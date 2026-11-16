/* ===================================================================
   PUBLIC — página principal
   =================================================================== */

(function () {
  'use strict';

  const R = window.Realty;
  let db = R.getDB();

  const state = {
    operation: 'todas',
    q: '',
    type: 'todas',
    min: 0,
    max: 0,
  };

  const BUDGETS = {
    venta: [
      { label: 'Cualquier precio', min: 0, max: 0 },
      { label: 'Hasta $8 M', min: 0, max: 8000000 },
      { label: '$8 M – $15 M', min: 8000000, max: 15000000 },
      { label: 'Más de $15 M', min: 15000000, max: 0 },
    ],
    renta: [
      { label: 'Cualquier renta', min: 0, max: 0 },
      { label: 'Hasta $20,000', min: 0, max: 20000 },
      { label: '$20,000 – $30,000', min: 20000, max: 30000 },
      { label: 'Más de $30,000', min: 30000, max: 0 },
    ],
  };

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ---------- header ---------- */
  const header = $('.site-header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 6);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navToggle = $('.nav-toggle');
  const mobilePanel = $('.mobile-panel');
  if (navToggle && mobilePanel) {
    navToggle.addEventListener('click', () => {
      const open = mobilePanel.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    $$('a', mobilePanel).forEach((a) =>
      a.addEventListener('click', () => {
        mobilePanel.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  /* ---------- promo bar (banner fijado al encabezado) ---------- */
  const pinned = db.banners.find((b) => b.active && b.pinned);
  const promoSlot = $('#promo-slot');
  if (promoSlot) {
    if (pinned) {
      promoSlot.innerHTML = `
        <div class="promo-bar">
          <div class="container promo-bar__inner">
            ${R.tagHTML(pinned.tag)}
            <span>${R.esc(pinned.title)} — ${R.esc(pinned.subtitle)}</span>
            <a href="#coleccion">${R.esc(pinned.cta || 'Ver más')}</a>
          </div>
        </div>`;
    } else {
      promoSlot.remove();
    }
  }

  /* ---------- hero ---------- */
  const featured =
    db.properties.find((p) => p.status === 'disponible' && p.tag === 'destacado') ||
    db.properties.find((p) => p.status === 'disponible');

  const heroFloat = $('#hero-float');
  if (heroFloat && featured) {
    const f = R.formatPrice(featured);
    heroFloat.innerHTML = `
      <img src="${R.esc(featured.images[0])}" alt="${R.esc(featured.title)}">
      <div class="hero__float-body">
        <div class="hero__float-eyebrow">Destacada</div>
        <div class="hero__float-title">${R.esc(featured.title)}</div>
        <div class="hero__float-price">${f.main} · ${R.esc(featured.zone)}</div>
      </div>
      <a class="hero__float-arrow" href="property.html?id=${encodeURIComponent(featured.id)}" aria-label="Ver propiedad destacada">${R.ICON.arrow}</a>`;
  }

  const heroMedia = $('#hero-media');
  if (heroMedia && featured) {
    heroMedia.src = featured.images[0];
    heroMedia.alt = featured.title;
  }

  /* ---------- búsqueda ---------- */
  const budgetSelect = $('#search-budget');
  const opTabs = $$('.search-tab');
  const searchForm = $('#search-form');

  function fillBudgets(op) {
    if (!budgetSelect) return;
    const list = BUDGETS[op] || BUDGETS.venta;
    budgetSelect.innerHTML = list
      .map((b, i) => `<option value="${i}">${R.esc(b.label)}</option>`)
      .join('');
  }
  fillBudgets('venta');

  opTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      opTabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      fillBudgets(tab.dataset.op);
    });
  });

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const activeTab = $('.search-tab.is-active');
      state.operation = activeTab ? activeTab.dataset.op : 'venta';
      state.q = ($('#search-q') || {}).value || '';
      state.type = ($('#search-type') || {}).value || 'todas';

      const idx = budgetSelect ? Number(budgetSelect.value) : 0;
      const range = (BUDGETS[state.operation] || BUDGETS.venta)[idx] || { min: 0, max: 0 };
      state.min = range.min;
      state.max = range.max;

      syncChips();
      renderListings();
      const target = document.getElementById('coleccion');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ---------- listados ---------- */
  const grid = $('#listing-grid');
  const countEl = $('#listing-count');
  const chips = $$('[data-filter]');

  function syncChips() {
    chips.forEach((chip) => {
      const value = chip.dataset.filter;
      const active =
        (state.operation === 'todas' && value === 'todas') ||
        (state.operation === 'venta' && value === 'venta') ||
        (state.operation === 'renta' && value === 'renta') ||
        (state.operation === 'oferta' && value === 'oferta');
      chip.classList.toggle('is-active', active);
    });

    opTabs.forEach((t) => {
      if (state.operation === 'venta' || state.operation === 'renta') {
        t.classList.toggle('is-active', t.dataset.op === state.operation);
      }
    });
    if (state.operation === 'venta' || state.operation === 'renta') fillBudgets(state.operation);
  }

  function filtered() {
    const q = state.q.trim().toLowerCase();
    return db.properties.filter((p) => {
      if (state.operation === 'venta' && p.operation !== 'venta') return false;
      if (state.operation === 'renta' && p.operation !== 'renta') return false;
      if (state.operation === 'oferta' && p.tag !== 'oferta') return false;
      if (state.type !== 'todas' && p.type !== state.type) return false;
      if (state.min && p.price < state.min) return false;
      if (state.max && p.price > state.max) return false;
      if (q) {
        const haystack = [p.title, p.zone, p.city, p.type, p.address].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }

  function renderListings() {
    if (!grid) return;
    const list = filtered();
    if (countEl) {
      countEl.textContent =
        list.length === 1 ? '1 propiedad' : `${list.length} propiedades`;
    }
    if (!list.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <h3 class="empty-state__title">Sin resultados para esta búsqueda</h3>
          <p>Ajusta la operación, el tipo o el rango de precio. También puedes escribirnos y buscamos por ti.</p>
          <button class="btn btn--outline" type="button" id="reset-filters">Limpiar filtros</button>
        </div>`;
      const reset = $('#reset-filters');
      if (reset) {
        reset.addEventListener('click', () => {
          state.operation = 'todas';
          state.q = '';
          state.type = 'todas';
          state.min = 0;
          state.max = 0;
          const qInput = $('#search-q');
          if (qInput) qInput.value = '';
          const typeSelect = $('#search-type');
          if (typeSelect) typeSelect.value = 'todas';
          syncChips();
          renderListings();
        });
      }
      return;
    }
    grid.innerHTML = list.map((p) => R.propertyCardHTML(p)).join('');
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      state.operation = chip.dataset.filter;
      syncChips();
      renderListings();
    });
  });

  if (grid) {
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-fav]');
      if (!btn) return;
      const id = btn.dataset.fav;
      const favs = R.toggleFavorite(id);
      const saved = favs.includes(id);
      btn.classList.toggle('is-saved', saved);
      btn.setAttribute('aria-pressed', String(saved));
    });
  }

  renderListings();

  /* ---------- reveal on scroll ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- año ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
