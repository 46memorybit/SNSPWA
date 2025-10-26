// app.js (ESM)

import { DB } from './db.js';

/**
 * 外部リンクボタンの定義
 * タイトルとURLはここを書き換えるだけで更新できます。
 */
export const LINKS = [
  { title: 'X',      url: 'https://46memorybit.github.io/SNSPWA/X/index.html' },
  { title: '歌ネット', url: 'https://www.uta-net.com/song/382246/' },
  { title: 'USEN',   url: 'https://usen.oshireq.com/song/6299592' },
];

const $ = (sel) => document.querySelector(sel);

function showToast(msg, ms = 1400) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), ms);
}

async function copyText(text) {
  try {
    if (!text) {
      showToast('コピーするテキストがありません');
      return;
    }
    await navigator.clipboard.writeText(text);
    showToast('コピーしました');
  } catch (e) {
    // 失敗時はフォールバック
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(ok ? 'コピーしました' : 'コピーに失敗しました');
  }
}

/** スタンドアロンPWAでも外部ブラウザで開く */
function openExternal(url) {
  // iOSスタンドアロン回避のため _blank を利用（ネイティブアプリ起動を避けやすい）
  window.open(url, '_blank', 'noopener,noreferrer');
}

function renderLinks() {
  const grid = $('#linkGrid');
  grid.innerHTML = '';
  LINKS.forEach(link => {
    const a = document.createElement('a');
    a.className = 'linkBtn';
    a.href = '#';
    a.textContent = link.title;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      openExternal(link.url);
    });
    grid.appendChild(a);
  });
}

function renderSaved(text) {
  $('#savedText').textContent = text || '';
}

async function main() {
  // 初期描画
  renderLinks();

  // 保存済みテキスト読み込み
  const saved = await DB.getText();
  renderSaved(saved);
  $('#inputText').value = saved || '';

  // 入力リアルタイム保存（入力毎）
  $('#inputText').addEventListener('input', async (e) => {
    await DB.setText(e.target.value);
    renderSaved(e.target.value);
  });

  // 手動保存ボタン
  $('#saveBtn').addEventListener('click', async () => {
    const v = $('#inputText').value;
    await DB.setText(v);
    renderSaved(v);
    showToast('保存しました');
  });

  // その場コピー
  $('#copyNowBtn').addEventListener('click', () => {
    copyText($('#inputText').value);
  });

  // 保存テキストをコピー
  $('#copySavedBtn').addEventListener('click', () => {
    copyText($('#savedText').textContent);
  });

  // 保存済み表示自体もタップでコピー
  $('#savedText').addEventListener('click', () => {
    copyText($('#savedText').textContent);
  });
}

document.addEventListener('DOMContentLoaded', main);
