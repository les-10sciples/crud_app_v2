import argparse
import logging
import sys
import time
from flask import Flask, request, jsonify, g
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Ajout pour éviter les erreurs CORS

# --- Logging setup -------------------------------------------------
# Basic logging config: stream to stdout so containers pick it up
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    stream=sys.stdout,
)

# Application logger
logger = logging.getLogger("crud_app_v2")
logger.setLevel(logging.INFO)

# Reuse the same handlers for Flask's app.logger and werkzeug so all
# HTTP-related logs go to the same place.
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))
    logger.addHandler(handler)

app.logger.handlers = logger.handlers
app.logger.setLevel(logger.level)
logging.getLogger("werkzeug").handlers = logger.handlers
logging.getLogger("werkzeug").setLevel(logger.level)


# Simple request timing + HTTP access logging
@app.before_request
def _start_timer():
    g._start_time = time.perf_counter()


@app.after_request
def _log_request(response):
    try:
        duration = (time.perf_counter() - g._start_time) * 1000.0
    except Exception:
        duration = -1.0
    remote = request.remote_addr or "-"
    logger.info("%s %s %s %s %.2fms", remote, request.method, request.path, response.status_code, duration)
    return response

# ------------------------------------------------------------------

# Argument parser pour choisir DB ou non
def parse_args():
    parser = argparse.ArgumentParser(description="TodoList backend")
    parser.add_argument('--db-uri', type=str, default=None, help='URI de connexion à la base de données')
    parser.add_argument('--availability-zone', type=str, default='A', choices=['A', 'B'], help='Availability zone (A or B)')
    return parser.parse_args()

args = parse_args()
availability_zone = args.availability_zone

if args.db_uri:
    from wrapper_db import TodoList
    db = TodoList(app, db_uri=args.db_uri)
else:
    from wrapper_no_db import TodoList as TodoList_NoDB
    db = TodoList_NoDB(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "availability_zone": availability_zone}), 200

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    try:
        return jsonify({"tasks": db.GetTodolist(), "availability_zone": availability_zone}), 200
    except Exception as e:
        logger.error("Failed to fetch tasks: %s", str(e))
        return jsonify({"error": "Database unavailable", "availability_zone": availability_zone}), 503

@app.route('/api/tasks', methods=['POST'])
def add_task():
    try:
        data = request.get_json()
        if (not data or 'name' not in data or 'status' not in data or 'description' not in data 
            or not db.CreateTask(data['name'], data['status'], data['description'])):
            return jsonify({"error": "Invalid data", "availability_zone": availability_zone}), 400
        return jsonify({"tasks": db.GetTodolist(), "availability_zone": availability_zone}), 201
    except Exception as e:
        logger.error("Failed to create task: %s", str(e))
        return jsonify({"error": "Database unavailable", "availability_zone": availability_zone}), 503

@app.route('/api/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    try:
        db.RemoveTask(id)
        return jsonify({"tasks": db.GetTodolist(), "availability_zone": availability_zone}), 200
    except Exception as e:
        logger.error("Failed to delete task %d: %s", id, str(e))
        return jsonify({"error": "Database unavailable", "availability_zone": availability_zone}), 503

@app.route('/api/tasks/update', methods=['POST'])
def update_task():
    try:
        data = request.get_json()
        if (not data or 'name' not in data or 'status' not in data 
            or 'description' not in data or not 'id' in data 
            or not db.UpdateTask(data['id'], data['name'], data['status'], data['description'])):
            return jsonify({"error": "Invalid data", "availability_zone": availability_zone}), 400
        return jsonify({"tasks": db.GetTodolist(), "availability_zone": availability_zone}), 201
    except Exception as e:
        logger.error("Failed to update task: %s", str(e))
        return jsonify({"error": "Database unavailable", "availability_zone": availability_zone}), 503

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)