/* ===================================================================
   ADMIN — panel de administración
   =================================================================== */

(function () {
  'use strict';

  const R = window.Realty;
  let db = R.getDB();

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const state = {
    view: 'resumen',
    propFilter: 'todas',
    bannerFilter: 'todos',
    search: '',
  };

  const admin = $('#admin');
  const toasts = $('#toasts');
  const VIEW_LABEL = { resumen: 'Resumen', propiedades: 'Propiedades', banners: 'Banners' };

  /* ---------- helpers ---------- */
  function toast(message) {
    if (!toasts) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `${R.ICON.check}<span>${R.esc(message)}</span>`;
    toasts.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .25s ease, transform .25s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateY(6px)';
      setTimeout(() => el.remove(), 260);
    }, 2600);
  }

  function persist(showToast) {
    const ok = R.saveDB(db);
    if (showToast) toast(ok ? 'Cambios publicados en el sitio público' : 'No se pudo guardar en este navegador');
    return ok;
  }

  function priceLabel(p) {
    return R.formatPrice(p).main;
  }

  /* ---------- views ---------- */
  function switchView(view) {
    state.view = view;
    $$('.admin-view').forEach((section) => {
      section.classList.toggle('is-active', section.id === 'view-' + view);
    });
    $$('.sidebar-nav__link[data-view]').forEach((link) => {
      link.classList.toggle('is-active', link.dataset.view === view);
    });
    const title = $('#topbar-title');
    const crumb = $('#topbar-crumb');
    if (title) title.textContent = VIEW_LABEL[view] || 'Panel';
    if (crumb) crumb.textContent = VIEW_LABEL[view] || 'Panel';
    admin.classList.remove('is-sidebar-open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- KPIs ---------- */
  function renderKpis() {
    const total = db.properties.length;
    const disponibles = db.properties.filter((p) => p.status === 'disponible').length;
    const renta = db.properties.filter((p) => p.operation === 'renta').length;
    const banners = db.banners.filter((b) => b.active).length;
    const pinned = db.banners.find((b) => b.pinned && b.active);

    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(value);
    };
    set('kpi-total', total);
    set('kpi-disponibles', disponibles);
    set('kpi-renta', renta);
    set('kpi-banners', banners);
    set('nav-count-props', total);
    set('nav-count-banners', banners);

    const pinnedEl = $('#kpi-pinned');
    if (pinnedEl) pinnedEl.textContent = pinned ? '1 fijado al encabezado' : 'ninguno fijado';
  }

  /* ---------- resumen ---------- */
  function renderSummary() {
    const list = $('#resumen-props');
    if (!list) return;
    list.innerHTML = db.properties
      .slice(0, 5)
      .map(
        (p) => `
        <div class="mini-list__item">
          <img class="mini-list__thumb" src="${R.esc(p.images[0] || '')}" alt="${R.esc(p.title)}">
          <span class="mini-list__name">${R.esc(p.title)}</span>
          <span class="mini-list__price">${priceLabel(p)}</span>
          ${R.statusHTML(p.status)}
        </div>`
      )
      .join('');
  }

  /* ---------- propiedades ---------- */
  function visibleProperties() {
    return db.properties.filter((p) => {
      if (state.propFilter === 'venta' && p.operation !== 'venta') return false;
      if (state.propFilter === 'renta' && p.operation !== 'renta') return false;
      if (state.propFilter === 'disponible' && p.status !== 'disponible') return false;
      if (state.search) {
        const hay = [p.title, p.city, p.zone, p.type].join(' ').toLowerCase();
        if (!hay.includes(state.search.toLowerCase())) return false;
      }
      return true;
    });
  }

  function renderTable() {
    const body = $('#props-table-body');
    if (!body) return;
    const list = visibleProperties();
    const count = $('#props-count');
    if (count) count.textContent = list.length === 1 ? '1 propiedad' : `${list.length} propiedades`;

    if (!list.length) {
      body.innerHTML = `<tr><td colspan="6" style="padding:2.5rem 1rem;text-align:center;color:var(--ink-faint)">
        No hay propiedades con este filtro.</td></tr>`;
      return;
    }

    body.innerHTML = list
      .map((p) => {
        const statusOpts = Object.keys(R.STATUS_LABEL)
          .map((s) => `<option value="${s}" ${s === p.status ? 'selected' : ''}>${R.STATUS_LABEL[s]}</option>`)
          .join('');
        const tagOpts = ['', 'oferta', 'urgente', 'destacado']
          .map(
            (t) =>
              `<option value="${t}" ${t === p.tag ? 'selected' : ''}>${t ? R.TAG_LABEL[t] : 'Sin etiqueta'}</option>`
          )
          .join('');

        return `
        <tr>
          <td>
            <div class="table__prop">
              <img class="table__thumb" src="${R.esc(p.images[0] || '')}" alt="">
              <div>
                <div class="table__name">${R.esc(p.title)}</div>
                <div class="table__place">${R.esc(p.zone)}, ${R.esc(p.city)}</div>
              </div>
            </div>
          </td>
          <td style="white-space:nowrap;color:var(--ink-muted)">${p.operation === 'renta' ? 'Renta' : 'Venta'}</td>
          <td class="table__price">${priceLabel(p)}${p.period ? ' <span style="font-weight:400;color:var(--ink-faint);font-size:10.5px">/mes</span>' : ''}</td>
          <td><select class="select" data-status="${R.esc(p.id)}" aria-label="Estado de ${R.esc(p.title)}">${statusOpts}</select></td>
          <td><select class="select" data-tag="${R.esc(p.id)}" aria-label="Etiqueta de ${R.esc(p.title)}">${tagOpts}</select></td>
          <td>
            <div class="row-actions">
              <a class="icon-btn" href="property.html?id=${encodeURIComponent(p.id)}" title="Ver ficha" aria-label="Ver ficha">
                <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </a>
            </div>
          </td>
        </tr>`;
      })
      .join('');
  }

  /* ---------- banners ---------- */
  function bannerTile(b) {
    return `
      <article class="banner-tile ${b.active ? '' : 'is-off'}">
        <div class="banner-tile__media">
          <img src="${R.esc(b.image)}" alt="${R.esc(b.title)}" loading="lazy">
          <div class="banner-tile__tags">${R.tagHTML(b.tag)}</div>
          ${b.pinned ? `<span class="banner-tile__pin">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v4M8 3h8l-1 5 3 3v2H6v-2l3-3-1-5Z"/></svg>
            Encabezado</span>` : ''}
        </div>
        <div class="banner-tile__body">
          <div class="banner-tile__title">${R.esc(b.title)}</div>
          <div class="banner-tile__sub">${R.esc(b.subtitle)}</div>
          <div class="banner-tile__foot">
            <label class="switch-row">
              <span class="switch-wrap">
                <input class="switch-input" type="checkbox" data-toggle="${R.esc(b.id)}" ${b.active ? 'checked' : ''}>
                <span class="switch"></span>
              </span>
              ${b.active ? 'Activo' : 'Inactivo'}
            </label>
            <div style="display:flex;gap:2px">
              <button class="icon-btn ${b.pinned ? 'is-pinned' : ''}" type="button" data-pin="${R.esc(b.id)}" title="${b.pinned ? 'Quitar del encabezado' : 'Fijar al encabezado'}" aria-label="Fijar al encabezado">
                <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v4M8 3h8l-1 5 3 3v2H6v-2l3-3-1-5Z"/></svg>
              </button>
              <button class="icon-btn icon-btn--danger" type="button" data-del="${R.esc(b.id)}" title="Eliminar banner" aria-label="Eliminar banner">
                <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/></svg>
              </button>
            </div>
          </div>
        </div>
      </article>`;
  }

  function renderBanners() {
    const list = $('#banner-list');
    if (!list) return;
    const items = db.banners.filter((b) => {
      if (state.bannerFilter === 'activos') return b.active;
      if (state.bannerFilter === 'inactivos') return !b.active;
      return true;
    });
    list.innerHTML = items.length
      ? items.map(bannerTile).join('')
      : `<div class="empty-state" style="grid-column:1/-1">
           <h3 class="empty-state__title">Sin banners en esta vista</h3>
           <p>Crea un banner con el formulario de arriba para mostrarlo en el sitio público.</p>
         </div>`;
  }

  function renderAll() {
    renderKpis();
    renderSummary();
    renderTable();
    renderBanners();
  }

  /* ---------- eventos: navegación ---------- */
  $$('.sidebar-nav__link[data-view]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchView(link.dataset.view);
    });
  });

  $$('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.goto));
  });

  const sidebarToggle = $('#sidebar-toggle');
  const scrim = $('#sidebar-scrim');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => admin.classList.toggle('is-sidebar-open'));
  }
  if (scrim) {
    scrim.addEventListener('click', () => admin.classList.remove('is-sidebar-open'));
  }

  /* ---------- eventos: filtros ---------- */
  $$('[data-prop-filter]').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.propFilter = chip.dataset.propFilter;
      $$('[data-prop-filter]').forEach((c) => c.classList.toggle('is-active', c === chip));
      renderTable();
    });
  });

  $$('[data-banner-filter]').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.bannerFilter = chip.dataset.bannerFilter;
      $$('[data-banner-filter]').forEach((c) => c.classList.toggle('is-active', c === chip));
      renderBanners();
    });
  });

  const search = $('#global-search');
  if (search) {
    search.addEventListener('input', () => {
      state.search = search.value.trim();
      if (state.view !== 'propiedades') switchView('propiedades');
      renderTable();
    });
  }

  /* ---------- eventos: tabla ---------- */
  const tableBody = $('#props-table-body');
  if (tableBody) {
    tableBody.addEventListener('change', (e) => {
      const statusSel = e.target.closest('[data-status]');
      const tagSel = e.target.closest('[data-tag]');
      if (statusSel) {
        const p = db.properties.find((x) => x.id === statusSel.dataset.status);
        if (p) {
          p.status = statusSel.value;
          persist(false);
          renderKpis();
          renderSummary();
          toast('Estado actualizado a ' + R.STATUS_LABEL[p.status]);
        }
      }
      if (tagSel) {
        const p = db.properties.find((x) => x.id === tagSel.dataset.tag);
        if (p) {
          p.tag = tagSel.value;
          persist(false);
          toast(p.tag ? 'Etiqueta aplicada: ' + R.TAG_LABEL[p.tag] : 'Etiqueta eliminada');
        }
      }
    });
  }

  /* ---------- eventos: banners ---------- */
  const bannerForm = $('#banner-form');
  if (bannerForm) {
    bannerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = $('#banner-title').value.trim();
      const subtitle = $('#banner-subtitle').value.trim();
      if (!title) return;

      const active = $('#banner-active').checked;
      const pinned = $('#banner-pinned').checked;
      if (pinned) db.banners.forEach((b) => { b.pinned = false; });

      db.banners.unshift({
        id: 'b-' + Date.now(),
        title,
        subtitle: subtitle || 'Novedades de la colección.',
        tag: $('#banner-tag').value,
        active,
        pinned,
        cta: $('#banner-cta').value.trim() || 'Ver propiedades',
        image:
          $('#banner-image').value.trim() ||
          'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80',
        createdAt: new Date().toISOString().slice(0, 10),
      });

      persist(false);
      bannerForm.reset();
      $('#banner-cta').value = 'Ver propiedades';
      $('#banner-active').checked = true;
      renderAll();
      toast(pinned ? 'Banner creado y fijado al encabezado' : 'Banner creado');
    });
  }

  const bannerList = $('#banner-list');
  if (bannerList) {
    bannerList.addEventListener('change', (e) => {
      const input = e.target.closest('[data-toggle]');
      if (!input) return;
      const b = db.banners.find((x) => x.id === input.dataset.toggle);
      if (!b) return;
      b.active = input.checked;
      if (!b.active) b.pinned = false;
      persist(false);
      renderAll();
      toast(b.active ? 'Banner activado' : 'Banner desactivado');
    });

    bannerList.addEventListener('click', (e) => {
      const pinBtn = e.target.closest('[data-pin]');
      const delBtn = e.target.closest('[data-del]');

      if (pinBtn) {
        const b = db.banners.find((x) => x.id === pinBtn.dataset.pin);
        if (!b) return;
        const willPin = !b.pinned;
        db.banners.forEach((item) => { item.pinned = false; });
        if (willPin) {
          b.pinned = true;
          b.active = true;
        }
        persist(false);
        renderAll();
        toast(willPin ? 'Banner fijado al encabezado público' : 'Banner quitado del encabezado');
      }

      if (delBtn) {
        const b = db.banners.find((x) => x.id === delBtn.dataset.del);
        if (!b) return;
        if (!window.confirm('¿Eliminar el banner "' + b.title + '"?')) return;
        db.banners = db.banners.filter((x) => x.id !== b.id);
        persist(false);
        renderAll();
        toast('Banner eliminado');
      }
    });
  }

  /* ---------- publicar ---------- */
  const publishBtn = $('#publish-btn');
  if (publishBtn) {
    publishBtn.addEventListener('click', () => {
      persist(false);
      toast('Cambios publicados. El sitio público ya está actualizado.');
    });
  }

  /* ---------- nueva propiedad ---------- */
  const modal = $('#property-modal');
  const propertyForm = $('#property-form');

  function openModal() {
    if (!modal) return;
    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open', '');
    setTimeout(() => {
      const first = $('#np-title');
      if (first) first.focus();
    }, 60);
  }

  function closeModal() {
    if (!modal) return;
    if (typeof modal.close === 'function') modal.close();
    else modal.removeAttribute('open');
  }

  $$('[data-open-property]').forEach((btn) => btn.addEventListener('click', openModal));
  $$('[data-close-modal]').forEach((btn) => btn.addEventListener('click', closeModal));

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (propertyForm) {
    propertyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = $('#np-title').value.trim();
      if (!title) {
        $('#np-title').reportValidity();
        return;
      }
      const operation = $('#np-operation').value;
      const price = Number($('#np-price').value) || 0;
      const image =
        $('#np-image').value.trim() ||
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80';

      db.properties.unshift({
        id: 'p-' + Date.now(),
        title,
        city: $('#np-city').value.trim() || 'México',
        zone: $('#np-zone').value.trim() || 'Centro',
        address: $('#np-zone').value.trim() || 'Dirección por confirmar',
        operation,
        type: $('#np-type').value,
        price,
        period: operation === 'renta' ? 'mes' : '',
        beds: Number($('#np-beds').value) || 0,
        baths: Number($('#np-baths').value) || 0,
        area: Number($('#np-area').value) || 0,
        parking: 1,
        year: new Date().getFullYear(),
        tag: $('#np-tag').value,
        status: 'disponible',
        images: [image, image],
        description:
          'Ficha recién creada desde el panel. Completa la descripción, amenidades y fotografías antes de compartirla con un cliente.',
        amenities: ['Descripción por completar', 'Amenidades por completar'],
      });

      persist(false);
      propertyForm.reset();
      closeModal();
      renderAll();
      switchView('propiedades');
      toast('Propiedad agregada a la colección');
    });
  }

  /* ---------- restablecer ---------- */
  const resetBtn = $('#reset-data');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (!window.confirm('Se restaurarán las propiedades y banners de ejemplo. ¿Continuar?')) return;
      db = R.resetDB();
      renderAll();
      switchView('resumen');
      toast('Datos de ejemplo restablecidos');
    });
  }

  renderAll();
})();
