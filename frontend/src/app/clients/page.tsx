"use client";

import {
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import ClientSearch from "@/components/clients/ClientSearch";

import {
  getApiErrorMessage,
  getClients,
} from "@/services/clients";

export default function ClientsPage() {
  const [search, setSearch] = useState("");

  const {
    data = [],
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
    retry: false,
  });

const clients = useMemo(() => {
  const normalizedSearch = search
    .trim()
    .toLowerCase();

  const clientList = Array.isArray(data)
    ? data
    : [];

  return clientList.filter((client) => {
      return (
        client.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        (client.nif ?? "").includes(
          normalizedSearch,
        ) ||
        (client.email ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        (client.phone ?? "").includes(
          normalizedSearch,
        ) ||
        (client.city ?? "")
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [data, search]);

  if (isPending) {
    return <div>A carregar clientes...</div>;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-red-700">
        <p className="font-bold">
          Erro ao carregar clientes
        </p>

        <p className="mt-2">
          {getApiErrorMessage(error)}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Clientes
          </h1>

          <p className="mt-1 text-slate-500">
            Gestão de clientes particulares.
          </p>
        </div>

        <Link
          href="/clients/new"
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          + Novo cliente
        </Link>
      </div>

      <ClientSearch
        value={search}
        onChange={setSearch}
      />

      <div className="mt-5 overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">
                Nome
              </th>

              <th className="p-3 text-left">
                NIF
              </th>

              <th className="p-3 text-left">
                Email
              </th>

              <th className="p-3 text-left">
                Telefone
              </th>

              <th className="p-3 text-left">
                Cidade
              </th>

              <th className="p-3 text-left">
                Estado
              </th>

              <th className="p-3 text-right">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-t hover:bg-slate-50"
              >
                <td className="p-3">
                  <Link
                    href={`/clients/${client.id}`}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    {client.name}
                  </Link>
                </td>

                <td className="p-3">
                  {client.nif ?? "-"}
                </td>

                <td className="p-3">
                  {client.email ?? "-"}
                </td>

                <td className="p-3">
                  {client.phone ?? "-"}
                </td>

                <td className="p-3">
                  {client.city ?? "-"}
                </td>

                <td className="p-3">
                  <span
                    className={
                      client.active
                        ? "rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700"
                        : "rounded-full bg-slate-200 px-3 py-1 text-sm font-medium text-slate-600"
                    }
                  >
                    {client.active
                      ? "Ativo"
                      : "Inativo"}
                  </span>
                </td>

                <td className="p-3">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Abrir
                    </Link>

                    <Link
                      href={`/clients/${client.id}/edit`}
                      className="font-medium text-slate-700 hover:underline"
                    >
                      Editar
                    </Link>
                  </div>
                </td>
              </tr>
            ))}

            {clients.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-slate-500"
                >
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}