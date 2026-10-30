(() => {
  const DATA_KEY = 'mountain-ops-dashboard-v1';
  const TITLE_KEY = 'mountain-ops-titles-v1';
  const ACCOUNT_KEY = 'mountain-ops-admin-v1';
  const SESSION_KEY = 'mountain-ops-session-v1';
  const cards = [
    {key:'safety', title:'Safety', hint:'Safety reminders, mountain conditions, or important alerts.', sample:'Add today’s safety reminders and any important mountain updates.'},
    {key:'general', title:'General Info', hint:'Important reminders, contacts, or shared notes.', sample:'Add the key details the team needs for today.'},
    {key:'quote', title:'Inspirational Quote', hint:'A short quote or message for the team.', sample:'“Great things are done by a series of small things brought together.”\n— Vincent van Gogh'},
    {key:'cv', title:'CV Daily Ops', hint:'Canyons Village operating notes and updates.', sample:'Add Canyons Village updates, staffing notes, or operational changes.'},
    {key:'mv', title:'MV Daily Ops', hint:'Mountain Village operating notes and updates.', sample:'Add Mountain Village updates, staffing notes, or operational changes.'},
    {key:'outlook', title:'12-Hour Outlook', hint:'The next 12 hours: weather, staffing, or operational impacts.', sample:'Add a short outlook for the next 12 hours.'}
  ];
  const defaults = Object.fromEntries(cards.map(card => [card.key, card.sample]));
  const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
  const getData = () => ({...defaults, ...(read(DATA_KEY) || {})});
  const getTitles = () => Object.fromEntries(cards.map(card => [card.key, (read(TITLE_KEY) || {})[card.key] || card.title]));
  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  function renderDashboard() {
    const data = getData();
    const titles = getTitles();
    document.querySelectorAll('[data-card]').forEach(card => { const heading = card.querySelector('h2'); if (heading) heading.textContent = titles[card.dataset.card]; });
    document.querySelectorAll('[data-content]').forEach(node => {
      const value = data[node.dataset.content] || '';
      node.innerHTML = value.trim() ? escapeHTML(value) : '<span class="empty-content">No update has been posted yet.</span>';
    });
    const today = new Intl.DateTimeFormat(undefined, {weekday:'long', month:'long', day:'numeric'}).format(new Date());
    const dateNode = document.getElementById('today-label');
    if (dateNode) dateNode.textContent = today;
  }

  async function digest(value) {
    const bytes = new TextEncoder().encode(value);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(hash)].map(n => n.toString(16).padStart(2,'0')).join('');
  }

  function renderEditor() {
    const host = document.getElementById('editor-fields');
    if (!host) return;
    const data = getData();
    const titles = getTitles();
    host.innerHTML = cards.map(card => `<section class="editor-field"><h3>${escapeHTML(titles[card.key])}</h3><label>Box heading<input name="title-${card.key}" value="${escapeHTML(titles[card.key])}" maxlength="60"></label><label>Information<textarea name="content-${card.key}" maxlength="1800">${escapeHTML(data[card.key] || '')}</textarea><small>${escapeHTML(card.hint)}</small></label></section>`).join('');
  }

  function setupAdmin() {
    const authPanel = document.getElementById('auth-panel');
    if (!authPanel) return;
    const authForm = document.getElementById('auth-form');
    const editorPanel = document.getElementById('editor-panel');
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');
    const confirmInput = document.getElementById('auth-confirm');
    const account = read(ACCOUNT_KEY);
    const isSetup = !account;
    if (!isSetup) {
      document.getElementById('auth-title').textContent = 'Sign in to edit';
      document.getElementById('auth-copy').textContent = 'Use the local admin account created in this browser.';
      document.getElementById('confirm-label').hidden = true;
      confirmInput.required = false;
      passwordInput.autocomplete = 'current-password';
      document.getElementById('auth-submit').textContent = 'Sign in';
    }
    const showEditor = () => {
      authPanel.hidden = true;
      editorPanel.hidden = false;
      renderEditor();
    };
    if (sessionStorage.getItem(SESSION_KEY) === '1') showEditor();
    authForm.addEventListener('submit', async event => {
      event.preventDefault();
      const username = usernameInput.value.trim();
      const password = passwordInput.value;
      const error = document.getElementById('auth-error');
      error.textContent = '';
      if (isSetup) {
        if (password !== confirmInput.value) { error.textContent = 'Those passwords do not match.'; return; }
        localStorage.setItem(ACCOUNT_KEY, JSON.stringify({username, passwordHash: await digest(password)}));
        sessionStorage.setItem(SESSION_KEY, '1');
        showEditor();
      } else {
        const savedAccount = read(ACCOUNT_KEY);
        if (username !== savedAccount.username || await digest(password) !== savedAccount.passwordHash) {
          error.textContent = 'That username or password is not correct.'; return;
        }
        sessionStorage.setItem(SESSION_KEY, '1');
        showEditor();
      }
      authForm.reset();
    });
    document.getElementById('sign-out').addEventListener('click', () => {
      sessionStorage.removeItem(SESSION_KEY);
      editorPanel.hidden = true;
      authPanel.hidden = false;
      authForm.reset();
    });
    document.getElementById('editor-form').addEventListener('submit', event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const data = {};
      const titles = {};
      for (const card of cards) {
        data[card.key] = String(form.get(`content-${card.key}`) || '').trim();
        const titleInput = event.currentTarget.elements[`title-${card.key}`];
        titles[card.key] = titleInput.value.trim() || card.title;
        const heading = document.querySelector(`[data-card="${card.key}"] h2`);
        if (heading) heading.textContent = titleInput.value.trim() || card.title;
      }
      localStorage.setItem(DATA_KEY, JSON.stringify(data));
      localStorage.setItem(TITLE_KEY, JSON.stringify(titles));
      const status = document.getElementById('save-status');
      status.textContent = `Saved in this browser at ${new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit'}).format(new Date())}.`;
    });
    document.getElementById('reset-demo').addEventListener('click', () => {
      if (!confirm('Replace the current box content with the sample text?')) return;
      localStorage.removeItem(DATA_KEY);
      localStorage.removeItem(TITLE_KEY);
      renderEditor();
      document.getElementById('save-status').textContent = 'Sample content restored in this browser.';
    });
  }
  renderDashboard();
  setupAdmin();
})();
