"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteMedia } from "@/lib/media/actions";

export function DeleteMediaButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (
      !confirm(
        "Supprimer définitivement ce média ?\n\nLe fichier sera retiré du stockage et n'apparaîtra plus sur le site.",
      )
    )
      return;
    startTransition(async () => {
      await deleteMedia(id);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink/80 text-cream backdrop-blur-sm transition hover:bg-burgundy disabled:opacity-50"
      title="Supprimer"
      aria-label="Supprimer ce média"
    >
      {pending ? (
        <span className="text-xs">…</span>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
        </svg>
      )}
    </button>
  );
}
