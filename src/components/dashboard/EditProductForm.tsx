"use client";

import { useActionState, useState } from "react";
import {
  updateProductAction,
  toggleProductActiveAction,
  type ProductActionState,
} from "@/actions/products";
import { HiOutlinePhotograph } from "react-icons/hi";

const initialState: ProductActionState = {};
const inputClass = "input input-bordered w-full rounded-xl";

type Option = { id: string; name: string };

type Product = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  unit: string;
  purchasePrice: string | number;
  salePrice: string | number;
  quantity: number;
  alertThreshold: number;
  categoryId: string;
  supplierId: string | null;
  imageUrl: string | null;
  isActive: boolean;
};

type Props = {
  product: Product;
  categories: Option[];
  suppliers: Option[];
};

export function EditProductForm({ product, categories, suppliers }: Props) {
  const [state, formAction, pending] = useActionState(
    updateProductAction,
    initialState,
  );
  const [preview, setPreview] = useState<string | null>(product.imageUrl);
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-base-300 p-3">
      <div className="flex items-center gap-3">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-base-200">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center opacity-30">
              <HiOutlinePhotograph className="size-5" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{product.name}</p>
          <p className="text-xs opacity-50">
            {product.sku} · {product.quantity} {product.unit}
            {!product.isActive ? " · Inactif" : ""}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-ghost rounded-lg"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Fermer" : "Modifier"}
        </button>
        <form action={toggleProductActiveAction}>
          <input type="hidden" name="id" value={product.id} />
          <button
            type="submit"
            className={`btn btn-sm rounded-lg ${product.isActive ? "btn-ghost text-error" : "btn-primary"}`}
          >
            {product.isActive ? "Désactiver" : "Réactiver"}
          </button>
        </form>
      </div>

      {open ? (
        <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="id" value={product.id} />
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

          <label className="block space-y-1 sm:col-span-2">
            <span className="text-sm font-medium">Nouvelle image</span>
            <input
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="file-input file-input-bordered file-input-sm w-full rounded-xl"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPreview(URL.createObjectURL(file));
              }}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium">SKU</span>
            <input name="sku" required defaultValue={product.sku} className={inputClass} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Nom</span>
            <input name="name" required defaultValue={product.name} className={inputClass} />
          </label>
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-sm font-medium">Description</span>
            <textarea
              name="description"
              rows={2}
              defaultValue={product.description ?? ""}
              className="textarea textarea-bordered w-full rounded-xl"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Unité</span>
            <input name="unit" required defaultValue={product.unit} className={inputClass} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Seuil alerte</span>
            <input
              type="number"
              name="alertThreshold"
              min={0}
              required
              defaultValue={product.alertThreshold}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Prix achat</span>
            <input
              type="number"
              step="0.01"
              name="purchasePrice"
              min={0}
              required
              defaultValue={Number(product.purchasePrice)}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Prix vente</span>
            <input
              type="number"
              step="0.01"
              name="salePrice"
              min={0}
              required
              defaultValue={Number(product.salePrice)}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Catégorie</span>
            <select
              name="categoryId"
              required
              defaultValue={product.categoryId}
              className="select select-bordered w-full rounded-xl"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Fournisseur</span>
            <select
              name="supplierId"
              defaultValue={product.supplierId ?? ""}
              className="select select-bordered w-full rounded-xl"
            >
              <option value="">— Aucun —</option>
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
            className="btn btn-primary rounded-xl sm:col-span-2"
          >
            {pending ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
