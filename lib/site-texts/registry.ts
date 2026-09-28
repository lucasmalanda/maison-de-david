// Liste de tous les textes modifiables du site public (_kit/index.html et
// _kit/don.html). Chaque clé correspond à un attribut data-text="…" dans le HTML.
// Le texte « default » est celui écrit dans le HTML : il reste affiché si
// aucune modification n'a été faite (ou si Supabase ne répond pas).
//
// Types :
//  - "line"  : une ligne de texte simple
//  - "text"  : un paragraphe
//  - "rich"  : un titre où *mot* = italique doré, retour à la ligne = saut de ligne
//  - "list"  : une valeur par ligne (ex. le bandeau défilant)
//
// Vérification : `node scripts/check-site-texts.mjs` compare cette liste au HTML.

export type SiteTextKind = "line" | "text" | "rich" | "list";

export type SiteTextField = {
  key: string;
  label: string;
  kind: SiteTextKind;
  default: string;
};

export type SiteTextSection = {
  id: string;
  title: string;
  description?: string;
  fields: SiteTextField[];
};

export const SITE_TEXT_SECTIONS: SiteTextSection[] = [
  {
    id: "home-hero",
    title: "Accueil · Bandeau vidéo",
    description: "Le haut de la page d'accueil, par-dessus la vidéo.",
    fields: [
      { key: "home.welcome.greet", label: "Mot de bienvenue", kind: "rich", default: "Bienvenue*.*" },
      { key: "home.welcome.sub", label: "Sous le mot de bienvenue", kind: "line", default: "La Maison de David" },
      { key: "home.hero.title", label: "Grand titre", kind: "rich", default: "Venez vous\n*abreuver*\ndans cette oasis." },
      { key: "home.hero.quote", label: "Verset", kind: "text", default: "« Mais celui qui boira de l'eau que je lui donnerai n'aura jamais soif, et l'eau que je lui donnerai deviendra en lui une source d'eau qui jaillira jusque dans la vie éternelle. »" },
      { key: "home.hero.quote_ref", label: "Référence du verset", kind: "line", default: "— Jean 4.14" },
      { key: "home.hero.cta_events", label: "Bouton « événements »", kind: "line", default: "Prochains événements" },
      { key: "home.hero.cta_gallery", label: "Bouton « galerie »", kind: "line", default: "Voir la galerie" },
      { key: "home.hero.scroll", label: "Indication de défilement", kind: "line", default: "Découvrir" },
      { key: "home.marquee", label: "Bandeau défilant (un mot par ligne)", kind: "list", default: "Louange\nAdoration\nCommunion\nEspérance\nÉvangélisation\nGospel\nPrière\nSoins d'âme" },
    ],
  },
  {
    id: "home-mission",
    title: "Accueil · Notre mission",
    fields: [
      { key: "home.mission.eyebrow", label: "Petit titre", kind: "line", default: "Notre mission" },
      { key: "home.mission.title", label: "Titre", kind: "rich", default: "Nous nous réunissons avec foi pour *louer et prier* ensemble." },
      { key: "home.mission.p1", label: "Paragraphe 1", kind: "text", default: "La Maison de David est une association qui apporte louange et présence de Dieu dans des lieux fragilisés — foyers, quartiers, temples." },
      { key: "home.mission.p2", label: "Paragraphe 2", kind: "text", default: "À travers la musique et l'adoration, elle offre espérance, paix et réconfort, en créant des moments de rencontre, de guérison et de lumière là où c'est le plus nécessaire." },
      { key: "home.pillar1.title", label: "Pilier i · titre", kind: "line", default: "Vivre d'amour" },
      { key: "home.pillar1.text", label: "Pilier i · texte", kind: "text", default: "Accueillir toute personne désirant vivre des moments de louange à travers ses dons artistiques." },
      { key: "home.pillar2.title", label: "Pilier ii · titre", kind: "line", default: "Soutenir & envoyer" },
      { key: "home.pillar2.text", label: "Pilier ii · texte", kind: "text", default: "Aider à développer et envoyer ceux qui veulent grandir dans leur don." },
      { key: "home.pillar3.title", label: "Pilier iii · titre", kind: "line", default: "Témoigner" },
      { key: "home.pillar3.text", label: "Pilier iii · texte", kind: "text", default: "Une foi vivante au travers de la Parole, du chant en chorale et des concerts." },
      { key: "home.pillar4.title", label: "Pilier iv · titre", kind: "line", default: "Communion fraternelle" },
      { key: "home.pillar4.text", label: "Pilier iv · texte", kind: "text", default: "Vivre l'unité, la simplicité, l'humilité, la vérité, l'amour et l'entraide." },
    ],
  },
  {
    id: "home-events",
    title: "Accueil · Événements",
    description: "Les événements eux-mêmes se gèrent dans la page Événements.",
    fields: [
      { key: "home.events.eyebrow", label: "Petit titre", kind: "line", default: "À venir" },
      { key: "home.events.title", label: "Titre", kind: "line", default: "Prochains rendez-vous." },
      { key: "home.events.intro", label: "Introduction", kind: "text", default: "Des soirées, des cultes, des moments d'évangélisation — là où vous êtes, ou là où nous sommes envoyés." },
      { key: "home.events.empty", label: "Message quand il n'y a aucun événement", kind: "line", default: "Aucun événement à venir pour le moment." },
      { key: "home.events.add_calendar", label: "Fiche événement · bouton calendrier", kind: "line", default: "Ajouter au calendrier" },
      { key: "home.events.google_calendar", label: "Fiche événement · bouton Google", kind: "line", default: "Google Agenda" },
    ],
  },
  {
    id: "home-gallery",
    title: "Accueil · Galerie",
    description: "Les photos se gèrent dans la page Galerie.",
    fields: [
      { key: "home.gallery.eyebrow", label: "Petit titre", kind: "line", default: "Galerie · Photos & Vidéos" },
      { key: "home.gallery.title", label: "Titre", kind: "line", default: "Des moments vécus, des visages éclairés." },
      { key: "home.gallery.intro", label: "Introduction", kind: "text", default: "Parcourez nos archives par type d'événement. Chaque image, chaque vidéo raconte un instant partagé — une louange, une prière, une rencontre." },
      { key: "home.gallery.filter_label", label: "Texte avant les filtres", kind: "line", default: "Filtrer par" },
    ],
  },
  {
    id: "home-donate",
    title: "Accueil · Bandeau « Faire un don »",
    fields: [
      { key: "home.donate.eyebrow", label: "Petit titre", kind: "line", default: "Soutenir l'œuvre" },
      { key: "home.donate.title", label: "Titre", kind: "rich", default: "Donnez avec *cœur.*" },
      { key: "home.donate.text", label: "Texte", kind: "text", default: "Votre don soutient la louange portée dans les lieux fragilisés, l'envoi des artistes, et l'organisation des cultes et concerts." },
      { key: "home.donate.button", label: "Bouton", kind: "line", default: "Faire un don" },
    ],
  },
  {
    id: "home-contact",
    title: "Accueil · Contact",
    fields: [
      { key: "home.contact.eyebrow", label: "Petit titre", kind: "line", default: "Contact" },
      { key: "home.contact.title", label: "Titre", kind: "rich", default: "*Écrivez-nous.*" },
      { key: "home.contact.intro", label: "Introduction", kind: "text", default: "Pour une collaboration, un besoin, ou simplement pour discuter — nous lisons chaque message." },
      { key: "home.contact.address_label", label: "Adresse · intitulé", kind: "line", default: "Adresse" },
      { key: "home.contact.address", label: "Adresse", kind: "line", default: "Genève, Suisse" },
      { key: "home.contact.email_label", label: "Email · intitulé", kind: "line", default: "Email" },
      { key: "home.contact.email", label: "Email", kind: "line", default: "contact@maisondedavid.com" },
      { key: "home.contact.social_label", label: "Réseaux · intitulé", kind: "line", default: "Suivez-nous" },
      { key: "home.contact.social", label: "Réseaux", kind: "line", default: "@lamaisondedavid" },
      { key: "home.contact.form.firstname", label: "Formulaire · Prénom", kind: "line", default: "Prénom *" },
      { key: "home.contact.form.lastname", label: "Formulaire · Nom", kind: "line", default: "Nom" },
      { key: "home.contact.form.email", label: "Formulaire · E-mail", kind: "line", default: "E-mail *" },
      { key: "home.contact.form.phone", label: "Formulaire · Numéro", kind: "line", default: "Numéro" },
      { key: "home.contact.form.message", label: "Formulaire · Message", kind: "line", default: "Message *" },
      { key: "home.contact.form.submit", label: "Formulaire · Bouton", kind: "line", default: "Envoyer le message" },
    ],
  },
  {
    id: "don",
    title: "Page Don",
    description: "Les coordonnées TWINT, IBAN et carte se gèrent dans la page Dons.",
    fields: [
      { key: "don.nav.home", label: "Bouton retour « Accueil »", kind: "line", default: "Accueil" },
      { key: "don.hero.eyebrow", label: "Petit titre", kind: "line", default: "Soutenir l'œuvre" },
      { key: "don.hero.title", label: "Titre", kind: "rich", default: "Donnez avec *cœur.*" },
      { key: "don.hero.text", label: "Texte", kind: "text", default: "Votre don soutient la louange portée dans les lieux fragilisés, l'envoi des artistes, et l'organisation des cultes et concerts." },
      { key: "don.twint.caption", label: "Sous le QR TWINT", kind: "line", default: "Scanne le QR avec ton app TWINT." },
      { key: "don.stripe.methods", label: "Carte · mention sécurité", kind: "line", default: "Paiement sécurisé" },
      { key: "don.thanks.text", label: "Remerciement", kind: "line", default: "Merci pour votre générosité 🙏" },
      { key: "don.thanks.verse", label: "Verset", kind: "text", default: "« Que chacun donne comme il l'a résolu en son cœur » — 2 Corinthiens 9.7" },
    ],
  },
  {
    id: "common",
    title: "Menu & pied de page",
    description: "Communs aux deux pages du site.",
    fields: [
      { key: "common.brand", label: "Nom de l'association", kind: "line", default: "La Maison de David" },
      { key: "common.brand.tagline", label: "Sous le nom (menu)", kind: "line", default: "Genève · Suisse" },
      { key: "common.nav.about", label: "Menu · À propos", kind: "line", default: "À propos" },
      { key: "common.nav.gallery", label: "Menu · Galerie", kind: "line", default: "Galerie" },
      { key: "common.nav.events", label: "Menu · Événements", kind: "line", default: "Événements" },
      { key: "common.nav.contact", label: "Menu · Contact", kind: "line", default: "Contact" },
      { key: "common.nav.donate", label: "Menu · Faire un don", kind: "line", default: "Faire un don" },
      { key: "common.footer.about", label: "Pied de page · présentation", kind: "text", default: "Apporter louange et présence de Dieu dans les lieux fragilisés — par la musique, l'adoration et la prière." },
      { key: "common.footer.col_site", label: "Pied de page · colonne 1", kind: "line", default: "Site" },
      { key: "common.footer.col_events", label: "Pied de page · colonne 2", kind: "line", default: "Événements" },
      { key: "common.footer.ev1", label: "Colonne 2 · lien 1", kind: "line", default: "Évangélisation" },
      { key: "common.footer.ev2", label: "Colonne 2 · lien 2", kind: "line", default: "Groupe de prière" },
      { key: "common.footer.ev3", label: "Colonne 2 · lien 3", kind: "line", default: "Culte protestant" },
      { key: "common.footer.ev4", label: "Colonne 2 · lien 4", kind: "line", default: "Gospel Night" },
      { key: "common.footer.ev5", label: "Colonne 2 · lien 5", kind: "line", default: "Atelier Gospel" },
      { key: "common.footer.col_legal", label: "Pied de page · colonne 3", kind: "line", default: "Légal" },
      { key: "common.footer.legal1", label: "Colonne 3 · lien 1", kind: "line", default: "Politique de confidentialité" },
      { key: "common.footer.legal2", label: "Colonne 3 · lien 2", kind: "line", default: "Conditions d'utilisation" },
      { key: "common.footer.legal3", label: "Colonne 3 · lien 3", kind: "line", default: "Accessibilité" },
      { key: "common.footer.copyright", label: "Copyright", kind: "line", default: "© 2026 La Maison de David · Genève, Suisse" },
      { key: "common.footer.signature", label: "Signature", kind: "line", default: "Conçu avec foi." },
    ],
  },
];

export const SITE_TEXT_FIELDS: SiteTextField[] = SITE_TEXT_SECTIONS.flatMap((s) => s.fields);

export const SITE_TEXT_BY_KEY = new Map(SITE_TEXT_FIELDS.map((f) => [f.key, f]));
