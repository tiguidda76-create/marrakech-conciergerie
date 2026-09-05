"use server";

import { revalidatePath } from "next/cache";
import { Task, TaskType, TaskStatus, TaskPriority } from "@/types";

export async function createTaskAction(data: {
  property_id: string;
  property_name: string;
  title: string;
  type: TaskType;
  scheduled_at: string;
  assigned_to?: string;
  priority?: TaskPriority;
  turnaround_hours?: number;
  notes?: string;
}) {
  const newTask: Task = {
    id: `tsk-${Date.now()}`,
    property_id: data.property_id,
    property_name: data.property_name,
    title: data.title,
    type: data.type,
    scheduled_at: data.scheduled_at,
    assigned_to: data.assigned_to,
    status: "todo",
    priority: data.priority || "Moyenne",
    turnaround_hours: data.turnaround_hours || 3,
    notes: data.notes,
    created_at: new Date().toISOString(),
  };

  revalidatePath("/taches");
  revalidatePath("/");
  return { success: true, task: newTask };
}

export async function toggleTaskStatusAction(taskId: string, currentStatus: TaskStatus) {
  const newStatus: TaskStatus = currentStatus === "done" ? "todo" : "done";
  revalidatePath("/taches");
  revalidatePath("/");
  return { success: true, taskId, newStatus };
}
