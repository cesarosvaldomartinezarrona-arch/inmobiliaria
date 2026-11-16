/* ===================================================================
   AUTH — puerta de acceso al panel de administración
   Verificación local con PBKDF2-SHA256 (WebCrypto).
   Requiere contexto seguro: https o localhost.
   Nota: es una puerta de interfaz, no autenticación de servidor.
   =================================================================== */

(function () {
  'use strict';

  const SESSION_KEY = 'depas-zmg.auth.v2';
  const FAIL_KEY = 'depas-zmg.auth.fails.v2';

  /* Credenciales: admin / DZMG2026!
     Para cambiarlas, ver README → "Acceso al panel". */
  const CONFIG = {
    userHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    passHash: '05123568cf7f200bef1cccd60448a279d8ad09a2b96296c73c8c91f66e864c6d',
    salt: 'd0b5a1f6c2e94b7e8a3f5d21c6e07b94',
    iterations: 210000,
    sessionHours: 8,
    maxFails: 5,
    cooldownMs: 60000,
  };

  const subtle = window.crypto && window.crypto.subtle ? window.crypto.subtle : null;

  /* ---------- codificación ---------- */
  function hex(buffer) {
    return Array.prototype.map
      .call(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  function bytesFromHex(value) {
    const out = new Uint8Array(value.length / 2);
    for (let i = 0; i < out.length; i += 1) out[i] = parseInt(value.substr(i * 2, 2), 16);
    return out;
  }

  function equal(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
  }

  /* ---------- derivación ---------- */
  function digest(text) {
    return subtle.digest('SHA-256', new TextEncoder().encode(text)).then(hex);
  }

  function derive(password) {
    return subtle
      .importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
      .then((key) =>
        subtle.deriveBits(
          {
            name: 'PBKDF2',
            salt: bytesFromHex(CONFIG.salt),
            iterations: CONFIG.iterations,
            hash: 'SHA-256',
          },
          key,
          256
        )
      )
      .then(hex);
  }

  function sign(payload) {
    return subtle
      .importKey(
        'raw',
        new TextEncoder().encode('depas-zmg.session.v2'),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )
      .then((key) => subtle.sign('HMAC', key, new TextEncoder().encode(payload)))
      .then(hex);
  }

  /* ---------- intentos fallidos ---------- */
  function readFails() {
    try {
      const raw = JSON.parse(localStorage.getItem(FAIL_KEY) || 'null');
      if (!raw || typeof raw.count !== 'number') return { count: 0, at: 0 };
      return raw;
    } catch (err) {
      return { count: 0, at: 0 };
    }
  }

  function writeFails(data) {
    try {
      localStorage.setItem(FAIL_KEY, JSON.stringify(data));
    } catch (err) {
      /* noop */
    }
  }

  function lockRemaining() {
    const fails = readFails();
    if (fails.count < CONFIG.maxFails) return { locked: false, waitMs: 0 };
    const elapsed = Date.now() - fails.at;
    if (elapsed >= CONFIG.cooldownMs) {
      writeFails({ count: 0, at: 0 });
      return { locked: false, waitMs: 0 };
    }
    return { locked: true, waitMs: CONFIG.cooldownMs - elapsed };
  }

  function registerFail() {
    const fails = readFails();
    const expired = fails.count >= CONFIG.maxFails && Date.now() - fails.at >= CONFIG.cooldownMs;
    const count = expired ? 1 : fails.count + 1;
    writeFails({ count, at: Date.now() });
    return lockRemaining();
  }

  function resetFails() {
    writeFails({ count: 0, at: 0 });
  }

  /* ---------- sesión ---------- */
  function readSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    } catch (err) {
      return null;
    }
  }

  function isAuthed() {
    const session = readSession();
    return !!(session && session.exp && session.exp > Date.now() && typeof session.sig === 'string');
  }

  function isValid() {
    const session = readSession();
    if (!session || !session.exp || session.exp <= Date.now() || !session.sig) {
      logout();
      return Promise.resolve(false);
    }
    return sign(session.u + '|' + session.exp).then((sig) => {
      if (!equal(sig, session.sig)) {
        logout();
        return false;
      }
      return true;
    });
  }

  function login(user, pass) {
    if (!subtle) return Promise.resolve({ ok: false, code: 'unsupported' });

    const lock = lockRemaining();
    if (lock.locked) return Promise.resolve({ ok: false, code: 'locked', waitMs: lock.waitMs });

    return Promise.all([digest(user.trim().toLowerCase()), derive(pass)]).then((result) => {
      const okUser = equal(result[0], CONFIG.userHash);
      const okPass = equal(result[1], CONFIG.passHash);

      if (!okUser || !okPass) {
        const after = registerFail();
        return { ok: false, code: after.locked ? 'locked' : 'invalid', waitMs: after.waitMs };
      }

      const session = { u: user.trim().toLowerCase(), exp: Date.now() + CONFIG.sessionHours * 3600000 };
      return sign(session.u + '|' + session.exp).then((sig) => {
        session.sig = sig;
        try {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        } catch (err) {
          /* noop */
        }
        resetFails();
        return { ok: true };
      });
    });
  }

  function logout() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (err) {
      /* noop */
    }
  }

  function sessionEndsAt() {
    const session = readSession();
    return session && session.exp ? session.exp : 0;
  }

  /* ---------- pantalla de acceso ---------- */
  function initLogin() {
    const form = document.getElementById('login-form');
    if (!form) return;

    const userInput = document.getElementById('login-user');
    const passInput = document.getElementById('login-pass');
    const notice = document.getElementById('login-notice');
    const submit = document.getElementById('login-submit');
    const eye = document.getElementById('toggle-pass');

    function showNotice(kind, text) {
      if (!notice) return;
      notice.hidden = false;
      notice.className = 'auth__notice auth__notice--' + kind;
      notice.textContent = text;
    }

    function hideNotice() {
      if (notice) notice.hidden = true;
    }

    let lockTimer = null;
    function startLockCountdown(waitMs) {
      let remaining = waitMs;
      clearInterval(lockTimer);
      const paint = () => {
        const secs = Math.ceil(Math.max(remaining, 0) / 1000);
        showNotice('error', 'Demasiados intentos fallidos. Espera ' + secs + ' s para volver a intentarlo.');
        if (submit) submit.disabled = true;
        remaining -= 1000;
        if (remaining < 0) {
          clearInterval(lockTimer);
          if (submit) submit.disabled = false;
          hideNotice();
          if (passInput) passInput.focus();
        }
      };
      paint();
      lockTimer = setInterval(paint, 1000);
    }

    if (new URLSearchParams(location.search).get('bye')) {
      showNotice('notice', 'Sesión cerrada correctamente. Ingresa de nuevo para continuar.');
    }

    if (!subtle) {
      showNotice(
        'error',
        'Este navegador no permite el acceso seguro. Abre el sitio publicado con https:// para iniciar sesión.'
      );
      if (submit) submit.disabled = true;
    }

    const initialLock = lockRemaining();
    if (initialLock.locked) startLockCountdown(initialLock.waitMs);

    if (eye && passInput) {
      eye.addEventListener('click', () => {
        const show = passInput.type === 'password';
        passInput.type = show ? 'text' : 'password';
        eye.classList.toggle('is-on', show);
        eye.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
        passInput.focus();
      });
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (submit && submit.disabled) return;

      const user = userInput ? userInput.value.trim() : '';
      const pass = passInput ? passInput.value : '';

      if (!user || !pass) {
        showNotice('error', 'Escribe tu usuario y contraseña.');
        return;
      }
      if (!subtle) return;

      hideNotice();
      if (submit) {
        submit.dataset.label = submit.textContent;
        submit.disabled = true;
        submit.textContent = 'Verificando…';
      }

      login(user, pass)
        .then((result) => {
          if (result.ok) {
            if (submit) submit.textContent = 'Acceso concedido…';
            location.replace('admin.html');
            return;
          }

          if (submit) {
            submit.disabled = false;
            submit.textContent = submit.dataset.label || 'Entrar al panel';
          }
          if (passInput) {
            passInput.value = '';
            passInput.focus();
          }

          if (result.code === 'locked') {
            startLockCountdown(result.waitMs || CONFIG.cooldownMs);
          } else if (result.code === 'unsupported') {
            showNotice('error', 'Este navegador no permite el acceso seguro. Usa https://.');
          } else {
            showNotice('error', 'Usuario o contraseña incorrectos. Verifica los datos e intenta de nuevo.');
          }
        })
        .catch(() => {
          if (submit) {
            submit.disabled = false;
            submit.textContent = submit.dataset.label || 'Entrar al panel';
          }
          showNotice('error', 'No se pudo verificar el acceso. Recarga la página e intenta de nuevo.');
        });
    });
  }

  /* ---------- panel ---------- */
  function initAdmin() {
    const out = document.getElementById('logout-btn');
    if (out) {
      out.addEventListener('click', () => {
        logout();
        location.replace('login.html?bye=1');
      });
    }
  }

  /* ---------- arranque ---------- */
  function boot() {
    const page = document.body ? document.body.dataset.page : '';

    if (page === 'admin') {
      isValid().then((ok) => {
        if (!ok) {
          location.replace('login.html?next=admin.html');
          return;
        }
        document.documentElement.classList.remove('auth-pending');
        document.documentElement.classList.add('auth-ok');
        initAdmin();
      });
      return;
    }

    if (page === 'login') {
      initLogin();
      if (isAuthed()) {
        isValid().then((ok) => {
          if (ok) location.replace('admin.html');
        });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.DZAuth = {
    CONFIG,
    login,
    logout,
    isAuthed,
    isValid,
    lockRemaining,
    sessionEndsAt,
  };
})();
