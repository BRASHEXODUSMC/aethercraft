const PLAYER_API = {
  // Static-first mode works from VS Code Live Server without PHP.
  mode: 'static',
  staticProfileBase: 'https://mc-api.io/profile/',
  staticUuidBase: 'https://mc-api.io/uuid/',
  playerDbBase: 'https://playerdb.co/api/player/minecraft/',
  proxyPath: 'php/profile-proxy.php?name='
};

function cleanUuid(value = '') {
  return String(value).replace(/-/g, '').trim();
}

function formatUuid(value = '') {
  const uuid = cleanUuid(value);
  return uuid.length === 32
    ? uuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')
    : uuid;
}

function normalizeProfile(data, requestedName) {
  const source = data?.data?.player || data?.data || data?.player || data?.profile || data || {};
  const meta = source.meta || data?.data?.player?.meta || {};
  const uuid = cleanUuid(
    source.uuid || source.id || source.uniqueId || source.unique_id ||
    meta.uuid || meta.id || data?.uuid || data?.id
  );
  const name = source.name || source.username || source.playerName || meta.name || requestedName;

  if (!uuid || uuid.length !== 32) {
    throw new Error('The API did not return a valid Java UUID');
  }

  return {
    id: uuid,
    name,
    raw: data
  };
}

async function fetchJson(url) {
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store'
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Profile service returned an unreadable response (${response.status})`);
  }

  if (!response.ok || data?.success === false || data?.error) {
    const message = data?.message || data?.error?.message || data?.error;
    throw new Error(response.status === 404 ? 'Player not found' : (message || `Lookup failed (${response.status})`));
  }
  return data;
}

async function requestStaticProfile(name) {
  // First request the complete profile. If its response format changes or is
  // temporarily incomplete, use the UUID endpoint as a second static request.
  try {
    const profile = await fetchJson(`${PLAYER_API.staticProfileBase}${encodeURIComponent(name)}/java`);
    return normalizeProfile(profile, name);
  } catch (profileError) {
    const uuidData = await fetchJson(`${PLAYER_API.staticUuidBase}${encodeURIComponent(name)}/java`);
    try {
      return normalizeProfile(uuidData, name);
    } catch {
      throw profileError;
    }
  }
}

async function requestPlayerDb(name) {
  const data = await fetchJson(PLAYER_API.playerDbBase + encodeURIComponent(name));
  return normalizeProfile(data, name);
}

async function requestProxy(name) {
  const data = await fetchJson(PLAYER_API.proxyPath + encodeURIComponent(name));
  return normalizeProfile(data, name);
}

async function requestProfile(name) {
  const providers = PLAYER_API.mode === 'proxy'
    ? [requestProxy]
    : PLAYER_API.mode === 'playerdb'
      ? [requestPlayerDb, requestStaticProfile, requestProxy]
      : [requestStaticProfile, requestPlayerDb, requestProxy];

  let lastError;
  for (const provider of providers) {
    try {
      return await provider(name);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Player lookup failed');
}

function installImageFallback(image, fallbackUrls = []) {
  if (!image) return;

  let fallbackIndex = 0;
  image.addEventListener('error', () => {
    if (fallbackIndex >= fallbackUrls.length) {
      image.alt = 'Minecraft player image unavailable';
      return;
    }

    image.src = fallbackUrls[fallbackIndex];
    fallbackIndex += 1;
  });
}

async function copyPlayerUuid(uuid) {
  try {
    await navigator.clipboard.writeText(uuid);
    toast('UUID copied');
  } catch {
    const input = document.createElement('textarea');
    input.value = uuid;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
    toast('UUID copied');
  }
}


async function fetchSkinBlob(url) {
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'image/png,image/*;q=0.9,*/*;q=0.5' },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Skin service returned ${response.status}`);
  }

  const blob = await response.blob();
  if (!blob.type.startsWith('image/') || blob.size < 100) {
    throw new Error('Skin service did not return a valid image');
  }
  return blob;
}

async function downloadPlayerSkin(name, uuid, button) {
  const cleanName = String(name || 'minecraft-player').replace(/[^A-Za-z0-9_-]/g, '') || 'minecraft-player';
  const cleanId = cleanUuid(uuid);
  const encodedName = encodeURIComponent(name);
  const encodedUuid = encodeURIComponent(cleanId);
  const originalText = button?.textContent || 'Download skin';

  const sources = [
    `https://mc-heads.net/skin/${encodedUuid}`,
    `https://crafatar.com/skins/${encodedUuid}`,
    `https://minotar.net/skin/${encodedName}`,
    `https://api.mcheads.org/skin/${encodedUuid}`
  ];

  if (button) {
    button.disabled = true;
    button.textContent = 'Preparing PNG...';
  }

  let lastError = null;
  for (const source of sources) {
    try {
      const blob = await fetchSkinBlob(source);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${cleanName}-minecraft-skin.png`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
      toast('Skin download started');
      if (button) {
        button.disabled = false;
        button.textContent = originalText;
      }
      return;
    } catch (error) {
      lastError = error;
    }
  }

  // Some image providers allow display/navigation but block browser fetch with
  // CORS. Opening the raw UUID skin is therefore the safest final static-site
  // fallback; the user can save the PNG from the browser tab.
  window.open(`https://mc-heads.net/skin/${encodedUuid}`, '_blank', 'noopener');
  toast('Direct download was blocked; opened the raw skin instead');
  if (button) {
    button.disabled = false;
    button.textContent = originalText;
  }
  console.warn('All automatic skin download providers failed', lastError);
}

async function lookupPlayer(event) {
  event.preventDefault();
  const name = $('#playerName').value.trim();

  if (!/^[A-Za-z0-9_]{1,16}$/.test(name)) {
    toast('Enter a valid Java username');
    return;
  }

  $('#playerResult').innerHTML = '<div class="card">Searching free Minecraft profile services...</div>';

  try {
    const profile = await requestProfile(name);
    const uuid = profile.id;
    const formatted = formatUuid(uuid);
    const safeName = escapeHtml(profile.name);
    const encodedName = encodeURIComponent(profile.name);
    const encodedUuid = encodeURIComponent(uuid);

    $('#playerResult').innerHTML = `
      <div class="card player-profile-card" style="display:grid;grid-template-columns:minmax(120px,180px) 1fr;gap:24px;align-items:center">
        <div style="display:grid;place-items:center;gap:12px">
          <img
            id="locatedPlayerBody"
            src="https://api.mcheads.org/player/${encodedUuid}/256"
            alt="${safeName} Minecraft skin"
            style="width:min(100%,160px);max-height:260px;object-fit:contain;image-rendering:pixelated;filter:drop-shadow(0 12px 24px rgba(80,255,110,.22))"
          />
          <div style="display:grid;place-items:center;gap:7px">
            <img
              id="locatedPlayerHead"
              src="https://api.mcheads.org/head/${encodedUuid}/96"
              alt="${safeName} Minecraft head"
              style="width:88px;height:88px;object-fit:contain;image-rendering:pixelated;border-radius:8px;filter:drop-shadow(0 8px 16px rgba(80,255,110,.28))"
            />
            <small class="muted">Player head</small>
          </div>
        </div>
        <div>
          <span class="tag green">Java Player</span>
          <h2>${safeName}</h2>
          <p class="muted">Minecraft UUID</p>
          <code>${formatted}</code>
          <p class="muted" style="margin-top:16px">Loaded with a browser-friendly static API. No PHP or Node.js is required while using VS Code Live Server.</p>
          <div class="toolbar">
            <button id="copyLocatedUuid" class="btn primary" type="button">Copy UUID</button>
            <button id="downloadLocatedSkin" class="btn ghost" type="button">Download skin</button>
            <a class="btn ghost" href="https://mc-heads.net/skin/${encodedUuid}" target="_blank" rel="noopener">Open raw skin</a>
          </div>
        </div>
      </div>`;

    const bodyImage = $('#locatedPlayerBody');
    const headImage = $('#locatedPlayerHead');

    installImageFallback(bodyImage, [
      `https://mc-heads.net/player/${encodedUuid}/256`,
      `https://mc-heads.net/body/${encodedUuid}/right`,
      'https://mc-heads.net/player/MHF_Steve/256'
    ]);

    installImageFallback(headImage, [
      `https://mc-heads.net/head/${encodedUuid}/96`,
      `https://mc-heads.net/avatar/${encodedUuid}/96`,
      'https://mc-heads.net/avatar/MHF_Steve/96'
    ]);

    $('#copyLocatedUuid').addEventListener('click', () => copyPlayerUuid(formatted));
    $('#downloadLocatedSkin').addEventListener('click', (event) => {
      downloadPlayerSkin(profile.name, uuid, event.currentTarget);
    });
  } catch (error) {
    $('#playerResult').innerHTML = `
      <div class="notice">
        <strong>Lookup failed:</strong> ${escapeHtml(error.message)}.
        Check that the name belongs to a Minecraft Java Edition profile. If all free services are temporarily unavailable, the included PHP proxy remains available as a fallback.
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  $('#playerLookup').onsubmit = lookupPlayer;
});
