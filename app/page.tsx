"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Plus } from "lucide-react";
import CreateTaskDialog from "@/components/CreateTaskDialog";

export default function Home() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await fetch("/api/tasks");
      const data = await response.json();
      setTasks(data);
    };

    if (session) {
      fetchTasks();
    }
  }, [session]);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Please sign in to continue</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Task Management</h1>
        {session.user.role === "ADMIN" && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{task.title}</CardTitle>
                <Badge variant={
                  task.status === "COMPLETED" ? "success" :
                  task.status === "IN_PROGRESS" ? "warning" : "default"
                }>
                  {task.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{task.description}</p>
              <div className="flex items-center text-sm text-muted-foreground">
                <ClipboardList className="mr-2 h-4 w-4" />
                Assigned to: {task.assignedTo.name}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateTaskDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onTaskCreated={(newTask) => setTasks([...tasks, newTask])}
      />
    </div>
  );
}