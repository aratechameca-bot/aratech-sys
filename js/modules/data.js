// ============================================================
// DATA ENGINE
// ============================================================

window.DATA = {
  getEngine(collection) {
    return window.SCHEMA[collection]?.engine || window.ENGINE.FIREBASE;
  },
  async getAll(collection) {
    switch (this.getEngine(collection)) {
      case window.ENGINE.FIREBASE:
        return await window.DRIVERS.firebase.getAll(collection);

      default:
        return DB.get(collection);
    }
  },

  async get(collection, id) {
    switch (this.getEngine(collection)) {
      case window.ENGINE.FIREBASE:
        return await window.DRIVERS.firebase.get(collection, id);

      default:
        return DB.get(collection).find((r) => r.id === id);
    }
  },

  // ============================================================
  // DOCUMENTO ÚNICO
  // ============================================================

  async getDoc(collection, id) {
    switch (this.getEngine(collection)) {
      case window.ENGINE.FIREBASE: {
        const doc = await window.DRIVERS.firebase.get(collection, id);

        if (doc) {
          DB.sobj(collection, doc);
        }

        return doc;
      }

      default:
        return DB.obj(collection);
    }
  },

  // ============================================================
  // FOLIADOR
  // ============================================================

  async nextFolio(prefix, minimo = 0) {
    switch (this.getEngine("folios")) {
      case window.ENGINE.FIREBASE:
        return await window.DRIVERS.firebase.nextFolio(prefix, minimo);

      default:
        return folioLocal(prefix);
    }
  },

  async saveDoc(collection, id, data) {
    switch (this.getEngine(collection)) {
      case window.ENGINE.FIREBASE:
        await window.DRIVERS.firebase.update(collection, id, data);

        DB.sobj(collection, data);

        return;
    }
  },

  // ============================================================
  // ELIMINAR TODOS LOS DOCUMENTOS DE UNA COLECCIÓN
  // ============================================================

  async clearCollection(collection) {
    switch (this.getEngine(collection)) {
      case window.ENGINE.FIREBASE:
        const docs = await this.getAll(collection);

        for (const doc of docs) {
          const id = doc.id || doc.email || doc.folio;

          if (!id) continue;

          await window.DRIVERS.firebase.delete(collection, id);
        }

        DB.set(collection, []);

        return;

      default:
        DB.set(collection, []);

        return;
    }
  },

  async save(collection, id, data) {
    switch (this.getEngine(collection)) {
      case window.ENGINE.FIREBASE:
        await window.DRIVERS.firebase.save(collection, id, data);

        DB.set(collection, [
          ...DB.get(collection).filter((r) => r.id !== id),
          data,
        ]);

        return;
    }
  },

  async update(collection, id, data) {
    switch (this.getEngine(collection)) {
      case window.ENGINE.FIREBASE:
        await window.DRIVERS.firebase.update(collection, id, data);

        const list = DB.get(collection);

        const i = list.findIndex((r) => r.id === id);

        if (i >= 0) {
          list[i] = {
            ...list[i],
            ...data,
          };

          DB.set(collection, list);
        }

        return;
    }
  },

  async delete(collection, id) {
    switch (this.getEngine(collection)) {
      case window.ENGINE.FIREBASE:
        await window.DRIVERS.firebase.delete(collection, id);

        DB.set(
          collection,
          DB.get(collection).filter((r) => r.id !== id),
        );

        return;
    }
  },
};
