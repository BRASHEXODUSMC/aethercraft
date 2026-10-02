const defaults = [
  {
    id: 1,
    title: 'Welcome to the AetherCraft community!',
    body: 'Introduce yourself, share your favorite builds, and meet the community.',
    tags: ['Announcement', 'Community'],
    author: 'Admin',
    date: 'Today',
    replies: [{ author: 'SteveBuilder', body: 'The new website looks incredible! 😀', reaction: 4 }]
  },
  {
    id: 2,
    title: 'Survival season launch discussion',
    body: 'What are you building first when the new season starts?',
    tags: ['Survival', 'Discussion'],
    author: 'SkyMiner',
    date: 'Yesterday',
    replies: []
  },
  {
    id: 3,
    title: 'Showcase your best redstone machines',
    body: 'Post screenshots or video links to your coolest contraptions.',
    tags: ['Redstone', 'Showcase'],
    author: 'PixelFox',
    date: '2 days ago',
    replies: []
  }
];

const FORUM_CATEGORIES = {
  Community: { icon: '💬', title: 'Community & Introductions', description: 'Meet players, share server stories, and welcome new members.' },
  FAQ: { icon: '❓', title: 'FAQ & Server Help', description: 'Frequently asked questions, server rules, commands, and beginner help.' },
  Building: { icon: '🏗️', title: 'Building Techniques', description: 'Design tips, palettes, terraforming, interiors, and structural advice.' },
  Recipes: { icon: '📖', title: 'Crafting & Recipes', description: 'Crafting recipes, item guides, brewing, enchanting, and resource tips.' },
  Redstone: { icon: '⚙️', title: 'Redstone Engineering', description: 'Circuits, doors, machines, storage systems, and technical builds.' },
  Survival: { icon: '🗡️', title: 'Survival & Gameplay', description: 'Survival progress, exploration, combat, progression, and challenges.' },
  Farms: { icon: '🌾', title: 'Farms & Automation', description: 'Mob farms, crop farms, villagers, resource systems, and automation.' },
  Mods: { icon: '🧩', title: 'Mods, Plugins & Datapacks', description: 'Modpacks, server plugins, datapacks, compatibility, and configuration.' },
  Showcase: { icon: '🏆', title: 'Builds & Showcases', description: 'Show off bases, towns, redstone creations, maps, and community projects.' },
  Marketplace: { icon: '💎', title: 'Trading & Marketplace', description: 'Player shops, trades, services, auctions, and in-game economy.' },
  Support: { icon: '🛠️', title: 'Support & Bug Reports', description: 'Report problems, request assistance, and track technical issues.' },
  'Off Topic': { icon: '🌙', title: 'Off Topic', description: 'Relaxed community conversations outside regular Minecraft topics.' }
};

let activeCategory = 'All';

function inferTopicCategory(topic) {
  if (topic.category && FORUM_CATEGORIES[topic.category]) return topic.category;
  const text = `${topic.title || ''} ${(topic.tags || []).join(' ')}`.toLowerCase();
  const rules = [
    ['FAQ', ['faq','question','rules','command','beginner']],
    ['Building', ['build','building','architecture','palette','terraform','interior']],
    ['Recipes', ['recipe','craft','brewing','enchant','item']],
    ['Redstone', ['redstone','circuit','contraption','machine']],
    ['Farms', ['farm','automation','villager']],
    ['Mods', ['mod','plugin','datapack']],
    ['Showcase', ['showcase','creation','project']],
    ['Marketplace', ['trade','market','shop','auction']],
    ['Support', ['support','bug','issue','help']],
    ['Survival', ['survival','season','gameplay']]
  ];
  return rules.find(([, words]) => words.some(word => text.includes(word)))?.[0] || 'Community';
}

let topics = JSON.parse(localStorage.getItem('ac_topics') || 'null') || defaults;
topics = topics.map(topic => ({ ...topic, category: inferTopicCategory(topic), tags: Array.isArray(topic.tags) ? topic.tags : [], views:Number(topic.views||0), solved:Boolean(topic.solved), replies:Array.isArray(topic.replies)?topic.replies:[] }));
localStorage.setItem('ac_topics', JSON.stringify(topics));
let media = [];
let authNoticeAt = 0;
let activeTopicId = null;

const EMOJI_CATEGORIES = {
  Smileys: [
    '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚',
    '😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️',
    '😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓',
    '🤗','🤔','🫣','🤭','🫢','🫡','🤫','🫠','🤥','😶','🫥','😐','🫤','😑','🫨','😬','🙄','😯','😦','😧'
  ],
  Gestures: [
    '👍','👎','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','👇','☝️','🫵','👏','🙌','🫶',
    '👐','🤲','🤝','🙏','✍️','💪','🦾','🖐️','✋','🤚','👋','🫲','🫱','💅','🤳','👀','👁️','🧠','🫀','❤️','🧡',
    '💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','💕','💞','💓','💗','💖','💘','💝','💟','❣️','💌'
  ],
  Minecraft: [
    '⛏️','🪓','⚔️','🛡️','🏹','🧱','🪨','🪵','🌲','🌳','🌿','🍄','🌾','🥕','🥔','🍎','🍞','🥩','🐷','🐮',
    '🐔','🐑','🐺','🐱','🐴','🐝','🐸','🦊','🐼','🐢','🐟','🦑','🐙','🦇','🕷️','🦂','🐉','🔥','💧','❄️',
    '⚡','🌙','☀️','⭐','🌟','✨','💎','🪙','🔔','🧭','🗺️','🕯️','🏰','🏠','⛺','🚪','🪜','🛏️','🧰','⚙️',
    '🧨','💥','☠️','👻','🧟','🧙','🧌','🥚','🎃','🪣','🎣','🚣','🚂','🛤️','📦','🔒','🔑','📜','📖','🏆'
  ],
  Nature: [
    '🌱','🌵','🌴','🌺','🌸','🌼','🌻','🌹','🥀','🍀','☘️','🍁','🍂','🍃','🪴','🪻','🌷','🪷','🌊','🌈',
    '☁️','⛅','🌧️','⛈️','🌩️','🌨️','☃️','⛄','🌪️','🌋','🏔️','⛰️','🏕️','🏜️','🏝️','🏞️','🌅','🌄','🌌','🌠',
    '🐶','🐭','🐹','🐰','🦁','🐯','🐻','🐨','🐵','🦄','🦋','🐌','🐞','🪲','🐜','🦗','🪱','🐍','🦎','🦖'
  ],
  Food: [
    '🍏','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦',
    '🥬','🥒','🌶️','🫑','🌽','🫒','🧄','🧅','🥜','🫘','🌰','🫚','🫛','🍄','🥐','🥯','🥞','🧇','🧀','🍖',
    '🍗','🥓','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🫔','🥗','🥘','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🍤',
    '🍦','🍩','🍪','🎂','🍰','🧁','🍫','🍬','🍭','🍯','🥛','☕','🧃','🥤','🧋','🧊'
  ],
  Activities: [
    '⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳',
    '🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤸','⛹️','🤺',
    '🎮','🕹️','🎲','♟️','🧩','🎯','🎳','🎨','🎭','🎤','🎧','🎼','🎹','🥁','🎷','🎺','🎸','🪕','🎻','🎬',
    '📷','📹','💻','⌨️','🖱️','📱','⌚','🔊','📣','🎉','🎊','🎈','🎁','🏅','🥇','🥈','🥉'
  ],
  Symbols: [
    '✅','❌','❗','❓','‼️','⁉️','⭕','🟢','🟡','🔴','🔵','🟣','⚫','⚪','🟤','🔶','🔷','🔸','🔹','▪️',
    '▫️','◾','◽','⬛','⬜','▶️','⏩','⏭️','⏯️','◀️','⏪','⏮️','🔼','⏫','🔽','⏬','➡️','⬅️','⬆️','⬇️',
    '↗️','↘️','↙️','↖️','↕️','↔️','🔄','🔃','➕','➖','✖️','➗','♾️','💯','✔️','☑️','🔘','🔳','🔲','🏁',
    '🚩','🏳️','🏴','🔔','🔕','📢','💬','💭','🗯️','♨️','💢','💤','💫','🌀','🔰','⭐','🌟','✨','⚠️','🛑'
  ]
};

const EMOJIS_PER_PAGE = 40;
let emojiState = { category: 'Smileys', page: 0, query: '', target: null };

function forumUserProfile(name){return findCommunityUser(name)}
function forumAvatar(name,size=64){return minecraftAvatar(forumUserProfile(name),size)}
function profileLink(name,content,cls='forum-author-link'){return `<a class="${cls}" href="${profileUrl(name)}" data-transition>${content}</a>`}
function forumSignature(name){const p=profileDefaults(forumUserProfile(name));if(!p.signatureText&&!p.signatureImage)return '';return `<div class="forum-signature">${p.signatureText?`<p>${escapeHtml(p.signatureText)}</p>`:''}${p.signatureImage?`<img src="${p.signatureImage}" alt="${escapeHtml(name)} forum signature">`:''}</div>`}
function saveTopics() {
  localStorage.setItem('ac_topics', JSON.stringify(topics));
}

function renderCategoryGrid() {
  const grid = $('#forumCategoryGrid');
  if (!grid) return;
  const counts = topics.reduce((totals, topic) => {
    const category = inferTopicCategory(topic);
    totals[category] = (totals[category] || 0) + 1;
    return totals;
  }, {});

  grid.innerHTML = Object.entries(FORUM_CATEGORIES).map(([key, category]) => `
    <button class="forum-category-card ${activeCategory === key ? 'active' : ''}" type="button" data-forum-category="${escapeHtml(key)}">
      <span class="forum-category-icon">${category.icon}</span>
      <span class="forum-category-copy">
        <strong>${escapeHtml(category.title)}</strong>
        <small>${escapeHtml(category.description)}</small>
      </span>
      <span class="forum-category-count">${counts[key] || 0}<small>topics</small></span>
    </button>
  `).join('');

  $$('[data-forum-category]', grid).forEach(button => {
    button.addEventListener('click', () => setCategoryFilter(button.dataset.forumCategory));
  });
}

function setCategoryFilter(category = 'All') {
  activeCategory = category;
  const details = FORUM_CATEGORIES[category];
  const title = $('#forumListTitle');
  const clear = $('#clearCategoryFilter');
  if (title) title.textContent = details ? `${details.icon} ${details.title}` : 'All forum topics';
  clear?.classList.toggle('hidden', category === 'All');
  renderCategoryGrid();
  renderTopics();
  document.querySelector('#forumListTitle')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function renderTopics() {
  const query = ($('#forumSearch')?.value || '').toLowerCase().trim();
  const box = $('#topicList');
  if (!box) return;

  const visibleTopics = topics
    .filter(topic => activeCategory === 'All' || inferTopicCategory(topic) === activeCategory)
    .filter(topic => `${topic.title} ${topic.body} ${inferTopicCategory(topic)} ${(topic.tags || []).join(' ')}`.toLowerCase().includes(query))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  box.innerHTML = visibleTopics.length ? visibleTopics.map(topic => {
    const categoryKey = inferTopicCategory(topic);
    const category = FORUM_CATEGORIES[categoryKey] || FORUM_CATEGORIES.Community;
    return `
      <article class="topic ${topic.locked ? 'locked' : ''}" data-id="${topic.id}" tabindex="0" role="button" aria-label="Open ${escapeHtml(topic.title)}">
        <div class="avatar forum-head-avatar">${profileLink(topic.author,`<img src="${forumAvatar(topic.author,56)}" alt="${escapeHtml(topic.author)} Minecraft head" onerror="this.src='https://mc-heads.net/avatar/MHF_Steve/56'">`,'forum-avatar-link')}</div>
        <div>
          <div class="topic-category-line"><span class="forum-topic-category">${category.icon} ${escapeHtml(category.title)}</span></div>
          <h3>${topic.pinned ? '<span class="topic-pin">📌</span>' : ''}<a href="#" class="open-topic">${escapeHtml(topic.title)}</a>${topic.locked ? ' 🔒' : ''}</h3>
          <div>${(topic.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join(' ')}</div>
          <div class="topic-meta">by ${profileLink(topic.author,escapeHtml(topic.author))} · ${topic.date}</div>
        </div>
        <div class="topic-count"><strong>${topic.replies.length}</strong><span class="topic-meta">replies</span></div>
      </article>
    `;
  }).join('') : `
    <div class="card forum-empty-state">
      <span>🧱</span>
      <h3>No topics found</h3>
      <p class="muted">Try another search or create the first topic in this category.</p>
    </div>
  `;

  $$('.topic').forEach(card => {
    const open = () => openTopic(Number(card.dataset.id));
    card.addEventListener('click', event => {
      if (!event.target.closest('button,input,a')) open();
      else if (event.target.closest('.open-topic')) {
        event.preventDefault();
        open();
      }
    });
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
  });
}
function openTopic(id) {
  const topic = topics.find(entry => entry.id === id);
  if (!topic) return;
  activeTopicId = id;

  $('#topicModalBody').innerHTML = `
    <div>
      <div class="topic-modal-category">${(FORUM_CATEGORIES[inferTopicCategory(topic)] || FORUM_CATEGORIES.Community).icon} ${escapeHtml((FORUM_CATEGORIES[inferTopicCategory(topic)] || FORUM_CATEGORIES.Community).title)}</div>
      <div>${(topic.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join(' ')}</div>
      <h2>${escapeHtml(topic.title)}</h2>
      <p class="muted">Posted by ${profileLink(topic.author,escapeHtml(topic.author))} · ${topic.date}</p>
      <div class="card">
        ${escapeHtml(topic.body).replace(/\n/g, '<br>')}
        ${(topic.media || []).length ? `<div class="forum-post-media">${(topic.media || []).map((src, imageIndex) => `
          <figure class="forum-post-image">
            <img src="${src}" alt="Forum attachment ${imageIndex + 1}">
            ${canManageTopicImages(topic) ? `<button class="forum-image-delete" type="button" onclick="removeTopicImage(${topic.id}, ${imageIndex})" aria-label="Delete uploaded image ${imageIndex + 1}">×</button>` : ''}
          </figure>
        `).join('')}</div>` : ''}
        ${topic.video ? `<p><a class="btn ghost" target="_blank" rel="noopener" href="${escapeHtml(topic.video)}">Open attached video</a></p>` : ''}
        ${forumSignature(topic.author)}
      </div>
      <h3>Replies</h3>
      <div>
        ${topic.replies.map((reply, index) => `
          <div class="card forum-reply-card">
            <div class="forum-reply-author"><img src="${forumAvatar(reply.author,42)}" alt="${escapeHtml(reply.author)} Minecraft head" onerror="this.src='https://mc-heads.net/avatar/MHF_Steve/42'">${profileLink(reply.author,`<strong>${escapeHtml(reply.author)}</strong>`)}</div>
            <p>${escapeHtml(reply.body)}</p>
            ${forumSignature(reply.author)}
            <button class="reaction" type="button" onclick="react(${id},${index})">❤️ ${reply.reaction || 0}</button>
          </div>
        `).join('') || '<p class="muted">No replies yet.</p>'}
      </div>
      ${topic.locked ? '<div class="notice">This topic is locked by an administrator.</div>' : `
        <div class="field forum-reply-field">
          <div class="reply-label-row">
            <label for="replyBody">Reply</label>
            <button id="openEmojiBrowser" class="btn ghost emoji-browser-button" type="button" aria-haspopup="dialog">😀 Browse emojis</button>
          </div>
          <textarea id="replyBody" class="textarea" placeholder="Write a reply..."></textarea>
        </div>
        <div class="reply-actions">
          <button class="btn primary" type="button" onclick="replyTopic(${id})">Post reply</button>
        </div>
      `}
    </div>
  `;

  $('#topicModal').classList.remove('hidden');
  const reply = $('#replyBody');
  reply?.addEventListener('focus', announceForumAuth);
  reply?.addEventListener('input', announceForumAuth);
  $('#openEmojiBrowser')?.addEventListener('click', () => openEmojiBrowser(reply));
}

function getForumUser() {
  return JSON.parse(localStorage.getItem('ac_user') || 'null');
}

function forumAuthNotice() {
  const user = getForumUser();
  toast(
    user ? `Logged in as ${user.username}` : 'You are not logged in — log in or create an account to post.',
    'auth',
    4200
  );
  return user;
}

function requireForumUser() {
  const user = getForumUser();
  if (!user) {
    toast('You are not logged in — log in or create an account to post.', 'auth', 4200);
    return null;
  }
  return user;
}

function announceForumAuth() {
  // Only warn guests. Logged-in members should not see a redundant
  // 'Logged in as ...' toast while opening or typing in the composer.
  if (getForumUser()) return;
  const now = Date.now();
  if (now - authNoticeAt < 1800) return;
  authNoticeAt = now;
  toast('You are not logged in — log in or create an account to post.', 'auth', 4200);
}

function canManageTopicImages(topic) {
  const user = getForumUser();
  if (!user) return false;
  return String(user.username).toLowerCase() === String(topic.author).toLowerCase() || String(user.role || '').toLowerCase() === 'admin';
}

function removeTopicImage(topicId, imageIndex) {
  const topic = topics.find(entry => entry.id === topicId);
  if (!topic || !canManageTopicImages(topic)) {
    toast('You cannot delete this image.', 'auth', 3200);
    return;
  }
  topic.media = (topic.media || []).filter((_, index) => index !== imageIndex);
  saveTopics();
  openTopic(topicId);
  toast('Forum image deleted.', 'copy', 3000);
}

function react(id, index) {
  const user = requireForumUser();
  if (!user) return;
  const topic = topics.find(entry => entry.id === id);
  topic.replies[index].reaction = (topic.replies[index].reaction || 0) + 1;
  saveTopics();
  openTopic(id);
}

function replyTopic(id) {
  const user = requireForumUser();
  if (!user) return;
  const topic = topics.find(entry => entry.id === id);
  if (topic.locked) return toast('This topic is locked');
  const body = $('#replyBody').value.trim();
  if (!body) return toast('Write a reply first');
  topic.replies.push({ author: user.username, authorId:user.id, body, reaction: 0, createdAt:new Date().toISOString() });
  saveTopics();
  openTopic(id);
  renderTopics();
  toast('Reply posted', 'copy', 3000);
}

function allEmojisForState() {
  const query = emojiState.query.trim().toLowerCase();
  const source = query
    ? Object.values(EMOJI_CATEGORIES).flat()
    : EMOJI_CATEGORIES[emojiState.category] || [];

  if (!query) return source;
  // Emoji glyphs do not have searchable text labels in this offline version,
  // so search supports category names and exact pasted emoji glyphs.
  const categoryMatches = Object.entries(EMOJI_CATEGORIES)
    .filter(([name]) => name.toLowerCase().includes(query))
    .flatMap(([, values]) => values);
  const glyphMatches = source.filter(emoji => emoji.includes(emojiState.query));
  return [...new Set([...categoryMatches, ...glyphMatches])];
}

function ensureEmojiBrowser() {
  let browser = $('#emojiBrowser');
  if (browser) return browser;

  browser = document.createElement('div');
  browser.id = 'emojiBrowser';
  browser.className = 'emoji-browser hidden';
  browser.setAttribute('role', 'dialog');
  browser.setAttribute('aria-modal', 'true');
  browser.setAttribute('aria-label', 'Emoji browser');
  browser.innerHTML = `
    <div class="emoji-browser-panel">
      <header class="emoji-browser-header">
        <div>
          <span class="kicker">FORUM REACTIONS</span>
          <h3>Choose an emoji</h3>
        </div>
        <button id="closeEmojiBrowser" class="emoji-browser-close" type="button" aria-label="Close emoji browser">×</button>
      </header>
      <div class="emoji-search-row">
        <input id="emojiSearch" class="input" type="search" placeholder="Search category or paste an emoji..." autocomplete="off">
      </div>
      <div id="emojiCategoryTabs" class="emoji-category-tabs"></div>
      <div class="emoji-compose-live"><span>Reply preview</span><div id="emojiReplyPreview" aria-live="polite">Your reply will appear here as you add emojis.</div></div><div id="emojiGrid" class="emoji-grid" aria-live="polite"></div>
      <footer class="emoji-browser-footer">
        <button id="emojiPrev" class="btn ghost" type="button">← Previous</button>
        <span id="emojiPageLabel" class="muted"></span>
        <button id="emojiNext" class="btn ghost" type="button">Next →</button>
      </footer>
    </div>
  `;
  document.body.appendChild(browser);

  $('#closeEmojiBrowser').addEventListener('click', closeEmojiBrowser);
  browser.addEventListener('click', event => {
    if (event.target === browser) closeEmojiBrowser();
  });
  $('#emojiSearch').addEventListener('input', event => {
    emojiState.query = event.target.value;
    emojiState.page = 0;
    renderEmojiBrowser();
  });
  $('#emojiPrev').addEventListener('click', () => {
    emojiState.page = Math.max(0, emojiState.page - 1);
    renderEmojiBrowser();
  });
  $('#emojiNext').addEventListener('click', () => {
    emojiState.page += 1;
    renderEmojiBrowser();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !browser.classList.contains('hidden')) closeEmojiBrowser();
  });
  return browser;
}

function openEmojiBrowser(target) {
  if (!target) return;
  emojiState.target = target;
  emojiState.page = 0;
  emojiState.query = '';
  const browser = ensureEmojiBrowser();
  $('#emojiSearch').value = '';
  browser.classList.remove('hidden');
  document.body.classList.add('emoji-browser-open'); target.scrollIntoView({behavior:'smooth',block:'center'}); updateEmojiReplyPreview();
  renderEmojiBrowser();
  setTimeout(() => $('#emojiSearch')?.focus(), 80);
}

function closeEmojiBrowser() {
  const browser = $('#emojiBrowser');
  if (!browser) return;
  browser.classList.add('hidden');
  document.body.classList.remove('emoji-browser-open');
  emojiState.target?.focus();
}

function updateEmojiReplyPreview(){const preview=$('#emojiReplyPreview'),field=emojiState.target;if(preview)preview.textContent=field?.value||'Your reply will appear here as you add emojis.'}

function insertEmoji(emoji) {
  const field = emojiState.target;
  if (!field) return;
  const start = field.selectionStart ?? field.value.length;
  const end = field.selectionEnd ?? start;
  const before = field.value.slice(0, start);
  const after = field.value.slice(end);
  field.value = `${before}${emoji}${after}`;
  const cursorPosition = start + emoji.length;
  field.setSelectionRange(cursorPosition, cursorPosition);
  field.dispatchEvent(new Event('input', { bubbles: true }));updateEmojiReplyPreview();
  field.focus();
}

function renderEmojiBrowser() {
  const categories = Object.keys(EMOJI_CATEGORIES);
  $('#emojiCategoryTabs').innerHTML = categories.map(category => `
    <button class="emoji-category-tab ${category === emojiState.category && !emojiState.query ? 'active' : ''}" type="button" data-category="${category}">${category}</button>
  `).join('');
  $$('.emoji-category-tab').forEach(button => {
    button.addEventListener('click', () => {
      emojiState.category = button.dataset.category;
      emojiState.query = '';
      emojiState.page = 0;
      $('#emojiSearch').value = '';
      renderEmojiBrowser();
    });
  });

  const emojis = allEmojisForState();
  const pages = Math.max(1, Math.ceil(emojis.length / EMOJIS_PER_PAGE));
  emojiState.page = Math.min(emojiState.page, pages - 1);
  const start = emojiState.page * EMOJIS_PER_PAGE;
  const visible = emojis.slice(start, start + EMOJIS_PER_PAGE);

  $('#emojiGrid').innerHTML = visible.length
    ? visible.map(emoji => `<button class="emoji-choice" type="button" data-emoji="${emoji}" aria-label="Insert ${emoji}">${emoji}</button>`).join('')
    : '<div class="emoji-empty">No emojis match that search.</div>';

  $$('.emoji-choice').forEach(button => {
    button.addEventListener('click', () => insertEmoji(button.dataset.emoji));
  });

  $('#emojiPageLabel').textContent = `Page ${emojiState.page + 1} of ${pages} · ${emojis.length} emojis`;
  $('#emojiPrev').disabled = emojiState.page === 0;
  $('#emojiNext').disabled = emojiState.page >= pages - 1;
}

function setupComposer() {
  const dropzone = $('#dropzone');
  const input = $('#imageInput');
  if (!dropzone) return;

  $$('#composer input,#composer textarea,#composer select').forEach(element => {
    element.addEventListener('focus', announceForumAuth);
    element.addEventListener('input', announceForumAuth);
  });

  dropzone.onclick = () => input.click();
  ['dragenter', 'dragover'].forEach(eventName => dropzone.addEventListener(eventName, event => {
    event.preventDefault();
    dropzone.classList.add('drag');
  }));
  ['dragleave', 'drop'].forEach(eventName => dropzone.addEventListener(eventName, event => {
    event.preventDefault();
    dropzone.classList.remove('drag');
  }));
  dropzone.addEventListener('drop', event => readFiles(event.dataTransfer.files));
  input.onchange = event => readFiles(event.target.files);

  function renderUploadPreviews() {
    const previews = $('#previews');
    if (!previews) return;
    const count = $('#uploadCount'); if (count) count.textContent = `${media.length} / 4 selected`;
    previews.innerHTML = media.map((src, index) => `
      <figure class="forum-upload-preview">
        <img src="${src}" alt="Selected forum attachment ${index + 1}">
        <button class="forum-upload-remove" type="button" data-remove-upload="${index}" aria-label="Remove selected image ${index + 1}">×</button>
      </figure>
    `).join('');
    $$('[data-remove-upload]', previews).forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        media.splice(Number(button.dataset.removeUpload), 1);
        renderUploadPreviews();
        input.value = '';
        toast('Selected image removed.', 'copy', 2400);
      });
    });
  }

  function resizeForumImage(file, maxWidth = 1280, maxHeight = 900, quality = 0.84) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const image = new Image();
        image.onerror = reject;
        image.onload = () => {
          const scale = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
          const width = Math.max(1, Math.round(image.naturalWidth * scale));
          const height = Math.max(1, Math.round(image.naturalHeight * scale));
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext('2d');
          context.drawImage(image, 0, 0, width, height);
          const outputType = file.type === 'image/png' && file.size < 850000 ? 'image/png' : 'image/jpeg';
          resolve(canvas.toDataURL(outputType, outputType === 'image/jpeg' ? quality : undefined));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function readFiles(files) {
    const room = Math.max(0, 4 - media.length);
    const selected = [...files].filter(file => file.type.startsWith('image/')).slice(0, room);
    if (!selected.length) {
      if (room === 0) toast('You can upload up to four images per topic.', 'auth', 3200);
      return;
    }
    for (const file of selected) {
      try {
        media.push(await resizeForumImage(file));
        renderUploadPreviews();
      } catch {
        toast(`Could not process ${file.name}.`, 'auth', 3200);
      }
    }
    input.value = '';
  }

  $('#newTopicForm').onsubmit = event => {
    event.preventDefault();
    const user = requireForumUser();
    if (!user) return;
    const formData = new FormData(event.target);
    const tags = [...$$('input[name=tags]:checked')].map(item => item.value);
    topics.unshift({
      id: Date.now(),
      title: formData.get('title'),
      body: formData.get('body'),
      video: formData.get('video'),
      category: FORUM_CATEGORIES[formData.get('category')] ? formData.get('category') : 'Community',
      tags: tags.length ? tags : ['General'],
      author: user.username,
      authorId:user.id,
      createdAt:new Date().toISOString(),
      date: 'Just now',
      replies: [],
      media
    });
    saveTopics();
    media = [];
    event.target.reset();
    $('#previews').innerHTML = '';
    closeComposerModal();
    renderTopics();
    toast('Forum post created.', 'copy', 3600);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  renderCategoryGrid();
  renderTopics();
  setupComposer();
  const requestedTopic=Number(new URLSearchParams(location.search).get('topic'));if(requestedTopic)setTimeout(()=>openTopic(requestedTopic),80);
  $('#forumSearch')?.addEventListener('input', renderTopics);
  $('#clearCategoryFilter')?.addEventListener('click', () => setCategoryFilter('All'));
  $$('[data-category-shortcut]').forEach(button => button.addEventListener('click', () => setCategoryFilter(button.dataset.categoryShortcut)));
  $('#newTopicBtn')?.addEventListener('click', () => {
    if (!getForumUser()) { announceForumAuth(); return; }
    openComposerModal();
  });
  $('#closeComposer')?.addEventListener('click', closeComposerModal);
  $('#composerModal')?.addEventListener('click', event => { if (event.target.id === 'composerModal') closeComposerModal(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !$('#composerModal')?.classList.contains('hidden')) closeComposerModal(); });
  $('#closeTopic')?.addEventListener('click', () => {
    $('#topicModal').classList.add('hidden');
    closeEmojiBrowser();
  });
});


/* v2.3 Professional Forum Update */
function forumSettings(){try{return JSON.parse(localStorage.getItem('ac_site_settings')||'{}')}catch{return {}}}
function hotReplyThreshold(){return Math.max(2,Number(forumSettings().hotTopicReplies||5))}
function openComposerModal(category){
  const modal=$('#composerModal'); if(!modal)return;
  if(category&&FORUM_CATEGORIES[category]) $('#topicCategory').value=category;
  modal.classList.remove('hidden'); document.body.classList.add('modal-open');
  requestAnimationFrame(()=>modal.classList.add('visible'));
  setTimeout(()=>$('#newTopicForm input[name="title"]')?.focus(),120);
}
function closeComposerModal(){const modal=$('#composerModal');if(!modal)return;modal.classList.remove('visible');document.body.classList.remove('modal-open');setTimeout(()=>modal.classList.add('hidden'),180)}
function profileStatsForForum(name){const key=String(name||'').toLowerCase();let posts=0,replies=0,reactions=0;topics.forEach(t=>{if(String(t.author).toLowerCase()===key)posts++;(t.replies||[]).forEach(r=>{if(String(r.author).toLowerCase()===key){replies++;reactions+=Number(r.reaction||0)}})});return{posts,replies,reactions,total:posts+replies}}
function reputationLevel(reactions){const n=Number(reactions||0);if(n>=100)return{label:'Legendary',level:5};if(n>=50)return{label:'Trusted',level:4};if(n>=20)return{label:'Respected',level:3};if(n>=5)return{label:'Known',level:2};return{label:'Newcomer',level:1}}
function rankInfo(name){const u=forumUserProfile(name)||{};const role=String(u.role||'Member');const settings=forumSettings();const colors=settings.rankColors||{};const map={Administrator:{label:'Admin',icon:'👑',color:colors.Administrator||'#ff5b64'},Moderator:{label:'Moderator',icon:'🛡️',color:colors.Moderator||'#58b9ff'},Founder:{label:'Founder',icon:'◆',color:colors.Founder||'#ffd45c'},Builder:{label:'Builder',icon:'🧱',color:colors.Builder||'#f0a45d'},Veteran:{label:'Veteran',icon:'⚔️',color:colors.Veteran||'#b98cff'},Donator:{label:'Donator',icon:'💎',color:colors.Donator||'#48e7c2'},Member:{label:'Member',icon:'🌿',color:colors.Member||'#78d64b'}};return map[role]||map.Member}
function userBadges(name){const u=forumUserProfile(name)||{},stats=profileStatsForForum(name),badges=[];const role=String(u.role||'Member');if(['Founder','Administrator','Moderator','Builder','Veteran','Donator'].includes(role))badges.push(role);if(stats.posts>=10)badges.push('Contributor');if(stats.reactions>=25)badges.push('Popular');if(u.minecraft?.uuid||u.minecraft?.username)badges.push('Minecraft Linked');return badges.slice(0,4)}
function isUserOnline(name){try{const seen=JSON.parse(localStorage.getItem('ac_online_users')||'{}');return Date.now()-Number(seen[String(name).toLowerCase()]||0)<5*60*1000}catch{return false}}
function touchOnlineStatus(){const u=getForumUser();if(!u)return;let seen={};try{seen=JSON.parse(localStorage.getItem('ac_online_users')||'{}')}catch{}seen[String(u.username).toLowerCase()]=Date.now();localStorage.setItem('ac_online_users',JSON.stringify(seen))}
function authorMarkup(name,size=56){const rank=rankInfo(name),stats=profileStatsForForum(name),rep=reputationLevel(stats.reactions),online=isUserOnline(name);return `<span class="forum-author-wrap" data-profile-hover="${escapeHtml(name)}"><a class="forum-avatar-link" href="${profileUrl(name)}" data-transition><span class="online-dot ${online?'online':''}"></span><img src="${forumAvatar(name,size)}" alt="${escapeHtml(name)} Minecraft head" onerror="this.src='https://mc-heads.net/avatar/MHF_Steve/${size}'"></a><span class="forum-author-copy"><a class="forum-author-name" style="--rank-color:${rank.color}" href="${profileUrl(name)}" data-transition>${escapeHtml(name)}</a><span class="mini-rank" style="--rank-color:${rank.color}">${rank.icon} ${rank.label}</span><span class="mini-reputation">⭐ ${rep.label}</span></span></span>`}
function topicBadges(topic){const out=[];if(topic.pinned)out.push('<span class="topic-status pinned">📌 Pinned</span>');if(topic.solved)out.push('<span class="topic-status solved">✓ Solved</span>');if((topic.replies||[]).length>=hotReplyThreshold())out.push('<span class="topic-status hot">🔥 Hot</span>');if(topic.locked)out.push('<span class="topic-status locked">🔒 Locked</span>');return out.join('')}
function canMarkSolved(topic){const u=getForumUser();if(!u)return false;return String(u.username).toLowerCase()===String(topic.author).toLowerCase()||String(u.role||'').toLowerCase()==='administrator'}
function toggleSolved(id){const t=topics.find(x=>x.id===id);if(!t||!canMarkSolved(t))return toast('Only the topic author or an administrator can change solved status.','auth',3500);t.solved=!t.solved;saveTopics();openTopic(id);renderTopics();toast(t.solved?'Topic marked solved.':'Solved status removed.','copy',3000)}

function renderTopics(){
 const query=($('#forumSearch')?.value||'').toLowerCase().trim(),box=$('#topicList');if(!box)return;
 const visible=topics.filter(t=>activeCategory==='All'||inferTopicCategory(t)===activeCategory).filter(t=>`${t.title} ${t.body} ${inferTopicCategory(t)} ${(t.tags||[]).join(' ')}`.toLowerCase().includes(query)).sort((a,b)=>Number(Boolean(b.pinned))-Number(Boolean(a.pinned))||Number(b.id)-Number(a.id));
 box.innerHTML=visible.length?visible.map(topic=>{const c=FORUM_CATEGORIES[inferTopicCategory(topic)]||FORUM_CATEGORIES.Community;return `<article class="topic pro-topic ${topic.locked?'locked':''}" data-id="${topic.id}" tabindex="0" role="button"><div class="topic-author-cell">${authorMarkup(topic.author,56)}</div><div class="topic-main"><div class="topic-category-line"><span class="forum-topic-category">${c.icon} ${escapeHtml(c.title)}</span>${topicBadges(topic)}</div><h3><a href="#" class="open-topic">${escapeHtml(topic.title)}</a></h3><div class="topic-tags">${(topic.tags||[]).map(tag=>`<span class="tag">${escapeHtml(tag)}</span>`).join(' ')}</div><div class="topic-meta">Started by ${profileLink(topic.author,escapeHtml(topic.author))} · ${escapeHtml(topic.date||'Recent')}</div></div><div class="topic-metrics"><div><strong>${(topic.replies||[]).length}</strong><span>Replies</span></div><div><strong>${Number(topic.views||0)}</strong><span>Views</span></div></div></article>`}).join(''):`<div class="card forum-empty-state"><span>🧱</span><h3>No topics found</h3><p class="muted">Try another search or create the first topic in this category.</p></div>`;
 $$('.topic',box).forEach(card=>{const open=()=>openTopic(Number(card.dataset.id));card.addEventListener('click',e=>{if(e.target.closest('[data-profile-hover],a[href*="profile.html"]'))return;if(e.target.closest('.open-topic'))e.preventDefault();open()});card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}})});setupProfileHoverCards();
}
function openTopic(id){
 const topic=topics.find(e=>e.id===id);if(!topic)return;activeTopicId=id;topic.views=Number(topic.views||0)+1;saveTopics();const c=FORUM_CATEGORIES[inferTopicCategory(topic)]||FORUM_CATEGORIES.Community;
 $('#topicModalBody').innerHTML=`<div class="pro-topic-view"><div class="topic-modal-category">${c.icon} ${escapeHtml(c.title)}</div><div class="topic-view-badges">${topicBadges(topic)}</div><h2>${escapeHtml(topic.title)}</h2><div class="topic-view-author">${authorMarkup(topic.author,52)}<span class="topic-view-stats">👀 ${topic.views} views · 💬 ${(topic.replies||[]).length} replies</span></div><article class="card forum-original-post">${escapeHtml(topic.body).replace(/\n/g,'<br>')}${(topic.media||[]).length?`<div class="forum-post-media">${topic.media.map((src,i)=>`<figure class="forum-post-image"><img src="${src}" alt="Forum attachment ${i+1}">${canManageTopicImages(topic)?`<button class="forum-image-delete" type="button" onclick="removeTopicImage(${topic.id},${i})">×</button>`:''}</figure>`).join('')}</div>`:''}${topic.video?`<p><a class="btn ghost" target="_blank" rel="noopener" href="${escapeHtml(topic.video)}">Open attached video</a></p>`:''}${forumSignature(topic.author)}</article><div class="topic-owner-actions">${canMarkSolved(topic)&&['FAQ','Support'].includes(inferTopicCategory(topic))?`<button class="btn ${topic.solved?'ghost':'primary'}" type="button" onclick="toggleSolved(${id})">${topic.solved?'Reopen topic':'✓ Mark solved'}</button>`:''}</div><h3>Replies</h3><div class="forum-replies">${(topic.replies||[]).map((r,i)=>`<div class="card forum-reply-card"><div class="forum-reply-author">${authorMarkup(r.author,42)}</div><p>${escapeHtml(r.body)}</p>${forumSignature(r.author)}<button class="reaction" type="button" onclick="react(${id},${i})">❤️ ${r.reaction||0}</button></div>`).join('')||'<p class="muted">No replies yet.</p>'}</div>${topic.locked?'<div class="notice">This topic is locked by an administrator.</div>':`<div class="field forum-reply-field"><div class="reply-label-row"><label for="replyBody">Reply</label><button id="openEmojiBrowser" class="btn ghost emoji-browser-button" type="button">😀 Browse emojis</button></div><textarea id="replyBody" class="textarea" placeholder="Write a reply..."></textarea></div><div class="reply-actions"><button class="btn primary" type="button" onclick="replyTopic(${id})">Post reply</button></div>`}</div>`;
 $('#topicModal').classList.remove('hidden');renderTopics();const reply=$('#replyBody');reply?.addEventListener('focus',announceForumAuth);reply?.addEventListener('input',announceForumAuth);$('#openEmojiBrowser')?.addEventListener('click',()=>openEmojiBrowser(reply));setupProfileHoverCards();
}
function setupProfileHoverCards(){
 let card=$('#forumProfileHover');
 if(!card){
   card=document.createElement('aside');
   card.id='forumProfileHover';
   card.className='forum-profile-hover hidden';
   document.body.appendChild(card);
 }
 const controller=window.__aetherProfileHover||(window.__aetherProfileHover={card,hideTimer:null,activeSource:null,activeName:'',bound:false});
 controller.card=card;
 const cancelHide=()=>{if(controller.hideTimer){clearTimeout(controller.hideTimer);controller.hideTimer=null}};
 const hideCard=(delay=500)=>{cancelHide();controller.hideTimer=setTimeout(()=>{card.classList.add('hidden');controller.activeSource=null;controller.activeName=''},delay)};
 const showCard=(el)=>{
   if(!el||!document.documentElement.contains(el))return;
   cancelHide();controller.activeSource=el;
   const name=el.dataset.profileHover;if(!name)return;
   controller.activeName=name;
   const u=forumUserProfile(name)||{},p=profileDefaults(u),stats=profileStatsForForum(name),rank=rankInfo(name),rep=reputationLevel(stats.reactions),badges=userBadges(name);
   card.innerHTML=`<div class="hover-profile-head"><img src="${forumAvatar(name,72)}" alt="${escapeHtml(name)} Minecraft head" onerror="this.src='https://mc-heads.net/avatar/MHF_Steve/72'"><div><strong style="--rank-color:${rank.color}">${escapeHtml(name)}</strong><span>${rank.icon} ${rank.label}</span><small>${isUserOnline(name)?'🟢 Online now':'⚫ Offline'}</small></div></div><p>${escapeHtml(p.bio||'Minecraft community member.')}</p><div class="hover-profile-stats"><span><b>${stats.posts}</b> topics</span><span><b>${stats.replies}</b> replies</span><span><b>${stats.reactions}</b> reactions</span></div><div class="hover-badges">${badges.map(b=>`<span>${escapeHtml(b)}</span>`).join('')}</div><a class="btn primary" href="${profileUrl(name)}" data-transition>View profile</a>`;
   const r=el.getBoundingClientRect(),cardWidth=310,estimatedHeight=Math.min(360,innerHeight-24);
   const left=Math.min(innerWidth-cardWidth-12,Math.max(12,r.left));
   let top=r.bottom+2;if(top+estimatedHeight>innerHeight-12)top=Math.max(12,r.top-estimatedHeight-2);
   card.style.left=left+'px';card.style.top=top+'px';card.classList.remove('hidden');
 };
 if(!controller.bound){
   controller.bound=true;
   document.addEventListener('pointerover',event=>{const el=event.target.closest?.('[data-profile-hover]');if(el)showCard(el)});
   document.addEventListener('pointerout',event=>{const el=event.target.closest?.('[data-profile-hover]');if(!el)return;const next=event.relatedTarget;if(next&&(el.contains(next)||card.contains(next)))return;hideCard(600)});
   document.addEventListener('focusin',event=>{const el=event.target.closest?.('[data-profile-hover]');if(el)showCard(el)});
   document.addEventListener('focusout',event=>{const el=event.target.closest?.('[data-profile-hover]');if(el&&!el.contains(event.relatedTarget)&&!card.contains(event.relatedTarget))hideCard(450)});
   card.addEventListener('pointerenter',cancelHide);
   card.addEventListener('pointerleave',event=>{if(controller.activeSource?.contains(event.relatedTarget))return;hideCard(500)});
   card.addEventListener('focusin',cancelHide);
   card.addEventListener('focusout',event=>{if(!card.contains(event.relatedTarget)&&!controller.activeSource?.contains(event.relatedTarget))hideCard(350)});
   card.addEventListener('click',event=>event.stopPropagation());
   addEventListener('scroll',()=>{if(!card.classList.contains('hidden')&&controller.activeSource)showCard(controller.activeSource)},{passive:true});
   addEventListener('resize',()=>hideCard(0));
 }
}
document.addEventListener('DOMContentLoaded',()=>{const composerModal=$('#composerModal');if(composerModal&&composerModal.parentElement!==document.body)document.body.appendChild(composerModal);touchOnlineStatus();setInterval(touchOnlineStatus,60000);setupProfileHoverCards();$$('[data-category-shortcut]').forEach(b=>b.addEventListener('dblclick',()=>openComposerModal(b.dataset.categoryShortcut)));const dz=$('#dropzone');dz?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#imageInput')?.click()}})});
