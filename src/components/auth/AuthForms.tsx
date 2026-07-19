"use client";

import Image from "next/image";
import { useActionState, useState, type ReactNode } from "react";
import { FaApple, FaGoogle, FaUserCircle } from "react-icons/fa";
import {
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineLockClosed,
  HiOutlineMail,
} from "react-icons/hi";
import { loginAction, type AuthActionState } from "@/actions/auth";

const fieldClass =
  "flex h-14 w-full items-center gap-3 rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-5 text-[#4B5563] shadow-sm transition focus-within:border-[#FF6600] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#FF6600]/20";

const iconClass = "size-[22px] shrink-0 text-[#9CA3AF]";

const inputClass =
  "min-w-0 flex-1 bg-transparent text-base text-[#0A1628] outline-none placeholder:text-[#9CA3AF]";

function FormLogo() {
  return (
    <div className="mb-1 flex justify-center">
      <Image
        src="/logo-dealzone.png"
        alt="DealZone"
        width={160}
        height={100}
        className="h-16 w-auto object-contain sm:h-[4.5rem]"
        priority
      />
    </div>
  );
}

function PillField({
  icon,
  trailing,
  children,
}: {
  icon: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className={fieldClass}>
      {icon}
      {children}
      {trailing}
    </label>
  );
}

function SocialButton({
  icon,
  label,
  variant = "outline",
}: {
  icon: ReactNode;
  label: string;
  variant?: "outline" | "accent" | "muted";
}) {
  const variants = {
    outline:
      "border border-[#E5E7EB] bg-white text-[#0A1628] hover:bg-[#F9FAFB]",
    accent: "border-none bg-[#FFB347] text-[#0A1628] hover:bg-[#ffa833]",
    muted: "border-none bg-[#F3F4F6] text-[#0A1628] hover:bg-[#E5E7EB]",
  };

  return (
    <button
      type="button"
      className={`btn relative h-12 w-full justify-center rounded-full font-medium shadow-sm ${variants[variant]}`}
    >
      <span className="absolute left-5 flex items-center">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

const initialState: AuthActionState = {};

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <FormLogo />

      <h2 className="text-center text-[1.85rem] font-extrabold leading-none tracking-tight text-[#0A1628]">
        Connexion
      </h2>

      <p className="text-center text-sm text-[#6B7280]">
        Accès réservé aux comptes créés par l&apos;administrateur
      </p>

      {state.error ? (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
          {state.error}
        </div>
      ) : null}

      <div className="mt-1 flex flex-col gap-3.5">
        <PillField icon={<HiOutlineMail className={iconClass} />}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </PillField>

        <PillField
          icon={<HiOutlineLockClosed className={iconClass} />}
          trailing={
            <button
              type="button"
              className="shrink-0 p-1 text-[#9CA3AF] hover:text-[#0A1628]"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
                <HiOutlineEyeOff className="size-[22px]" />
              ) : (
                <HiOutlineEye className="size-[22px]" />
              )}
            </button>
          }
        >
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Mot de passe"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </PillField>
      </div>

      <div className="-mt-1 flex justify-end">
        <button
          type="button"
          className="text-sm text-[#9CA3AF] underline underline-offset-2 hover:text-[#0A1628]"
        >
          Mot de passe oublié ?
        </button>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn h-14 w-full rounded-full border-none bg-[#FF6600] text-base font-semibold text-white shadow-md shadow-[#FF6600]/25 hover:bg-[#e85e00] disabled:opacity-60"
      >
        {pending ? "Connexion..." : "Connexion"}
      </button>

      <div className="flex items-center gap-3 py-0.5">
        <div className="h-px flex-1 bg-[#E5E7EB]" />
        <span className="text-sm text-[#9CA3AF]">ou</span>
        <div className="h-px flex-1 bg-[#E5E7EB]" />
      </div>

      <div className="flex flex-col gap-2.5">
        <SocialButton
          icon={<FaGoogle className="size-5 text-[#EA4335]" />}
          label="Continuer avec Google"
          variant="outline"
        />
        <SocialButton
          icon={<FaApple className="size-5 text-black" />}
          label="Continuer avec Apple"
          variant="accent"
        />
        <SocialButton
          icon={<FaUserCircle className="size-5 text-[#6B7280]" />}
          label="Continuer en invité"
          variant="muted"
        />
      </div>
    </form>
  );
}
