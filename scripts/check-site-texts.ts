// Vérifie que chaque data-text du site (_kit/*.html) est déclaré dans
// lib/site-texts/registry.ts avec le même texte par défaut, et inversement.
// Usage : node scripts/check-site-texts.ts
import { readFileSync } from "node:fs";
import { SITE_TEXT_BY_KEY } from "../lib/site-texts/registry.ts";

const normalize = (s: string) => s.replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").trim();
const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const seen = new Set<string>();
let errors = 0;

for (const file of ["_kit/index.html", "_kit/don.html"]) {
  const html = readFileSync(file, "utf8");
  const re = /<(\w+)\b([^>]*?)\sdata-text="([^"]+)"([^>]*)>([\s\S]*?)<\/\1>/g;
  for (const m of html.matchAll(re)) {
    const [, , , key, attrs, inner] = m;
    const rich = /\sdata-rich\b/.test(attrs) || /\sdata-rich\b/.test(m[2]);
    const text = rich
      ? inner.replace(/\s*<br>\s*/g, "\n").replace(/<em>([\s\S]*?)<\/em>/g, "*$1*")
      : inner.replace(/\s+/g, " ");
    seen.add(key);
    const field = SITE_TEXT_BY_KEY.get(key);
    if (!field) { console.error(`✗ ${file} : clé inconnue ${key}`); errors++; continue; }
    if ((field.kind === "rich") !== rich) { console.error(`✗ ${key} : data-rich incohérent`); errors++; }
    if (normalize(decode(text)) !== normalize(field.default)) {
      console.error(`✗ ${key} : défaut différent\n   HTML : ${JSON.stringify(normalize(decode(text)))}\n   liste: ${JSON.stringify(field.default)}`);
      errors++;
    }
  }
  for (const m of html.matchAll(/data-text-list="([^"]+)"/g)) seen.add(m[1]);
}

for (const key of SITE_TEXT_BY_KEY.keys()) {
  if (!seen.has(key)) { console.error(`✗ ${key} déclaré mais absent du HTML`); errors++; }
}

console.log(errors ? `${errors} problème(s)` : `✓ ${seen.size} textes, tout correspond`);
process.exit(errors ? 1 : 0);
