class TodoList:
    def __init__(self, app_context):
        self.app = app_context
        self.db = []

    def GetTodolist(self):
        return self.db

    def CreateTask(self, name, state, description):
        if not name or state not in ["À faire", "En cours", "Terminé"] :
            return False
        self.db.append({"id" : len(self.db) + 1, "name" : name, "status" : state, "description" : description})
        return True

    def RemoveTask(self, id):
        self.db = [item for item in self.db if item['id'] != id]
        return True

    def UpdateTask(self, id, name, state, description):
        i = 0
        while i < len(self.db) and self.db[i]["id"] != id:
            i+=1
        if i == len(self.db) or not name or not state in ["À faire", "En cours", "Terminé"]:
            return False
        self.db[i]["name"] = name
        self.db[i]["status"] = state
        self.db[i]["description"] = description
        return True