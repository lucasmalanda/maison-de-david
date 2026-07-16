"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createUser, updatePassword, deleteUser } from "@/lib/users/actions";
import type { AllowedUser } from "@/lib/users/queries";

type Props = {
  users: AllowedUser[];
  currentUserEmail: string;
};

const ROLE_LABEL: Record<AllowedUser["role"], string> = {
  admin: "Admin",
  editor: "Éditeur",
};

export function UsersManager({ users, currentUserEmail }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [pwUser, setPwUser] = useState<AllowedUser | null>(null);
  const [delUser, setDelUser] = useState<AllowedUser | null>(null);

  return (
    <>
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-cream transition hover:bg-gold-deep"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Ajouter un utilisateur
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-line bg-parchment/60">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-deep">
              <th className="px-5 py-4 font-semibold">Email</th>
              <th className="px-5 py-4 font-semibold">Rôle</th>
              <th className="hidden px-5 py-4 font-semibold sm:table-cell">Ajouté le</th>
              <th className="px-5 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-ink-soft">
                  Aucun utilisateur pour le moment.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelf = u.email.toLowerCase() === currentUserEmail.toLowerCase();
                return (
                  <tr key={u.email} className="border-b border-line/60 last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-semibold uppercase text-cream">
                          {u.email.slice(0, 1)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-ink">{u.email}</p>
                          <div className="mt-0.5 flex items-center gap-2">
                            {isSelf && (
                              <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-deep">
                                Vous
                              </span>
                            )}
                            {!u.hasAccount && (
                              <span className="text-[10px] font-semibold uppercase tracking-widest text-burgundy">
                                Compte manquant
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${
                          u.role === "admin"
                            ? "bg-gold/15 text-gold-deep"
                            : "bg-ink/8 text-ink-soft"
                        }`}
                      >
                        {ROLE_LABEL[u.role]}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 text-ink-soft sm:table-cell">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setPwUser(u)}
                          className="rounded-md border border-line px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft transition hover:border-gold hover:text-gold-deep"
                        >
                          Mot de passe
                        </button>
                        <button
                          type="button"
                          onClick={() => setDelUser(u)}
                          disabled={isSelf}
                          title={isSelf ? "Vous ne pouvez pas retirer votre propre accès" : undefined}
                          className="rounded-md border border-line px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft transition hover:border-burgundy/50 hover:text-burgundy disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-soft"
                        >
                          Retirer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {addOpen && <AddUserModal onClose={() => setAddOpen(false)} />}
      {pwUser && <PasswordModal user={pwUser} onClose={() => setPwUser(null)} />}
      {delUser && <DeleteModal user={delUser} onClose={() => setDelUser(null)} />}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Modale générique                                                    */
/* ------------------------------------------------------------------ */

function Modal({
  title,
  eyebrow,
  onClose,
  children,
}: {
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-line bg-parchment p-7 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-deep">
              {eyebrow}
            </p>
            <h2 className="mt-1 font-display text-2xl text-ink">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition hover:bg-cream"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-semibold uppercase tracking-widest text-gold-deep">
      {children}
    </label>
  );
}

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-cream px-4 py-3 text-base text-ink placeholder:text-ink-soft/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";

/* ------------------------------------------------------------------ */
/* Ajouter un utilisateur                                              */
/* ------------------------------------------------------------------ */

function AddUserModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "editor">("editor");
  const [pending, startTransition] = useTransition();
  // Écran de confirmation qui affiche le mdp une dernière fois.
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;

    const fd = new FormData();
    fd.set("email", email);
    fd.set("password", password);
    fd.set("role", role);

    startTransition(async () => {
      const res = await createUser(fd);
      if (res.ok) {
        toast.success(`Utilisateur ${res.createdEmail} créé.`);
        setCreated({ email: res.createdEmail ?? email, password });
      } else {
        toast.error(res.error ?? "Impossible de créer l'utilisateur.");
      }
    });
  }

  function generatePassword() {
    // Génère un mdp lisible de 14 caractères, côté client.
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    const arr = new Uint32Array(14);
    crypto.getRandomValues(arr);
    setPassword(Array.from(arr, (n) => chars[n % chars.length]).join(""));
  }

  if (created) {
    return (
      <Modal eyebrow="Utilisateur créé" title="Note le mot de passe." onClose={onClose}>
        <p className="text-sm text-ink-soft">
          Le compte de <span className="font-semibold text-ink">{created.email}</span> est prêt.
          Transmets-lui ces identifiants — le mot de passe ne sera plus affiché.
        </p>
        <div className="mt-5 space-y-3">
          <CopyRow label="Email" value={created.email} />
          <CopyRow label="Mot de passe" value={created.password} mono />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-md bg-ink px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-cream transition hover:bg-gold-deep"
        >
          J&apos;ai noté, fermer
        </button>
      </Modal>
    );
  }

  return (
    <Modal eyebrow="Nouvel accès" title="Ajouter un utilisateur." onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Email</Label>
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="prenom@exemple.com"
            className={inputClass}
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label>Mot de passe</Label>
            <button
              type="button"
              onClick={generatePassword}
              className="text-[10px] font-semibold uppercase tracking-widest text-gold-deep transition hover:text-ink"
            >
              Générer
            </button>
          </div>
          <input
            type="text"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8 caractères minimum"
            className={`${inputClass} font-mono tracking-wider`}
          />
        </div>
        <div>
          <Label>Rôle</Label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {(["editor", "admin"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-md border px-4 py-2.5 text-xs font-semibold uppercase tracking-widest transition ${
                  role === r
                    ? "border-gold bg-gold/10 text-gold-deep"
                    : "border-line bg-cream text-ink-soft hover:border-gold/50"
                }`}
              >
                {r === "admin" ? "Admin" : "Éditeur"}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            {role === "admin"
              ? "Accès complet, y compris la gestion des utilisateurs."
              : "Peut gérer le contenu, mais pas les utilisateurs."}
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border border-line px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft transition hover:border-ink/30"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={pending || !email || !password}
            className="flex-1 rounded-md bg-ink px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-cream transition hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Création…" : "Créer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Modifier le mot de passe                                            */
/* ------------------------------------------------------------------ */

function PasswordModal({ user, onClose }: { user: AllowedUser; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    startTransition(async () => {
      const res = await updatePassword(user.email, password);
      if (res.ok) {
        toast.success(`Mot de passe de ${user.email} mis à jour.`);
        onClose();
      } else {
        toast.error(res.error ?? "Impossible de modifier le mot de passe.");
      }
    });
  }

  function generatePassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    const arr = new Uint32Array(14);
    crypto.getRandomValues(arr);
    setPassword(Array.from(arr, (n) => chars[n % chars.length]).join(""));
  }

  return (
    <Modal eyebrow="Sécurité" title="Nouveau mot de passe." onClose={onClose}>
      <p className="text-sm text-ink-soft">
        Pour <span className="font-semibold text-ink">{user.email}</span>. Pense à lui
        communiquer le nouveau mot de passe.
      </p>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <Label>Nouveau mot de passe</Label>
            <button
              type="button"
              onClick={generatePassword}
              className="text-[10px] font-semibold uppercase tracking-widest text-gold-deep transition hover:text-ink"
            >
              Générer
            </button>
          </div>
          <input
            type="text"
            required
            minLength={8}
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8 caractères minimum"
            className={`${inputClass} font-mono tracking-wider`}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border border-line px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft transition hover:border-ink/30"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={pending || !password}
            className="flex-1 rounded-md bg-ink px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-cream transition hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Mise à jour…" : "Mettre à jour"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Supprimer                                                           */
/* ------------------------------------------------------------------ */

function DeleteModal({ user, onClose }: { user: AllowedUser; onClose: () => void }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteUser(user.email);
      if (res.ok) {
        toast.success(`${user.email} n'a plus accès.`);
        onClose();
      } else {
        toast.error(res.error ?? "Impossible de retirer l'utilisateur.");
      }
    });
  }

  return (
    <Modal eyebrow="Confirmation" title="Retirer l'accès ?" onClose={onClose}>
      <p className="text-sm text-ink-soft">
        Le compte de <span className="font-semibold text-ink">{user.email}</span> sera
        supprimé définitivement, ainsi que son accès au dashboard. Cette action est
        irréversible.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-md border border-line px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft transition hover:border-ink/30"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="flex-1 rounded-md bg-burgundy px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-cream transition hover:bg-burgundy/85 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Suppression…" : "Retirer définitivement"}
        </button>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Ligne copiable                                                      */
/* ------------------------------------------------------------------ */

function CopyRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(value).then(
      () => {
        setCopied(true);
        toast.success(`${label} copié.`);
        setTimeout(() => setCopied(false), 1500);
      },
      () => toast.error("Copie impossible."),
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-cream px-4 py-3">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gold-deep">{label}</p>
        <p className={`truncate text-ink ${mono ? "font-mono tracking-wider" : ""}`}>{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-md border border-line px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-ink-soft transition hover:border-gold hover:text-gold-deep"
      >
        {copied ? "Copié ✓" : "Copier"}
      </button>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-CH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
