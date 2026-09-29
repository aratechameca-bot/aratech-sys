const { onCall } = require("firebase-functions/v2/https");

const { db } = require("../lib/firestore");
const { ok } = require("../lib/responses");
const ERR = require("../lib/errors");
const LOG = require("../lib/logger");
const AUTH = require("../lib/auth");
const COLLECTIONS = require("../lib/collections");

exports.getAll = onCall(async (request) => {
  try {
    AUTH.user(request);

    const collection = request.data.collection;

    if (!collection) {
      ERR.invalid("COLLECTION_REQUIRED");
    }

    COLLECTIONS.validate(collection);

    const snap = await db.collection(collection).get();

    const data = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return ok({
      data,
    });
  } catch (e) {
    LOG.error("getAll", {
      error: e.message,
      collection: request.data?.collection,
    });

    throw e;
  }
});

exports.save = onCall(async (request) => {
  try {
    AUTH.user(request);

    const { collection, data } = request.data;

    if (!collection) {
      ERR.invalid("COLLECTION_REQUIRED");
    }

    COLLECTIONS.validate(collection);

    if (!data || typeof data !== "object") {
      ERR.invalid("DATA_REQUIRED");
    }

    const id = data.id || db.collection(collection).doc().id;

    await db
      .collection(collection)
      .doc(id)
      .set({
        ...data,
        id,
      });

    return ok({
      id,
    });
  } catch (e) {
    LOG.error("save", {
      error: e.message,
      collection: request.data?.collection,
    });

    throw e;
  }
});

exports.update = onCall(async (request) => {
  try {
    AUTH.user(request);

    const { collection, id, data } = request.data;

    if (!collection) {
      ERR.invalid("COLLECTION_REQUIRED");
    }

    COLLECTIONS.validate(collection);

    if (!id) {
      ERR.invalid("ID_REQUIRED");
    }

    if (!data || typeof data !== "object") {
      ERR.invalid("DATA_REQUIRED");
    }

    await db.collection(collection).doc(id).update(data);

    return ok({
      id,
    });
  } catch (e) {
    LOG.error("update", {
      error: e.message,
      collection: request.data?.collection,
      id: request.data?.id,
    });

    throw e;
  }
});

exports.remove = onCall(async (request) => {
  try {
    AUTH.user(request);

    const { collection, id } = request.data;

    if (!collection) {
      ERR.invalid("COLLECTION_REQUIRED");
    }

    COLLECTIONS.validate(collection);

    if (!id) {
      ERR.invalid("ID_REQUIRED");
    }

    await db.collection(collection).doc(id).delete();

    return ok();
  } catch (e) {
    LOG.error("remove", {
      error: e.message,
      collection: request.data?.collection,
      id: request.data?.id,
    });

    throw e;
  }
});
