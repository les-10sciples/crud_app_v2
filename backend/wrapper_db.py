import logging
from flask_sqlalchemy import SQLAlchemy

# Logger for DB access operations
logger = logging.getLogger("crud_app_v2.db")
logger.setLevel(logging.INFO)


class TodoList:
    def __init__(self, app_context, db_uri=None):
        self.app = app_context
        # Configuration de la base de données PostgreSQL
        if db_uri:
            self.app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
        else:
            self.app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://me:123@localhost/mydatabase'
        self.app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

        self.db = SQLAlchemy(self.app)

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

    def GetTodolist(self):
        logger.info("DB: fetching all items")
        items = self.Item.query.all()
        return [{"id": item.id, "name": item.name, "status" : ["À faire", "En cours", "Terminé"][item.status], "description" : item.description} for item in items]

    def CreateTask(self, name, state, description):
        StatusConverter = {"À faire": 0, "En cours": 1, "Terminé": 2}
        if not name or state not in StatusConverter:
            return False
        logger.info("DB: creating task name=%s state=%s", name, state)
        item = self.Item(name=name, status=StatusConverter[state], description=description)
        self.db.session.add(item)
        self.db.session.commit()
        return True

    def RemoveTask(self, id):
        logger.info("DB: removing task id=%s", id)
        item = self.Item.query.get(id)
        if not item:
            logger.warning("DB: remove failed, item not found id=%s", id)
            return False
        self.db.session.delete(item)
        self.db.session.commit()
        return True

    def UpdateTask(self, id, name, state, description):
        StatusConverter = {"À faire": 0, "En cours": 1, "Terminé": 2}
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