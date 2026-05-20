"use client";

import { useTransition } from "react";
import { deleteEvent } from "@/lib/events/actions";

export function DeleteEventButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (
      !confirm(
        `Supprimer définitivement "${title}" ?\n\nL'événement sera retiré du site. (Le flyer reste dans le stockage par sécurité.)`,
      )
    )
      return;
    startTransition(async () => {
      await deleteEvent(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-xs font-semibold uppercase tracking-widest text-burgundy transition hover:underline disabled:opacity-50"
    >
      {pending ? "…" : "Supprimer"}
    </button>
  );
}
