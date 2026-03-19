// ============================================
// AC Scoreboard — NUI Application
// ============================================

(function () {
  'use strict';

  // ---- State ----
  let config = {};
  let locales = {};
  let data = {};

  // ---- DOM refs ----
  const $ = (s) => document.querySelector(s);
  const overlay = $('#overlay');
  const scoreboard = $('#scoreboard');
  const headerTitle = $('#header-title');
  const headerPlayerCount = $('#header-player-count');
  const groupsSection = $('#groups-section');
  const groupsTitle = $('#groups-title');
  const groupsGrid = $('#groups-grid');
  const indicatorsSection = $('#indicators-section');
  const indicatorsList = $('#indicators-list');
  const playersSection = $('#players-section');
  const playersTitle = $('#players-title');
  const playersGrid = $('#players-grid');
  const footer = $('#footer');
  const footerServerIdBtn = $('#footer-server-id-btn');
  const footerServerIdText = $('#footer-server-id-text');

  // ---- NUI helpers ----
  function postNUI(event, data) {
    fetch('https://ac_scoreboard/' + event, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {}),
    }).catch(() => {});
  }

  // ---- Visibility ----
  function setVisible(visible) {
    if (visible) {
      overlay.classList.remove('hidden');
      scoreboard.classList.remove('hidden');
      // Force reflow for animation
      void scoreboard.offsetHeight;
      scoreboard.classList.add('visible');

} else {
      scoreboard.classList.remove('visible');
      overlay.classList.add('hidden');
      setTimeout(() => {
        scoreboard.classList.add('hidden');
      }, 280);
    }
  }

  // ---- Render groups ----
  function renderGroups() {
    if (!data.groups || data.groups.length === 0) {
      groupsSection.classList.add('hidden');
      return;
    }
    groupsSection.classList.remove('hidden');

    const cols = config.groupColumns || 1;
    groupsGrid.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';

    let html = '';
    for (let i = 0; i < data.groups.length; i++) {
      const g = data.groups[i];
      const isEmpty = g.count === 0;
      let cls = 'group-card';
      if (config.compactGroups) cls += ' compact';
      if (isEmpty) {
        cls += ' empty';
        if (config.highlightEmptyGroups) cls += ' highlight-empty';
      }

      const iconHtml = g.icon
        ? '<div class="group-icon"><span class="iconify" data-icon="' + escHtml(g.icon) + '" data-width="18"></span></div>'
        : '<div class="group-icon"><span class="iconify" data-icon="mdi:account-group" data-width="18"></span></div>';

      html +=
        '<div class="' + cls + '">' +
          iconHtml +
          '<div class="group-info"><span class="group-label">' + escHtml(g.label) + '</span></div>' +
          '<span class="group-count">' + g.count + '</span>' +
        '</div>';
    }
    groupsGrid.innerHTML = html;
    refreshIcons();
  }

  // ---- Render indicators ----
  function renderIndicators() {
    if (!data.statusIndicators || data.statusIndicators.length === 0) {
      indicatorsSection.classList.add('hidden');
      return;
    }
    indicatorsSection.classList.remove('hidden');

    let html = '';
    for (let i = 0; i < data.statusIndicators.length; i++) {
      const ind = data.statusIndicators[i];
      const dotClass = ind.state ? 'active' : 'inactive';

      const iconHtml = ind.icon
        ? '<span class="indicator-icon"><span class="iconify" data-icon="' + escHtml(ind.icon) + '" data-width="16"></span></span>'
        : '';

      html +=
        '<div class="indicator-row">' +
          '<span class="indicator-dot ' + dotClass + '"></span>' +
          iconHtml +
          '<span class="indicator-label">' + escHtml(ind.label) + '</span>' +
        '</div>';
    }
    indicatorsList.innerHTML = html;
    refreshIcons();
  }

  // ---- Render players ----
  function renderPlayers() {
    if (!data.players || data.players.length === 0) {
      playersSection.classList.add('hidden');
      return;
    }
    playersSection.classList.remove('hidden');

    const cols = config.playerColumns || 1;
    playersGrid.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';

    const uppercase = config.uppercaseNames || false;
    const anonLabel = locales.anonymous_player || 'Anonymous';

    let html = '';
    for (let i = 0; i < data.players.length; i++) {
      const p = data.players[i];
      const name = p.name || anonLabel;
      const displayName = uppercase ? name.toUpperCase() : name;
      const initial = name.charAt(0).toUpperCase();

      let cls = 'player-row';
      if (config.compactPlayers) cls += ' compact';

      html +=
        '<div class="' + cls + '">' +
          '<div class="player-avatar">' + escHtml(initial) + '</div>' +
          '<span class="player-name">' + escHtml(displayName) + '</span>' +
          (p.id != null ? '<span class="player-id">#' + p.id + '</span>' : '') +
        '</div>';
    }
    playersGrid.innerHTML = html;
  }

  // ---- Render footer ----
  function renderFooter() {
    if (!data.footer) {
      footer.classList.add('hidden');
      return;
    }
    footer.classList.remove('hidden');

    headerPlayerCount.textContent = data.footer.playerCount + '/' + data.footer.maxPlayers;

    if (data.footer.serverId != null) {
      footerServerIdText.textContent = 'ID: ' + data.footer.serverId;
      footerServerIdBtn.title = locales.copy_server_id || 'Copy your server ID';
    } else {
      footerServerIdText.textContent = 'ID: —';
    }
  }

  // ---- Apply config ----
  function applyConfig() {
    if (config.title) {
      headerTitle.textContent = config.title.text || 'Scoreboard';
    }
  }

  // ---- Apply locales ----
  function applyLocales() {
    groupsTitle.textContent = locales.groups || 'Groups';
    playersTitle.textContent = locales.players || 'Players';
  }

  // ---- Utilities ----
  function escHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function refreshIcons() {
    if (window.Iconify) {
      window.Iconify.scan();
    }
  }

  // ---- Copy server ID ----
  footerServerIdBtn.addEventListener('click', function () {
    postNUI('copyServerId');
    const copiedLabel = locales.server_id_copied || 'Copied!';
    const origText = footerServerIdText.textContent;
    footerServerIdText.textContent = copiedLabel;
    footerServerIdBtn.classList.add('copied');
    setTimeout(function () {
      footerServerIdText.textContent = origText;
      footerServerIdBtn.classList.remove('copied');
    }, 1500);
  });

  // ---- Close on overlay click ----
  overlay.addEventListener('click', function () {
    if (config.closeOnOutsideClick) {
      postNUI('close');
    }
  });

  // ---- Close on escape / backspace ----
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.key === 'Backspace') && config.closeOnEscape) {
      postNUI('close');
    }
  });

  // ---- NUI message handler ----
  window.addEventListener('message', function (event) {
    const msg = event.data;
    if (!msg || !msg.action) return;

    switch (msg.action) {
      case 'setVisible':
        setVisible(msg.data);
        break;

      case 'setData':
        data = msg.data || {};
        renderGroups();
        renderIndicators();
        renderPlayers();
        renderFooter();
        break;

      case 'setConfig':
        config = msg.data || {};
        applyConfig();
        break;

      case 'setLocales':
        locales = msg.data || {};
        applyLocales();
        break;
    }
  });

  // ---- Signal ready ----
  postNUI('ready');
})();
