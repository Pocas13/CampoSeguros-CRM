export const API_BASE_URL = "/api";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name?: string;
  email: string;
  password: string;
};

export type LoginResponse = {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
  expiresIn: string;
};

async function handleResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Erro no pedido.");
  }

  return data;
}

export async function loginUser(payload: LoginPayload) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response) as Promise<LoginResponse>;
}

export async function registerUser(payload: RegisterPayload) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}
