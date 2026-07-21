import axios from "axios";

import { api } from "./api";
import type { Company } from "@/types/company";

export type CreateCompanyData = {
  name: string;
  nif?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
};

export type UpdateCompanyData = Partial<CreateCompanyData>;

export async function getCompanies(): Promise<Company[]> {
  const response = await api.get<Company[]>("/companies");

  if (!Array.isArray(response.data)) {
    throw new Error(
      "O servidor devolveu um formato inválido para a lista de empresas.",
    );
  }

  return response.data;
}

export async function getCompany(
  id: number,
): Promise<Company> {
  const response = await api.get<Company>(
    `/companies/${id}`,
  );

  return response.data;
}

export async function createCompany(
  data: CreateCompanyData,
): Promise<Company> {
  const response = await api.post<Company>(
    "/companies",
    data,
  );

  return response.data;
}

export async function updateCompany(
  id: number,
  data: UpdateCompanyData,
): Promise<Company> {
  const response = await api.patch<Company>(
    `/companies/${id}`,
    data,
  );

  return response.data;
}

export async function deleteCompany(
  id: number,
): Promise<Company> {
  const response = await api.delete<Company>(
    `/companies/${id}`,
  );

  return response.data;
}

export function getCompanyApiErrorMessage(
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
