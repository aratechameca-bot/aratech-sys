// ============================================================
// ARATECH Ecosystem
// Firebase Cloud Functions Client
// ============================================================

import { app } from "./firebase-config.js";

import {
  getFunctions,
  httpsCallable,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-functions.js";

const functions = getFunctions(app, "us-east1");

export async function callFunction(name, data = {}) {
  const fn = httpsCallable(functions, name);

  const result = await fn(data);

  return result.data;
}
