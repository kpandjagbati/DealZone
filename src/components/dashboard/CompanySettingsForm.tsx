"use client";

import { useActionState } from "react";
import {
  updateCompanySettingsAction,
  type SettingsActionState,
} from "@/actions/settings";

const initialState: SettingsActionState = {};
const inputClass = "input input-bordered w-full rounded-xl";

type Props = {
  companyName: string;
  address: string | null;
  currency: string;
  defaultAlertThreshold: number;
};

export function CompanySettingsForm(props: Props) {
  const [state, formAction, pending] = useActionState(
    updateCompanySettingsAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3.5">
      {state.error ? (
        <div className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
          {state.error}
        </div>
      ) : null}
      {state.success ? (
        <div className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
          {state.success}
        </div>
      ) : null}

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Nom de l&apos;entreprise</span>
        <input
          name="companyName"
          required
          defaultValue={props.companyName}
          className={inputClass}
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Adresse</span>
        <textarea
          name="address"
          rows={2}
          defaultValue={props.address ?? ""}
          className="textarea textarea-bordered w-full rounded-xl"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Devise</span>
        <input
          name="currency"
          required
          defaultValue={props.currency}
          className={inputClass}
          placeholder="XOF"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Seuil d&apos;alerte par défaut</span>
        <input
          type="number"
          name="defaultAlertThreshold"
          min={0}
          required
          defaultValue={props.defaultAlertThreshold}
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary rounded-xl"
      >
        {pending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
