"use client";

import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteClient,
  getApiErrorMessage,
  getClient,
  updateClient,
} from "@/services/clients";

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const rawId = params.id;

  const clientId = Number(
    Array.isArray(rawId)
      ? rawId[0]
      : rawId,
  );

  const {
    data: client,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => getClient(clientId),
    enabled:
      Number.isInteger(clientId) &&
      clientId > 0,
    retry: false,
  });

  const statusMutation = useMutation({
    mutationFn: (active: boolean) =>
      updateClient(clientId, {
        active,
      }),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["client", clientId],
        }),

        queryClient.invalidateQueries({
          queryKey: ["clients"],
        }),
      ]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteClient(clientId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["clients"],
      });

      router.push("/clients");
    },
  });

  function handleDelete() {
    if (!client) {
      return;
    }

    const confirmed = window.confirm(
      `Tem a certeza de que pretende eliminar o cliente "${client.name}"?`,
    );

    if (confirmed) {
      deleteMutation.mutate();
    }
  }

  if (isPending) {
    return <div>A carregar cliente...</div>;
  }

  if (isError || !client) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-red-700">
        {getApiErrorMessage(
          error,
          "Cliente não encontrado.",
        )}
      </div>
    );
  }

  const mutationError =
    statusMutation.error ||
    deleteMutation.error;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/clients"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Voltar aos clientes
          </Link>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">
              {client.name}
            </h1>

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
          </div>

          <p className="mt-1 text-slate-500">
            Ficha completa do cliente
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              statusMutation.mutate(
                !client.active,
              )
            }
            disabled={statusMutation.isPending}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium hover:bg-slate-50 disabled:opacity-60"
          >
            {client.active
              ? "Desativar"
              : "Ativar"}
          </button>

          <Link
            href={`/clients/${client.id}/edit`}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Editar
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {deleteMutation.isPending
              ? "A eliminar..."
              : "Eliminar"}
          </button>
        </div>
      </div>

      {mutationError && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          {getApiErrorMessage(mutationError)}
        </div>
      )}

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-5 text-xl font-bold">
          Dados pessoais
        </h2>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <InfoItem
            label="Nome"
            value={client.name}
          />

          <InfoItem
            label="NIF"
            value={client.nif}
          />

          <InfoItem
            label="Data de nascimento"
            value={formatDate(
              client.birthDate,
            )}
          />

          <InfoItem
            label="Email"
            value={client.email}
          />

          <InfoItem
            label="Telefone"
            value={client.phone}
          />

          <InfoItem
            label="Morada"
            value={client.address}
          />

          <InfoItem
            label="Código postal"
            value={client.postalCode}
          />

          <InfoItem
            label="Localidade"
            value={client.city}
          />

          <InfoItem
            label="Cliente desde"
            value={formatDate(
              client.createdAt,
            )}
          />
        </div>

        <div className="mt-6 border-t pt-5">
          <p className="text-sm font-medium text-slate-500">
            Observações
          </p>

          <p className="mt-2 whitespace-pre-wrap">
            {client.notes ||
              "Sem observações."}
          </p>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <SectionHeader
          title="Apólices"
          count={client.policies?.length ?? 0}
        />

        {!client.policies?.length ? (
          <EmptyState text="Este cliente ainda não tem apólices." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 text-left">
                    Apólice
                  </th>

                  <th className="p-3 text-left">
                    Produto
                  </th>

                  <th className="p-3 text-left">
                    Seguradora
                  </th>

                  <th className="p-3 text-left">
                    Prémio
                  </th>

                  <th className="p-3 text-left">
                    Renovação
                  </th>

                  <th className="p-3 text-left">
                    Estado
                  </th>
                </tr>
              </thead>

              <tbody>
                {client.policies.map(
                  (policy) => (
                    <tr
                      key={policy.id}
                      className="border-t"
                    >
                      <td className="p-3 font-medium">
                        {policy.policyNumber}
                      </td>

                      <td className="p-3">
                        {policy.product}
                      </td>

                      <td className="p-3">
                        {policy.insurer}
                      </td>

                      <td className="p-3">
                        {formatCurrency(
                          policy.premium,
                        )}
                      </td>

                      <td className="p-3">
                        {formatDate(
                          policy.renewalDate,
                        )}
                      </td>

                      <td className="p-3">
                        {policy.status}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl bg-white p-6 shadow">
          <SectionHeader
            title="Sinistros"
            count={client.claims?.length ?? 0}
          />

          {!client.claims?.length ? (
            <EmptyState text="Sem sinistros registados." />
          ) : (
            <div className="space-y-3">
              {client.claims.map((claim) => (
                <div
                  key={claim.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex justify-between gap-4">
                    <p className="font-semibold">
                      {claim.claimNumber}
                    </p>

                    <span className="text-sm text-slate-500">
                      {claim.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-600">
                    {claim.description ||
                      "Sem descrição."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl bg-white p-6 shadow">
          <SectionHeader
            title="Simulações"
            count={
              client.simulations?.length ?? 0
            }
          />

          {!client.simulations?.length ? (
            <EmptyState text="Sem simulações registadas." />
          ) : (
            <div className="space-y-3">
              {client.simulations.map(
                (simulation) => (
                  <div
                    key={simulation.id}
                    className="rounded-lg border border-slate-200 p-4"
                  >
                    <div className="flex justify-between gap-4">
                      <p className="font-semibold">
                        {
                          simulation.insuranceType
                        }
                      </p>

                      <span className="text-sm text-slate-500">
                        {simulation.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      Prémio:{" "}
                      {formatCurrency(
                        simulation.premium,
                      )}
                    </p>
                  </div>
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-medium">
        {value || "-"}
      </p>
    </div>
  );
}

function SectionHeader({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h2 className="text-xl font-bold">
        {title}
      </h2>

      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
        {count}
      </span>
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
      {text}
    </div>
  );
}

function formatCurrency(
  value: number | null,
) {
  if (value === null) {
    return "-";
  }

  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "pt-PT",
  ).format(new Date(value));
}