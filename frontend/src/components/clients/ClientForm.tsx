"use client";

import type { FormEvent } from "react";

export type ClientFormValues = {
  name: string;
  nif: string;
  birthDate: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  notes: string;
  active: boolean;
};

export const emptyClientForm: ClientFormValues = {
  name: "",
  nif: "",
  birthDate: "",
  email: "",
  phone: "",
  address: "",
  postalCode: "",
  city: "",
  notes: "",
  active: true,
};

type ClientFormProps = {
  values: ClientFormValues;
  onChange: (
    values: ClientFormValues,
  ) => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  errorMessage?: string;
  submitLabel: string;
  showStatus?: boolean;
};

export default function ClientForm({
  values,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  errorMessage,
  submitLabel,
  showStatus = false,
}: ClientFormProps) {
  function updateField<K extends keyof ClientFormValues>(
    field: K,
    value: ClientFormValues[K],
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
          <Field label="Nome completo *">
            <input
              required
              value={values.name}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value,
                )
              }
              className={inputClass}
              placeholder="Nome completo"
            />
          </Field>
        </div>

        <Field label="NIF">
          <input
            value={values.nif}
            onChange={(event) =>
              updateField(
                "nif",
                event.target.value.replace(
                  /\D/g,
                  "",
                ),
              )
            }
            className={inputClass}
            maxLength={9}
            inputMode="numeric"
            placeholder="123456789"
          />
        </Field>

        <Field label="Data de nascimento">
          <input
            type="date"
            value={values.birthDate}
            onChange={(event) =>
              updateField(
                "birthDate",
                event.target.value,
              )
            }
            className={inputClass}
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={values.email}
            onChange={(event) =>
              updateField(
                "email",
                event.target.value,
              )
            }
            className={inputClass}
            placeholder="cliente@email.pt"
          />
        </Field>

        <Field label="Telefone">
          <input
            value={values.phone}
            onChange={(event) =>
              updateField(
                "phone",
                event.target.value,
              )
            }
            className={inputClass}
            placeholder="912345678"
          />
        </Field>

        <div className="md:col-span-2">
          <Field label="Morada">
            <input
              value={values.address}
              onChange={(event) =>
                updateField(
                  "address",
                  event.target.value,
                )
              }
              className={inputClass}
              placeholder="Rua, número e fração"
            />
          </Field>
        </div>

        <Field label="Código postal">
          <input
            value={values.postalCode}
            onChange={(event) =>
              updateField(
                "postalCode",
                event.target.value,
              )
            }
            className={inputClass}
            placeholder="4400-001"
          />
        </Field>

        <Field label="Localidade">
          <input
            value={values.city}
            onChange={(event) =>
              updateField(
                "city",
                event.target.value,
              )
            }
            className={inputClass}
            placeholder="Vila Nova de Gaia"
          />
        </Field>

        {showStatus && (
          <Field label="Estado">
            <select
              value={
                values.active ? "active" : "inactive"
              }
              onChange={(event) =>
                updateField(
                  "active",
                  event.target.value === "active",
                )
              }
              className={inputClass}
            >
              <option value="active">
                Ativo
              </option>

              <option value="inactive">
                Inativo
              </option>
            </select>
          </Field>
        )}

        <div className="md:col-span-2">
          <Field label="Observações">
            <textarea
              value={values.notes}
              onChange={(event) =>
                updateField(
                  "notes",
                  event.target.value,
                )
              }
              className={`${inputClass} resize-none`}
              rows={5}
              placeholder="Informações relevantes sobre o cliente"
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
          {isSubmitting
            ? "A guardar..."
            : submitLabel}
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
      <span className="mb-2 block font-medium">
        {label}
      </span>

      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500";