// ============================================================
// ARATECH Ecosystem
// Data Adapter
// ============================================================

import FirebaseAPI from "../firebase/firebase-api.js";

const DataAdapter = {
  async getAll(collection) {
    return await FirebaseAPI.getAll(collection);
  },

  async save(collection, data) {
    return await FirebaseAPI.save(collection, data.id, data);
  },

  async update(collection, id, data) {
    return await FirebaseAPI.update(collection, id, data);
  },

  async delete(collection, id) {
    return await FirebaseAPI.delete(collection, id);
  },
};

export default DataAdapter;
