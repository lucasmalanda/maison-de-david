/* ============================================================
   TEXTES MODIFIABLES — chargés depuis Supabase (table site_texts)
   ------------------------------------------------------------
   Chaque élément marqué data-text="clé" garde son texte d'origine
   dans le HTML. Si une version modifiée existe dans le dashboard,
   elle le remplace. Si Supabase ne répond pas, rien ne change.
     - data-rich       : *mot* = <em>mot</em>, retour ligne = <br>
     - data-text-list  : une valeur par ligne (bandeau défilant)
   ============================================================ */
(function () {
  const SUPABASE_URL = 'https://eppxcrlppxcktotqnkjp.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_Ret1opucP7rF1qjO6zICUQ_XXEAvJMO';

  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function richToHtml(s) {
    return escapeHtml(s)
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\r?\n/g, '<br>');
  }

  function apply(texts) {
    document.querySelectorAll('[data-text]').forEach(function (el) {
      const value = texts[el.getAttribute('data-text')];
      if (value == null) return;
      if (el.hasAttribute('data-rich')) el.innerHTML = richToHtml(value);
      else el.textContent = value;
    });

    // Bandeau défilant : les mots sont répétés 2× pour la boucle.
    document.querySelectorAll('[data-text-list]').forEach(function (el) {
      const value = texts[el.getAttribute('data-text-list')];
      if (value == null) return;
      const words = value.split(/\r?\n/).map(function (w) { return w.trim(); }).filter(Boolean);
      if (words.length === 0) return;
      const spans = words.map(function (w) { return '<span>' + escapeHtml(w) + '</span>'; }).join('');
      el.innerHTML = spans + spans;
    });
  }

  fetch(SUPABASE_URL + '/rest/v1/site_texts?select=key,value', {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY },
  })
    .then(function (res) { return res.ok ? res.json() : []; })
    .then(function (rows) {
      const texts = {};
      (rows || []).forEach(function (r) { texts[r.key] = r.value; });
      apply(texts);
      // Pour les textes affichés par le JavaScript de la page (ex. catégories)
      window.SITE_TEXTS = texts;
      window.dispatchEvent(new Event('site-texts:loaded'));
    })
    .catch(function (err) {
      console.warn('[site-texts] textes d\'origine conservés :', err);
    });
})();
