"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import {
  updateMyAvatarAction,
  type AuthActionState,
} from "@/actions/auth";
import { HiOutlinePhotograph } from "react-icons/hi";

const initialState: AuthActionState = {};

type Props = {
  name: string;
  email: string;
  avatarUrl: string | null;
};

export function ProfileAvatarForm({ name, email, avatarUrl }: Props) {
  const [state, formAction, pending] = useActionState(
    updateMyAvatarAction,
    initialState,
  );
  const [preview, setPreview] = useState<string | null>(avatarUrl);

  return (
    <form action={formAction} className="space-y-4">
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

      <div className="flex items-center gap-4">
        <div className="relative size-20 overflow-hidden rounded-full bg-base-200 ring-2 ring-primary/30">
          {preview ? (
            <Image
              src={preview}
              alt={name}
              fill
              className="object-cover"
              sizes="80px"
              unoptimized
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xl font-bold text-primary">
              {name.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{name}</p>
          <p className="text-sm opacity-50">{email}</p>
        </div>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Choisir une photo</span>
        <input
          type="file"
          name="avatar"
          accept="image/jpeg,image/png,image/webp,image/gif"
          required
          className="file-input file-input-bordered w-full rounded-xl"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setPreview(URL.createObjectURL(file));
          }}
        />
        <span className="flex items-center gap-1 text-xs opacity-50">
          <HiOutlinePhotograph className="size-4" />
          JPG, PNG, WEBP — max 5 Mo
        </span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary rounded-xl"
      >
        {pending ? "Enregistrement..." : "Enregistrer la photo"}
      </button>
    </form>
  );
}
