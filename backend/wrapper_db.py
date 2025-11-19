import logging
import time
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import OperationalError, DBAPIError

# Logger for DB access operations
logger = logging.getLogger("crud_app_v2.db")
logger.setLevel(logging.INFO)


class TodoList:
    def __init__(self, app_context, db_write_uri=None, db_read_uri=None):
        self.app = app_context
        # Configuration de la base de données PostgreSQL
        # Default to same URI if only one is provided
        default_uri = 'postgresql://me:123@localhost/mydatabase'
        write_uri = db_write_uri or default_uri
        read_uri = db_read_uri or db_write_uri or default_uri
        
        self.app.config['SQLALCHEMY_DATABASE_URI'] = write_uri
        self.app.config['SQLALCHEMY_BINDS'] = {
            'read': read_uri
        }
        self.app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        # Enable connection pool pre-ping to detect stale connections
        self.app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
            'pool_pre_ping': True,
            'pool_recycle': 300,
            'pool_size': 10,
            'max_overflow': 20
        }

        self.db = SQLAlchemy(self.app)
        self.use_separate_read_db = db_read_uri is not None and db_read_uri != write_uri

        # Définition du modèle Item
        class Item(self.db.Model):
            __tablename__ = 'items'
            id = self.db.Column(self.db.Integer, primary_key=True)
            name = self.db.Column(self.db.String(100), nullable=False)
            status = self.db.Column(self.db.Integer, nullable=False)
            description = self.db.Column(self.db.String(1000), nullable=True)

        self.Item = Item  # Stocker la classe Item dans l'instance

        # Création des tables
        with self.app.app_context():
            self.db.create_all()

    def _retry_on_db_error(self, func, *args, max_retries=3, **kwargs):
        """Retry database operations with exponential backoff."""
        for attempt in range(max_retries):
            try:
                return func(*args, **kwargs)
            except (OperationalError, DBAPIError) as e:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
                    logger.warning(
                        "DB operation failed (attempt %d/%d): %s. Retrying in %ds...",
                        attempt + 1, max_retries, str(e), wait_time
                    )
                    time.sleep(wait_time)
                    # Dispose the connection pool to force new connections
                    self.db.engine.dispose()
                else:
                    logger.error("DB operation failed after %d attempts: %s", max_retries, str(e))
                    raise

    def GetTodolist(self):
        def _fetch():
            logger.info("DB: fetching all items from read database")
            # Use read bind if separate read DB is configured
            if self.use_separate_read_db:
                items = self.db.session.query(self.Item).execution_options(bind=self.db.get_engine(self.app, bind='read')).all()
            else:
                items = self.Item.query.all()
            return [{"id": item.id, "name": item.name, "status" : ["À faire", "En cours", "Terminé"][item.status], "description" : item.description} for item in items]
        return self._retry_on_db_error(_fetch)

    def CreateTask(self, name, state, description):
        StatusConverter = {"À faire": 0, "En cours": 1, "Terminé": 2}
        if not name or state not in StatusConverter:
            return False
        def _create():
            logger.info("DB: creating task name=%s state=%s", name, state)
            item = self.Item(name=name, status=StatusConverter[state], description=description)
            self.db.session.add(item)
            self.db.session.commit()
            return True
        return self._retry_on_db_error(_create)

    def RemoveTask(self, id):
        def _remove():
            logger.info("DB: removing task id=%s", id)
            item = self.Item.query.get(id)
            if not item:
                logger.warning("DB: remove failed, item not found id=%s", id)
                return False
            self.db.session.delete(item)
            self.db.session.commit()
            return True
        try:
            return self._retry_on_db_error(_remove)
        except Exception:
            self.db.session.rollback()
            raise

    def UpdateTask(self, id, name, state, description):
        StatusConverter = {"À faire": 0, "En cours": 1, "Terminé": 2}
        def _update():
            logger.info("DB: updating task id=%s name=%s state=%s", id, name, state)
            item = self.Item.query.get(id)
            if not item or not name or state not in StatusConverter:
                logger.warning("DB: update failed for id=%s (exists=%s valid_data=%s)", id, bool(item), bool(name and state in StatusConverter))
                return False
            item.name = name
            item.status = StatusConverter[state]  # Correction ici (status et non state)
            item.description = description
            self.db.session.commit()
            return True
        try:
            return self._retry_on_db_error(_update)
        except Exception:
            self.db.session.rollback()
            raise