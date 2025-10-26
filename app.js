// app.js (ESM)
import { DB } from './db.js';

/** 外部リンクボタン（ここを書き換えるだけでOK） */
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
  } catch {
    // フォールバック
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

/** PWA(standalone)でも外部ブラウザで開く傾向にさせる */
function openExternal(url) {
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
  renderLinks();

  // 起動時に保存済みを反映
  const saved = await DB.getText();
  $('#inputText').value = saved || '';
  renderSaved(saved);

  // 入力のたびに自動保存 & 表示へ反映
  $('#inputText').addEventListener('input', async (e) => {
    const v = e.target.value;
    await DB.setText(v);
    renderSaved(v);
  });

  // コピー（現在の入力）
  $('#copyNowBtn').addEventListener('click', () => {
    copyText($('#inputText').value);
  });

  // コピー（保存表示）
  $('#copySavedBtn').addEventListener('click', () => {
    copyText($('#savedText').textContent);
  });
  $('#savedText').addEventListener('click', () => {
    copyText($('#savedText').textContent);
  });
}

document.addEventListener('DOMContentLoaded', main);
