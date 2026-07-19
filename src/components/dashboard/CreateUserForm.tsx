"use client";

import { useActionState, useState } from "react";
import {
  createStaffUserAction,
  type AuthActionState,
} from "@/actions/auth";
import { HiOutlineEye, HiOutlineEyeOff, HiOutlinePhotograph } from "react-icons/hi";

const initialState: AuthActionState = {};
const inputClass = "input input-bordered w-full rounded-xl";

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(
    createStaffUserAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6"
    >
      <h2 className="text-lg font-semibold">Créer un utilisateur</h2>
      <p className="mt-1 text-sm opacity-60">
        Définissez l&apos;email, le mot de passe et la photo de profil.
      </p>

      <div className="mt-5 space-y-3.5">
        {state.error ? (
          <div className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
            {state.error}
          </div>
        ) : null}

        {state.success ? (
          <div className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
            <p className="font-semibold">{state.success}</p>
            {state.createdEmail && state.createdPassword ? (
              <div className="mt-2 rounded-lg bg-base-100/80 p-3 font-mono text-xs leading-relaxed text-base-content">
                <p>Rôle : {state.createdRole}</p>
                <p>Email : {state.createdEmail}</p>
                <p>Mot de passe : {state.createdPassword}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-16 rounded-full bg-base-200 ring ring-base-300">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Aperçu" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-base-content/30">
                  <HiOutlinePhotograph className="size-7" />
                </div>
              )}
            </div>
          </div>
          <label className="block flex-1 space-y-1.5">
            <span className="text-sm font-medium">Photo de profil</span>
            <input
              type="file"
              name="avatar"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="file-input file-input-bordered file-input-sm w-full rounded-xl"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPreview(URL.createObjectURL(file));
                else setPreview(null);
              }}
            />
            <span className="text-xs opacity-50">JPG, PNG, WEBP — max 5 Mo</span>
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Nom complet</span>
          <input name="name" required className={inputClass} placeholder="Nom" />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            name="email"
            required
            className={inputClass}
            placeholder="email@exemple.com"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Mot de passe d&apos;accès</span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              minLength={6}
              className={`${inputClass} pr-12`}
              placeholder="Minimum 6 caractères"
            />
            <button
              type="button"
              className="btn btn-ghost btn-circle btn-sm absolute right-1.5 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword((v) => !v)}
              aria-label="Afficher / masquer"
            >
              {showPassword ? (
                <HiOutlineEyeOff className="size-5" />
              ) : (
                <HiOutlineEye className="size-5" />
              )}
            </button>
          </div>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Confirmer le mot de passe</span>
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            required
            minLength={6}
            className={inputClass}
            placeholder="Retapez le mot de passe"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Rôle</span>
          <select
            name="role"
            required
            className="select select-bordered w-full rounded-xl"
            defaultValue="GESTIONNAIRE"
          >
            <option value="GESTIONNAIRE">Gestionnaire</option>
            <option value="MAGASINIER">Magasinier</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary mt-1 w-full rounded-xl"
        >
          {pending ? "Création..." : "Créer le compte"}
        </button>
      </div>
    </form>
  );
}
