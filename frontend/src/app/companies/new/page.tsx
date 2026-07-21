"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import CompanyForm, {
  emptyCompanyForm,
  type CompanyFormValues,
} from "@/components/companies/CompanyForm";
import {
  createCompany,
  getCompanyApiErrorMessage,
} from "@/services/companies.service";

export default function NewCompanyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CompanyFormValues>({
    ...emptyCompanyForm,
  });

  const mutation = useMutation({
    mutationFn: createCompany,
    onSuccess: async (company) => {
      await queryClient.invalidateQueries({
        queryKey: ["companies"],
      });
      router.push(`/companies/${company.id}`);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    mutation.mutate({
      name: form.name.trim(),
      nif: form.nif.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      city: form.city.trim() || null,
    });
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nova empresa</h1>
        <p className="mt-1 text-slate-500">
          Registar uma empresa no InsureFlow.
        </p>
      </div>

      <CompanyForm
        values={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/companies")}
        isSubmitting={mutation.isPending}
        submitLabel="Guardar empresa"
        errorMessage={
          mutation.isError
            ? getCompanyApiErrorMessage(
                mutation.error,
                "Não foi possível criar a empresa.",
              )
            : undefined
        }
      />
    </div>
  );
}
