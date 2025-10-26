/* =========================
   設定（ここを編集）
   ========================= */
const QUICK_LINKS = [
  { title: 'X',       url: 'https://46memorybit.github.io/SNSPWA/X/index.html' },
  { title: '歌ネット', url: 'https://www.uta-net.com/song/382246/' },
  { title: 'USEN',    url: 'https://usen.oshireq.com/song/6299592' },
];

/* =========================
   メイン処理
   ========================= */
(async () => {
  const memoEl   = document.getElementById('memo');
  const copyBtn  = document.getElementById('copyBtn');
  const toastEl  = document.getElementById('toast');
  const saveHint = document.getElementById('saveHint');
  const linksEl  = document.getElementById('links');

  // 既存保存値のロード
  const SAVED_KEY = 'memo:text';
  try {
    const saved = await db.get(SAVED_KEY);
    if (typeof saved === 'string') memoEl.value = saved;
  } catch (e) { console.warn('load failed', e); }

  // 自動保存（入力のたびに保存：小さめのデバウンス）
  let t;
  memoEl.addEventListener('input', () => {
    saveHint.textContent = '保存中…';
    clearTimeout(t);
    t = setTimeout(async () => {
      try {
        await db.set(SAVED_KEY, memoEl.value);
        saveHint.textContent = '保存しました（自動）';
      } catch (e) {
        saveHint.textContent = '保存に失敗しました';
        console.error(e);
      }
    }, 250);
  });

  // コピー
  copyBtn.addEventListener('click', async () => {
    const text = memoEl.value ?? '';
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // フォールバック
        memoEl.select();
        document.execCommand('copy');
        memoEl.setSelectionRange(memoEl.value.length, memoEl.value.length);
      }
      showToast('コピーしました');
    } catch (e) {
      showToast('コピーに失敗しました');
      console.error(e);
    }
  });

  // リンクボタン描画（app.js の QUICK_LINKS を利用）
  linksEl.innerHTML = '';
  QUICK_LINKS.forEach(({ title, url }) => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = title;
    btn.addEventListener('click', () => {
      // PWA（standalone）でも外部はブラウザで開かれる想定
      // ここでは安全のため rel 付与
      window.open(url, '_blank', 'noopener,noreferrer');
    });
    linksEl.appendChild(btn);
  });

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.style.display = 'block';
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => (toastEl.style.display = 'none'), 1500);
  }
})();
