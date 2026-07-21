"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  FileSpreadsheet,
  Mail,
  MapPin,
  Phone,
  UserRound,
  Users,
} from "lucide-react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteCompany,
  getCompany,
  getCompanyApiErrorMessage,
} from "@/services/companies.service";

export default function CompanyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = getParamId(params.id);

  const {
    data: company,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => getCompany(companyId),
    enabled: Number.isInteger(companyId) && companyId > 0,
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCompany(companyId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["companies"],
      });
      router.push("/companies");
    },
  });

  function handleDelete() {
    if (!company) {
      return;
    }

    const confirmed = window.confirm(
      `Tem a certeza de que pretende eliminar a empresa "${company.name}"?`,
    );

    if (confirmed) {
      deleteMutation.mutate();
    }
  }

  if (isPending) {
    return <div>A carregar empresa...</div>;
  }

  if (isError || !company) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-red-700">
        {getCompanyApiErrorMessage(
          error,
          "Empresa não encontrada.",
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/companies"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Voltar às empresas
          </Link>
          <h1 className="mt-2 text-3xl font-bold">{company.name}</h1>
          <p className="mt-1 text-slate-500">
            Ficha da empresa e respetivos registos.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/companies/${company.id}/edit`}
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

      {deleteMutation.isError && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          {getCompanyApiErrorMessage(
            deleteMutation.error,
            "Não foi possível eliminar a empresa.",
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Clientes"
          value={company._count.clients}
          icon={<Users size={22} />}
        />
        <StatCard
          label="Utilizadores"
          value={company._count.users}
          icon={<UserRound size={22} />}
        />
        <StatCard
          label="Simulações"
          value={company._count.simulations}
          icon={<FileSpreadsheet size={22} />}
        />
      </div>

      <section className="rounded-xl bg-white p-6 shadow">
        <div className="mb-5 flex items-center gap-3">
          <Building2 className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold">Dados da empresa</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <InfoItem label="Nome" value={company.name} />
          <InfoItem label="NIF" value={company.nif} />
          <InfoItem
            label="Email"
            value={company.email}
            icon={<Mail size={17} />}
          />
          <InfoItem
            label="Telefone"
            value={company.phone}
            icon={<Phone size={17} />}
          />
          <InfoItem
            label="Localidade"
            value={company.city}
            icon={<MapPin size={17} />}
          />
          <InfoItem
            label="Registada em"
            value={formatDate(company.createdAt)}
          />
        </div>

        <div className="mt-6 border-t pt-5">
          <p className="text-sm font-medium text-slate-500">Morada</p>
          <p className="mt-1 font-medium">{company.address || "-"}</p>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <SectionTitle
          title="Clientes recentes"
          count={company._count.clients}
        />

        {!company.clients?.length ? (
          <EmptyState text="Esta empresa ainda não tem clientes associados." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 text-left">Nome</th>
                  <th className="p-3 text-left">NIF</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Telefone</th>
                  <th className="p-3 text-left">Cidade</th>
                  <th className="p-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {company.clients.map((client) => (
                  <tr key={client.id} className="border-t">
                    <td className="p-3">
                      <Link
                        href={`/clients/${client.id}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {client.name}
                      </Link>
                    </td>
                    <td className="p-3">{client.nif ?? "-"}</td>
                    <td className="p-3">{client.email ?? "-"}</td>
                    <td className="p-3">{client.phone ?? "-"}</td>
                    <td className="p-3">{client.city ?? "-"}</td>
                    <td className="p-3">
                      <span
                        className={
                          client.active
                            ? "rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700"
                            : "rounded-full bg-slate-200 px-3 py-1 text-sm font-medium text-slate-600"
                        }
                      >
                        {client.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl bg-white p-6 shadow">
          <SectionTitle
            title="Utilizadores"
            count={company._count.users}
          />

          {!company.users?.length ? (
            <EmptyState text="Sem utilizadores associados." />
          ) : (
            <div className="space-y-3">
              {company.users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {user.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatRole(user.role)}
                    </p>
                    <p
                      className={`mt-1 text-xs ${
                        user.active ? "text-green-600" : "text-slate-500"
                      }`}
                    >
                      {user.active ? "Ativo" : "Inativo"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl bg-white p-6 shadow">
          <SectionTitle
            title="Simulações recentes"
            count={company._count.simulations}
          />

          {!company.simulations?.length ? (
            <EmptyState text="Sem simulações associadas." />
          ) : (
            <div className="space-y-3">
              {company.simulations.map((simulation) => (
                <div
                  key={simulation.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex justify-between gap-4">
                    <p className="font-semibold">
                      {simulation.insuranceType}
                    </p>
                    <span className="text-sm text-slate-500">
                      {simulation.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Prémio: {formatCurrency(simulation.premium)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white p-5 shadow">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-bold">{value}</p>
      </div>
      <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
        {icon}
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | null | undefined;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-1 flex items-center gap-2 font-medium">
        {icon}
        <span>{value || "-"}</span>
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h2 className="text-xl font-bold">{title}</h2>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
        {count}
      </span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
      {text}
    </div>
  );
}

function getParamId(value: string | string[] | undefined) {
  return Number(Array.isArray(value) ? value[0] : value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-PT").format(new Date(value));
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return "-";
  }

  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatRole(role: string) {
  const labels: Record<string, string> = {
    SUPER_ADMIN: "Super administrador",
    ADMIN: "Administrador",
    MANAGER: "Gestor",
    EMPLOYEE: "Colaborador",
  };

  return labels[role] ?? role;
}
