// Doc Styler Chrome Extension - Content Script

(function () {
  'use strict';

  // --- 1. Keep Google Docs Favicon Active ---
  const GOOGLE_DOCS_FAVICON = chrome.runtime.getURL('icons/icon48.png');

  function applyDocsFavicon() {
    let links = document.querySelectorAll("link[rel~='icon']");
    if (links.length === 0) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = GOOGLE_DOCS_FAVICON;
      document.head.appendChild(link);
    } else {
      links.forEach(link => {
        if (link.href !== GOOGLE_DOCS_FAVICON) {
          link.href = GOOGLE_DOCS_FAVICON;
        }
      });
    }
  }

  // Monitor head for dynamically replaced favicons
  const faviconObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'attributes') {
        applyDocsFavicon();
      }
    });
  });

  // Start favicon loop and observer
  applyDocsFavicon();
  faviconObserver.observe(document.head, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['href', 'rel']
  });

  // Double check on interval
  setInterval(applyDocsFavicon, 2000);


  // --- 2. Google Docs Header Injection ---
  function createHeaderHTML(docTitle) {
    const headerImageUrl = chrome.runtime.getURL('images/header.png');
    return `
      <div class="gdocs-header-container">
        <img class="gdocs-header-image" src="${headerImageUrl}" alt="Google Docs Header" />
      </div>
    `;
  }

  // Determine current service title based on URL
  function getServiceTitle() {
    const url = window.location.href;
    if (url.includes('chatgpt.com') || url.includes('chat.openai.com')) {
      return 'Draft Document: ChatGPT Session';
    } else if (url.includes('claude.ai')) {
      return 'Draft Document: Claude Research';
    } else if (url.includes('gemini.google.com')) {
      return 'Draft Document: Gemini Insights';
    }
    return 'Draft Document';
  }

  // Inject the header once DOM is ready or instantly if already ready
  function injectGDocsInterface() {
    if (document.getElementById('gdocs-styled-header')) return;

    // Create wrapper element for header
    const headerWrapper = document.createElement('div');
    headerWrapper.id = 'gdocs-styled-header';
    headerWrapper.innerHTML = createHeaderHTML(getServiceTitle());
    document.body.appendChild(headerWrapper);

    // Apply class to body
    document.body.classList.add('gdocs-styled');

  }

  // --- 3. Bootstrapper / DOM Observers ---

  function tryBootstrap() {
    // Make sure we have a body before building
    if (document.body) {
      injectGDocsInterface();
    } else {
      setTimeout(tryBootstrap, 100);
    }
  }

  // Run on start
  tryBootstrap();

  // Handle SPA transitions which might clear out injected elements
  const pageObserver = new MutationObserver((mutations) => {
    if (!document.getElementById('gdocs-styled-header') && document.body) {
      injectGDocsInterface();
    }
  });

  // Observe general body additions to make sure our styling is always integrated
  pageObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

})();
