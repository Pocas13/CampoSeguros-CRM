import {api} from './api';import type{Insurer}from '@/types/insurer';
export const getInsurers=async()=> (await api.get<Insurer[]>('/insurers')).data;
export const getInsurer=async(id:number)=>(await api.get<Insurer>(`/insurers/${id}`)).data;
export const createInsurer=async(data:any)=>(await api.post<Insurer>('/insurers',data)).data;
export const updateInsurer=async(id:number,data:any)=>(await api.patch<Insurer>(`/insurers/${id}`,data)).data;
export const deleteInsurer=async(id:number)=>(await api.delete(`/insurers/${id}`)).data;
export const addInsurerContact=async(id:number,data:any)=>(await api.post(`/insurers/${id}/contacts`,data)).data;
export const deleteInsurerContact=async(id:number)=>(await api.delete(`/insurers/contacts/${id}`)).data;
