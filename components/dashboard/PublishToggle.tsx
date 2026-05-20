"use client";

import { useTransition } from "react";
import { togglePublishEvent } from "@/lib/events/actions";

export function PublishToggle({
  id,
  isPublished,
}: {
  id: string;
  isPublished: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await togglePublishEvent(id, !isPublished);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest transition disabled:opacity-50 ${
        isPublished
          ? "bg-gold/15 text-gold-deep hover:bg-gold/25"
          : "bg-ink/10 text-ink-soft hover:bg-ink/15"
      }`}
      title={isPublished ? "Cliquer pour dépublier" : "Cliquer pour publier"}
    >
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          isPublished ? "bg-gold-deep" : "bg-ink-soft/50"
        }`}
      />
      {pending ? "…" : isPublished ? "Publié" : "Brouillon"}
    </button>
  );
}
