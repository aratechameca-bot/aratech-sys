# Fase 3 — App Check (Etapa 8.6)

Fecha: 29 de septiembre de 2026

## Configuración en consola (hecha)

- **Clave reCAPTCHA Enterprise:** `ARASYS web`, tipo Website · Score.
  - ID: `6Lf7PdUtAAAAACZICzz0kSCeUKZAl9xGR9rAripG` (es pública por diseño).
  - Dominios: `aratech-ecosystem.web.app`, `aratech-ecosystem.firebaseapp.com`, `clientes-aratech.web.app`, `sys.aratech.com.mx` y `clientes.aratech.com.mx`.
- **App Check:** app web `...2960f25f34a4561db804e6` registrada con reCAPTCHA Enterprise.
- **Estado de las APIs:** Storage, Cloud Firestore y Authentication en **"No se aplica"** (solo monitoreo).

## Etapa 2 — Monitoreo (este paquete)

| Archivo | Cambio |
|---|---|
| `index.html` | Carga `firebase-app-check-compat.js` (v12.0.0) justo después de `firebase-app-compat.js` |
| `js/modules/firebase.js` | Activa App Check con `ReCaptchaEnterpriseProvider` y renovación automática, justo después de `initializeApp` |

- En `localhost` se activa el **token de depuración** para poder probar localmente.
- Si App Check falla (por ejemplo, un bloqueador de anuncios impide cargar reCAPTCHA), el sistema sigue funcionando igual, porque todavía no se aplica.
- **No hay cambios en Cloud Functions ni en las reglas.**

### Publicar

```
firebase deploy --only hosting
```

Después, recarga ARASYS con `Ctrl + Shift + R` en todos los equipos.

### Verificar (con F12)

1. Inicia sesión y usa el sistema normalmente: órdenes, un archivo en un ticket, abrir un comprobante.
2. En la pestaña **Consola** no deben aparecer errores que mencionen `AppCheck` o `appCheck/`.
3. En la pestaña **Red** (Network), escribe `appcheck` en el filtro. Debe aparecer una petición a `content-firebaseappcheck.googleapis.com` (`exchangeRecaptchaEnterpriseToken`) con estado **200**.

### Qué se mide durante el monitoreo (3 a 7 días)

- **Firestore y Storage:** en la consola de Firebase, App Check → APIs, cada servicio mostrará las solicitudes **verificadas** y **no verificadas** (las métricas pueden tardar unas horas en aparecer). La meta es que el tráfico de ARASYS salga prácticamente 100% verificado.
- **Cloud Functions:** los registros de las funciones indican, en cada llamada, si trae App Check. En el Explorador de registros:
  ```
  jsonPayload.message:"Callable request verification"
  ```
  El campo `jsonPayload.verifications.app` vale `VALID` (con App Check), `MISSING` (sin él) o `INVALID`.
  - Las llamadas del **portal de clientes** saldrán `MISSING`; es lo esperado, porque el portal no tiene App Check (Etapa 10).

### Fuentes normales de solicitudes "no verificadas"

- Pestañas que quedaron abiertas con la versión anterior, hasta que se recarguen.
- El portal de clientes.
- Cualquier intento externo de usar tus APIs. Esto es justo lo que App Check bloqueará en la etapa 3.

## Etapa 3 — Activación (pendiente, después del monitoreo)

1. **Firestore:** App Check → APIs → Cloud Firestore → **Aplicar**.
2. **Storage:** el mismo procedimiento.
3. **Functions:** agregar `enforceAppCheck: true` solo a las funciones de ARASYS; las del portal quedan fuera hasta la Etapa 10. Se despliega por grupos.
4. Límites por usuario en las funciones sensibles.

Cada paso se prueba antes de pasar al siguiente. Para revertir Firestore o Storage, basta con desactivar la aplicación en la consola.
