"use client";

import { useActionState, useMemo, useState } from "react";
import {
  createMovementAction,
  type MovementActionState,
} from "@/actions/movements";

const initialState: MovementActionState = {};
const inputClass = "input input-bordered w-full rounded-xl";

type ProductOption = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
};

type Props = {
  products: ProductOption[];
  mode: "inout" | "adjust";
};

export function MovementForm({ products, mode }: Props) {
  const [state, formAction, pending] = useActionState(
    createMovementAction,
    initialState,
  );
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [type, setType] = useState<"IN" | "OUT">(mode === "adjust" ? "IN" : "IN");

  const selected = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId],
  );

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 p-5 text-sm opacity-70">
        Aucun produit actif. Créez d&apos;abord des produits.
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6"
    >
      <h2 className="text-lg font-semibold">
        {mode === "adjust" ? "Ajustement d'inventaire" : "Nouveau mouvement"}
      </h2>
      <p className="mt-1 text-sm opacity-60">
        {mode === "adjust"
          ? "Corrigez la quantité réelle constatée sur le terrain."
          : "Enregistrez une entrée ou une sortie de stock."}
      </p>

      <div className="mt-5 space-y-3.5">
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

        {mode === "adjust" ? (
          <input type="hidden" name="type" value="ADJUST" />
        ) : (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Type</span>
            <select
              name="type"
              className="select select-bordered w-full rounded-xl"
              value={type}
              onChange={(e) => setType(e.target.value as "IN" | "OUT")}
            >
              <option value="IN">Entrée (IN)</option>
              <option value="OUT">Sortie (OUT)</option>
            </select>
          </label>
        )}

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Produit</span>
          <select
            name="productId"
            required
            className="select select-bordered w-full rounded-xl"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) — {p.quantity} {p.unit}
              </option>
            ))}
          </select>
          {selected ? (
            <span className="text-xs opacity-50">
              Stock actuel : {selected.quantity} {selected.unit}
            </span>
          ) : null}
        </label>

        {mode === "adjust" ? (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Quantité réelle (cible)</span>
            <input
              type="number"
              name="targetQuantity"
              required
              min={0}
              defaultValue={selected?.quantity ?? 0}
              key={selected?.id}
              className={inputClass}
            />
          </label>
        ) : (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Quantité</span>
            <input
              type="number"
              name="quantity"
              required
              min={1}
              defaultValue={1}
              className={inputClass}
            />
          </label>
        )}

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Motif</span>
          <input
            name="reason"
            required
            className={inputClass}
            placeholder={
              mode === "adjust"
                ? "Inventaire physique"
                : type === "IN"
                  ? "Réception fournisseur"
                  : "Vente / livraison"
            }
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Référence</span>
          <input
            name="reference"
            className={inputClass}
            placeholder="N° BL, facture…"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Note</span>
          <textarea
            name="note"
            rows={2}
            className="textarea textarea-bordered w-full rounded-xl"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary w-full rounded-xl"
        >
          {pending ? "Enregistrement..." : "Valider"}
        </button>
      </div>
    </form>
  );
}
