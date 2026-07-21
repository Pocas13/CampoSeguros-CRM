import { api } from "./api";

export type GlobalSearchItem = {
  id: number;
  type: "CLIENT" | "POLICY" | "CLAIM" | "QUOTE";
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
};

export type GlobalSearchResponse = {
  query: string;
  results: GlobalSearchItem[];
};

export async function globalSearch(query: string, limit = 6) {
  const response = await api.get<GlobalSearchResponse>("/search", {
    params: { q: query, limit },
  });
  return response.data;
}
