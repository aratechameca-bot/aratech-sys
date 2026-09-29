// ============================================================
// ARATECH Ecosystem
// Firebase API
// Capa de acceso a Firestore
// ============================================================

import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from "./firebase-db.js";

const FirebaseAPI = {
  async getAll(nombreColeccion) {
    const snap = await getDocs(collection(db, nombreColeccion));

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  async save(nombreColeccion, datos) {
    return await addDoc(collection(db, nombreColeccion), datos);
  },

  async update(nombreColeccion, id, datos) {
    return await updateDoc(doc(db, nombreColeccion, id), datos);
  },

  async delete(nombreColeccion, id) {
    return await deleteDoc(doc(db, nombreColeccion, id));
  },
};

export default FirebaseAPI;
