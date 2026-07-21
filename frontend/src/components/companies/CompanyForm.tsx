"use client";

import type { FormEvent } from "react";

export type CompanyFormValues = {
  name: string;
  nif: string;
  email: string;
  phone: string;
  address: string;
  city: string;
};

export const emptyCompanyForm: CompanyFormValues = {
  name: "",
  nif: "",
  email: "",
  phone: "",
  address: "",
  city: "",
};

type CompanyFormProps = {
  values: CompanyFormValues;
  onChange: (values: CompanyFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  errorMessage?: string;
};

export default function CompanyForm({
  values,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
  errorMessage,
}: CompanyFormProps) {
  function updateField<K extends keyof CompanyFormValues>(
    field: K,
    value: CompanyFormValues[K],
  ) {
    onChange({
      ...values,
      [field]: value,
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl bg-white p-6 shadow"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <Field label="Nome da empresa *">
            <input
              required
              minLength={2}
              value={values.name}
              onChange={(event) =>
                updateField("name", event.target.value)
              }
              className={inputClass}
              placeholder="Ex.: CampoSeguros, Lda."
            />
          </Field>
        </div>

        <Field label="NIF">
          <input
            value={values.nif}
            onChange={(event) =>
              updateField(
                "nif",
                event.target.value.replace(/\D/g, ""),
              )
            }
            className={inputClass}
            maxLength={9}
            inputMode="numeric"
            placeholder="123456789"
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={values.email}
            onChange={(event) =>
              updateField("email", event.target.value)
            }
            className={inputClass}
            placeholder="geral@empresa.pt"
          />
        </Field>

        <Field label="Telefone">
          <input
            value={values.phone}
            onChange={(event) =>
              updateField("phone", event.target.value)
            }
            className={inputClass}
            placeholder="223 000 000"
          />
        </Field>

        <Field label="Localidade">
          <input
            value={values.city}
            onChange={(event) =>
              updateField("city", event.target.value)
            }
            className={inputClass}
            placeholder="Vila Nova de Gaia"
          />
        </Field>

        <div className="md:col-span-2">
          <Field label="Morada">
            <input
              value={values.address}
              onChange={(event) =>
                updateField("address", event.target.value)
              }
              className={inputClass}
              placeholder="Rua, número e fração"
            />
          </Field>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-5 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-300 px-5 py-3 font-medium hover:bg-slate-50 disabled:opacity-60"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "A guardar..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-medium">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500";
