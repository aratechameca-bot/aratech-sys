// ============================================================
// ARATECH Ecosystem
// Firebase Authentication
// ============================================================

import { app } from "./firebase-config.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();

export { signInWithPopup, signOut, onAuthStateChanged };
