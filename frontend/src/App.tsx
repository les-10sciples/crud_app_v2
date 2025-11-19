import React, { useState, useEffect } from "react";
import { Task } from "./types";
import { apiService } from "./api";
import { getFrontendAvailabilityZone } from "./config";

// CSS pour l'animation du spinner et reset global
const spinnerStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const App = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    status: "À faire",
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [frontendAZ, setFrontendAZ] = useState<string>("A");
  const [backendAZ, setBackendAZ] = useState<string>("-");

  useEffect(() => {
    // Load frontend availability zone from config
    getFrontendAvailabilityZone().then(zone => setFrontendAZ(zone));
    
    // Set up callback for backend AZ updates
    apiService.onAvailabilityZoneUpdate = (zone: string) => {
      setBackendAZ(zone);
    };
    
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const taskList = await apiService.getTasks();
      setTasks(taskList || []);
    } catch (error) {
      console.error("Erreur lors du chargement des tâches:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTask.name.trim() || !newTask.description.trim()) return;

    try {
      const updatedTasks = await apiService.createTask(
        newTask.name,
        newTask.status,
        newTask.description
      );
      setTasks(updatedTasks || []);
      setNewTask({ name: "", description: "", status: "À faire" });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la tâche:", error);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      const updatedTasks = await apiService.updateTask(
        editingTask.id,
        editingTask.name,
        editingTask.status,
        editingTask.description
      );
      setTasks(updatedTasks || []);
      setEditingTask(null);
    } catch (error) {
      console.error("Erreur lors de la modification de la tâche:", error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      const updatedTasks = await apiService.deleteTask(id);
      setTasks(updatedTasks || []);
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche:", error);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask({ ...task });
  };

  const cancelEditing = () => {
    setEditingTask(null);
  };

  if (loading) {
    return (
      <>
        <style>{spinnerStyles}</style>
        <div 
          style={{ 
            minHeight: "100vh",
            background: "#e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          }}
        >
          <div style={{
            backgroundColor: "white",
            padding: "40px 60px",
            borderRadius: "20px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            textAlign: "center",
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "4px solid #e1e5e9",
              borderTop: "4px solid #991b1b",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}></div>
            <p style={{ 
              color: "#333", 
              fontSize: "18px", 
              margin: "0",
              fontWeight: "600"
            }}>
              ⏳ Chargement...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{spinnerStyles}</style>
      <div
        style={{
          minHeight: "100vh",
          background: "#e5e7eb",
          padding: "20px",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h1 
          style={{ 
            textAlign: "center", 
            color: "#1f2937", 
            marginBottom: "20px",
            fontSize: "3rem",
            fontWeight: "300",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            letterSpacing: "2px"
          }}
        >
          TodoList
        </h1>

        {/* Availability Zone Indicators */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              padding: "12px 24px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "14px", color: "#666", fontWeight: "600" }}>
              Frontend AZ:
            </span>
            <span
              style={{
                backgroundColor: "#991b1b",
                color: "white",
                padding: "6px 16px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "700",
                minWidth: "32px",
                textAlign: "center",
              }}
            >
              {frontendAZ}
            </span>
          </div>
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              padding: "12px 24px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "14px", color: "#666", fontWeight: "600" }}>
              Backend AZ:
            </span>
            <span
              style={{
                backgroundColor: backendAZ === "-" ? "#9ca3af" : "#991b1b",
                color: "white",
                padding: "6px 16px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "700",
                minWidth: "32px",
                textAlign: "center",
              }}
            >
              {backendAZ}
            </span>
          </div>
        </div>

        {/* Formulaire d'ajout */}
        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "16px",
            marginBottom: "40px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <h2 
            style={{ 
              marginTop: "0", 
              color: "#333",
              fontSize: "1.8rem",
              fontWeight: "600",
              marginBottom: "25px"
            }}
          >
            Ajouter une nouvelle tâche
          </h2>
        <form onSubmit={handleAddTask}>
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="✏️ Nom de la tâche"
              value={newTask.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask({ ...newTask, name: e.target.value })}
              style={{
                width: "100%",
                padding: "14px 18px",
                border: "2px solid #e1e5e9",
                borderRadius: "12px",
                fontSize: "16px",
                transition: "all 0.3s ease",
                outline: "none",
                backgroundColor: "#fafbfc",
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.border = "2px solid #667eea";
                (e.target as HTMLInputElement).style.backgroundColor = "white";
                (e.target as HTMLInputElement).style.transform = "translateY(-1px)";
                (e.target as HTMLInputElement).style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.15)";
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.border = "2px solid #e1e5e9";
                (e.target as HTMLInputElement).style.backgroundColor = "#fafbfc";
                (e.target as HTMLInputElement).style.transform = "translateY(0)";
                (e.target as HTMLInputElement).style.boxShadow = "none";
              }}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <textarea
              placeholder="📝 Description de la tâche"
              value={newTask.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              style={{
                width: "100%",
                padding: "14px 18px",
                border: "2px solid #e1e5e9",
                borderRadius: "12px",
                fontSize: "16px",
                minHeight: "100px",
                resize: "vertical",
                transition: "all 0.3s ease",
                outline: "none",
                backgroundColor: "#fafbfc",
                fontFamily: "inherit",
              }}
              onFocus={(e) => {
                (e.target as HTMLTextAreaElement).style.border = "2px solid #667eea";
                (e.target as HTMLTextAreaElement).style.backgroundColor = "white";
                (e.target as HTMLTextAreaElement).style.transform = "translateY(-1px)";
                (e.target as HTMLTextAreaElement).style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.15)";
              }}
              onBlur={(e) => {
                (e.target as HTMLTextAreaElement).style.border = "2px solid #e1e5e9";
                (e.target as HTMLTextAreaElement).style.backgroundColor = "#fafbfc";
                (e.target as HTMLTextAreaElement).style.transform = "translateY(0)";
                (e.target as HTMLTextAreaElement).style.boxShadow = "none";
              }}
            />
          </div>
          <div style={{ marginBottom: "25px" }}>
            <select
              value={newTask.status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setNewTask({ ...newTask, status: e.target.value })
              }
              style={{
                width: "100%",
                padding: "14px 18px",
                border: "2px solid #e1e5e9",
                borderRadius: "12px",
                fontSize: "16px",
                backgroundColor: "#fafbfc",
                cursor: "pointer",
                outline: "none",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => {
                (e.target as HTMLSelectElement).style.border = "2px solid #667eea";
                (e.target as HTMLSelectElement).style.backgroundColor = "white";
              }}
              onBlur={(e) => {
                (e.target as HTMLSelectElement).style.border = "2px solid #e1e5e9";
                (e.target as HTMLSelectElement).style.backgroundColor = "#fafbfc";
              }}
            >
              <option value="À faire">🔵 À faire</option>
              <option value="En cours">🟡 En cours</option>
              <option value="Terminé">🟢 Terminé</option>
            </select>
          </div>
          <button
            type="submit"
            style={{
              background: "linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)",
              color: "white",
              border: "none",
              padding: "16px 32px",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(153, 27, 27, 0.3)",
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.transform = "translateY(-2px)";
              (e.target as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(153, 27, 27, 0.4)";
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.transform = "translateY(0)";
              (e.target as HTMLButtonElement).style.boxShadow = "0 4px 15px rgba(153, 27, 27, 0.3)";
            }}
          >
            + Ajouter la tâche
          </button>
        </form>
      </div>

        {/* Liste des tâches */}
        <div>
          <h2 
            style={{ 
              color: "#1f2937", 
              marginBottom: "25px",
              fontSize: "1.8rem",
              fontWeight: "600",
              textShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            📋 Mes tâches ({tasks.length})
          </h2>

          {tasks.length === 0 ? (
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "60px 40px",
                textAlign: "center",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <p style={{ color: "#888", fontSize: "18px", margin: "0" }}>
                🎯 Aucune tâche pour le moment. Ajoutez-en une !
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "20px" }}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "25px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.15)";
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.12)";
                  }}
                >
                {editingTask && editingTask.id === task.id ? (
                  // Mode édition
                  <form onSubmit={handleUpdateTask}>
                    <div style={{ marginBottom: "15px" }}>
                      <input
                        type="text"
                        value={editingTask.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEditingTask({
                            ...editingTask,
                            name: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          border: "2px solid #e1e5e9",
                          borderRadius: "10px",
                          fontSize: "16px",
                          transition: "all 0.3s ease",
                          outline: "none",
                          backgroundColor: "#fafbfc",
                        }}
                        onFocus={(e) => {
                          (e.target as HTMLInputElement).style.border = "2px solid #667eea";
                          (e.target as HTMLInputElement).style.backgroundColor = "white";
                          (e.target as HTMLInputElement).style.boxShadow = "0 3px 10px rgba(102, 126, 234, 0.15)";
                        }}
                        onBlur={(e) => {
                          (e.target as HTMLInputElement).style.border = "2px solid #e1e5e9";
                          (e.target as HTMLInputElement).style.backgroundColor = "#fafbfc";
                          (e.target as HTMLInputElement).style.boxShadow = "none";
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                      <textarea
                        value={editingTask.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setEditingTask({
                            ...editingTask,
                            description: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          border: "2px solid #e1e5e9",
                          borderRadius: "10px",
                          minHeight: "80px",
                          fontSize: "16px",
                          resize: "vertical",
                          transition: "all 0.3s ease",
                          outline: "none",
                          backgroundColor: "#fafbfc",
                          fontFamily: "inherit",
                        }}
                        onFocus={(e) => {
                          (e.target as HTMLTextAreaElement).style.border = "2px solid #667eea";
                          (e.target as HTMLTextAreaElement).style.backgroundColor = "white";
                          (e.target as HTMLTextAreaElement).style.boxShadow = "0 3px 10px rgba(102, 126, 234, 0.15)";
                        }}
                        onBlur={(e) => {
                          (e.target as HTMLTextAreaElement).style.border = "2px solid #e1e5e9";
                          (e.target as HTMLTextAreaElement).style.backgroundColor = "#fafbfc";
                          (e.target as HTMLTextAreaElement).style.boxShadow = "none";
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <select
                        value={editingTask.status}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setEditingTask({
                            ...editingTask,
                            status: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          border: "2px solid #e1e5e9",
                          borderRadius: "10px",
                          fontSize: "16px",
                          backgroundColor: "#fafbfc",
                          cursor: "pointer",
                          outline: "none",
                          transition: "all 0.3s ease",
                        }}
                        onFocus={(e) => {
                          (e.target as HTMLSelectElement).style.border = "2px solid #667eea";
                          (e.target as HTMLSelectElement).style.backgroundColor = "white";
                        }}
                        onBlur={(e) => {
                          (e.target as HTMLSelectElement).style.border = "2px solid #e1e5e9";
                          (e.target as HTMLSelectElement).style.backgroundColor = "#fafbfc";
                        }}
                      >
                        <option value="À faire">🔵 À faire</option>
                        <option value="En cours">🟡 En cours</option>
                        <option value="Terminé">🟢 Terminé</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        type="submit"
                        style={{
                          background: "linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)",
                          color: "white",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "600",
                          transition: "all 0.3s ease",
                          boxShadow: "0 3px 12px rgba(153, 27, 27, 0.3)",
                        }}
                        onMouseOver={(e) => {
                          (e.target as HTMLButtonElement).style.transform = "translateY(-1px)";
                          (e.target as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(153, 27, 27, 0.4)";
                        }}
                        onMouseOut={(e) => {
                          (e.target as HTMLButtonElement).style.transform = "translateY(0)";
                          (e.target as HTMLButtonElement).style.boxShadow = "0 3px 12px rgba(153, 27, 27, 0.3)";
                        }}
                      >
                        ✅ Sauvegarder
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        style={{
                          background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                          color: "white",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "600",
                          transition: "all 0.3s ease",
                          boxShadow: "0 3px 12px rgba(107, 114, 128, 0.3)",
                        }}
                        onMouseOver={(e) => {
                          (e.target as HTMLButtonElement).style.transform = "translateY(-1px)";
                          (e.target as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(107, 114, 128, 0.4)";
                        }}
                        onMouseOut={(e) => {
                          (e.target as HTMLButtonElement).style.transform = "translateY(0)";
                          (e.target as HTMLButtonElement).style.boxShadow = "0 3px 12px rgba(107, 114, 128, 0.3)";
                        }}
                      >
                        ❌ Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  // Mode affichage
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <h3 style={{ margin: "0", color: "#333", flex: 1 }}>
                        {task.name}
                      </h3>
                      <span
                        style={{
                          backgroundColor:
                            task.status === "Terminé"
                              ? "#10b981"
                              : task.status === "En cours"
                              ? "#f59e0b"
                              : "#6366f1",
                          color: "white",
                          padding: "8px 16px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: "600",
                          marginLeft: "15px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        {task.status === "Terminé" ? "🟢" : task.status === "En cours" ? "🟡" : "🔵"}
                        {task.status}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: "0 0 15px 0",
                        color: "#666",
                        lineHeight: "1.5",
                      }}
                    >
                      {task.description}
                    </p>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        onClick={() => startEditing(task)}
                        style={{
                          background: "linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)",
                          color: "white",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "600",
                          transition: "all 0.3s ease",
                          boxShadow: "0 3px 12px rgba(153, 27, 27, 0.3)",
                        }}
                        onMouseOver={(e) => {
                          (e.target as HTMLButtonElement).style.transform = "translateY(-1px)";
                          (e.target as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(153, 27, 27, 0.4)";
                        }}
                        onMouseOut={(e) => {
                          (e.target as HTMLButtonElement).style.transform = "translateY(0)";
                          (e.target as HTMLButtonElement).style.boxShadow = "0 3px 12px rgba(153, 27, 27, 0.3)";
                        }}
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        style={{
                          background: "linear-gradient(135deg, #7f1d1d 0%, #5f1515 100%)",
                          color: "white",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "600",
                          transition: "all 0.3s ease",
                          boxShadow: "0 3px 12px rgba(127, 29, 29, 0.3)",
                        }}
                        onMouseOver={(e) => {
                          (e.target as HTMLButtonElement).style.transform = "translateY(-1px)";
                          (e.target as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(127, 29, 29, 0.4)";
                        }}
                        onMouseOut={(e) => {
                          (e.target as HTMLButtonElement).style.transform = "translateY(0)";
                          (e.target as HTMLButtonElement).style.boxShadow = "0 3px 12px rgba(127, 29, 29, 0.3)";
                        }}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </>
                )}
              </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default App;
