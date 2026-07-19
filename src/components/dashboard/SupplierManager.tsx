"use client";

import { useActionState } from "react";
import {
  createSupplierAction,
  updateSupplierAction,
  deleteSupplierAction,
  type CatalogActionState,
} from "@/actions/suppliers";

const initialState: CatalogActionState = {};
const inputClass = "input input-bordered w-full rounded-xl";

type Supplier = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  _count: { products: number };
};

export function SupplierManager({ suppliers }: { suppliers: Supplier[] }) {
  const [createState, createAction, createPending] = useActionState(
    createSupplierAction,
    initialState,
  );

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <form
        action={createAction}
        className="rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6"
      >
        <h2 className="text-lg font-semibold">Nouveau fournisseur</h2>
        <div className="mt-4 space-y-3.5">
          {createState.error ? (
            <div className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
              {createState.error}
            </div>
          ) : null}
          {createState.success ? (
            <div className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
              {createState.success}
            </div>
          ) : null}
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Nom</span>
            <input name="name" required className={inputClass} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Email</span>
            <input type="email" name="email" className={inputClass} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Téléphone</span>
            <input name="phone" className={inputClass} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Adresse</span>
            <textarea
              name="address"
              rows={2}
              className="textarea textarea-bordered w-full rounded-xl"
            />
          </label>
          <button
            type="submit"
            disabled={createPending}
            className="btn btn-primary w-full rounded-xl"
          >
            {createPending ? "Création..." : "Créer"}
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold">
          Liste ({suppliers.length})
        </h2>
        {suppliers.length === 0 ? (
          <p className="text-sm opacity-60">Aucun fournisseur pour le moment.</p>
        ) : (
          <ul className="space-y-4">
            {suppliers.map((s) => (
              <SupplierRow key={s.id} supplier={s} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SupplierRow({ supplier }: { supplier: Supplier }) {
  const [state, formAction, pending] = useActionState(
    updateSupplierAction,
    initialState,
  );

  return (
    <li className="rounded-xl border border-base-300 p-4">
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="id" value={supplier.id} />
        {state.error ? (
          <p className="text-sm text-error">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-success">{state.success}</p>
        ) : null}
        <input
          name="name"
          required
          defaultValue={supplier.name}
          className={inputClass}
        />
        <input
          type="email"
          name="email"
          defaultValue={supplier.email ?? ""}
          className={inputClass}
          placeholder="Email"
        />
        <input
          name="phone"
          defaultValue={supplier.phone ?? ""}
          className={inputClass}
          placeholder="Téléphone"
        />
        <textarea
          name="address"
          rows={2}
          defaultValue={supplier.address ?? ""}
          className="textarea textarea-bordered w-full rounded-xl"
          placeholder="Adresse"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs opacity-50">
            {supplier._count.products} produit
            {supplier._count.products > 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="btn btn-sm btn-primary rounded-lg"
            >
              {pending ? "..." : "Enregistrer"}
            </button>
            <button
              type="submit"
              formAction={deleteSupplierAction}
              className="btn btn-sm btn-ghost text-error rounded-lg"
            >
              Supprimer
            </button>
          </div>
        </div>
      </form>
    </li>
  );
}
