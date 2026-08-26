// GenVault chat widget logic — place in /public/genvault-widget.js
// Loaded via <Script src="/genvault-widget.js" strategy="afterInteractive" /> in layout.

(function () {
  // ======================================================================
  // CONFIG — jaise stock/prices badlein, yahan update karte rahein
  // ======================================================================
  const CONFIG = {
    businessName: "GENVAULT",
    tagline: "Reserve a piece before it's gone",
    greeting: "Hey! Welcome to the vault. Kisi piece ke baare mein pooch sakte ho, ya main aapko current drop se match karke dikha sakta hoon. Kya dhoondh rahe ho?",
    systemPrompt: `You are the ordering/reservation assistant for GenVault, a curated thrift and streetwear store selling rare, mostly one-of-one pieces (Y2K, vintage, oversized streetwear).

Current featured stock (one-of-one — once reserved/sold, it's gone):
- GV-014 — Oversized Flannel, 90s Wash — ₹1,299 — Size M — Condition: Excellent — ONLY 2 LEFT
- GV-027 — Vault Cargo Pants — ₹1,799 — Size 32 — Condition: Good
- GV-031 — Y2K Zip Hoodie — ₹1,599 — Size L — Condition: Excellent
- GV-006 — Archive Tee, Blank 90s — ₹699 — Size M — Condition: Good

Store voice: Gen Z streetwear brand, confident but chill, not corporate. Short replies (2-4 sentences), like a friend texting from the shop.

Behavior:
- Reply in whatever language/style the customer uses (Hindi, English, or Hinglish) — mirror them naturally.
- Help customers find pieces by vibe, size, or budget from the stock list above. If nothing matches, say so honestly and suggest checking the Shop page for new drops.
- Since items are one-of-one, treat a reservation as time-sensitive — mention that reserving locks it in until checkout.
- Before finalizing, confirm: item code, item name, size, and price.
- Once confirmed, end your reply with a line starting exactly with "CERT:" followed by a one-line reservation summary
  (e.g. "CERT: GV-014 Oversized Flannel 90s Wash, Size M — ₹1,299 — reserved for 24h"). Only include this once everything is confirmed.
- Never invent stock that isn't listed above.`
  };
  // ======================================================================

  function init() {
    const root = document.getElementById('gv-root');
    if (!root) return;

    let isOpen = false;
    let history = [];

    root.innerHTML = `
      <div class="gv-panel" id="gv-panel" role="dialog" aria-label="${CONFIG.businessName} chat" aria-hidden="true">
        <div class="gv-header">
          <div class="gv-header-top">
            <div>
              <div class="gv-brand">GEN<span>VAULT</span></div>
              <div class="gv-tagline">${CONFIG.tagline}</div>
            </div>
            <button class="gv-close" id="gv-close" aria-label="Close chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
        <div class="gv-messages" id="gv-messages"></div>
        <div class="gv-inputbar">
          <textarea class="gv-input" id="gv-input" rows="1" placeholder="Ask about a piece…" aria-label="Message"></textarea>
          <button class="gv-send" id="gv-send" aria-label="Send message">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--gv-void)" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </button>
        </div>
      </div>
      <button class="gv-launcher" id="gv-launcher" aria-label="Open GenVault chat" aria-expanded="false">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--gv-brass-bright)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="10" width="18" height="11" rx="1.5"/>
          <path d="M7 10V7a5 5 0 0 1 10 0v3"/>
          <circle cx="12" cy="15" r="1.6" fill="var(--gv-brass-bright)" stroke="none"/>
        </svg>
        <span class="gv-launcher-badge">chat</span>
      </button>
    `;

    const panel = document.getElementById('gv-panel');
    const launcher = document.getElementById('gv-launcher');
    const closeBtn = document.getElementById('gv-close');
    const messagesEl = document.getElementById('gv-messages');
    const inputEl = document.getElementById('gv-input');
    const sendBtn = document.getElementById('gv-send');

    function addBotBubble(text) {
      const div = document.createElement('div');
      div.className = 'gv-msg gv-msg-bot';
      div.textContent = text;
      messagesEl.appendChild(div);
      scrollToBottom();
    }

    function addUserBubble(text) {
      const div = document.createElement('div');
      div.className = 'gv-msg gv-msg-user';
      div.textContent = text;
      messagesEl.appendChild(div);
      scrollToBottom();
    }

    function addCert(summary) {
      const div = document.createElement('div');
      div.className = 'gv-cert';
      div.innerHTML = `<div class="gv-cert-title">Certificate of Reservation</div><div class="gv-cert-body"></div>`;
      div.querySelector('.gv-cert-body').textContent = summary;
      messagesEl.appendChild(div);
      scrollToBottom();
    }

    let typingEl = null;
    function showTyping() {
      typingEl = document.createElement('div');
      typingEl.className = 'gv-typing';
      typingEl.innerHTML = '<span></span><span></span><span></span>';
      messagesEl.appendChild(typingEl);
      scrollToBottom();
    }
    function hideTyping() {
      if (typingEl) { typingEl.remove(); typingEl = null; }
    }

    function scrollToBottom() {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function openPanel() {
      isOpen = true;
      panel.classList.add('gv-open');
      panel.setAttribute('aria-hidden', 'false');
      launcher.setAttribute('aria-expanded', 'true');
      if (messagesEl.children.length === 0) {
        addBotBubble(CONFIG.greeting);
        history.push({ role: 'assistant', content: CONFIG.greeting });
      }
      inputEl.focus();
    }

    function closePanel() {
      isOpen = false;
      panel.classList.remove('gv-open');
      panel.setAttribute('aria-hidden', 'true');
      launcher.setAttribute('aria-expanded', 'false');
    }

    launcher.addEventListener('click', () => isOpen ? closePanel() : openPanel());
    closeBtn.addEventListener('click', closePanel);

    inputEl.addEventListener('input', () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 80) + 'px';
    });

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    sendBtn.addEventListener('click', sendMessage);

    async function sendMessage() {
      const text = inputEl.value.trim();
      if (!text) return;
      inputEl.value = '';
      inputEl.style.height = 'auto';
      addUserBubble(text);
      history.push({ role: 'user', content: text });
      sendBtn.disabled = true;
      showTyping();

      try {
        // Calls our own Next.js API route (app/api/chat/route.js),
        // which holds the Anthropic API key server-side.
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system: CONFIG.systemPrompt,
            messages: history
          })
        });

        const data = await response.json();
        hideTyping();

        if (!response.ok) {
          throw new Error(data.error || 'Request failed');
        }

        const textBlock = (data.content || []).find(b => b.type === 'text');
        let reply = textBlock ? textBlock.text : "Sorry, kuch gadbad ho gayi. Please try again.";

        let certSummary = null;
        const certIdx = reply.indexOf('CERT:');
        if (certIdx !== -1) {
          certSummary = reply.slice(certIdx + 'CERT:'.length).trim();
          reply = reply.slice(0, certIdx).trim();
        }

        if (reply) addBotBubble(reply);
        if (certSummary) addCert(certSummary);

        history.push({ role: 'assistant', content: textBlock ? textBlock.text : reply });
      } catch (err) {
        hideTyping();
        addBotBubble("Connection issue aa raha hai. Thodi der baad try karein.");
        console.error("GenVault chat widget error:", err);
      } finally {
        sendBtn.disabled = false;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
