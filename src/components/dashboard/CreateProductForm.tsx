"use client";

import { useActionState, useState } from "react";
import {
  createProductAction,
  type ProductActionState,
} from "@/actions/products";
import { HiOutlinePhotograph } from "react-icons/hi";

const initialState: ProductActionState = {};
const inputClass = "input input-bordered w-full rounded-xl";

type Option = { id: string; name: string };

type Props = {
  categories: Option[];
  suppliers: Option[];
};

export function CreateProductForm({ categories, suppliers }: Props) {
  const [state, formAction, pending] = useActionState(
    createProductAction,
    initialState,
  );
  const [preview, setPreview] = useState<string | null>(null);

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 p-5 text-sm opacity-70">
        Créez d&apos;abord au moins une catégorie avant d&apos;ajouter un produit.
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6"
    >
      <h2 className="text-lg font-semibold">Ajouter un produit</h2>
      <p className="mt-1 text-sm opacity-60">
        Renseignez les infos et joignez une image du produit.
      </p>

      <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
        {state.error ? (
          <div className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error sm:col-span-2">
            {state.error}
          </div>
        ) : null}
        {state.success ? (
          <div className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success sm:col-span-2">
            {state.success}
          </div>
        ) : null}

        <div className="flex items-center gap-4 sm:col-span-2">
          <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-base-200 ring ring-base-300">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Aperçu" className="size-full object-cover" />
            ) : (
              <HiOutlinePhotograph className="size-8 opacity-30" />
            )}
          </div>
          <label className="block flex-1 space-y-1.5">
            <span className="text-sm font-medium">Image du produit</span>
            <input
              type="file"
              name="image"
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
          <span className="text-sm font-medium">SKU / Code</span>
          <input name="sku" required className={inputClass} placeholder="ELEC-001" />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Nom</span>
          <input
            name="name"
            required
            className={inputClass}
            placeholder="Nom du produit"
          />
        </label>

        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium">Description</span>
          <textarea
            name="description"
            className="textarea textarea-bordered w-full rounded-xl"
            rows={2}
            placeholder="Description (optionnel)"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Unité</span>
          <input
            name="unit"
            defaultValue="pièce"
            required
            className={inputClass}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Quantité initiale</span>
          <input
            type="number"
            name="quantity"
            min={0}
            defaultValue={0}
            required
            className={inputClass}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Prix d&apos;achat</span>
          <input
            type="number"
            name="purchasePrice"
            min={0}
            step="0.01"
            defaultValue={0}
            required
            className={inputClass}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Prix de vente</span>
          <input
            type="number"
            name="salePrice"
            min={0}
            step="0.01"
            defaultValue={0}
            required
            className={inputClass}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Seuil d&apos;alerte</span>
          <input
            type="number"
            name="alertThreshold"
            min={0}
            defaultValue={5}
            required
            className={inputClass}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Catégorie</span>
          <select
            name="categoryId"
            required
            className="select select-bordered w-full rounded-xl"
            defaultValue=""
          >
            <option value="" disabled>
              Choisir…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium">Fournisseur (optionnel)</span>
          <select
            name="supplierId"
            className="select select-bordered w-full rounded-xl"
            defaultValue=""
          >
            <option value="">Aucun</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary mt-1 rounded-xl sm:col-span-2"
        >
          {pending ? "Enregistrement..." : "Ajouter le produit"}
        </button>
      </div>
    </form>
  );
}
