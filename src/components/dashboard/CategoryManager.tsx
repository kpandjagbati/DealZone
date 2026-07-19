"use client";

import { useActionState } from "react";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  type CatalogActionState,
} from "@/actions/categories";

const initialState: CatalogActionState = {};
const inputClass = "input input-bordered w-full rounded-xl";

type Category = {
  id: string;
  name: string;
  description: string | null;
  _count: { products: number };
};

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [createState, createAction, createPending] = useActionState(
    createCategoryAction,
    initialState,
  );

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <form
        action={createAction}
        className="rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6"
      >
        <h2 className="text-lg font-semibold">Nouvelle catégorie</h2>
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
            <input name="name" required className={inputClass} placeholder="Ex. Électronique" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Description</span>
            <textarea
              name="description"
              rows={3}
              className="textarea textarea-bordered w-full rounded-xl"
              placeholder="Optionnel"
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
          Liste ({categories.length})
        </h2>
        {categories.length === 0 ? (
          <p className="text-sm opacity-60">Aucune catégorie pour le moment.</p>
        ) : (
          <ul className="space-y-4">
            {categories.map((cat) => (
              <CategoryRow key={cat.id} category={cat} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CategoryRow({ category }: { category: Category }) {
  const [state, formAction, pending] = useActionState(
    updateCategoryAction,
    initialState,
  );

  return (
    <li className="rounded-xl border border-base-300 p-4">
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="id" value={category.id} />
        {state.error ? (
          <p className="text-sm text-error">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-success">{state.success}</p>
        ) : null}
        <input
          name="name"
          required
          defaultValue={category.name}
          className={inputClass}
        />
        <textarea
          name="description"
          rows={2}
          defaultValue={category.description ?? ""}
          className="textarea textarea-bordered w-full rounded-xl"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs opacity-50">
            {category._count.products} produit
            {category._count.products > 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="btn btn-sm btn-primary rounded-lg"
            >
              {pending ? "..." : "Enregistrer"}
            </button>
            {category._count.products === 0 ? (
              <button
                type="submit"
                formAction={deleteCategoryAction}
                className="btn btn-sm btn-ghost text-error rounded-lg"
              >
                Supprimer
              </button>
            ) : null}
          </div>
        </div>
      </form>
    </li>
  );
}
