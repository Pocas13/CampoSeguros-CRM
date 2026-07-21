import { api } from "./api";
import type { UserRole } from "@/providers/AuthProvider";

export type TeamUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  active: boolean;
  avatarUrl: string | null;
  phone: string | null;
  jobTitle: string | null;
  lastLoginAt: string | null;
  companyId: number | null;
  createdAt: string;
};

export type CreateTeamUser = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  permissions?: string[];
  phone?: string | null;
  jobTitle?: string | null;
  avatarUrl?: string | null;
};

export type UserInvitation = {
  id: number;
  email: string;
  role: UserRole;
  permissions: string[];
  expiresAt: string;
  createdAt: string;
  invitationUrl?: string;
};

export const getUsers = async () => (await api.get<TeamUser[]>("/users")).data;
export const createUser = async (data: CreateTeamUser) => (await api.post<TeamUser>("/users", data)).data;
export const updateUser = async (id: number, data: Partial<CreateTeamUser> & { active?: boolean }) => (await api.patch<TeamUser>(`/users/${id}`, data)).data;
export const deactivateUser = async (id: number) => (await api.delete<TeamUser>(`/users/${id}`)).data;
export const getInvitations = async () => (await api.get<UserInvitation[]>("/users/invitations")).data;
export const inviteUser = async (data: { email: string; role: UserRole; permissions?: string[] }) => (await api.post<UserInvitation>("/users/invitations", data)).data;
export const cancelInvitation = async (id: number) => (await api.delete(`/users/invitations/${id}`)).data;

export type UserDirectoryItem = {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  jobTitle: string | null;
};

export const getUserDirectory = async (): Promise<UserDirectoryItem[]> =>
  (await api.get<UserDirectoryItem[]>("/users/directory")).data;
