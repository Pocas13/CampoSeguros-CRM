"use client";

import { useEffect, useState } from "react";
import { getClients } from "@/services/clients";
import { Client } from "@/types/client";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClients()
      .then(setClients)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-10">A carregar clientes...</div>;
  }

  return (
    <div className="p-10">
      <h1 className="mb-6 text-3xl font-bold">Clientes</h1>

      <table className="w-full border-collapse rounded-lg overflow-hidden shadow">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-3 text-left">Nome</th>
            <th className="p-3 text-left">NIF</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Telefone</th>
            <th className="p-3 text-left">Cidade</th>
          </tr>
        </thead>

        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="border-t">
              <td className="p-3">{client.name}</td>
              <td className="p-3">{client.nif}</td>
              <td className="p-3">{client.email}</td>
              <td className="p-3">{client.phone}</td>
              <td className="p-3">{client.city}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}