import argparse
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Ajout pour éviter les erreurs CORS

# Argument parser pour choisir DB ou non
def parse_args():
    parser = argparse.ArgumentParser(description="TodoList backend")
    parser.add_argument('--db-uri', type=str, default=None, help='URI de connexion à la base de données')
    return parser.parse_args()

args = parse_args()

if args.db_uri:
    from wrapper_db import TodoList
    db = TodoList(app, db_uri=args.db_uri)
else:
    from wrapper_no_db import TodoList as TodoList_NoDB
    db = TodoList_NoDB(app)

@app.route('/tasks', methods=['GET'])
def get_tasks():
    return jsonify({"tasks": db.GetTodolist()}), 200

@app.route('/tasks', methods=['POST'])
def add_task():
    data = request.get_json()
    if (not data or 'name' not in data or 'status' not in data or 'description' not in data 
        or not db.CreateTask(data['name'], data['status'], data['description'])):
        return jsonify({"error": "Invalid data"}), 400
    return jsonify({"tasks": db.GetTodolist()}), 201

@app.route('/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    db.RemoveTask(id)
    return jsonify({"tasks": db.GetTodolist()}), 200

@app.route('/tasks/update', methods=['POST'])
def update_task():
    data = request.get_json()
    if (not data or 'name' not in data or 'status' not in data 
        or 'description' not in data or not 'id' in data 
        or not db.UpdateTask(data['id'], data['name'], data['status'], data['description'])):
        return jsonify({"error": "Invalid data"}), 400
    return jsonify({"tasks": db.GetTodolist()}), 201

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)