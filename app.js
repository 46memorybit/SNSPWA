// app.js
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const toast = (msg) => {
  const t = $('#toast');
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { t.style.display = 'none'; }, 1400);
};

function renderQuickLinks() {
  const defaults = [
    { title: 'X(短縮)', url: 'https://46memorybit.github.io/SNSPWA/X/index.html' },
    { title: '歌ネット', url: 'https://www.uta-net.com/song/382246/' },
    { title: 'USEN', url: 'https://usen.oshireq.com/song/6299592' },
    { title: 'YouTube', url: 'https://www.youtube.com/' },
  ];
  const grid = $('#quickLinks');
  grid.innerHTML = '';
  [...defaults].forEach((d) => {
    const btn = document.createElement('button');
    btn.className = 'link-btn';
    btn.type = 'button';
    btn.textContent = d.title;
    btn.addEventListener('click', () => openURL(d.url));
    grid.appendChild(btn);
  });
}

function openURL(url) {
  // PWAとしては同タブ遷移が自然。外部ブラウザで開きたい場合は _blank に変更。
  location.href = url;
}

async function renderLinkList() {
  const list = $('#linkList');
  const links = await window.DB.getLinks();
  list.innerHTML = '';
  for (const link of links) {
    // 一覧カード
    const card = document.createElement('div');
    card.className = 'item';
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `<strong>${escapeHTML(link.title)}</strong><br>${escapeHTML(link.url)}`;
    const actions = document.createElement('div');
    actions.className = 'actions';

    const previewBtn = document.createElement('button');
    previewBtn.className = 'del';
    previewBtn.textContent = '開く';
    previewBtn.addEventListener('click', () => openURL(link.url));

    const delBtn = document.createElement('button');
    delBtn.className = 'del';
    delBtn.textContent = '削除';
    delBtn.addEventListener('click', async () => {
      if (confirm(`削除しますか？\n${link.title}\n${link.url}`)) {
        await window.DB.deleteLink(link.id);
        await renderLinkList();
        renderRegisteredButtons(); // グリッド側も更新
        toast('削除しました');
      }
    });

    actions.appendChild(previewBtn);
    actions.appendChild(delBtn);
    card.appendChild(meta);
    card.appendChild(actions);
    list.appendChild(card);
  }
}

async function renderRegisteredButtons() {
  // 既定ボタンの後ろに連結表示したい場合：quickLinks に追加
  const grid = $('#quickLinks');
  // まず既定を再描画
  renderQuickLinks();
  // その後にDB分を追記
  const links = await window.DB.getLinks();
  for (const link of links) {
    const btn = document.createElement('button');
    btn.className = 'link-btn';
    btn.type = 'button';
    btn.textContent = link.title;
    btn.addEventListener('click', () => openURL(link.url));
    grid.appendChild(btn);
  }
}

function escapeHTML(s) {
  return s.replace(/[&<>"']/g, (c) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

async function onAdd() {
  const title = $('#titleInput').value.trim();
  const url = $('#urlInput').value.trim();
  if (!title) return toast('タイトルを入力してください');
  if (!url || !/^https?:\/\/.+/i.test(url)) return toast('URLは https:// から入力してください');

  await window.DB.addLink(title, url);
  $('#titleInput').value = '';
  $('#urlInput').value = '';
  await renderLinkList();
  await renderRegisteredButtons();
  toast('追加しました');
}

async function copyInput() {
  const txt = $('#inputText').value;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(txt);
    } else {
      // フォールバック（iOS対応）
      const ta = document.createElement('textarea');
      ta.value = txt;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    $('#copySub').textContent = 'コピーしました';
    toast('コピーしました');
  } catch (e) {
    $('#copySub').textContent = 'コピー失敗';
    toast('コピーできませんでした');
  } finally {
    setTimeout(() => { $('#copySub').textContent = '未コピー'; }, 1200);
  }
}

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  renderQuickLinks();
  await renderRegisteredButtons();
  await renderLinkList();

  $('#copyBtn').addEventListener('click', copyInput);
  $('#addBtn').addEventListener('click', onAdd);

  // Enter で追加（URL入力中）
  $('#urlInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); onAdd(); }
  });

  registerSW();
});
