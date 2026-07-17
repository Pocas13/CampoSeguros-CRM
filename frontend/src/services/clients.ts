import { api } from "./api";
import { Client } from "@/types/client";

export async function getClients(): Promise<Client[]> {
  const response = await api.get("/clients");
  return response.data;
}