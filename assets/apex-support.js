/* ═════════════════════════════════════════════════════════════
   APEX SUPPORT — floating help button + FAQ overlay + bug reporter
   Drops onto any page. Reads from localStorage to pre-fill identity
   on bug reports. Fires GHL webhook on submit.
   ═════════════════════════════════════════════════════════════ */
(function(){
  if (document.getElementById('apex-support-btn')) return;
  if (window.location.pathname.match(/\/(privacy|terms|reset)\.html$/i)) return;

  // ── DATA ─────────────────────────────────────────────────────────────
  const FAQS = [
    { q: 'Is this medical advice?', a: 'No. Apex is a research and education tool. Every dose, protocol, and citation is for educational reference only. Always consult a licensed healthcare provider before starting any peptide protocol.' },
    { q: 'Do I need to make an account?', a: 'No. The tracker, encyclopedia, and goals builder all work without an account. Your data stays on your device. If you want cross-device sync (cloud), that\'s an Apex Pro feature.' },
    { q: 'Is my data private?', a: 'Yes. Everything you save (protocols, photos, weight log, notes) is stored locally in your browser. Nothing is uploaded to a server unless you explicitly opt in to email capture or cloud sync.' },
    { q: 'How does the affiliate program work?', a: 'Sign up at /affiliate.html with your name, email, and chosen code. You earn $1/month for every Apex Pro subscriber you refer — paid forever, as long as they stay subscribed. Min $10 payout, monthly.' },
    { q: 'What\'s the difference between Free and Apex Pro?', a: 'Free gives you the full tracker, encyclopedia, goals builder, conflict detection, receptor map, and cost tracker. Apex Pro ($2.99/mo) adds cloud sync, lab integration, AI protocol coach, member-only stacks, affiliate eligibility, and 20% off Apex hardware.' },
    { q: 'Can I export my data?', a: 'Yes. Open the tracker → scroll to "Sync across devices" → click Export Stack. Your full protocol history downloads as a JSON file. Import it on any other device.' },
    { q: 'How do I reset everything?', a: 'In your browser console: localStorage.clear() then refresh. Or use a private/incognito window for a clean session. Visit /reset.html for a guided reset.' },
    { q: 'Where do you source the protocols?', a: 'Every dose is cross-referenced from NEJM clinical trials, FDA labels, 8+ compounding pharmacy SOPs, and published research. See /research.html for the full paper trail.' },
    { q: 'I found a bug — what do I do?', a: 'Click "Report a bug" inside this support menu. The form pre-fills your browser, page, and a snapshot of your current state so we can fix it fast.' },
    { q: 'How do I cancel Apex Pro?', a: 'Open Profile → Manage Subscription → Cancel. Cancellation takes effect at the end of your current billing period. No questions asked, no retention call.' },
    { q: 'Does Apex sell peptides?', a: 'No. Apex sells hardware (the V3 Pen, BAC water, needles) and provides research tools. We don\'t sell peptides themselves — for those you need a compounding pharmacy with a prescription, or a research-use vendor.' },
    { q: 'Can I use the Apex pen with insulin or HGH?', a: 'The pen is designed for research peptides reconstituted with bacteriostatic water. It is not a medical device for insulin or HGH delivery. Talk to your provider about appropriate delivery devices for prescribed medications.' },
  ];

  // ── BUTTON (always-visible, bottom-left) ─────────────────────────────
  const btn = document.createElement('button');
  btn.id = 'apex-support-btn';
  btn.innerHTML = '?';
  btn.title = 'Help & support';
  btn.style.cssText = 'position:fixed;left:16px;bottom:60px;z-index:9996;width:46px;height:46px;border-radius:50%;background:rgba(13,19,24,.95);border:1.5px solid rgba(20,184,166,.55);color:#14b8a6;font-family:\'Rajdhani\',sans-serif;font-size:22px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.45);backdrop-filter:blur(6px);transition:transform .15s,border-color .15s,color .15s;';
  btn.onmouseover = () => { btn.style.transform = 'translateY(-2px)'; btn.style.borderColor = '#14b8a6'; btn.style.color = '#fff'; btn.style.background = 'rgba(20,184,166,.2)'; };
  btn.onmouseout = () => { btn.style.transform = ''; btn.style.borderColor = 'rgba(20,184,166,.55)'; btn.style.color = '#14b8a6'; btn.style.background = 'rgba(13,19,24,.95)'; };
  btn.onclick = openSupport;
  document.body.appendChild(btn);

  // ── OVERLAY ──────────────────────────────────────────────────────────
  function openSupport() {
    if (document.getElementById('apex-support-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'apex-support-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(4,6,8,.92);z-index:10010;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;font-family:"Barlow",sans-serif;';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    overlay.innerHTML = `
      <div style="width:680px;max-width:95vw;max-height:92vh;background:#0d1318;border:1px solid #1a2d3a;border-radius:8px;overflow:hidden;display:flex;flex-direction:column;animation:apexSupportIn .24s cubic-bezier(.2,.8,.2,1);">
        <style>@keyframes apexSupportIn{from{opacity:0;transform:translateY(10px) scale(.985);}to{opacity:1;transform:none;}}</style>
        <div style="padding:20px 26px 16px;border-bottom:1px solid #1a2d3a;display:flex;justify-content:space-between;align-items:center;background:linear-gradient(180deg,rgba(20,184,166,.06),rgba(20,184,166,0));">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#fff;letter-spacing:-.2px;">💬 Help & Support</div>
          <button onclick="document.getElementById('apex-support-overlay').remove()" style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;padding:4px 8px;border-radius:4px;">✕</button>
        </div>
        <div style="flex:1;overflow-y:auto;padding:22px 26px;">

          <!-- TABS -->
          <div style="display:flex;gap:8px;margin-bottom:18px;border-bottom:1px solid #1a2d3a;">
            <button class="apex-sup-tab" data-tab="faq" style="background:none;border:none;color:#14b8a6;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.18em;padding:10px 6px;cursor:pointer;text-transform:uppercase;border-bottom:2px solid #14b8a6;">FAQ</button>
            <button class="apex-sup-tab" data-tab="bug" style="background:none;border:none;color:#94a3b8;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.18em;padding:10px 6px;cursor:pointer;text-transform:uppercase;border-bottom:2px solid transparent;">Report a Bug</button>
            <button class="apex-sup-tab" data-tab="contact" style="background:none;border:none;color:#94a3b8;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.18em;padding:10px 6px;cursor:pointer;text-transform:uppercase;border-bottom:2px solid transparent;">Contact</button>
          </div>

          <!-- FAQ PANE -->
          <div id="apex-sup-pane-faq" class="apex-sup-pane">
            <div style="margin-bottom:14px;">
              <input id="apex-sup-search" type="text" placeholder="Search FAQs…" style="width:100%;background:#080c10;border:1px solid #1a2d3a;border-radius:4px;color:#fff;font-family:'Barlow',sans-serif;font-size:14px;padding:10px 14px;outline:none;">
            </div>
            <div id="apex-sup-faq-list">${renderFaq(FAQS)}</div>
          </div>

          <!-- BUG PANE -->
          <div id="apex-sup-pane-bug" class="apex-sup-pane" style="display:none;">
            <div style="font-size:13px;color:#94a3b8;line-height:1.6;margin-bottom:14px;">
              Found something broken? We fix bugs fast. Tell us what happened — we'll auto-attach your browser + page info.
            </div>
            <div class="apex-sup-form-row">
              <label style="font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.15em;color:#94a3b8;text-transform:uppercase;display:block;margin-bottom:6px;">Email (optional, for follow-up)</label>
              <input id="apex-sup-bug-email" type="email" placeholder="you@email.com" value="${(localStorage.getItem('apex_email') || '').replace(/^open@apexprotocol$/, '')}" style="width:100%;background:#080c10;border:1px solid #1a2d3a;border-radius:4px;color:#fff;font-family:'Barlow',sans-serif;font-size:14px;padding:10px 14px;outline:none;">
            </div>
            <div style="margin-top:12px;">
              <label style="font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.15em;color:#94a3b8;text-transform:uppercase;display:block;margin-bottom:6px;">What happened?</label>
              <textarea id="apex-sup-bug-desc" rows="5" placeholder="I clicked X and Y happened. Expected Z." style="width:100%;background:#080c10;border:1px solid #1a2d3a;border-radius:4px;color:#fff;font-family:'Barlow',sans-serif;font-size:14px;padding:10px 14px;outline:none;resize:vertical;"></textarea>
            </div>
            <div style="margin-top:12px;padding:10px 12px;background:rgba(8,12,16,.6);border-radius:4px;font-family:'Share Tech Mono',monospace;font-size:10px;color:#64748b;line-height:1.6;letter-spacing:.05em;">
              <b style="color:#94a3b8;">AUTO-ATTACHED:</b><br>
              Page: <span style="color:#cbd5e1;">${window.location.pathname}</span><br>
              Browser: <span style="color:#cbd5e1;">${navigator.userAgent.split(' ').slice(-2).join(' ')}</span><br>
              Viewport: <span style="color:#cbd5e1;">${window.innerWidth}×${window.innerHeight}</span><br>
              Active protocols: <span style="color:#cbd5e1;">${getProtocolCount()}</span>
            </div>
            <button onclick="window._apexSupSubmit('bug')" style="margin-top:14px;width:100%;background:#14b8a6;color:#fff;border:0;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;letter-spacing:.1em;padding:13px;cursor:pointer;text-transform:uppercase;border-radius:4px;">Send Bug Report</button>
          </div>

          <!-- CONTACT PANE -->
          <div id="apex-sup-pane-contact" class="apex-sup-pane" style="display:none;">
            <div style="font-size:13px;color:#94a3b8;line-height:1.6;margin-bottom:18px;">
              Direct line to the Apex team. We respond within 24 hours on weekdays.
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;">
              <a href="mailto:hello@apexdosing.com" style="padding:18px 20px;background:rgba(20,184,166,.08);border:1px solid rgba(20,184,166,.4);border-radius:6px;text-decoration:none;color:#fff;display:block;transition:border-color .15s,transform .15s;">
                <div style="font-size:24px;margin-bottom:8px;">✉️</div>
                <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;margin-bottom:4px;">Email</div>
                <div style="font-family:'Share Tech Mono',monospace;font-size:11px;color:#14b8a6;">hello@apexdosing.com</div>
              </a>
              <a href="https://discord.gg/apexprotocol" target="_blank" rel="noopener" style="padding:18px 20px;background:rgba(20,184,166,.08);border:1px solid rgba(20,184,166,.4);border-radius:6px;text-decoration:none;color:#fff;display:block;transition:border-color .15s,transform .15s;">
                <div style="font-size:24px;margin-bottom:8px;">💬</div>
                <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;margin-bottom:4px;">Discord</div>
                <div style="font-family:'Share Tech Mono',monospace;font-size:11px;color:#14b8a6;">Apex Pro members only</div>
              </a>
            </div>
            <div style="font-family:'Share Tech Mono',monospace;font-size:11px;color:#64748b;line-height:1.6;letter-spacing:.05em;text-align:center;padding-top:14px;border-top:1px solid #1a2d3a;">
              For medical questions, please consult a licensed healthcare provider.<br>
              Apex provides research tools only — not medical advice.
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Tab switching
    overlay.querySelectorAll('.apex-sup-tab').forEach(t => {
      t.onclick = () => {
        overlay.querySelectorAll('.apex-sup-tab').forEach(x => { x.style.color = '#94a3b8'; x.style.borderBottomColor = 'transparent'; });
        t.style.color = '#14b8a6';
        t.style.borderBottomColor = '#14b8a6';
        overlay.querySelectorAll('.apex-sup-pane').forEach(p => p.style.display = 'none');
        document.getElementById('apex-sup-pane-' + t.dataset.tab).style.display = 'block';
      };
    });

    // FAQ search
    const search = document.getElementById('apex-sup-search');
    if (search) {
      search.oninput = () => {
        const q = search.value.toLowerCase().trim();
        const filtered = q ? FAQS.filter(f => (f.q + ' ' + f.a).toLowerCase().includes(q)) : FAQS;
        document.getElementById('apex-sup-faq-list').innerHTML = renderFaq(filtered);
      };
    }
  }

  function renderFaq(items) {
    if (!items.length) return '<p style="color:#64748b;font-size:13px;text-align:center;padding:20px;">No matches. Try different keywords or ask via Contact.</p>';
    return items.map(f => `
      <details style="border-bottom:1px solid #1a2d3a;padding:14px 0;">
        <summary style="cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#fff;list-style:none;display:flex;justify-content:space-between;align-items:center;">
          <span>${f.q}</span>
          <span style="color:#14b8a6;font-size:18px;">+</span>
        </summary>
        <div style="margin-top:8px;font-size:13px;color:#cbd5e1;line-height:1.6;padding-right:24px;">${f.a}</div>
      </details>
    `).join('');
  }

  function getProtocolCount() {
    try { return (JSON.parse(localStorage.getItem('apex_tracker') || '{}').protocols || []).length; }
    catch(e) { return 0; }
  }

  window._apexSupSubmit = function(type) {
    if (type === 'bug') {
      const email = (document.getElementById('apex-sup-bug-email') || {}).value || '';
      const desc = (document.getElementById('apex-sup-bug-desc') || {}).value || '';
      if (!desc.trim()) { alert('Tell us what happened — that\'s the part we need.'); return; }
      const payload = {
        event: 'bug_report',
        email: email,
        description: desc,
        page: window.location.pathname,
        url: window.location.href,
        user_agent: navigator.userAgent,
        viewport: window.innerWidth + 'x' + window.innerHeight,
        protocol_count: getProtocolCount(),
        ref_code: localStorage.getItem('apex_ref_code') || null,
        timestamp: new Date().toISOString(),
      };
      const url = window.GHL_WEBHOOK_URL || '';
      if (url) {
        fetch(url, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) }).catch(()=>{});
      }
      // Local log so we have it even if webhook fails
      try {
        const log = JSON.parse(localStorage.getItem('apex_bug_log') || '[]');
        log.push(payload);
        localStorage.setItem('apex_bug_log', JSON.stringify(log.slice(-20)));
      } catch(e) {}
      const overlay = document.getElementById('apex-support-overlay');
      if (overlay) {
        overlay.querySelector('#apex-sup-pane-bug').innerHTML =
          '<div style="text-align:center;padding:36px 20px;">'+
          '<div style="font-size:48px;margin-bottom:14px;">✅</div>'+
          '<div style="font-family:\'Rajdhani\',sans-serif;font-size:22px;font-weight:700;color:#fff;margin-bottom:8px;">Got it. Thanks.</div>'+
          '<div style="font-size:13px;color:#94a3b8;line-height:1.6;max-width:380px;margin:0 auto;">We log every bug report. If you left an email, we\'ll follow up when it\'s fixed. Otherwise, the fix will ship in the next update.</div>'+
          '</div>';
      }
    }
  };
})();
