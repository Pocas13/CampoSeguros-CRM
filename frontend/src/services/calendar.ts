import { api } from "./api";
import type { CalendarEvent } from "@/types/calendar";

export const getCalendarEvents = async (from: string, to: string) =>
  (await api.get<CalendarEvent[]>("/calendar", { params: { from, to } })).data;
export const createCalendarEvent = async (data: Record<string, unknown>) =>
  (await api.post<CalendarEvent>("/calendar", data)).data;
export const updateCalendarEvent = async (id: number, data: Record<string, unknown>) =>
  (await api.patch<CalendarEvent>(`/calendar/${id}`, data)).data;
export const deleteCalendarEvent = async (id: number) => (await api.delete(`/calendar/${id}`)).data;
