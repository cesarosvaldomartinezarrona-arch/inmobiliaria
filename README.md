# Depas ZMG — Sitio inmobiliario

Sitio web estático para una inmobiliaria en Guadalajara, Jalisco. Incluye una página pública,
una ficha de propiedad y un panel de administración con gestión de banners y propiedades.

## Páginas

| Archivo | Descripción |
| --- | --- |
| `index.html` | Página principal: hero, buscador, colección de propiedades, zonas y contacto. |
| `property.html` | Ficha individual. Se abre con `property.html?id=<id-de-propiedad>`. |
| `admin.html` | Panel administrativo: resumen, propiedades y banners. |

## Panel de administración

- **Propiedades**: cambiar estado (disponible, vendida, rentada, borrador), asignar etiquetas
  (`Oferta`, `Urgente`, `Destacado`) y crear fichas nuevas.
- **Banners**: crear banners, activarlos o desactivarlos, etiquetarlos y **fijar uno al encabezado
  público**. Solo un banner puede estar fijado a la vez.
- **Publicar cambios**: confirma la publicación en el sitio público.

Los cambios se guardan en `localStorage` del navegador, por lo que se reflejan de inmediato en las
páginas públicas del mismo equipo. El botón "Restablecer datos de prueba" recupera la colección
inicial.

Acceso al panel desde el botón **Panel admin** de la navegación o desde
`https://<usuario>.github.io/inmobiliaria/admin.html`.

## Estructura

```
.
├── index.html
├── property.html
├── admin.html
├── assets/
│   └── logo.jpeg
└── src/
    ├── js/
    │   ├── store.js      # datos, persistencia y plantillas compartidas
    │   ├── public.js     # página principal
    │   ├── property.js   # ficha de propiedad
    │   └── admin.js      # panel administrativo
    └── styles/
        ├── design-system.css  # tokens, reset, tipografía y utilidades
        └── components.css     # componentes de las tres páginas
```

## Publicación en GitHub Pages

1. Subir los cambios a la rama `master`.
2. En **Settings → Pages**, seleccionar:
   - **Source**: Deploy from a branch
   - **Branch**: `master`
   - **Folder**: `/ (root)`
3. Guardar y esperar la publicación. La URL queda como
   `https://<usuario>.github.io/inmobiliaria/`.

El sitio no requiere compilación ni dependencias: es HTML, CSS y JavaScript estáticos.
