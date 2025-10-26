// db.js (ESM)
// 単一テキストを localStorage に保存（超軽量・即時）
const KEY = 'savedText';

export const DB = {
  async getText() {
    try {
      return localStorage.getItem(KEY) ?? '';
    } catch {
      return '';
    }
  },
  async setText(value) {
    try {
      localStorage.setItem(KEY, value ?? '');
      return true;
    } catch {
      return false;
    }
  }
};
