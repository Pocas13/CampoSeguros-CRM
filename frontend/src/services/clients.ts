import axios from "axios";

import { api } from "./api";
import type { Client } from "@/types/client";

export type CreateClientData = {
  name: string;
  nif?: string | null;
  birthDate?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  notes?: string | null;
  companyId: number;
};

export type UpdateClientData = {
  name?: string;
  nif?: string | null;
  birthDate?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  notes?: string | null;
  active?: boolean;
};

export async function getClients(): Promise<Client[]> {
  const response = await api.get<
    Client[] | { data: Client[] }
  >("/clients");

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (
    response.data &&
    "data" in response.data &&
    Array.isArray(response.data.data)
  ) {
    return response.data.data;
  }

  throw new Error(
    "O servidor devolveu um formato inválido para a lista de clientes.",
  );
}

export async function getClient(
  id: number,
): Promise<Client> {
  const response = await api.get<Client>(
    `/clients/${id}`,
  );

  return response.data;
}

export async function createClient(
  data: CreateClientData,
): Promise<Client> {
  const response = await api.post<Client>(
    "/clients",
    data,
  );

  return response.data;
}

export async function updateClient(
  id: number,
  data: UpdateClientData,
): Promise<Client> {
  const response = await api.patch<Client>(
    `/clients/${id}`,
    data,
  );

  return response.data;
}

export async function deleteClient(
  id: number,
): Promise<Client> {
  const response = await api.delete<Client>(
    `/clients/${id}`,
  );

  return response.data;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Ocorreu um erro inesperado.",
): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(" ");
    }

    if (typeof message === "string") {
      return message;
    }

    if (error.code === "ERR_NETWORK") {
      return "Não foi possível ligar ao servidor.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}