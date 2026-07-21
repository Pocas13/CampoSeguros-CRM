"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import ClientForm, {
  emptyClientForm,
  type ClientFormValues,
} from "@/components/clients/ClientForm";

import {
  getApiErrorMessage,
  getClient,
  updateClient,
} from "@/services/clients";

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const rawId = params.id;

  const clientId = Number(
    Array.isArray(rawId)
      ? rawId[0]
      : rawId,
  );

  const [form, setForm] =
    useState<ClientFormValues>({
      ...emptyClientForm,
    });

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

  useEffect(() => {
    if (!client) {
      return;
    }

    setForm({
      type: client.type ?? "INDIVIDUAL",
      name: client.name,
      nif: client.nif ?? "",
      birthDate: client.birthDate
        ? client.birthDate.slice(0, 10)
        : "",
      incorporationDate: client.incorporationDate ? client.incorporationDate.slice(0,10) : "",
      cae: client.cae ?? "",
      representativeName: client.representativeName ?? "",
      email: client.email ?? "",
      phone: client.phone ?? "",
      address: client.address ?? "",
      postalCode:
        client.postalCode ?? "",
      city: client.city ?? "",
      country: client.country ?? "Portugal",
      notes: client.notes ?? "",
      active: client.active,
    });
  }, [client]);

  const mutation = useMutation({
    mutationFn: () =>
      updateClient(clientId, {
        type: form.type,
        name: form.name.trim(),
        nif: form.nif.trim() || null,
        birthDate: form.type === "INDIVIDUAL" ? form.birthDate || null : null,
        incorporationDate: form.type === "BUSINESS" ? form.incorporationDate || null : null,
        cae: form.type === "BUSINESS" ? form.cae.trim() || null : null,
        representativeName: form.type === "BUSINESS" ? form.representativeName.trim() || null : null,
        email:
          form.email.trim() || null,
        phone:
          form.phone.trim() || null,
        address:
          form.address.trim() || null,
        postalCode:
          form.postalCode.trim() || null,
        city: form.city.trim() || null,
        country: form.country.trim() || null,
        notes:
          form.notes.trim() || null,
        active: form.active,
      }),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["clients"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["client", clientId],
        }),
      ]);

      router.push(`/clients/${clientId}`);
    },
  });

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    mutation.mutate();
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

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Editar cliente
        </h1>

        <p className="mt-1 text-slate-500">
          {client.name}
        </p>
      </div>

      <ClientForm
        values={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        onCancel={() =>
          router.push(
            `/clients/${clientId}`,
          )
        }
        isSubmitting={mutation.isPending}
        submitLabel="Guardar alterações"
        showStatus
        errorMessage={
          mutation.isError
            ? getApiErrorMessage(
                mutation.error,
                "Não foi possível guardar as alterações.",
              )
            : undefined
        }
      />
    </div>
  );
}