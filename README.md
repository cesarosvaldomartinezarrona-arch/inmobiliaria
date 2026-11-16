# Depas ZMG — Sitio inmobiliario

Sitio web estático para una inmobiliaria en Guadalajara, Jalisco. Incluye una página pública,
una ficha de propiedad y un panel de administración con gestión de banners y propiedades.

## Páginas

| Archivo | Descripción |
| --- | --- |
| `index.html` | Página principal: hero, buscador, colección de propiedades, zonas y contacto. |
| `property.html` | Ficha individual. Se abre con `property.html?id=<id-de-propiedad>`. |
| `login.html` | Acceso al panel. Requiere usuario y contraseña. |
| `admin.html` | Panel administrativo: resumen, propiedades y banners. Solo con sesión iniciada. |

## Acceso al panel

El panel está protegido con usuario y contraseña:

```
Usuario:    admin
Contraseña: DZMG2026!
```

- La contraseña no se guarda en texto plano: se valida con **PBKDF2-SHA256** (210 000 iteraciones)
  contra un hash almacenado en `src/js/auth.js`.
- La sesión dura **8 horas** y se guarda en `sessionStorage`, así que se cierra al cerrar el
  navegador o al usar **Cerrar sesión** en la barra lateral del panel.
- Tras **5 intentos fallidos** el acceso se bloquea 60 segundos.
- Si alguien abre `admin.html` sin sesión, se le redirige a `login.html`.

### Cambiar el usuario o la contraseña

Genera los nuevos hashes (requiere Node.js) y pégalos en el bloque `CONFIG` de `src/js/auth.js`:

```bash
node -e "const c=require('crypto');const salt=c.randomBytes(16);const pass=process.argv[1];const user=process.argv[2];console.log('userHash:',c.createHash('sha256').update(user.toLowerCase()).digest('hex'));console.log('passHash:',c.pbkdf2Sync(pass,salt,210000,32,'sha256').toString('hex'));console.log('salt:',salt.toString('hex'))" 'NUEVA_CONTRASEÑA' 'NUEVO_USUARIO'
```

Reemplaza `userHash`, `passHash` y `salt` en `CONFIG`. Si cambias `iterations`, ajústalo también en
el comando.

### Alcance de esta protección

El sitio es estático (GitHub Pages no ejecuta código del servidor), así que esta puerta de acceso
vive en el navegador: impide el acceso casual y el de quien no conoce las credenciales, pero no
detiene a alguien con conocimientos técnicos que manipule el navegador o lea el código. Para
seguridad estricta hace falta autenticación de servidor (Firebase Auth, Supabase, Netlify Identity o
un backend propio).

## Panel de administración

- **Propiedades**: cambiar estado (disponible, vendida, rentada, borrador), asignar etiquetas
  (`Oferta`, `Urgente`, `Destacado`) y crear fichas nuevas.
- **Banners**: crear banners, activarlos o desactivarlos, etiquetarlos y **fijar uno al encabezado
  público**. Solo un banner puede estar fijado a la vez.
- **Publicar cambios**: confirma la publicación en el sitio público.

Los cambios se guardan en `localStorage` del navegador, por lo que se reflejan de inmediato en las
páginas públicas del mismo equipo. El botón "Restablecer datos de prueba" recupera la colección
inicial.

Acceso al panel desde el botón **Panel admin** de la navegación, que lleva a
`https://<usuario>.github.io/inmobiliaria/login.html`.

## Estructura

```
.
├── index.html
├── property.html
├── login.html
├── admin.html
├── assets/
│   └── logo.jpeg
└── src/
    ├── js/
    │   ├── store.js      # datos, persistencia y plantillas compartidas
    │   ├── auth.js       # acceso al panel: credenciales, sesión y bloqueo
    │   ├── public.js     # página principal
    │   ├── property.js   # ficha de propiedad
    │   └── admin.js      # panel administrativo
    └── styles/
        ├── design-system.css  # tokens, reset, tipografía y utilidades
        └── components.css     # componentes de las páginas
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
