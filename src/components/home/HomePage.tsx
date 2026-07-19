"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/AuthForms";

export function HomePage() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchParams = useSearchParams();

  function openLogin() {
    dialogRef.current?.showModal();
  }

  function closeLogin() {
    dialogRef.current?.close();
  }

  useEffect(() => {
    if (searchParams.get("login") === "1") {
      dialogRef.current?.showModal();
    }
  }, [searchParams]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function onCancel(e: Event) {
      e.preventDefault();
      dialog?.close();
    }

    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, []);

  return (
    <div className="dz-home-bg relative flex min-h-screen flex-col">
      <header className="navbar dz-animate-fade-in px-4 sm:px-8">
        <div className="flex flex-1 items-center">
          <Image
            src="/logo-dealzone.png"
            alt="DealZone"
            width={180}
            height={110}
            className="h-16 w-auto object-contain sm:h-20"
            priority
          />
        </div>
        <div className="flex flex-none gap-2">
          <button
            type="button"
            className="btn btn-primary btn-sm rounded-full sm:btn-md"
            onClick={openLogin}
          >
            Connexion
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-4 text-center">
        <div className="dz-animate-fade-up mb-8 w-full max-w-md">
          <Image
            src="/logo-dealzone.png"
            alt="Logo DealZone"
            width={360}
            height={220}
            priority
            className="mx-auto h-auto w-full max-w-[200px] object-contain sm:max-w-[240px]"
          />
        </div>

        <p className="dz-animate-fade-up dz-delay-1 mx-auto max-w-md text-base leading-relaxed text-base-content/70 sm:text-lg">
          Gérez votre stock en toute simplicité — produits, mouvements et alertes
          au même endroit.
        </p>

        <div className="dz-animate-fade-up dz-delay-2 mt-10 flex w-full max-w-sm justify-center">
          <button
            type="button"
            className="btn btn-primary btn-lg w-full max-w-xs rounded-full"
            onClick={openLogin}
          >
            Connexion
          </button>
        </div>

        <p className="dz-animate-fade-up dz-delay-3 mt-4 max-w-md text-sm opacity-60">
          Les comptes Gestionnaire et Magasinier sont créés uniquement par
          l&apos;administrateur.
        </p>
      </main>

      <footer className="dz-animate-fade-in dz-delay-3 pb-6 text-center text-xs opacity-50">
        © {new Date().getFullYear()} DealZone
      </footer>

      <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box max-h-[92vh] max-w-md overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem] sm:p-8">
          <form method="dialog">
            <button
              type="submit"
              className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 text-[#9CA3AF]"
              aria-label="Fermer"
            >
              ✕
            </button>
          </form>

          <LoginForm />
        </div>
        <form method="dialog" className="modal-backdrop bg-black/50">
          <button type="submit" onClick={closeLogin}>
            close
          </button>
        </form>
      </dialog>
    </div>
  );
}
