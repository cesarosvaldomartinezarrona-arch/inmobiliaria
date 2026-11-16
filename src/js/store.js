/* ===================================================================
   STORE — datos compartidos entre el sitio público y el panel admin
   Persistencia: localStorage (misma máquina / mismo navegador)
   =================================================================== */

(function () {
  'use strict';

  const KEY = 'depas-zmg.db.v1';
  const FAV_KEY = 'depas-zmg.favs.v1';

  const img = (id, w) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w || 1200}&q=80`;

  const seed = {
    agency: {
      name: 'Depas ZMG',
      tagline: 'Inmobiliaria',
      phone: '+52 479 276 1205',
      whatsapp: '524792761205',
      email: 'contacto@depaszmg.com',
      address: 'Av. Américas 1500, Guadalajara, Jalisco',
      hours: 'Lun – Vie · 9:00 a 19:00',
    },
    properties: [
      {
        id: 'casa-puerta-hierro',
        title: 'Casa en Puerta de Hierro',
        city: 'Zapopan, Jalisco',
        zone: 'Puerta de Hierro',
        address: 'Calle Puerta de Hierro 4520',
        operation: 'venta',
        type: 'Casa',
        price: 8450000,
        period: '',
        beds: 4,
        baths: 4.5,
        area: 420,
        parking: 3,
        year: 2021,
        tag: 'destacado',
        status: 'disponible',
        images: [
          img('photo-1600585154340-be6161a56a0c'),
          img('photo-1600607687939-ce8a6c25118c'),
          img('photo-1600566753086-00f18fb6b3ea'),
          img('photo-1484154218962-a197022b5858'),
        ],
        description:
          'Una residencia de líneas limpias y luz natural durante todo el día. La planta principal integra sala, comedor y cocina en un solo volumen que se abre hacia una terraza con jardín y alberca. Las recámaras se ubican en el segundo nivel para mayor privacidad, con la principal provista de vestidor y baño completo.',
        amenities: [
          'Alberca privada', 'Jardín maduro', 'Cocina integral', 'Estudio',
          'Cuarto de servicio', 'Domótica básica', 'Seguridad 24 h', 'Terraza techada',
        ],
      },
      {
        id: 'departamento-providencia',
        title: 'Departamento en Providencia',
        city: 'Guadalajara, Jalisco',
        zone: 'Providencia',
        address: 'Av. Providencia 1450',
        operation: 'renta',
        type: 'Departamento',
        price: 32000,
        period: 'mes',
        beds: 2,
        baths: 2,
        area: 118,
        parking: 1,
        year: 2019,
        tag: 'oferta',
        status: 'disponible',
        images: [
          img('photo-1502672260266-1c1ef2d93688'),
          img('photo-1560448204-e02f11c3d0e2'),
          img('photo-1522708323590-d24dbb6b0267'),
        ],
        description:
          'Departamento amueblado en el corazón de Providencia, a dos calles del Parque Providencia. Ideal para quien busca caminar a todo: restaurantes, galerías, transporte y oficinas. El edificio cuenta con recepción, gimnasio y roof garden compartido.',
        amenities: [
          'Amueblado', 'Gimnasio', 'Roof garden', 'Recepción 24 h',
          'Elevador', 'Pet friendly', 'Internet incluido', 'Seguridad',
        ],
      },
      {
        id: 'residencia-chapalita',
        title: 'Residencia en Chapalita',
        city: 'Zapopan, Jalisco',
        zone: 'Chapalita',
        address: 'Av. Guadalupe 210',
        operation: 'venta',
        type: 'Casa',
        price: 12900000,
        period: '',
        beds: 5,
        baths: 5,
        area: 610,
        parking: 2,
        year: 2018,
        tag: 'destacado',
        status: 'disponible',
        images: [
          img('photo-1570129477492-45c003edd2be'),
          img('photo-1600210492486-724fe5c67fb0'),
          img('photo-1600585152220-90363fe7e115'),
          img('photo-1493809842364-78817add7ffb'),
        ],
        description:
          'Casona restaurada con técnicas tradicionales y acabados contemporáneos. Patio central con fuente, vigas de madera y cantera original. A cinco minutos caminando de la Glorieta de Chapalita, en una de las calles más tranquilas de la colonia.',
        amenities: [
          'Patio central', 'Fuente de cantera', 'Chimenea', 'Bóveda catalana',
          'Cisterna', 'Bodega', 'Vista a la glorieta', 'Amueblado parcial',
        ],
      },
      {
        id: 'loft-guadalajara-centro',
        title: 'Loft en Guadalajara Centro',
        city: 'Guadalajara, Jalisco',
        zone: 'Centro Histórico',
        address: 'Calle Morelos 118',
        operation: 'renta',
        type: 'Loft',
        price: 18500,
        period: 'mes',
        beds: 1,
        baths: 1,
        area: 68,
        parking: 1,
        year: 2022,
        tag: 'urgente',
        status: 'disponible',
        images: [
          img('photo-1522708323590-d24dbb6b0267'),
          img('photo-1484154218962-a197022b5858'),
          img('photo-1502672260266-1c1ef2d93688'),
        ],
        description:
          'Loft de doble altura en un edificio rehabilitado de 1920. Ventanales originales, pisos de roble y una cocina abierta de acero. Disponible de inmediato, con contrato flexible desde seis meses.',
        amenities: [
          'Doble altura', 'Pisos de roble', 'Cocina integral', 'Disponible inmediato',
          'Luz natural', 'Edificio histórico', 'Azotea compartida', 'Bicicletas',
        ],
      },
      {
        id: 'villa-puerto-vallarta',
        title: 'Villa frente al mar en Conchas Chinas',
        city: 'Puerto Vallarta, Jalisco',
        zone: 'Conchas Chinas',
        address: 'Carretera a Barra de Navidad km 3',
        operation: 'venta',
        type: 'Villa',
        price: 15200000,
        period: '',
        beds: 4,
        baths: 4,
        area: 380,
        parking: 2,
        year: 2017,
        tag: '',
        status: 'disponible',
        images: [
          img('photo-1613490493576-7fde63acd811'),
          img('photo-1512917774080-9991f1c4c750'),
          img('photo-1600607687939-ce8a6c25118c'),
          img('photo-1600566753086-00f18fb6b3ea'),
        ],
        description:
          'Villa escalonada sobre la ladera, con vista abierta a la bahía desde cada nivel. Alberca infinita, terraza de día y una palapa para comedor exterior. A diez minutos del Malecón y con acceso peatonal a playa Las Estacas.',
        amenities: [
          'Vista al mar', 'Alberca infinita', 'Palapa', 'Terraza de día',
          'Riego automatizado', 'Aire acondicionado', 'Amueblado', 'Acceso a playa',
        ],
      },
      {
        id: 'penthouse-andares',
        title: 'Penthouse en Andares',
        city: 'Zapopan, Jalisco',
        zone: 'Andares',
        address: 'Av. Patria 2400',
        operation: 'venta',
        type: 'Penthouse',
        price: 24800000,
        period: '',
        beds: 3,
        baths: 3.5,
        area: 265,
        parking: 2,
        year: 2020,
        tag: 'oferta',
        status: 'disponible',
        images: [
          img('photo-1600210492486-724fe5c67fb0'),
          img('photo-1560448204-e02f11c3d0e2'),
          img('photo-1502672260266-1c1ef2d93688'),
        ],
        description:
          'Último nivel con terraza privada de 70 m² y vista al Bosque Colomos. Doble altura en la sala, cocina Bulthaup y acabados en mármol. Amenidades de hotel en un edificio de solo doce residencias.',
        amenities: [
          'Terraza privada', 'Vista a Colomos', 'Cocina Bulthaup', 'Doble altura',
          'Concierge', 'Spa', 'Cava de vinos', 'Dos cajones',
        ],
      },
      {
        id: 'casa-tlaquepaque',
        title: 'Casa en el centro de Tlaquepaque',
        city: 'Tlaquepaque, Jalisco',
        zone: 'Centro',
        address: 'Calle Independencia 9',
        operation: 'venta',
        type: 'Casa',
        price: 6750000,
        period: '',
        beds: 3,
        baths: 2,
        area: 240,
        parking: 1,
        year: 1998,
        tag: '',
        status: 'vendida',
        images: [
          img('photo-1580587771525-78b9dba3b914'),
          img('photo-1493809842364-78817add7ffb'),
          img('photo-1484154218962-a197022b5858'),
        ],
        description:
          'Casa de tres niveles en una calle peatonal del centro. Techos altos, balcones de hierro forjado y una terraza con vista a los tejados de la ciudad. Vendida recientemente; contamos con propiedades similares disponibles.',
        amenities: [
          'Terraza con vista', 'Balcones', 'Techos altos', 'Bodega',
          'Cocina equipada', 'Calefacción', 'Calle peatonal', 'Vista panorámica',
        ],
      },
      {
        id: 'departamento-zapopan-norte',
        title: 'Departamento en Zapopan Norte',
        city: 'Zapopan, Jalisco',
        zone: 'Jardines del Valle',
        address: 'Av. Tesistán 700',
        operation: 'renta',
        type: 'Departamento',
        price: 14000,
        period: 'mes',
        beds: 2,
        baths: 2,
        area: 92,
        parking: 1,
        year: 2023,
        tag: '',
        status: 'disponible',
        images: [
          img('photo-1560448204-e02f11c3d0e2'),
          img('photo-1522708323590-d24dbb6b0267'),
          img('photo-1502672260266-1c1ef2d93688'),
        ],
        description:
          'Departamento nuevo en un conjunto cerrado con áreas verdes y casa club. Cocina integral, área de lavado independiente y balcón. Cerca de hospitales, universidades y los principales corporativos de la zona norte.',
        amenities: [
          'Casa club', 'Áreas verdes', 'Gimnasio', 'Balcón',
          'Área de lavado', 'Estacionamiento techado', 'Conjunto cerrado', 'Nuevo',
        ],
      },
    ],
    banners: [
      {
        id: 'b-temporada',
        title: 'Temporada de fin de año',
        subtitle: 'Propiedades seleccionadas con hasta 15% de descuento.',
        tag: 'oferta',
        active: true,
        pinned: true,
        cta: 'Ver propiedades',
        image: img('photo-1600585152220-90363fe7e115', 1000),
        createdAt: '2026-11-02',
      },
      {
        id: 'b-san-miguel',
        title: 'Nuevas llegadas en Chapalita',
        subtitle: 'Tres residencias recién incorporadas a la colección.',
        tag: 'destacado',
        active: true,
        pinned: false,
        cta: 'Explorar colección',
        image: img('photo-1570129477492-45c003edd2be', 1000),
        createdAt: '2026-11-08',
      },
      {
        id: 'b-polanco',
        title: 'Últimas unidades en Andares',
        subtitle: 'Dos penthouses con entrega inmediata.',
        tag: 'urgente',
        active: false,
        pinned: false,
        cta: 'Solicitar información',
        image: img('photo-1600210492486-724fe5c67fb0', 1000),
        createdAt: '2026-11-11',
      },
    ],
  };

  const money = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  });

  const clone = (v) => JSON.parse(JSON.stringify(v));

  function getDB() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return clone(seed);
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.properties) || !Array.isArray(parsed.banners)) {
        return clone(seed);
      }
      return Object.assign(clone(seed), parsed);
    } catch (err) {
      return clone(seed);
    }
  }

  function saveDB(db) {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
      return true;
    } catch (err) {
      return false;
    }
  }

  function resetDB() {
    try { localStorage.removeItem(KEY); } catch (err) { /* noop */ }
    return clone(seed);
  }

  function getFavorites() {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function toggleFavorite(id) {
    const list = getFavorites();
    const next = list.includes(id) ? list.filter((x) => x !== id) : list.concat(id);
    try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch (err) { /* noop */ }
    return next;
  }

  const esc = (str) =>
    String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  function formatPrice(p, opts) {
    const short = opts && opts.short;
    const value = money.format(p.price).replace('MX$', '$');
    if (p.period) return { main: value, suffix: '/ ' + p.period };
    if (short) {
      if (p.price >= 1000000) return { main: '$' + (p.price / 1000000).toFixed(1).replace('.0', '') + ' M', suffix: '' };
      return { main: value, suffix: '' };
    }
    return { main: value, suffix: '' };
  }

  const TAG_LABEL = { oferta: 'Oferta', urgente: 'Urgente', destacado: 'Destacado' };

  function tagHTML(tag) {
    if (!tag) return '';
    return `<span class="tag tag--${esc(tag)}">${TAG_LABEL[tag] || esc(tag)}</span>`;
  }

  const STATUS_LABEL = {
    disponible: 'Disponible',
    vendida: 'Vendida',
    rentada: 'Rentada',
    borrador: 'Borrador',
  };

  function statusHTML(status) {
    return `<span class="status status--${esc(status)}">${STATUS_LABEL[status] || esc(status)}</span>`;
  }

  const ICON = {
    pin: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>',
    bed: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-7h18v7"/><path d="M3 18h18"/><path d="M6 11V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/></svg>',
    bath: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-3Z"/><path d="M6 12V6a2.5 2.5 0 0 1 5 0"/><path d="M8 20l-1 2M17 20l1 2"/></svg>',
    area: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M9 4v5H4M15 20v-5h5"/></svg>',
    car: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16h14l-1.4-5.2A2 2 0 0 0 15.7 9H8.3a2 2 0 0 0-1.9 1.8L5 16Z"/><path d="M6 16v3M18 16v3"/><circle cx="8" cy="16" r="1.2"/><circle cx="16" cy="16" r="1.2"/></svg>',
    heart: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-9.4A4.1 4.1 0 0 1 12 7a4.1 4.1 0 0 1 7 3.6c0 5-7 9.4-7 9.4Z"/></svg>',
    arrow: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    phone: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 4h3l1.5 4-2 1.4a12 12 0 0 0 5.6 5.6l1.4-2 4 1.5v3A2.5 2.5 0 0 1 17.5 20C10.6 19.4 4.6 13.4 4 6.5A2.5 2.5 0 0 1 6.5 4Z"/></svg>',
    mail: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/></svg>',
    whatsapp: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11.6A7.8 7.8 0 0 1 8.4 18.5L4 20l1.5-4.3A7.8 7.8 0 1 1 20 11.6Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5"/></svg>',
    check: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
  };

  function propertyCardHTML(p, opts) {
    const f = formatPrice(p);
    const saved = getFavorites().includes(p.id);
    const media = p.images && p.images[0] ? p.images[0] : '';
    const tag = tagHTML(p.tag);
    const status = p.status !== 'disponible' ? statusHTML(p.status) : '';
    const specs = [];
    if (p.beds) specs.push(`<span class="p-card__spec">${ICON.bed}${p.beds} rec</span>`);
    if (p.baths) specs.push(`<span class="p-card__spec">${ICON.bath}${p.baths} baños</span>`);
    if (p.area) specs.push(`<span class="p-card__spec">${ICON.area}${p.area} m²</span>`);
    if (p.parking) specs.push(`<span class="p-card__spec">${ICON.car}${p.parking}</span>`);

    return `
      <article class="p-card">
        <div class="p-card__media">
          <a href="property.html?id=${encodeURIComponent(p.id)}" aria-label="${esc(p.title)}">
            <img src="${esc(media)}" alt="${esc(p.title)}" loading="lazy">
          </a>
          <div class="p-card__tags">${tag}${p.status === 'vendida' ? '<span class="tag tag--vendida">Vendida</span>' : ''}</div>
          <button class="p-card__fav ${saved ? 'is-saved' : ''}" type="button" data-fav="${esc(p.id)}" aria-label="Guardar propiedad" aria-pressed="${saved}">${ICON.heart}</button>
          ${status ? `<div class="p-card__status">${status}</div>` : ''}
        </div>
        <div class="p-card__body">
          <span class="p-card__kicker">${esc(p.operation === 'renta' ? 'En renta' : 'En venta')} · ${esc(p.type)}</span>
          <h3 class="p-card__title"><a href="property.html?id=${encodeURIComponent(p.id)}">${esc(p.title)}</a></h3>
          <p class="p-card__location">${ICON.pin}${esc(p.zone)}, ${esc(p.city)}</p>
          <div class="p-card__specs">${specs.join('')}</div>
          <div class="p-card__foot">
            <div class="p-card__price">${f.main}${f.suffix ? ` <small>${f.suffix}</small>` : ''}</div>
            <a class="p-card__cta" href="property.html?id=${encodeURIComponent(p.id)}">Ver ficha ${ICON.arrow}</a>
          </div>
        </div>
      </article>`;
  }

  window.Realty = {
    KEY,
    getDB,
    saveDB,
    resetDB,
    getFavorites,
    toggleFavorite,
    formatPrice,
    tagHTML,
    statusHTML,
    propertyCardHTML,
    esc,
    STATUS_LABEL,
    TAG_LABEL,
    ICON,
  };
})();
