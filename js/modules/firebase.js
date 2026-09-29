// ============================================================
// ARATECH Ecosystem
// Firebase
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyDDOkUqtf58MOYIhuvGHES5ih1IliGCsG4",

  authDomain: "aratech-ecosystem.firebaseapp.com",

  projectId: "aratech-ecosystem",

  storageBucket: "aratech-ecosystem.firebasestorage.app",

  messagingSenderId: "767396683539",

  appId: "1:767396683539:web:2960f25f34a4561db804e6",
};

firebase.initializeApp(firebaseConfig);

// ============================================================
// [FASE 3] APP CHECK — reCAPTCHA Enterprise
// ============================================================
// Adjunta a cada petición a Firestore, Storage y Cloud Functions una prueba
// de que viene de la página real de ARASYS. Mientras App Check no esté
// "aplicado" en la consola, Firebase solo lo MIDE y no rechaza nada.
// Se activa antes de cualquier uso de Firestore/Auth/Functions.

const RECAPTCHA_ENTERPRISE_SITE_KEY = "6Lf7PdUtAAAAACZICzz0kSCeUKZAl9xGR9rAripG";

// En desarrollo local (localhost) reCAPTCHA no valida el dominio: se usa un
// "token de depuración" que aparece en la consola del navegador y se registra
// en App Check → Apps → Administrar tokens de depuración.
if (["localhost", "127.0.0.1"].includes(location.hostname)) {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

try {
  if (firebase.appCheck && firebase.appCheck.ReCaptchaEnterpriseProvider) {
    firebase
      .appCheck()
      .activate(
        new firebase.appCheck.ReCaptchaEnterpriseProvider(
          RECAPTCHA_ENTERPRISE_SITE_KEY,
        ),
        true, // renovar el token automáticamente
      );
  } else {
    console.warn("App Check no disponible: el script no se cargó.");
  }
} catch (e) {
  // Si App Check falla, el sistema sigue funcionando (aún no está aplicado)
  console.warn("No se pudo activar App Check:", e);
}

const FB = {
  auth: firebase.auth(),

  db: firebase.firestore(),
};

window.FB = FB;
// ============================================================
// PERSISTENCIA DE SESIÓN
// ============================================================

FB.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// ============================================================
// CRUD Firestore
// ============================================================
FB.getAll = async function (collection) {
  const snapshot = await FB.db.collection(collection).get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

FB.get = async function (collection, id) {
  const doc = await FB.db.collection(collection).doc(id).get();

  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data(),
  };
};

FB.save = async function (collection, id, data) {
  await FB.db.collection(collection).doc(id).set(data);
};

FB.update = async function (collection, id, data) {
  await FB.db.collection(collection).doc(id).set(data, { merge: true });
};
FB.delete = async function (collection, id) {
  await FB.db.collection(collection).doc(id).delete();
};

// ============================================================
// FOLIADORES FIRESTORE
// ============================================================

// [FASE 4] "minimo" (opcional): si el contador quedó atrasado respecto a los
// registros existentes, el siguiente folio será mayor que ese número.
FB.nextFolio = async function (prefix, minimo = 0) {
  const ref = FB.db.collection("folios").doc(prefix);

  return await FB.db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);

    let ultimo = 0;

    // Si ya existe el documento en Firestore
    if (snap.exists) {
      ultimo = Number(snap.data().ultimo || 0);
    }
    // Si todavía no existe,
    // intentar recuperar el contador histórico
    // desde el objeto local.
    else {
      const cache = DB.obj("folios", {});

      ultimo = Number(cache[prefix] || 0);
    }

    ultimo = Math.max(ultimo, Number(minimo) || 0);

    ultimo++;

    const ahora = new Date().toISOString();

    tx.set(
      ref,
      {
        prefijo: prefix,

        ultimo,

        siguiente: prefix + "-" + String(ultimo + 1).padStart(4, "0"),

        creado: snap.exists ? snap.data().creado || ahora : ahora,

        actualizado: ahora,

        usuario: window.USUARIO?.nombre || "Sistema",
      },
      { merge: true },
    );

    return prefix + "-" + String(ultimo).padStart(4, "0");
  });
};

// ============================================================
// FIREBASE CLOUD FUNCTIONS
// ============================================================

const functions = firebase.app().functions("us-east1");

FB.callFunction = async function (nombre, data = {}) {
  try {
    const fn = functions.httpsCallable(nombre);

    const res = await fn(data);

    return res.data;
  } catch (e) {
    console.error("Firebase Function Error:", nombre, e);

    return {
      ok: false,
      error: e.message,
    };
  }
};
