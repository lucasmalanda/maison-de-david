"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadMediaBatch, type ActionResult } from "@/lib/media/actions";
import {
  MEDIA_CATEGORIES,
  type MediaCategorySlug,
} from "@/lib/media/categories";

export function MediaUploader() {
  const router = useRouter();
  const [category, setCategory] = useState<MediaCategorySlug | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (prev, formData) => {
      // On injecte la catégorie sélectionnée et les fichiers en mémoire
      if (category) formData.set("category", category);
      formData.delete("files");
      for (const f of files) formData.append("files", f);

      const result = await uploadMediaBatch(prev, formData);
      if (result.ok) {
        setFiles([]);
        if (inputRef.current) inputRef.current.value = "";
        // Force le re-fetch du Server Component parent pour que la grille
        // reçoive les nouveaux médias sans attendre une navigation.
        router.refresh();
      }
      return result;
    },
    null,
  );

  function appendFiles(newFiles: File[]) {
    setFiles((prev) => [
      ...prev,
      ...newFiles.filter(
        (nf) => !prev.some((p) => p.name === nf.name && p.size === nf.size),
      ),
    ]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
    );
    appendFiles(dropped);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  const canUpload = category !== null && files.length > 0 && !pending;

  return (
    <form action={formAction} className="space-y-5 rounded-lg border border-line bg-parchment p-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gold-deep">
          1. Choisir une catégorie
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {MEDIA_CATEGORIES.map((c) => {
            const active = category === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => setCategory(c.slug)}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition ${
                  active
                    ? "border-gold-deep bg-gold-deep text-cream"
                    : "border-line bg-cream text-ink-soft hover:border-gold hover:text-ink"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gold-deep">
          2. Ajouter des fichiers
        </p>
        <label
          htmlFor="media-files"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-10 text-center transition ${
            isDragging
              ? "border-gold-deep bg-gold/10"
              : "border-line bg-cream/60 hover:border-gold hover:bg-gold/5"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-9 w-9 text-gold-deep">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="font-display text-base italic text-ink">
            Glisse-dépose ou clique pour choisir
          </span>
          <span className="text-xs text-ink-soft">
            Photos (JPG, PNG, AVIF, WebP) ou vidéos (MP4, WebM) — plusieurs à la fois OK
          </span>
          <input
            id="media-files"
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? []);
              appendFiles(picked);
            }}
            className="sr-only"
          />
        </label>
      </div>

      {/* Liste des fichiers en attente */}
      {files.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gold-deep">
            {files.length} fichier{files.length > 1 ? "s" : ""} prêt
            {files.length > 1 ? "s" : ""} à uploader
          </p>
          <ul className="mt-3 space-y-2">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center gap-3 rounded-md bg-cream/70 px-3 py-2 text-sm"
              >
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink/10 text-[10px] font-semibold uppercase text-ink-soft">
                  {f.type.startsWith("video/") ? "VID" : "IMG"}
                </span>
                <span className="min-w-0 flex-1 truncate text-ink">
                  {f.name}
                </span>
                <span className="text-xs text-ink-soft tabular-nums">
                  {(f.size / 1024 / 1024).toFixed(1)} Mo
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  disabled={pending}
                  className="text-xs uppercase tracking-widest text-burgundy hover:underline disabled:opacity-50"
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-soft">
          {category === null
            ? "Sélectionne d'abord une catégorie."
            : files.length === 0
              ? "Ajoute au moins un fichier."
              : `Prêt à uploader ${files.length} fichier${files.length > 1 ? "s" : ""} dans ${MEDIA_CATEGORIES.find((c) => c.slug === category)?.label}.`}
        </p>
        <button
          type="submit"
          disabled={!canUpload}
          className="rounded-md bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-cream transition hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? `Upload de ${files.length}…`
            : `Uploader${files.length ? ` ${files.length}` : ""}`}
        </button>
      </div>

      {/* Messages */}
      {state?.ok && state.uploaded && !state.error && (
        <div className="rounded-md border border-gold/40 bg-gold/10 p-3 text-sm text-ink">
          ✓ {state.uploaded} fichier{state.uploaded > 1 ? "s" : ""} uploadé
          {state.uploaded > 1 ? "s" : ""} avec succès.
        </div>
      )}
      {state?.error && (
        <div className="rounded-md border border-burgundy/30 bg-burgundy/5 p-3 text-sm text-burgundy">
          {state.error}
        </div>
      )}
    </form>
  );
}
