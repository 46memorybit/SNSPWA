/**
 * 超軽量 Key-Value ストア
 * - まず IndexedDB を使用
 * - 使えなければ localStorage にフォールバック
 */
const db = (() => {
  const DB_NAME = 'simple-kv';
  const STORE   = 'kv';
  let idb;

  function openIDB() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return resolve(null);
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => resolve(null); // フォールバック許可
    });
  }

  async function ensure() {
    if (idb !== undefined) return idb;
    idb = await openIDB();
    return idb;
  }

  return {
    async get(key) {
      const dbi = await ensure();
      if (!dbi) {
        try { return JSON.parse(localStorage.getItem(key)); } catch { return localStorage.getItem(key); }
      }
      return new Promise((resolve, reject) => {
        const tx = dbi.transaction(STORE, 'readonly');
        const st = tx.objectStore(STORE);
        const req = st.get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror   = () => resolve(null);
      });
    },
    async set(key, value) {
      const dbi = await ensure();
      const val = typeof value === 'string' ? value : JSON.stringify(value);
      if (!dbi) {
        localStorage.setItem(key, val);
        return;
      }
      return new Promise((resolve, reject) => {
        const tx = dbi.transaction(STORE, 'readwrite');
        const st = tx.objectStore(STORE);
        const req = st.put(val, key);
        req.onsuccess = () => resolve();
        req.onerror   = (e) => reject(e);
      });
    },
    async del(key) {
      const dbi = await ensure();
      if (!dbi) {
        localStorage.removeItem(key);
        return;
      }
      return new Promise((resolve, reject) => {
        const tx = dbi.transaction(STORE, 'readwrite');
        const st = tx.objectStore(STORE);
        const req = st.delete(key);
        req.onsuccess = () => resolve();
        req.onerror   = (e) => reject(e);
      });
    }
  };
})();
