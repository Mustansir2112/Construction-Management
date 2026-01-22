"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grip, Plus, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Task {
  id: string;
  description: string;
  state: "not started" | "in progress" | "completed";
  priority: number;
  created_at?: string;
}

const columns = [
  { id: "not started", title: "To Do" },
  { id: "in progress", title: "In Progress" },
  { id: "completed", title: "Done" },
];

interface DragState {
  taskId: string | null;
  sourceColumn: string | null;
}

export function KanbanBoardIntegrated() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [drag, setDrag] = useState<DragState>({
    taskId: null,
    sourceColumn: null,
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    description: "",
    priority: 3,
    state: "not started" as const,
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const response = await fetch("/api/kanban");
      const data = await response.json();
      if (Array.isArray(data)) {
        setTasks(data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask() {
    if (!newTask.description.trim()) return;

    try {
      const response = await fetch("/api/kanban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        await fetchTasks();
        setNewTask({ description: "", priority: 3, state: "not started" });
        setIsCreateOpen(false);
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  }

  async function handleDeleteTask(id: string) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`/api/kanban?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  async function handleDrop(targetColumn: string) {
    if (!drag.taskId || drag.sourceColumn === targetColumn) {
      setDrag({ taskId: null, sourceColumn: null });
      return;
    }

    // Optimistic update
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === drag.taskId
          ? { ...task, state: targetColumn as Task["state"] }
          : task
      )
    );

    // Update in database
    try {
      await fetch("/api/kanban", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: drag.taskId,
          state: targetColumn,
        }),
      });
    } catch (error) {
      console.error("Error updating task:", error);
      // Revert on error
      await fetchTasks();
    }

    setDrag({ taskId: null, sourceColumn: null });
  }

  const handleDragStart = (
    e: React.DragEvent,
    taskId: string,
    column: string
  ) => {
    setDrag({ taskId, sourceColumn: column });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnd = () => {
    setDrag({ taskId: null, sourceColumn: null });
  };

  const getTasksForColumn = (columnId: string) => {
    return tasks
      .filter((task) => task.state === columnId)
      .sort((a, b) => a.priority - b.priority);
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return "bg-red-100 text-red-700";
    if (priority <= 3) return "bg-amber-100 text-amber-700";
    return "bg-green-100 text-green-700";
  };

  const getPriorityLabel = (priority: number) => {
    if (priority === 1) return "Critical";
    if (priority === 2) return "High";
    if (priority === 3) return "Medium";
    if (priority === 4) return "Low";
    return "Minimal";
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Task Management
          </h2>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((column) => {
            const columnTasks = getTasksForColumn(column.id);
            return (
              <div
                key={column.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(column.id)}
                className="bg-muted/30 rounded-lg p-4 min-h-[400px] border border-border/50"
              >
                <h3 className="font-semibold text-foreground mb-4 text-sm">
                  {column.title} ({columnTasks.length})
                </h3>

                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) =>
                        handleDragStart(e, task.id, column.id)
                      }
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "p-3 rounded-lg cursor-move transition-all duration-200 bg-card border border-border hover:shadow-md relative group",
                        drag.taskId === task.id ? "opacity-50 shadow-lg" : ""
                      )}
                    >
                      <div className="flex gap-2 items-start">
                        <Grip className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm leading-snug">
                            {task.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span
                              className={cn(
                                "inline-block text-[10px] font-semibold px-2 py-0.5 rounded",
                                getPriorityColor(task.priority)
                              )}
                            >
                              {getPriorityLabel(task.priority)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Create Task Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                placeholder="Enter task description..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newTask.priority.toString()}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, priority: parseInt(value) })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Critical</SelectItem>
                  <SelectItem value="2">High</SelectItem>
                  <SelectItem value="3">Medium</SelectItem>
                  <SelectItem value="4">Low</SelectItem>
                  <SelectItem value="5">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Select
                value={newTask.state}
                onValueChange={(value: any) =>
                  setNewTask({ ...newTask, state: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not started">To Do</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="completed">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateTask} className="flex-1">
                Create Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
