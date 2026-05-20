# 🚀 DÉMARRER LA PHASE 2 — Maison de David (v2)

> 📌 **Pour Lucas** : ce dossier contient tout ce qu'il faut pour passer du site HTML actuel à un vrai site Next.js avec dashboard d'admin pour gérer photos et flyers d'événements.
> Prends ton temps, lis ce fichier en entier avant de commencer.

---

## 🎉 Ce que tu as déjà accompli (Phase 1 — terminée ✅)

Tu as un **superbe site en ligne** sur Vercel à l'URL `site-live-xxx.vercel.app` :

- ✅ Hero cinématique avec **scrollytelling vidéo** (mini-film montagne → oasis → médaillon)
- ✅ Mot d'accueil "Bienvenue. — La Maison de David" en grande typo dorée
- ✅ Boucle pendule du médaillon (sans dos vide)
- ✅ Section Mission (4 piliers)
- ✅ Section Événements (4 cartes)
- ✅ Galerie filtrable par 6 catégories (Évangélisation, Prière, Soins d'âme, Culte, Gospel Night, Atelier Gospel) avec lightbox
- ✅ Bandeau Don
- ✅ Formulaire de contact (visuel uniquement)
- ✅ Footer

**Le site marche déjà, il reste en ligne pendant qu'on construit la v2.**

---

## 🎯 Ce qu'on va construire (Phase 2)

Un **vrai dashboard d'admin** pour que toi + bénévoles puissiez :
- 📸 **Ajouter des photos** dans la galerie (drag & drop, par catégorie)
- 📅 **Créer/modifier des événements** avec date, lieu, description
- 🎫 **Uploader un flyer** par événement → quand on clique sur "Gospel Night" sur le site, le flyer apparaît dans une lightbox
- 💌 **Voir les messages** reçus depuis le formulaire de contact
- 👥 **Inviter des bénévoles** avec leur propre compte

Le tout protégé par **connexion Google** ou **lien magique par email**.

---

## 📦 Contenu de ce kit

| Fichier | Rôle |
|---------|------|
| **`PHASE2-DEMARRER-ICI.md`** (ce fichier) | Ton guide perso, lis-le |
| **`BRIEF-PHASE2.md`** | Instructions complètes pour Claude Code |
| **`PHASE2-RESSOURCES.md`** | Liste des comptes externes à créer (pour info) |
| **`twint-qr.avif`** | Ton QR TWINT pour la page de don |
| **`hero.avif`** | L'image du hero (fallback) |
| **`videos/intro.mp4`** | Mini-film montagne → oasis (10s) |
| **`videos/loop.mp4`** | Boucle pendule médaillon (4s) |
| **`index.html`** | Version actuelle du site (référence visuelle) |

---

## 🎬 Plan d'action (à suivre tranquillement)

### ☀️ Étape 1 — Création du nouveau dossier (2 min)

1. Ouvre l'explorateur Windows
2. Va dans `C:\Users\cindy\Desktop\`
3. **Crée un nouveau dossier** : `maison-de-david-v2`
4. **Glisse-dépose** TOUS les fichiers de ce kit dedans, **dans la même structure** :
   ```
   maison-de-david-v2\
   ├── PHASE2-DEMARRER-ICI.md
   ├── BRIEF-PHASE2.md
   ├── PHASE2-RESSOURCES.md
   ├── twint-qr.avif
   ├── hero.avif
   ├── index.html
   └── videos\
       ├── intro.mp4
       └── loop.mp4
   ```

⚠️ **Ton dossier `site-live` actuel reste intact** ! On ne le touche pas.

### ☀️ Étape 2 — Créer ton compte Supabase (5 min, optionnel mais recommandé)

Pendant que tu peux, va sur **https://supabase.com** et crée ton compte :
1. Clique "Start your project"
2. Connecte-toi avec **GitHub** (le plus simple)
3. Clique "New project"
4. Nom : `maison-de-david`
5. Région : **Frankfurt (eu-central-1)** ⚠️ TRÈS important pour la conformité Suisse/RGPD
6. Mot de passe DB : **génère un fort + sauvegarde-le quelque part** (Notes Apple, gestionnaire de mots de passe, etc.)
7. Attends 2 min que Supabase initialise

Quand on en aura besoin, tu auras juste à me dire "c'est prêt" et on configurera ensemble.

### ☀️ Étape 3 — Ouvrir Claude Code

Dans ton terminal Windows :
```
cd C:\Users\cindy\Desktop\maison-de-david-v2
claude
```

### ☀️ Étape 4 — Donner le brief

**Copie-colle exactement ce message** dans Claude Code :

```
Salut ! On démarre la PHASE 2 du projet "La Maison de David" :
créer un vrai site Next.js avec un dashboard d'admin pour que des bénévoles
puissent gérer la galerie photos et les flyers des événements.

Dans ce dossier tu trouveras :
- BRIEF-PHASE2.md → tes instructions complètes (LIS-LE EN PRIORITÉ)
- PHASE2-RESSOURCES.md → la liste des comptes externes
- index.html → la version actuelle du site (référence design)
- hero.avif → l'image fallback du hero
- twint-qr.avif → le QR TWINT pour la page de don
- videos/intro.mp4 + videos/loop.mp4 → les vidéos du hero

IMPORTANT : le site actuel utilise un SCROLLYTELLING VIDÉO sur le hero
(deux vidéos qui jouent selon le scroll). Cette logique doit être PRÉSERVÉE
dans le nouveau Next.js.

Avant de commencer :
1. Lis BRIEF-PHASE2.md attentivement
2. Lis PHASE2-RESSOURCES.md
3. Inspecte index.html pour bien comprendre le design existant
4. Fais-moi un résumé en 5-6 lignes :
   - Ce que tu as compris du projet
   - Les étapes que tu vas suivre
   - Le premier compte externe que tu vas me demander de créer
5. Attends mon "go" avant de toucher au code

RAPPEL : je suis débutant. Vas-y doucement. Explique les concepts
techniques en français simple. Demande-moi confirmation aux étapes
clés. Fais des commits Git réguliers en français.
```

Appuie sur **Entrée**.

### ☀️ Étape 5 — Tu reviens me voir

Quand Claude Code t'aura fait son résumé, **reviens dans cette conversation Claude.ai** et copie-colle son résumé.

Je vérifierai qu'il est parti dans la bonne direction avant que tu lui dises "go".

---

## 🆘 En cas de pépin

### Si Claude Code part dans une mauvaise direction
Tape simplement : **"Stop, on revient en arrière"** ou **"Non, fais plutôt comme ceci"**. Tu es le boss.

### Si une étape semble compliquée
**Reviens me voir** ici, je traduirai en français simple ou je préparerai un schéma.

### Si Claude Code te demande un mot technique que tu ne comprends pas
**Demande-lui** : *"Tu peux m'expliquer en français simple ?"* Il le fera.

### Si tu casses tout
Pas de panique. **Ton site actuel `site-live` reste en ligne et fonctionne**. Tu peux supprimer le dossier `maison-de-david-v2` et on recommence proprement.

---

## ⏱️ Estimation du temps

**Total : 6 à 8 heures** réparties comme tu veux. Tu peux faire :
- ❌ **PAS** : tout en une fois (tu vas péter un câble)
- ✅ **OUI** : 1-2h par session, sur 4-5 jours
- ✅ **OUI** : une grosse session de 4h le week-end + petites finitions ensuite

### Découpage suggéré
| Session | Quoi | Durée |
|---------|------|-------|
| 1 | Init Next.js + reprise du design (hero, sections) | 1h30-2h |
| 2 | Connexion Supabase + base de données | 1h |
| 3 | Auth (Google + magic link) | 1h |
| 4 | Dashboard : événements + flyers | 1h30 |
| 5 | Dashboard : galerie photos | 1h |
| 6 | Formulaire mail + page don (TWINT/Stripe/PayPal) | 1h |
| 7 | Déploiement + tests | 30 min |

---

## 🎁 Bonus : pendant que tu dors

Si jamais tu te réveilles et que tu as 5 min, va sur **https://supabase.com** et fais ton compte. Ça t'évitera de le faire en plein milieu d'une session quand on en aura besoin. Mais ce n'est pas obligatoire maintenant.

---

## 🙏 Bonne nuit Lucas !

Tu as fait un **boulot incroyable** ce soir : déploiement Vercel, intégration vidéo IA, scrollytelling cinématique, ajustements design fins... Vraiment.

Repose-toi bien et reprends quand tu seras frais.

Je suis là quand tu reviens ✨
