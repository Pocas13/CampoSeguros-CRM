import { api } from "./api";
import type { Quote } from "@/types/quote";

export const getQuotes = async () => (await api.get<Quote[]>("/quotes")).data;
export const getQuote = async (id: number) => (await api.get<Quote>(`/quotes/${id}`)).data;
export const createQuote = async (data: Record<string, unknown>) => (await api.post<Quote>("/quotes", data)).data;
export const updateQuote = async (id: number, data: Record<string, unknown>) => (await api.patch<Quote>(`/quotes/${id}`, data)).data;
export const deleteQuote = async (id: number) => (await api.delete(`/quotes/${id}`)).data;
export const addQuoteOffer = async (id: number, data: Record<string, unknown>) => (await api.post(`/quotes/${id}/offers`, data)).data;
export const updateQuoteOffer = async (offerId: number, data: Record<string, unknown>) => (await api.patch(`/quotes/offers/${offerId}`, data)).data;
export const selectQuoteOffer = async (id: number, offerId: number) => (await api.post(`/quotes/${id}/offers/${offerId}/select`)).data;
export const addQuoteDocument = async (id: number, data: Record<string, unknown>) => (await api.post(`/quotes/${id}/documents`, data)).data;
export const convertQuote = async (id: number, data: Record<string, unknown>) => (await api.post(`/quotes/${id}/convert`, data)).data;
