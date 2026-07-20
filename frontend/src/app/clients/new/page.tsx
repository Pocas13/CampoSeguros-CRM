"use client";

import {
  type FormEvent,
  useState,
} from "react";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import ClientForm, {
  emptyClientForm,
  type ClientFormValues,
} from "@/components/clients/ClientForm";

import {
  createClient,
  getApiErrorMessage,
} from "@/services/clients";

export default function NewClientPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] =
    useState<ClientFormValues>({
      ...emptyClientForm,
    });

  const mutation = useMutation({
    mutationFn: createClient,

    onSuccess: async (client) => {
      await queryClient.invalidateQueries({
        queryKey: ["clients"],
      });

      router.push(`/clients/${client.id}`);
    },
  });

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    mutation.mutate({
      name: form.name.trim(),
      nif: form.nif.trim() || null,
      birthDate: form.birthDate || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      postalCode:
        form.postalCode.trim() || null,
      city: form.city.trim() || null,
      notes: form.notes.trim() || null,
      companyId: 1,
    });
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Novo cliente
        </h1>

        <p className="mt-1 text-slate-500">
          Registar um novo cliente no CRM.
        </p>
      </div>

      <ClientForm
        values={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        onCancel={() =>
          router.push("/clients")
        }
        isSubmitting={mutation.isPending}
        submitLabel="Guardar cliente"
        errorMessage={
          mutation.isError
            ? getApiErrorMessage(
                mutation.error,
                "Não foi possível criar o cliente.",
              )
            : undefined
        }
      />
    </div>
  );
}