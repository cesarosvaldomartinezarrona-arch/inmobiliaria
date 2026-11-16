/* ===================================================================
   PROPERTY — ficha individual
   =================================================================== */

(function () {
  'use strict';

  const R = window.Realty;
  const db = R.getDB();
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const property =
    db.properties.find((p) => p.id === id) ||
    db.properties.find((p) => p.status === 'disponible') ||
    db.properties[0];

  if (!property) {
    document.body.innerHTML = '<div class="container" style="padding:4rem 0"><h1>No hay propiedades disponibles.</h1><p><a href="index.html">Volver al inicio</a></p></div>';
    return;
  }

  document.title = property.title + ' — Depas ZMG';

  /* ---------- header ---------- */
  const header = $('.site-header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 6);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navToggle = $('.nav-toggle');
  const mobilePanel = $('.mobile-panel');
  if (navToggle && mobilePanel) {
    navToggle.addEventListener('click', () => {
      const open = mobilePanel.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- contenido ---------- */
  const f = R.formatPrice(property);
  const crumb = $('#crumb-title');
  if (crumb) crumb.textContent = property.zone;

  const tags = $('#pd-tags');
  if (tags) {
    const statusTag =
      property.status === 'disponible'
        ? '<span class="tag tag--neutral">Disponible</span>'
        : `<span class="tag tag--vendida">${R.STATUS_LABEL[property.status]}</span>`;
    tags.innerHTML = `
      <span class="tag tag--neutral">${property.operation === 'renta' ? 'En renta' : 'En venta'}</span>
      ${R.tagHTML(property.tag)}
      ${statusTag}`;
  }

  const title = $('#pd-title');
  if (title) title.textContent = property.title;

  const loc = $('#pd-loc');
  if (loc) {
    loc.innerHTML = `${R.ICON.pin}<span>${R.esc(property.address)} · ${R.esc(property.zone)}, ${R.esc(property.city)}</span>`;
  }

  const priceEl = $('#pd-price');
  if (priceEl) priceEl.innerHTML = `${f.main}${f.suffix ? ` <small style="font-size:12px;color:var(--ink-faint)">${f.suffix}</small>` : ''}`;

  const noteEl = $('#pd-note');
  if (noteEl) {
    noteEl.textContent =
      property.operation === 'renta'
        ? 'Renta mensual · no incluye mantenimiento'
        : 'Precio de venta · escrituras al corriente';
  }

  const specs = $('#pd-specs');
  if (specs) {
    const cells = [
      { label: 'Recámaras', value: property.beds ? property.beds : '—' },
      { label: 'Baños', value: property.baths ? property.baths : '—' },
      { label: 'Superficie', value: property.area ? property.area + ' m²' : '—' },
      { label: 'Estacionamiento', value: property.parking ? property.parking + ' autos' : '—' },
    ];
    specs.innerHTML = cells
      .map(
        (c) => `<div class="spec-grid__item">
          <span class="spec-grid__label">${c.label}</span>
          <span class="spec-grid__value">${c.value}</span>
        </div>`
      )
      .join('');
  }

  const desc = $('#pd-desc');
  if (desc) desc.textContent = property.description;

  const amenities = $('#pd-amenities');
  if (amenities) {
    amenities.innerHTML = (property.amenities || [])
      .map((a) => `<div class="amenity">${R.ICON.check}<span>${R.esc(a)}</span></div>`)
      .join('');
  }

  /* ---------- galería ---------- */
  const images = property.images && property.images.length ? property.images : [];
  const gallery = $('#pd-gallery');
  if (gallery && images.length) {
    const shown = images.slice(0, 3);
    gallery.innerHTML = shown
      .map(
        (src, i) => `
        <button class="pd-gallery__item" type="button" data-photo="${i}" aria-label="Ampliar foto ${i + 1}" style="border:0;padding:0;cursor:zoom-in">
          <img src="${R.esc(src)}" alt="${R.esc(property.title)} — foto ${i + 1}">
          ${i === 2 && images.length > 3 ? `<span class="pd-gallery__more">+${images.length - 3} ${images.length - 3 === 1 ? 'foto' : 'fotos'}</span>` : ''}
        </button>`
      )
      .join('');
  }

  const lightbox = $('#lightbox');
  const lbImg = $('#lightbox-img');
  const lbCount = $('#lightbox-count');
  let lbIndex = 0;

  function paintLightbox() {
    if (!lbImg || !images.length) return;
    lbImg.src = images[lbIndex];
    lbImg.alt = property.title + ' — foto ' + (lbIndex + 1);
    if (lbCount) lbCount.textContent = `${lbIndex + 1} / ${images.length}`;
  }

  function openLightbox(index) {
    if (!lightbox) return;
    lbIndex = index;
    paintLightbox();
    if (typeof lightbox.showModal === 'function') lightbox.showModal();
    else lightbox.setAttribute('open', '');
  }

  function moveLightbox(step) {
    if (!images.length) return;
    lbIndex = (lbIndex + step + images.length) % images.length;
    paintLightbox();
  }

  if (gallery) {
    gallery.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-photo]');
      if (!btn) return;
      openLightbox(Number(btn.dataset.photo));
    });
  }
  const lbNext = $('#lightbox-next');
  const lbPrev = $('#lightbox-prev');
  const lbClose = $('#lightbox-close');
  if (lbNext) lbNext.addEventListener('click', () => moveLightbox(1));
  if (lbPrev) lbPrev.addEventListener('click', () => moveLightbox(-1));
  if (lbClose && lightbox) lbClose.addEventListener('click', () => lightbox.close());
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') moveLightbox(1);
      if (e.key === 'ArrowLeft') moveLightbox(-1);
    });
  }

  /* ---------- similares ---------- */
  const similar = $('#similar-grid');
  if (similar) {
    let list = db.properties.filter(
      (p) => p.id !== property.id && p.city === property.city && p.status !== 'vendida'
    );
    if (list.length < 3) {
      const extra = db.properties.filter(
        (p) =>
          p.id !== property.id &&
          p.operation === property.operation &&
          p.status !== 'vendida' &&
          !list.includes(p)
      );
      list = list.concat(extra);
    }
    list = list.slice(0, 3);
    similar.innerHTML = list.length
      ? list.map((p) => R.propertyCardHTML(p)).join('')
      : `<div class="empty-state" style="grid-column:1/-1">
           <h3 class="empty-state__title">Sin propiedades similares por ahora</h3>
           <p>Escríbenos y buscamos opciones con las mismas características para ti.</p>
         </div>`;

    similar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-fav]');
      if (!btn) return;
      const favs = R.toggleFavorite(btn.dataset.fav);
      const saved = favs.includes(btn.dataset.fav);
      btn.classList.toggle('is-saved', saved);
      btn.setAttribute('aria-pressed', String(saved));
    });
  }

  /* ---------- formulario ---------- */
  const whatsapp = $('#pd-whatsapp');
  if (whatsapp) {
    const msg = `Hola, me interesa "${property.title}" (${property.zone}). ¿Podemos agendar una visita?`;
    whatsapp.href = `https://wa.me/${db.agency.whatsapp}?text=${encodeURIComponent(msg)}`;
  }

  const contactForm = $('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contactForm.querySelector('input[type="text"]').value.trim();
      contactForm.innerHTML = `
        <div style="padding:.4rem 0 .2rem">
          <div class="agent-card__avatar" style="margin-bottom:.7rem">${R.ICON.check}</div>
          <div style="font-size:14px;font-weight:600">Gracias${name ? ', ' + R.esc(name) : ''}.</div>
          <p style="font-size:12px;color:var(--ink-muted);margin-top:.35rem;line-height:1.6">
            Recibimos tu solicitud. Un asesor te contactará en menos de 24 horas hábiles para
            coordinar la visita.
          </p>
        </div>`;
    });
  }
})();
