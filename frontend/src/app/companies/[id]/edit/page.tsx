"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import CompanyForm, {
  emptyCompanyForm,
  type CompanyFormValues,
} from "@/components/companies/CompanyForm";
import {
  getCompany,
  getCompanyApiErrorMessage,
  updateCompany,
} from "@/services/companies.service";

export default function EditCompanyPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = getParamId(params.id);

  const [form, setForm] = useState<CompanyFormValues>({
    ...emptyCompanyForm,
  });

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

  useEffect(() => {
    if (!company) {
      return;
    }

    setForm({
      name: company.name,
      nif: company.nif ?? "",
      email: company.email ?? "",
      phone: company.phone ?? "",
      address: company.address ?? "",
      city: company.city ?? "",
    });
  }, [company]);

  const mutation = useMutation({
    mutationFn: () =>
      updateCompany(companyId, {
        name: form.name.trim(),
        nif: form.nif.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["companies"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["company", companyId],
        }),
      ]);

      router.push(`/companies/${companyId}`);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate();
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
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Editar empresa</h1>
        <p className="mt-1 text-slate-500">{company.name}</p>
      </div>

      <CompanyForm
        values={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/companies/${companyId}`)}
        isSubmitting={mutation.isPending}
        submitLabel="Guardar alterações"
        errorMessage={
          mutation.isError
            ? getCompanyApiErrorMessage(
                mutation.error,
                "Não foi possível guardar as alterações.",
              )
            : undefined
        }
      />
    </div>
  );
}

function getParamId(value: string | string[] | undefined) {
  return Number(Array.isArray(value) ? value[0] : value);
}
