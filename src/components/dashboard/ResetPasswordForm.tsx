"use client";

import { useActionState, useState } from "react";
import {
  resetUserPasswordAction,
  type AuthActionState,
} from "@/actions/auth";

const initialState: AuthActionState = {};

type Props = {
  userId: string;
  userName: string;
  userEmail: string;
};

export function ResetPasswordForm({ userId, userName, userEmail }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    resetUserPasswordAction,
    initialState,
  );

  if (!open) {
    return (
      <button
        type="button"
        className="btn btn-ghost btn-xs rounded-lg"
        onClick={() => setOpen(true)}
      >
        Mot de passe
      </button>
    );
  }

  return (
    <div className="mt-1 rounded-xl border border-base-300 bg-base-200/50 p-3">
      <p className="mb-2 text-xs font-medium opacity-70">
        Nouveau mot de passe — {userName}
      </p>
      {state.error ? (
        <div className="mb-2 rounded-lg bg-error/10 px-3 py-2 text-xs text-error">
          {state.error}
        </div>
      ) : null}
      {state.success ? (
        <div className="mb-2 rounded-lg bg-success/10 px-3 py-2 text-xs text-success">
          <p>{state.success}</p>
          {state.createdPassword ? (
            <p className="mt-1 font-mono text-base-content">
              {userEmail} / {state.createdPassword}
            </p>
          ) : null}
        </div>
      ) : null}
      <form action={formAction} className="flex flex-col gap-2">
        <input type="hidden" name="userId" value={userId} />
        <input
          type="password"
          name="password"
          required
          minLength={6}
          className="input input-bordered input-sm w-full rounded-lg"
          placeholder="Nouveau mot de passe"
        />
        <input
          type="password"
          name="confirmPassword"
          required
          minLength={6}
          className="input input-bordered input-sm w-full rounded-lg"
          placeholder="Confirmer"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary btn-xs rounded-lg"
          >
            {pending ? "..." : "Enregistrer"}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-xs rounded-lg"
            onClick={() => setOpen(false)}
          >
            Fermer
          </button>
        </div>
      </form>
    </div>
  );
}
