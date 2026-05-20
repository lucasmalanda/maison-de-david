# 🔑 Ressources & comptes externes — Phase 2

> Ce document liste **TOUS** les comptes/services externes nécessaires pour la phase 2.
> **Tu n'as RIEN à créer maintenant** — Claude Code te guidera étape par étape pour chaque service au bon moment.

---

## 📦 Récapitulatif

| # | Service | Quand | À quoi ça sert | Coût |
|---|---------|-------|----------------|------|
| 1 | **Supabase** | Étape 3 | Base de données + connexion + stockage photos | Gratuit |
| 2 | **Google Cloud** | Étape 4 | Connexion "via Google" | Gratuit |
| 3 | **Resend** | Étape 8 | Envoi d'emails formulaire | Gratuit (3000/mois) |
| 4 | **Stripe** | Étape 9a | Paiement carte bancaire | Gratuit (~3% commission) |
| 5 | **PayPal Business** | Étape 9b | Paiement PayPal | Gratuit (~3.4% commission) |
| 6 | **GitHub** | Déjà fait ✅ | Hébergement code |
| 7 | **Vercel** | Déjà fait ✅ | Déploiement |

---

## 1. 🟢 Supabase (le plus important)

**Ce que c'est** : un service tout-en-un :
- Base de données pour stocker événements, photos, messages
- Système de connexion/inscription pour les bénévoles
- Espace de stockage pour images et flyers

**Comment créer ton compte** :
1. Va sur https://supabase.com
2. Clique "Start your project"
3. Connecte-toi avec **GitHub** (le plus simple)
4. Crée un projet :
   - Nom : `maison-de-david`
   - Région : **Frankfurt (eu-central-1)** ⚠️ TRÈS important
   - Mot de passe DB : génère un fort + sauvegarde-le

⏱️ **5 minutes max**, gratuit, pas besoin de carte bancaire.

**Quand on l'utilisera** : Étape 3 du brief

---

## 2. 🔵 Google Cloud (pour "Connexion avec Google")

**Ce que c'est** : Google demande qu'on déclare notre site avant de permettre à tes bénévoles de se connecter via leur compte Google.

**Comment ça marche** : Claude Code te guidera pour :
1. Aller sur https://console.cloud.google.com
2. Créer un "projet"
3. Activer l'API "Google Sign-In"
4. Récupérer un **Client ID** et **Client Secret**
5. Les coller dans Supabase

⏱️ **Compte 5-10 minutes**. Un peu fastidieux mais on le fait une seule fois.

**Quand on l'utilisera** : Étape 4 du brief

---

## 3. 📧 Resend (envoi d'emails)

**Ce que c'est** : service qui permet à ton site d'envoyer des emails (formulaire de contact).

**Pourquoi pas Gmail ?** Gmail bloque les envois automatiques. Resend est conçu pour ça.

**Comment créer ton compte** :
1. https://resend.com
2. "Get Started"
3. Connecte-toi avec GitHub ou email
4. **3000 emails gratuits/mois** (largement assez)

**Quand on l'utilisera** : Étape 8 du brief

---

## 4. 💳 Stripe (paiement carte bancaire)

**Ce que c'est** : solution de paiement la plus utilisée (Apple, Spotify, Substack...).

**Tarifs** : ~2.9% + 0.30 CHF par transaction. Pas d'abonnement.

Exemple : sur un don de 100 CHF, Stripe prend ~3.20 CHF, tu reçois ~96.80 CHF.

**Création** : ⚠️ Plus long que les autres (vérification d'identité). Prévois 15-20 min, et il te faudra :
- Pièce d'identité (passeport ou carte)
- IBAN suisse (compte de l'asso)
- Justificatif d'adresse
- Numéro d'enregistrement de l'association

⚠️ Si l'asso n'est pas encore enregistrée officiellement, **on peut commencer en mode test** (faux paiements). Le mode test fonctionne 100% — c'est juste qu'il ne reçoit pas d'argent réel. On passera en mode "live" quand tu seras prêt.

**Quand on l'utilisera** : Étape 9a du brief

---

## 5. 🅿️ PayPal Business

**Ce que c'est** : option alternative pour ceux qui ont un compte PayPal.

**Tarifs** : ~3.4% + 0.55 CHF par transaction.

**Tu en as déjà un ?** Tu peux convertir ton PayPal personnel en Business gratuitement. Sinon https://paypal.com → "Créer un compte Business".

**Quand on l'utilisera** : Étape 9b du brief

---

## 6. 📱 TWINT (déjà OK)

**Tu l'as déjà** ✅ — ton QR code `twint-qr.avif` est dans le kit.

**Quand on l'utilisera** : Étape 9c — Claude Code copiera l'image dans `/public/`.

---

## 💰 Récap des frais pour 1000 CHF de dons

| Moyen | Frais | Tu reçois |
|-------|-------|-----------|
| **TWINT QR** | 0% | **1000 CHF** ✨ |
| **Stripe (CB)** | ~2.9% | ~971 CHF |
| **PayPal** | ~3.4% | ~966 CHF |

**Conseil** : mets en avant TWINT en premier sur la page de don 😉

Pour les autres services : **0 CHF** au volume d'une asso.

---

## ⏱️ Quand on aura besoin de chaque compte

| Quand | Quoi |
|-------|------|
| Étape 3 | Supabase |
| Étape 4 | Google Cloud |
| Étape 8 | Resend |
| Étape 9a | Stripe |
| Étape 9b | PayPal Business |

À chaque fois, Claude Code te le dira et te guidera. **Tu n'as rien à préparer en avance.**

---

## 🆘 Si tu te perds

Reviens dans la conversation Claude (claude.ai), je suis là.
Tu peux aussi demander à Claude Code : *"Explique-moi en 2 phrases ce qu'on est en train de faire."*

Bonne chance ! 🚀
