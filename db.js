// db.js (ESM)
/**
 * シンプルかつ高速にするため localStorage を使用。
 * 端末内に半永久的に保持され、オフラインでも利用可能。
 * 必要になれば IndexedDB 実装に差し替え可能なインターフェースにしています。
 */

const KEY = 'savedText';

export const DB = {
  async getText() {
    try {
      return localStorage.getItem(KEY) ?? '';
    } catch (e) {
      return '';
    }
  },
  async setText(value) {
    try {
      localStorage.setItem(KEY, value ?? '');
      return true;
    } catch (e) {
      return false;
    }
  }
};
