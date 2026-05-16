/**
 * ChatGPT Visible Trace & Sources Exporter
 *
 * Bookmarklet source.
 *
 * This script only reads elements already visible in the ChatGPT web UI:
 * - the visible reasoning/trace panel, when available;
 * - the visible sources panel.
 *
 * It does not access hidden model reasoning or private internal chain-of-thought.
 * It runs locally in the browser and does not send data to an external server.
 */

(async () => {
  const PANEL_SELECTOR = 'div.relative.isolate.my-3.flex.flex-col';
  const SOURCES_BUTTON_SELECTOR = 'button[aria-label="Sources"]';
  const MODAL_ID = '__cgpt_extract_modal__';

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const findPanel = () => document.querySelector(PANEL_SELECTOR);

  const openVisiblePanel = async () => {
    let panel = findPanel();

    if (panel) {
      return panel;
    }

    const sourcesButton = document.querySelector(SOURCES_BUTTON_SELECTOR);

    if (!sourcesButton) {
      alert('Bouton Sources introuvable. Ouvre une reponse ChatGPT avec recherche web ou trace visible.');
      return null;
    }

    sourcesButton.click();

    const start = Date.now();

    while (Date.now() - start < 6000) {
      await sleep(150);
      panel = findPanel();

      if (panel) {
        return panel;
      }
    }

    alert('Le panneau visible n a pas pu etre charge apres 6s.');
    return null;
  };

  const expandCollapsedItems = async (panel) => {
    for (let index = 0; index < 5; index += 1) {
      const buttons = [...panel.querySelectorAll('button')].filter((button) =>
        /\d+\s*more/i.test(button.innerText)
      );

      if (!buttons.length) {
        break;
      }

      buttons.forEach((button) => button.click());
      await sleep(300);
    }
  };

  const cleanStep = (stepElement) => {
    const links = [...stepElement.querySelectorAll('a[href]')].map((link) => link.href);

    const linkTexts = new Set(
      [...stepElement.querySelectorAll('a[href]')].map((link) => link.innerText.trim())
    );

    const lines = stepElement.innerText.split('\n');
    const title = (lines[0] || '').trim();

    const body = lines
      .slice(1)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .filter((line) => !linkTexts.has(line))
      .filter((line) => !/^show\s+(less|more)$/i.test(line))
      .filter((line) => !/^\d+\s+more$/i.test(line))
      .join('\n');

    return {
      title,
      body,
      sources: links,
    };
  };

  const panel = await openVisiblePanel();

  if (!panel) {
    return;
  }

  await expandCollapsedItems(panel);

  const steps = [...panel.children]
    .map(cleanStep)
    .filter((step) => !/^thought for \d+/i.test(step.title))
    .filter((step) => step.title.toLowerCase() !== 'done');

  const allSources = [...new Set(steps.flatMap((step) => step.sources))];

  const head =
    '# Trace visible ChatGPT et sources\n\n' +
    'URL: ' +
    location.href +
    '\n' +
    'Date: ' +
    new Date().toISOString() +
    '\n\n';

  const buildFullMarkdown = () => {
    let markdown = head;

    steps.forEach((step, index) => {
      markdown += '## Etape ' + (index + 1) + ' — ' + step.title + '\n\n';

      if (step.body) {
        markdown += step.body + '\n\n';
      }

      if (step.sources.length) {
        markdown += '**Sources :**\n';
        step.sources.forEach((url) => {
          markdown += '- ' + url + '\n';
        });
        markdown += '\n';
      }
    });

    markdown += '\n---\n\n# Toutes les sources (' + allSources.length + ')\n\n';

    allSources.forEach((url) => {
      markdown += '- ' + url + '\n';
    });

    return markdown;
  };

  const buildSourcesOnlyMarkdown = () => {
    let markdown =
      '# Sources ChatGPT\n\n' +
      'URL: ' +
      location.href +
      '\n' +
      'Date: ' +
      new Date().toISOString() +
      '\n\n' +
      'Total: ' +
      allSources.length +
      ' sources uniques\n\n';

    allSources.forEach((url) => {
      markdown += '- ' + url + '\n';
    });

    return markdown;
  };

  let mode = 'full';
  let markdown = buildFullMarkdown();

  document.getElementById(MODAL_ID)?.remove();

  const overlay = document.createElement('div');
  overlay.id = MODAL_ID;
  overlay.style.cssText =
    'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:2147483647;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif';

  const box = document.createElement('div');
  box.style.cssText =
    'background:#fff;color:#111;width:min(900px,92vw);height:min(80vh,720px);border-radius:12px;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.3);overflow:hidden';

  box.innerHTML =
    '<div style="padding:12px 16px;border-bottom:1px solid #e5e5e5;display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
    '<strong style="flex:1;min-width:200px">Export visible ChatGPT — ' +
    steps.length +
    ' etapes / ' +
    allSources.length +
    ' sources</strong>' +
    '<div style="display:inline-flex;border:1px solid #d1d5db;border-radius:6px;overflow:hidden">' +
    '<button id="__cgpt_full__" style="padding:6px 10px;border:0;background:#2563eb;color:#fff;cursor:pointer;font-size:12px">Trace visible + sources</button>' +
    '<button id="__cgpt_only__" style="padding:6px 10px;border:0;background:#f9fafb;color:#111;cursor:pointer;font-size:12px;border-left:1px solid #d1d5db">Sources uniquement</button>' +
    '</div>' +
    '<button id="__cgpt_copy__" style="padding:6px 12px;border:1px solid #d1d5db;background:#f9fafb;border-radius:6px;cursor:pointer">Copier</button>' +
    '<button id="__cgpt_dl__" style="padding:6px 12px;border:1px solid #d1d5db;background:#f9fafb;border-radius:6px;cursor:pointer">.md</button>' +
    '<button id="__cgpt_close__" style="padding:6px 10px;border:1px solid #d1d5db;background:#f9fafb;border-radius:6px;cursor:pointer">✕</button>' +
    '</div>' +
    '<textarea id="__cgpt_ta__" style="flex:1;width:100%;border:0;outline:0;padding:14px 16px;font:13px ui-monospace,Menlo,Consolas,monospace;resize:none;white-space:pre;background:#fafafa"></textarea>';

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const textarea = document.getElementById('__cgpt_ta__');
  const fullButton = document.getElementById('__cgpt_full__');
  const onlyButton = document.getElementById('__cgpt_only__');
  const copyButton = document.getElementById('__cgpt_copy__');
  const downloadButton = document.getElementById('__cgpt_dl__');
  const closeButton = document.getElementById('__cgpt_close__');

  textarea.value = markdown;

  const setMode = (nextMode) => {
    mode = nextMode;
    markdown = mode === 'full' ? buildFullMarkdown() : buildSourcesOnlyMarkdown();
    textarea.value = markdown;

    if (mode === 'full') {
      fullButton.style.background = '#2563eb';
      fullButton.style.color = '#fff';
      onlyButton.style.background = '#f9fafb';
      onlyButton.style.color = '#111';
    } else {
      onlyButton.style.background = '#2563eb';
      onlyButton.style.color = '#fff';
      fullButton.style.background = '#f9fafb';
      fullButton.style.color = '#111';
    }
  };

  fullButton.onclick = () => setMode('full');
  onlyButton.onclick = () => setMode('only');

  closeButton.onclick = () => overlay.remove();

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      overlay.remove();
    }
  });

  copyButton.onclick = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      copyButton.textContent = 'Copie';
    } catch (error) {
      textarea.select();
      document.execCommand('copy');
      copyButton.textContent = 'Copie';
    }
  };

  downloadButton.onclick = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download =
      (mode === 'full' ? 'chatgpt-visible-trace-' : 'chatgpt-sources-') +
      Date.now() +
      '.md';

    link.click();
  };
})();
