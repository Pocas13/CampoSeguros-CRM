import axios from "axios";

export function apiError(error: unknown, fallback = "Ocorreu um erro inesperado.") {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;
    if (error.code === "ERR_NETWORK") return "Não foi possível ligar ao servidor.";
  }
  return error instanceof Error ? error.message : fallback;
}
