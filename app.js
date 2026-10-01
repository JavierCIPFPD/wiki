(function () {
  'use strict';

  const elements = {
    article: document.getElementById('article'),
    breadcrumb: document.getElementById('breadcrumb'),
    description: document.getElementById('site-description'),
    list: document.getElementById('page-list'),
    count: document.getElementById('page-count'),
    search: document.getElementById('page-search'),
    searchHint: document.getElementById('search-hint'),
    status: document.getElementById('sync-status'),
    siteName: document.getElementById('site-name'),
    brand: document.querySelector('.brand'),
    previous: document.getElementById('previous-page'),
    next: document.getElementById('next-page'),
    mobileIndex: document.getElementById('mobile-index-button'),
    sidebar: document.getElementById('sidebar')
  };

  const state = { config: {}, pages: [], activeFile: 'inicio.md', searchSequence: 0 };
  const markdown = window.markdownit({ html: false, linkify: true, typographer: true, breaks: false });
  markdown.core.ruler.after('inline', 'wiki_task_lists', function (tokensState) {
    tokensState.tokens.forEach(function (token, tokenIndex) {
      if (token.type !== 'inline' || !token.children) return;
      const task = token.children.find(function (child) {
        return child.type === 'text' && /^\[[ xX]\]\s+/.test(child.content);
      });
      if (!task) return;

      const checked = /^\[[xX]\]/.test(task.content);
      task.content = task.content.replace(/^\[[ xX]\]\s+/, '');
      const checkbox = new tokensState.Token('html_inline', '', 0);
      checkbox.content = '<input type="checkbox" disabled' + (checked ? ' checked' : '') + '> ';
      token.children.unshift(checkbox);

      let nestedItems = 0;
      for (let index = tokenIndex - 1; index >= 0; index -= 1) {
        const ancestor = tokensState.tokens[index];
        if (ancestor.type === 'list_item_close') nestedItems += 1;
        if (ancestor.type === 'list_item_open') {
          if (nestedItems === 0) {
            ancestor.attrJoin('class', 'task-list-item');
            break;
          }
          nestedItems -= 1;
        }
      }
    });
  });

  function setStatus(message, isError) {
    elements.status.textContent = message;
    elements.status.closest('.sidebar-footer').classList.toggle('is-error', Boolean(isError));
  }

  async function readConfig() {
    const response = await fetch('wiki.env', { cache: 'no-store' });
    if (!response.ok) throw new Error('No se pudo leer wiki.env (' + response.status + ').');
    const config = {};
    (await response.text()).split(/\r?\n/).forEach(function (line) {
      const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
      if (match) config[match[1]] = match[2].replace(/^(["'])(.*)\1$/, '$2');
    });
    return config;
  }

  function applyConfig(config) {
    const style = document.documentElement.style;
    const colorKeys = {
      ACCENT_COLOR: '--accent',
      HIGHLIGHT_COLOR: '--highlight',
      PAPER_COLOR: '--paper',
      INK_COLOR: '--ink',
      SIDEBAR_COLOR: '--sidebar'
    };

    Object.keys(colorKeys).forEach(function (key) {
      if (/^#[\da-fA-F]{6}$/.test(config[key] || '')) style.setProperty(colorKeys[key], config[key]);
    });

    const siteName = config.SITE_NAME || 'Moncalvillo';
    document.title = siteName + ' | Wiki';
    elements.siteName.textContent = siteName;
    elements.description.textContent = config.SITE_DESCRIPTION || 'Avances e ideas';
  }

  function getRepositorySettings(config) {
    const owner = config.GITHUB_OWNER || '';
    const repository = config.GITHUB_REPOSITORY || '';
    const branch = config.GITHUB_BRANCH || 'main';
    const directory = (config.CONTENT_DIRECTORY || 'hilos').replace(/^\/+|\/+$/g, '');

    if (!owner || !repository || owner.indexOf('tu-') === 0 || repository.indexOf('nombre-') === 0) {
      throw new Error('Configura GITHUB_OWNER y GITHUB_REPOSITORY en wiki.env.');
    }

    return {
      owner: owner,
      repository: repository,
      branch: branch,
      directory: directory,
      api: 'https://api.github.com/repos/' + encodeURIComponent(owner) + '/' + encodeURIComponent(repository) + '/contents/' + directory.split('/').map(encodeURIComponent).join('/') + '?ref=' + encodeURIComponent(branch),
      rawBase: 'https://raw.githubusercontent.com/' + encodeURIComponent(owner) + '/' + encodeURIComponent(repository) + '/' + encodeURIComponent(branch) + '/'
    };
  }

  function pageTitle(filename) {
    return filename.replace(/\.(md|markdown)$/i, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  async function listPages(repository) {
    const response = await fetch(repository.api, { cache: 'no-store', headers: { Accept: 'application/vnd.github+json' } });
    if (!response.ok) {
      if (response.status === 404) throw new Error('No se encontró la carpeta de páginas. Comprueba repositorio, rama y ruta.');
      if (response.status === 403) throw new Error('GitHub ha limitado temporalmente las consultas. Vuelve a cargar la página más tarde.');
      throw new Error('GitHub no pudo devolver la lista de páginas (' + response.status + ').');
    }

    const entries = await response.json();
    if (!Array.isArray(entries)) throw new Error('La ruta configurada no es una carpeta pública.');

    return entries.filter(function (entry) {
      return entry.type === 'file' && /\.(md|markdown)$/i.test(entry.name) && entry.name.toLowerCase() !== 'inicio.md' && entry.name.toLowerCase() !== 'inicio.markdown';
    }).map(function (entry) {
      return { name: entry.name, path: entry.path, title: pageTitle(entry.name), url: repository.rawBase + entry.path.split('/').map(encodeURIComponent).join('/') };
    }).sort(function (left, right) {
      return left.title.localeCompare(right.title, 'es', { sensitivity: 'base' });
    });
  }

  async function loadMarkdown(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error('No se pudo cargar el Markdown (' + response.status + ').');
    return response.text();  
  }

  function loadPageContent(page) {
    if (page.content) return Promise.resolve(page.content);
    if (!page.pendingContent) {
      page.pendingContent = loadMarkdown(page.url).then(function (content) {
        page.content = content;
        return content;
      }).finally(function () {
        page.pendingContent = null;
      });
    }
    return page.pendingContent;
  }

  function renderMarkdown(source) {
    const rendered = markdown.render(source);
    const safe = DOMPurify.sanitize(rendered, {
      USE_PROFILES: { html: true },
      ADD_TAGS: ['iframe', 'video', 'source', 'input'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'checked', 'disabled', 'frameborder', 'loading', 'referrerpolicy', 'sandbox', 'src', 'type', 'controls', 'playsinline', 'poster']
    });
    return addMediaPlayers(safe);
  }

  function youtubeId(url) {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1).split('/')[0];
    if (parsed.hostname === 'youtube.com' || parsed.hostname === 'www.youtube.com' || parsed.hostname === 'm.youtube.com') {
      if (parsed.pathname === '/watch') return parsed.searchParams.get('v');
      const match = parsed.pathname.match(/^\/(embed|shorts)\/([\w-]+)/);
      return match ? match[2] : null;
    }
    return null;
  }

  function videoFrame(source, title) {
    const frame = document.createElement('iframe');
    frame.src = source;
    frame.title = title;
    frame.loading = 'lazy';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    frame.sandbox = 'allow-scripts allow-same-origin allow-presentation';
    const wrapper = document.createElement('div');
    wrapper.className = 'video-frame';
    wrapper.appendChild(frame);
    return wrapper.outerHTML;
  }

  function internalPageName(href) {
    let value = href.trim();
    if (!value || value.charAt(0) === '#') return null;
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) {
      let linkedHost;
      try { linkedHost = new URL(value).hostname; } catch (error) { return null; }
      if (!/^[^./]+\.(?:md|markdown)$/i.test(linkedHost)) return null;
      value = linkedHost;
    }

    let path = value.split(/[?#]/, 1)[0].replace(/\\/g, '/');
    path = path.slice(path.lastIndexOf('/') + 1);
    let filename;
    try { filename = decodeURIComponent(path); } catch (error) { return null; }
    if (!/\.(?:md|markdown)$/i.test(filename)) return null;
    if (/^inicio\.(?:md|markdown)$/i.test(filename)) return 'inicio.md';

    const normalizedTitle = pageTitle(filename).toLocaleLowerCase('es');
    const page = state.pages.find(function (item) {
      return item.name.toLowerCase() === filename.toLowerCase() || pageTitle(item.name).toLocaleLowerCase('es') === normalizedTitle;
    });
    return page ? page.name : null;
  }

  function addMediaPlayers(html) {
    const holder = document.createElement('div');
    holder.innerHTML = html;
    holder.querySelectorAll('img[src]').forEach(function (image) {
      try {
        if (new URL(image.getAttribute('src'), window.location.href).protocol !== 'https:') image.remove();
      } catch (error) {
        image.remove();
      }
    });
    holder.querySelectorAll('a[href]').forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href) return;
      const filename = internalPageName(href);
      if (filename) {
        link.href = '#/' + encodeURIComponent(filename);
        return;
      }
      let parsed;
      try { parsed = new URL(href, window.location.href); } catch (error) { return; }
      if (parsed.protocol !== 'https:') return;

      const id = youtubeId(parsed.href);
      if (id && /^[\w-]{11}$/.test(id)) {
        link.replaceWith(document.createRange().createContextualFragment(videoFrame('https://www.youtube-nocookie.com/embed/' + id, 'Vídeo de YouTube')));
        return;
      }

      const vimeo = parsed.hostname === 'vimeo.com' || parsed.hostname === 'www.vimeo.com';
      const vimeoMatch = vimeo && parsed.pathname.match(/^\/(\d+)/);
      if (vimeoMatch) {
        link.replaceWith(document.createRange().createContextualFragment(videoFrame('https://player.vimeo.com/video/' + vimeoMatch[1], 'Vídeo de Vimeo')));
        return;
      }

      if (/\.(mp4|webm)$/i.test(parsed.pathname)) {
        const video = document.createElement('video');
        video.controls = true;
        video.preload = 'metadata';
        video.playsInline = true;
        video.src = parsed.href;
        const wrapper = document.createElement('div');
        wrapper.className = 'video-frame';
        wrapper.appendChild(video);
        link.replaceWith(wrapper);
      }
    });
    return holder.innerHTML;
  }

  function createPageLink(page, active) {
    const link = document.createElement('a');
    link.className = 'page-link' + (active ? ' is-active' : '');
    link.href = '#/' + encodeURIComponent(page.name);
    link.textContent = page.title;
    if (active) link.setAttribute('aria-current', 'page');
    return link;
  }

  function drawPageList(query) {
    const normalized = query.trim().toLocaleLowerCase('es');
    const results = normalized ? state.pages.filter(function (page) {
      return (page.title + ' ' + (page.content || '')).toLocaleLowerCase('es').includes(normalized);
    }) : state.pages;

    elements.list.replaceChildren();
    results.forEach(function (page) { elements.list.appendChild(createPageLink(page, page.name === state.activeFile)); });
    if (normalized && results.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-results';
      empty.textContent = 'No hay coincidencias.';
      elements.list.appendChild(empty);
    }
    elements.count.textContent = String(results.length);
    elements.searchHint.textContent = normalized ? (results.length === 1 ? '1 resultado' : results.length + ' resultados') : 'Busca títulos y contenido';
  }

  function currentPageIndex() {
    return state.pages.findIndex(function (page) { return page.name === state.activeFile; });
  }

  function updateNavigation() {
    const index = currentPageIndex();
    elements.previous.disabled = index <= 0;
    elements.next.disabled = index < 0 || index >= state.pages.length - 1;
  }

  function showError(message) {
    elements.article.setAttribute('aria-busy', 'false');
    elements.article.replaceChildren();
    const section = document.createElement('section');
    section.className = 'error-state';
    const title = document.createElement('h1');
    title.textContent = 'No se pudo cargar la wiki';
    const detail = document.createElement('p');
    detail.textContent = message;
    section.append(title, detail);
    elements.article.appendChild(section);
    setStatus('Revisa la configuración', true);
  }

  async function showArticle(filename) {
    const isHome = /^inicio\.(md|markdown)$/i.test(filename);
    const page = isHome ? null : state.pages.find(function (item) { return item.name === filename; });
    if (!isHome && !page) {
      window.location.hash = '#/inicio.md';
      return;
    }

    state.activeFile = isHome ? 'inicio.md' : page.name;
    elements.article.setAttribute('aria-busy', 'true');
    elements.breadcrumb.replaceChildren(document.createTextNode('Wiki '));
    const separator = document.createElement('span');
    separator.setAttribute('aria-hidden', 'true');
    separator.textContent = '/';
    elements.breadcrumb.append(separator, document.createTextNode(isHome ? 'Portada' : page.title));
    updateNavigation();
    drawPageList(elements.search.value);

    try {
      const source = isHome ? state.home : await loadPageContent(page);
      if (state.activeFile !== filename && !(isHome && state.activeFile === 'inicio.md')) return;
      if (page) page.content = source;
      elements.article.innerHTML = renderMarkdown(source);
      elements.article.setAttribute('aria-busy', 'false');
      enhanceArticle();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      elements.sidebar.classList.remove('is-open');
      elements.mobileIndex.setAttribute('aria-expanded', 'false');
      drawPageList(elements.search.value);
    } catch (error) {
      showError(error.message);
    }
  }

  function enhanceArticle() {
    elements.article.querySelectorAll('a[href]').forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      try {
        const url = new URL(href, window.location.href);
        if (url.protocol === 'https:' || url.protocol === 'http:') {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }
      } catch (error) { return; }
    });
    elements.article.querySelectorAll('pre code').forEach(function (code) {
      const pre = code.closest('pre');
      pre.tabIndex = 0;
      pre.setAttribute('aria-label', 'Bloque de código; desplázate horizontalmente para leerlo completo');
    });
  }

  function routeFromHash() {
    const encoded = window.location.hash.replace(/^#\/?/, '');
    if (!encoded) return 'inicio.md';
    try { return decodeURIComponent(encoded); } catch (error) { return 'inicio.md'; }
  }

  function navigateTo(offset) {
    const index = currentPageIndex();
    const page = state.pages[index + offset];
    if (page) window.location.hash = '#/' + encodeURIComponent(page.name);
  }

  async function init() {
    try {
      if (!window.markdownit || !window.DOMPurify) throw new Error('No se encontraron las librerías locales de Markdown y sanitización.');
      state.config = await readConfig();
      applyConfig(state.config);
      state.repository = getRepositorySettings(state.config);
      const homeUrl = state.repository.rawBase + state.repository.directory + '/inicio.md';
      const [home, pages] = await Promise.all([loadMarkdown(homeUrl), listPages(state.repository)]);
      state.pages = pages;
      state.pages.forEach(function (page) { page.content = ''; });
      state.home = home;
      drawPageList('');
      setStatus('Contenido actualizado desde GitHub', false);
      if (!window.location.hash) window.location.hash = '#/inicio.md';
      await showArticle(routeFromHash());
    } catch (error) {
      showError(error.message);
    }
  }

  elements.search.addEventListener('input', async function () {
    const query = elements.search.value;
    const searchSequence = ++state.searchSequence;
    if (query.trim()) {
      const missing = state.pages.filter(function (page) { return !page.content; });
      try {
        await Promise.all(missing.map(loadPageContent));
      } catch (error) { setStatus('La búsqueda puede estar incompleta', true); }
    }
    if (searchSequence !== state.searchSequence) return;
    drawPageList(query);
  });

  elements.previous.addEventListener('click', function () { navigateTo(-1); });
  elements.next.addEventListener('click', function () { navigateTo(1); });
  elements.brand.addEventListener('click', function (event) {
    event.preventDefault();
    window.location.hash = '#/inicio.md';
    window.location.reload();
  });
  elements.mobileIndex.addEventListener('click', function () {
    const open = elements.sidebar.classList.toggle('is-open');
    elements.mobileIndex.setAttribute('aria-expanded', String(open));
  });
  elements.search.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      state.searchSequence += 1;
      elements.search.value = '';
      drawPageList('');
    }
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
      event.preventDefault();
      elements.search.focus();
    }
  });
  window.addEventListener('hashchange', function () { showArticle(routeFromHash()); });

  init();
}());