// Doc Styler Chrome Extension - Content Script

(function () {
  'use strict';

  // --- 1. Keep Google Docs Favicon Active ---
  const GOOGLE_DOCS_FAVICON = 'https://ssl.gstatic.com/docs/documents/images/kix-favicon-7.ico';

  function applyDocsFavicon() {
    let links = document.querySelectorAll("link[rel~='icon']");
    if (links.length === 0) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/x-icon';
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
  const DOCS_LOGO_SVG = `
    <svg viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 2C0 0.9 0.9 0 2 0H16L24 8V30C24 31.1 23.1 32 22 32H2C0.9 32 0 31.1 0 30V2Z" fill="#2684FC"/>
      <path d="M16 0L24 8H18C16.9 8 16 7.1 16 6V0Z" fill="#A8C7FA"/>
      <rect x="5" y="12" width="14" height="2" rx="1" fill="white"/>
      <rect x="5" y="16" width="14" height="2" rx="1" fill="white"/>
      <rect x="5" y="20" width="10" height="2" rx="1" fill="white"/>
    </svg>
  `;

  const STAR_SVG = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/>
    </svg>
  `;

  const CLOUD_SVG = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3zm-5.55-5.55L12 11.02l-1.45 1.43-1.41-1.41L12 8.19l2.86 2.85-1.41 1.41z"/>
    </svg>
  `;

  const SHARE_LOCK_SVG = `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  `;

  function createHeaderHTML(docTitle) {
    return `
      <div class="gdocs-header-container">
        <div class="gdocs-header-top">
          <div class="gdocs-header-left">
            <div class="gdocs-logo" title="Google Docs Restyled by Doc Styler">
              ${DOCS_LOGO_SVG}
            </div>
            <div class="gdocs-meta-and-menu">
              <div class="gdocs-title-row">
                <input class="gdocs-title" value="${docTitle}" title="Rename Document" id="gdocs-doc-title-input" />
                <div class="gdocs-title-actions">
                  <div class="gdocs-title-icon" id="gdocs-star" title="Star">${STAR_SVG}</div>
                  <div class="gdocs-title-icon" title="Document Status">${CLOUD_SVG}</div>
                </div>
              </div>
              <div class="gdocs-menu-row">
                <div class="gdocs-menu-item" id="menu-file">File
                  <div class="gdocs-dropdown">
                    <div class="gdocs-dropdown-item" id="btn-export-txt">Export as Text (.txt)</div>
                    <div class="gdocs-dropdown-item" id="btn-print">Print</div>
                    <div class="gdocs-dropdown-divider"></div>
                    <div class="gdocs-dropdown-item" id="btn-new-chat">New Chat Document</div>
                  </div>
                </div>
                <div class="gdocs-menu-item" id="menu-edit">Edit
                  <div class="gdocs-dropdown">
                    <div class="gdocs-dropdown-item" id="btn-clear">Clear Workspace</div>
                    <div class="gdocs-dropdown-item" id="btn-copy">Copy Document Content</div>
                  </div>
                </div>
                <div class="gdocs-menu-item" id="menu-view">View
                  <div class="gdocs-dropdown">
                    <div class="gdocs-dropdown-item" id="btn-toggle-dark">Toggle Dark Mode</div>
                    <div class="gdocs-dropdown-item" id="btn-toggle-width">Toggle Compact Width</div>
                  </div>
                </div>
                <div class="gdocs-menu-item" id="menu-insert">Insert
                  <div class="gdocs-dropdown">
                    <div class="gdocs-dropdown-item" id="btn-insert-timestamp">Current Date/Time</div>
                    <div class="gdocs-dropdown-item" id="btn-insert-template">Document Template</div>
                  </div>
                </div>
                <div class="gdocs-menu-item" id="menu-format">Format
                  <div class="gdocs-dropdown">
                    <div class="gdocs-dropdown-item" id="btn-bold-toggle">Bold style</div>
                    <div class="gdocs-dropdown-item" id="btn-italic-toggle">Italic style</div>
                    <div class="gdocs-dropdown-item" id="btn-clean-formatting">Reset Document Style</div>
                  </div>
                </div>
                <div class="gdocs-menu-item" id="menu-help">Help
                  <div class="gdocs-dropdown">
                    <div class="gdocs-dropdown-item" id="btn-about">About Doc Styler</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="gdocs-header-right">
            <div class="gdocs-header-btn" title="Comment History">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
              </svg>
            </div>
            <div class="gdocs-header-btn" title="Present to a meeting">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.11-.9-2-2-2zm0 14H3V5h18v12zm-5-6l-4 4-4-4 1.41-1.41L11 11.17V7h2v4.17l1.59-1.59L16 11z"/>
              </svg>
            </div>
            <button class="gdocs-share-btn" title="Share Document">
              ${SHARE_LOCK_SVG}
              <span>Share</span>
            </button>
            <div class="gdocs-avatar" title="Google Account Profile">
              D
            </div>
          </div>
        </div>
        
        <!-- Formatting Toolbar -->
        <div class="gdocs-toolbar">
          <button class="gdocs-toolbar-btn" id="tb-undo" title="Undo (Ctrl+Z)">
            <svg viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>
          </button>
          <button class="gdocs-toolbar-btn" id="tb-redo" title="Redo (Ctrl+Y)">
            <svg viewBox="0 0 24 24"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>
          </button>
          <button class="gdocs-toolbar-btn" id="tb-print" title="Print (Ctrl+P)">
            <svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
          </button>
          <button class="gdocs-toolbar-btn" id="tb-paint" title="Paint format">
            <svg viewBox="0 0 24 24"><path d="M17.66 5.41l.92.92-2.69 2.69-.92-.92 2.69-2.69M4 14c0 2.21 1.79 4 4 4s4-1.79 4-4H4zm13-4.3c-.26 0-.51.11-.7.29L10.59 15.7c-.18.19-.29.44-.29.7 0 .55.45 1 1 1 .26 0 .51-.11.7-.29l5.71-5.71c.18-.19.29-.44.29-.7 0-.55-.45-1-1-1zM19 2h-6c-1.1 0-2 .9-2 2v3h10V4c0-1.1-.9-2-2-2z"/></svg>
          </button>
          
          <div class="gdocs-toolbar-separator"></div>
          
          <div class="gdocs-style-select" title="Styles">
            <span>Normal text</span>
            <svg viewBox="0 0 24 24" width="12" height="12"><path d="M7 10l5 5 5-5H7z" fill="currentColor"/></svg>
          </div>
          
          <div class="gdocs-toolbar-separator"></div>
          
          <div class="gdocs-font-select" title="Font">
            <span id="gdocs-active-font-name">Arial</span>
            <svg viewBox="0 0 24 24" width="12" height="12"><path d="M7 10l5 5 5-5H7z" fill="currentColor"/></svg>
          </div>
          
          <div class="gdocs-toolbar-separator"></div>
          
          <!-- Size Controls -->
          <div class="gdocs-size-control">
            <button class="gdocs-toolbar-btn" id="tb-font-dec" style="min-width:20px;height:24px;">-</button>
            <input class="gdocs-size-input" id="tb-font-size" value="11" />
            <button class="gdocs-toolbar-btn" id="tb-font-inc" style="min-width:20px;height:24px;">+</button>
          </div>
          
          <div class="gdocs-toolbar-separator"></div>
          
          <!-- Text Formatting Buttons -->
          <button class="gdocs-toolbar-btn" id="tb-bold" title="Bold (Ctrl+B)">
            <strong>B</strong>
          </button>
          <button class="gdocs-toolbar-btn" id="tb-italic" title="Italic (Ctrl+I)">
            <span style="font-style: italic; font-family: Georgia, serif; font-weight: bold;">I</span>
          </button>
          <button class="gdocs-toolbar-btn" id="tb-underline" title="Underline (Ctrl+U)">
            <span style="text-decoration: underline; font-weight: bold;">U</span>
          </button>
          <button class="gdocs-toolbar-btn" id="tb-color" title="Text color">
            <span style="color: #ea4335; font-weight: bold; font-size: 15px; border-bottom: 3px solid #000; line-height: 10px; display: inline-block; width: 14px; text-align: center;">A</span>
          </button>
          <button class="gdocs-toolbar-btn" id="tb-highlight" title="Highlight color">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12.41 2.58a2 2 0 0 0-2.83 0L3 11.16a1 1 0 0 0 0 1.41L4.42 14c.2.2.45.3.71.3H12l-1.3-1.3H6.83l4.3-4.3c2.4-.41 4.38 1.13 4.38 2.3 0 .47-.19.91-.53 1.25l1.42 1.42A4 4 0 0 0 18 11.5c0-2.45-1.92-4.44-4.36-4.57l-1.23-1.23 2.12-2.12-2.12-2M2 20h20v2H2v-2z"/></svg>
          </button>
          
          <div class="gdocs-toolbar-separator"></div>
          
          <!-- Alignment -->
          <button class="gdocs-toolbar-btn active" id="tb-align-left" title="Left align">
            <svg viewBox="0 0 24 24"><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/></svg>
          </button>
          <button class="gdocs-toolbar-btn" id="tb-align-center" title="Center align">
            <svg viewBox="0 0 24 24"><path d="M20 11H4v2h16v-2zm-2-4H6v2h12V7zm-2 8H8v2h8v-2zm-4 4h-4v2h4v-2zM22 3H2v2h20V3z"/></svg>
          </button>
          
          <!-- Lists -->
          <button class="gdocs-toolbar-btn" id="tb-list-bullet" title="Bulleted list">
            <svg viewBox="0 0 24 24"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>
          </button>
        </div>
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

    // Attach listeners
    setupHeaderInteractions();
    setupDropdownMenus();
    setupFunctionalButtons();
  }

  // --- 3. Interactive Mechanics ---

  function setupHeaderInteractions() {
    // Star toggle
    const starBtn = document.getElementById('gdocs-star');
    if (starBtn) {
      starBtn.addEventListener('click', () => {
        starBtn.classList.toggle('starred');
      });
    }

    // Title input auto-save simulation
    const titleInput = document.getElementById('gdocs-doc-title-input');
    if (titleInput) {
      titleInput.addEventListener('change', (e) => {
        console.log('Document title updated to:', e.target.value);
        // We can save to chrome storage or local storage if needed
        localStorage.setItem('gdocs_doc_styler_title', e.target.value);
      });
      
      // Load saved title
      const savedTitle = localStorage.getItem('gdocs_doc_styler_title');
      if (savedTitle) {
        titleInput.value = savedTitle;
      }
    }
  }

  function setupDropdownMenus() {
    const menuItems = document.querySelectorAll('.gdocs-menu-item');
    
    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // If clicking another menu, close the active ones first
        const isAlreadyActive = item.classList.contains('active');
        closeAllMenus();
        
        if (!isAlreadyActive) {
          item.classList.add('active');
        }
      });
    });

    // Close menus on clicking outside
    document.addEventListener('click', () => {
      closeAllMenus();
    });
  }

  function closeAllMenus() {
    document.querySelectorAll('.gdocs-menu-item').forEach(item => {
      item.classList.remove('active');
    });
  }

  // --- 4. Functionalities (Text Export, Printing, Workspace Clear, Styling, Dark Mode) ---

  function setupFunctionalButtons() {
    // --- File -> Export as Text ---
    const btnExport = document.getElementById('btn-export-txt');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        exportChatToTxt();
      });
    }

    // --- File -> Print ---
    const btnPrint = document.getElementById('btn-print');
    const tbPrint = document.getElementById('tb-print');
    const triggerPrint = () => { window.print(); };
    if (btnPrint) btnPrint.addEventListener('click', triggerPrint);
    if (tbPrint) tbPrint.addEventListener('click', triggerPrint);

    // --- File -> New Chat ---
    const btnNewChat = document.getElementById('btn-new-chat');
    if (btnNewChat) {
      btnNewChat.addEventListener('click', () => {
        startNewChatOnPlatform();
      });
    }

    // --- Edit -> Clear Workspace ---
    const btnClear = document.getElementById('btn-clear');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (confirm('Clear current editor draft content?')) {
          startNewChatOnPlatform();
        }
      });
    }

    // --- Edit -> Copy Content ---
    const btnCopy = document.getElementById('btn-copy');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        copyChatText();
      });
    }

    // --- View -> Toggle Dark Mode ---
    const btnToggleDark = document.getElementById('btn-toggle-dark');
    if (btnToggleDark) {
      btnToggleDark.addEventListener('click', () => {
        document.body.classList.toggle('gdocs-dark-mode');
        const isDarkMode = document.body.classList.contains('gdocs-dark-mode');
        localStorage.setItem('gdocs_doc_styler_dark', isDarkMode ? 'true' : 'false');
        showStatusNotification(isDarkMode ? 'Dark Document theme enabled' : 'Classic Page theme enabled');
      });

      // Load dark mode preference
      if (localStorage.getItem('gdocs_doc_styler_dark') === 'true') {
        document.body.classList.add('gdocs-dark-mode');
      }
    }

    // --- View -> Toggle Compact Width ---
    const btnToggleWidth = document.getElementById('btn-toggle-width');
    if (btnToggleWidth) {
      btnToggleWidth.addEventListener('click', () => {
        document.body.classList.toggle('gdocs-compact-width');
        const isCompact = document.body.classList.contains('gdocs-compact-width');
        showStatusNotification(isCompact ? 'Compact width enabled' : 'Standard page width enabled');
      });
    }

    // --- Insert -> Current Date ---
    const btnInsertTime = document.getElementById('btn-insert-timestamp');
    if (btnInsertTime) {
      btnInsertTime.addEventListener('click', () => {
        const datetime = new Date().toLocaleString();
        pasteTextIntoInput(datetime);
      });
    }

    // --- Insert -> Template ---
    const btnInsertTemplate = document.getElementById('btn-insert-template');
    if (btnInsertTemplate) {
      btnInsertTemplate.addEventListener('click', () => {
        const template = `=== REPORT TEMPLATE ===\nDate: ${new Date().toLocaleDateString()}\nTitle: Project Evaluation\n\n1. Executive Summary:\n\n2. Research Findings:\n\n3. Recommendations:\n=======================`;
        pasteTextIntoInput(template);
      });
    }

    // --- Format -> Bold, Italic ---
    const tbBold = document.getElementById('tb-bold');
    if (tbBold) {
      tbBold.addEventListener('click', () => {
        tbBold.classList.toggle('active');
        wrapSelectedTextInMarkdown('**', '**');
      });
    }
    const btnBoldMenu = document.getElementById('btn-bold-toggle');
    if (btnBoldMenu) {
      btnBoldMenu.addEventListener('click', () => {
        wrapSelectedTextInMarkdown('**', '**');
      });
    }

    const tbItalic = document.getElementById('tb-italic');
    if (tbItalic) {
      tbItalic.addEventListener('click', () => {
        tbItalic.classList.toggle('active');
        wrapSelectedTextInMarkdown('*', '*');
      });
    }
    const btnItalicMenu = document.getElementById('btn-italic-toggle');
    if (btnItalicMenu) {
      btnItalicMenu.addEventListener('click', () => {
        wrapSelectedTextInMarkdown('*', '*');
      });
    }

    // Font size modifiers
    const fontInc = document.getElementById('tb-font-inc');
    const fontDec = document.getElementById('tb-font-dec');
    const fontSizeInput = document.getElementById('tb-font-size');
    if (fontInc && fontDec && fontSizeInput) {
      fontInc.addEventListener('click', () => {
        let size = parseInt(fontSizeInput.value, 10) || 11;
        fontSizeInput.value = size + 1;
        adjustPageZoom(size + 1);
      });
      fontDec.addEventListener('click', () => {
        let size = parseInt(fontSizeInput.value, 10) || 11;
        if (size > 8) {
          fontSizeInput.value = size - 1;
          adjustPageZoom(size - 1);
        }
      });
    }

    // Help -> About
    const btnAbout = document.getElementById('btn-about');
    if (btnAbout) {
      btnAbout.addEventListener('click', () => {
        alert('Doc Styler Chrome Extension v1.1\n\nTransforms your chat experiences into a clean, distraction-free Google Docs writing interface.\n\nSupports:\n- Google Gemini\n- Claude AI\n- ChatGPT');
      });
    }
  }

  // Inject text helper
  function pasteTextIntoInput(text) {
    const selector = 'textarea, div[contenteditable="true"], [role="textbox"]';
    const textareas = document.querySelectorAll(selector);
    
    // Find the most likely active text prompt area
    let activeInput = document.activeElement;
    if (!activeInput || !activeInput.matches(selector)) {
      // Find first visible matching selector
      for (let el of textareas) {
        if (el.getBoundingClientRect().height > 0) {
          activeInput = el;
          break;
        }
      }
    }

    if (activeInput) {
      activeInput.focus();
      
      // Attempt to paste using clipboard or insertion
      if (activeInput.tagName === 'TEXTAREA' || activeInput.tagName === 'INPUT') {
        const start = activeInput.selectionStart;
        const end = activeInput.selectionEnd;
        const value = activeInput.value;
        activeInput.value = value.substring(0, start) + text + value.substring(end);
        activeInput.selectionStart = activeInput.selectionEnd = start + text.length;
        activeInput.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (activeInput.getAttribute('contenteditable') === 'true') {
        // Contenteditable fields (like ChatGPT, Claude)
        document.execCommand('insertText', false, text);
      }
      showStatusNotification('Inserted text at cursor');
    } else {
      showStatusNotification('Click on the prompt box first to insert text');
    }
  }

  // Wrap selections in Markdown
  function wrapSelectedTextInMarkdown(startTag, endTag) {
    const activeInput = document.activeElement;
    if (!activeInput) return;

    if (activeInput.tagName === 'TEXTAREA' || activeInput.tagName === 'INPUT') {
      const start = activeInput.selectionStart;
      const end = activeInput.selectionEnd;
      const val = activeInput.value;
      if (start !== end) {
        const selected = val.substring(start, end);
        activeInput.value = val.substring(0, start) + startTag + selected + endTag + val.substring(end);
        activeInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else if (activeInput.getAttribute('contenteditable') === 'true') {
      const selection = window.getSelection();
      if (!selection.isCollapsed) {
        const selectedText = selection.toString();
        document.execCommand('insertText', false, startTag + selectedText + endTag);
      }
    }
  }

  // Set font size by adjusting parent element stylesheet variables/zoom
  function adjustPageZoom(size) {
    const ratio = size / 11;
    // Set customized font size scale across document elements
    document.documentElement.style.setProperty('--gdocs-font-scale', ratio);
    showStatusNotification(`Font scale set to ${size}pt`);
  }

  // --- Gather Platform Transcripts ---
  function getChatTextTranscripts() {
    let transcript = '';
    const titleInput = document.getElementById('gdocs-doc-title-input');
    const docTitle = titleInput ? titleInput.value : 'Google Doc Transcript';
    
    transcript += `=========================================\n`;
    transcript += `  ${docTitle.toUpperCase()}\n`;
    transcript += `  Exported via Doc Styler Extension\n`;
    transcript += `  Date: ${new Date().toLocaleString()}\n`;
    transcript += `=========================================\n\n`;

    const url = window.location.href;
    if (url.includes('chatgpt.com') || url.includes('chat.openai.com')) {
      // ChatGPT Selectors
      const turns = document.querySelectorAll('[data-testid^="conversation-turn-"]');
      if (turns.length > 0) {
        turns.forEach(turn => {
          const isUser = turn.querySelector('[data-testid="user-message"]') !== null;
          const author = isUser ? 'USER' : 'DOC STYLER AI';
          const contentEl = turn.querySelector('.markdown, .prose') || turn;
          if (contentEl) {
            transcript += `[${author}]:\n${contentEl.innerText}\n\n-----------------------------------------\n\n`;
          }
        });
      } else {
        // Fallback for ChatGPT older containers
        document.querySelectorAll('div.text-base').forEach(el => {
          const isUser = el.querySelector('img') === null; // basic guess
          const author = isUser ? 'USER' : 'DOC STYLER AI';
          transcript += `[${author}]:\n${el.innerText}\n\n-----------------------------------------\n\n`;
        });
      }
    } else if (url.includes('claude.ai')) {
      // Claude Selectors
      const blocks = document.querySelectorAll('.font-user-message, [data-testid="user-message"], .font-claude-message');
      blocks.forEach(block => {
        const isUser = block.classList.contains('font-user-message') || block.getAttribute('data-testid') === 'user-message';
        const author = isUser ? 'USER' : 'DOC STYLER AI';
        transcript += `[${author}]:\n${block.innerText}\n\n-----------------------------------------\n\n`;
      });
      // Fallback
      if (blocks.length === 0) {
        document.querySelectorAll('div.contents').forEach(el => {
          transcript += `${el.innerText}\n\n`;
        });
      }
    } else if (url.includes('gemini.google.com')) {
      // Gemini Selectors
      const userQueries = document.querySelectorAll('user-query');
      const modelResponses = document.querySelectorAll('model-response');
      
      const maxLength = Math.max(userQueries.length, modelResponses.length);
      for (let i = 0; i < maxLength; i++) {
        if (userQueries[i]) {
          transcript += `[USER]:\n${userQueries[i].innerText}\n\n-----------------------------------------\n\n`;
        }
        if (modelResponses[i]) {
          transcript += `[DOC STYLER AI]:\n${modelResponses[i].innerText}\n\n-----------------------------------------\n\n`;
        }
      }
    }

    if (transcript.length < 250) {
      // Fallback, grab general page texts
      transcript += "\nNo structured chat threads parsed. Raw page text grab:\n\n";
      transcript += document.body.innerText.substring(0, 5000);
    }

    return transcript;
  }

  function exportChatToTxt() {
    try {
      const text = getChatTextTranscripts();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      const titleInput = document.getElementById('gdocs-doc-title-input');
      const filename = (titleInput ? titleInput.value : 'doc_styler_export')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_') + '.txt';

      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showStatusNotification('Document exported successfully!');
    } catch (e) {
      console.error(e);
      alert('Could not compile text document. Is there active content?');
    }
  }

  function copyChatText() {
    try {
      const text = getChatTextTranscripts();
      navigator.clipboard.writeText(text).then(() => {
        showStatusNotification('Entire chat copied to clipboard!');
      });
    } catch (err) {
      alert('Failed to copy text.');
    }
  }

  function startNewChatOnPlatform() {
    const url = window.location.href;
    if (url.includes('chatgpt.com') || url.includes('chat.openai.com')) {
      // Click the 'New Chat' button
      const newChatBtn = document.querySelector('nav a[href="/"], nav button:first-child, [data-testid="sidebar-new-chat-button"]');
      if (newChatBtn) {
        newChatBtn.click();
      } else {
        window.location.href = 'https://chatgpt.com';
      }
    } else if (url.includes('claude.ai')) {
      const newChatBtn = document.querySelector('a[href="/new"], button:has-text("New chat")') || [...document.querySelectorAll('button, a')].find(el => el.textContent.includes('New Chat'));
      if (newChatBtn) {
        newChatBtn.click();
      } else {
        window.location.href = 'https://claude.ai';
      }
    } else if (url.includes('gemini.google.com')) {
      const newChatBtn = document.querySelector('g-basic-button[data-test-id="new-chat-button"], button.new-chat-button') || [...document.querySelectorAll('button, a')].find(el => el.textContent.includes('New chat'));
      if (newChatBtn) {
        newChatBtn.click();
      } else {
        window.location.href = 'https://gemini.google.com/app';
      }
    }
  }

  // --- Dynamic Floating Notification Banner ---
  function showStatusNotification(message) {
    let container = document.getElementById('gdocs-notif-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'gdocs-notif-container';
      container.className = 'gdocs-extension-status';
      document.body.appendChild(container);
    }
    container.innerHTML = `<span>${message}</span><span class="gdocs-close" id="gdocs-notif-close">×</span>`;
    container.style.opacity = '1';
    container.style.display = 'flex';

    document.getElementById('gdocs-notif-close').onclick = () => {
      container.style.opacity = '0';
      setTimeout(() => { container.style.display = 'none'; }, 300);
    };

    // Auto-dismiss
    if (window.gdocsNotifTimer) clearTimeout(window.gdocsNotifTimer);
    window.gdocsNotifTimer = setTimeout(() => {
      container.style.opacity = '0';
      setTimeout(() => { container.style.display = 'none'; }, 300);
    }, 4000);
  }


  // --- 5. Bootstrapper / DOM Observers ---

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
