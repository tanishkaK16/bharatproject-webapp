/* ===== ViksitNetra — Full-Featured app.js ===== */

// ===== PAGE NAVIGATION =====
function switchPage(pageId) {
    document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');
    document.querySelectorAll('.sidebar-item').forEach(s => {
        s.classList.toggle('active', s.dataset.page === pageId);
    });
    if (pageId === 'graph') initGraphCanvas();
    if (window.innerWidth < 768) closeSidebar();
}

// ===== MOBILE SIDEBAR =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('active');
});
function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
}
if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

// ===== KPI COUNTER ANIMATION =====
function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();
    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        let val = Math.floor(eased * target);
        if (suffix === 'M') el.textContent = (val / 1000000).toFixed(1) + 'M';
        else if (val >= 1000000) el.textContent = (val / 1000000).toFixed(1) + 'M';
        else if (val >= 1000) el.textContent = val.toLocaleString('en-IN');
        else el.textContent = val;
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}
const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); counterObs.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('.kpi-value[data-target]').forEach(el => counterObs.observe(el));

// ===== NOTIFICATION DROPDOWN =====
(function () {
    const notifBtn = document.getElementById('notifBtn');
    if (!notifBtn) return;
    const dropdown = document.createElement('div');
    dropdown.className = 'notif-dropdown';
    dropdown.id = 'notifDropdown';
    dropdown.innerHTML = `
        <div class="notif-dropdown-header"><strong>Notifications</strong><button id="markAllRead">Mark all read</button></div>
        <div class="notif-dropdown-list">
            <div class="notif-dropdown-item unread"><span class="ndi-dot"></span><div><strong>Cyclone Warning — Odisha</strong><p>Wind speed 120 km/h. Evacuation advisory issued.</p><span class="ndi-time">2 min ago</span></div></div>
            <div class="notif-dropdown-item unread"><span class="ndi-dot"></span><div><strong>ETL Pipeline Complete</strong><p>1,204 records processed from 7 data sources.</p><span class="ndi-time">8 min ago</span></div></div>
            <div class="notif-dropdown-item unread"><span class="ndi-dot"></span><div><strong>Grievance Batch Resolved</strong><p>Maharashtra water supply — 1,204 auto-resolved.</p><span class="ndi-time">22 min ago</span></div></div>
            <div class="notif-dropdown-item"><span class="ndi-dot" style="opacity:0"></span><div><strong>System Audit Passed</strong><p>Monthly blockchain audit: 0 anomalies.</p><span class="ndi-time">1 hour ago</span></div></div>
        </div>`;
    notifBtn.style.position = 'relative';
    notifBtn.parentElement.style.position = 'relative';
    notifBtn.parentElement.appendChild(dropdown);
    notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    document.getElementById('markAllRead')?.addEventListener('click', () => {
        dropdown.querySelectorAll('.unread').forEach(i => i.classList.remove('unread'));
        const dot = notifBtn.querySelector('.notif-dot');
        if (dot) dot.style.display = 'none';
    });
    document.addEventListener('click', () => dropdown.classList.remove('show'));
    dropdown.addEventListener('click', e => e.stopPropagation());
})();

// ===== PROFILE DROPDOWN =====
(function () {
    const profile = document.getElementById('headerProfile');
    if (!profile) return;
    profile.style.cursor = 'pointer';
    profile.style.position = 'relative';
    const pdrop = document.createElement('div');
    pdrop.className = 'profile-dropdown';
    pdrop.innerHTML = `
        <div class="pd-header"><div class="pd-avatar">AK</div><div><strong>Admin</strong><small>admin@viksitnetra.gov.in</small></div></div>
        <div class="pd-divider"></div>
        <div class="pd-item" onclick="switchPage('dashboard')">📊 Dashboard</div>
        <div class="pd-item" onclick="alert('Settings panel coming soon!')">⚙️ Settings</div>
        <div class="pd-item" onclick="alert('Help documentation coming soon!')">❓ Help & Support</div>
        <div class="pd-divider"></div>
        <div class="pd-item pd-logout" onclick="alert('Logged out successfully!')">🚪 Logout</div>`;
    profile.appendChild(pdrop);
    profile.addEventListener('click', e => { e.stopPropagation(); pdrop.classList.toggle('show'); });
    document.addEventListener('click', () => pdrop.classList.remove('show'));
    pdrop.addEventListener('click', e => e.stopPropagation());
})();

// ===== LANGUAGE SELECTOR =====
document.getElementById('headerLangSelect')?.addEventListener('change', function () {
    const lang = this.value;
    const langSync = document.getElementById('langSelect');
    if (langSync) langSync.value = lang;
    showToast(`Language switched to ${this.options[this.selectedIndex].text}`);
});
document.getElementById('langSelect')?.addEventListener('change', function () {
    const headerLang = document.getElementById('headerLangSelect');
    if (headerLang) headerLang.value = this.value;
    showToast(`Co-Pilot language set to ${this.options[this.selectedIndex].text}`);
});

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = 'position:fixed;top:70px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:8px;';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    const colors = { info: '#3B82F6', success: '#22C55E', warning: '#F59E0B', error: '#EF4444' };
    toast.style.cssText = `padding:12px 20px;background:rgba(15,23,42,0.95);border:1px solid ${colors[type] || colors.info};border-radius:8px;color:#f1f5f9;font-size:0.8rem;box-shadow:0 8px 32px rgba(0,0,0,0.4);transform:translateX(120%);transition:transform 0.3s ease;backdrop-filter:blur(10px);max-width:320px;`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.style.transform = 'translateX(0)');
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== AI CO-PILOT — INTELLIGENT CHATBOT =====
let currentPersona = 'collector';
function selectPersona(el, id) {
    document.querySelectorAll('.persona-item').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    currentPersona = id;
    showToast(`Switched to ${el.querySelector('strong').textContent} persona`);
}
function setQuery(el) {
    document.getElementById('chatInput').value = el.textContent.trim();
    document.getElementById('chatInput').focus();
}

// Comprehensive Government Data Knowledge Base
const govKnowledgeBase = [
    { keywords: ['gdp', 'growth', 'economy', 'economic'], answer: "**India Economic Overview (2025-26)**\n\n• **GDP Growth**: 7.2% (Q4 2025), up from 6.8% in Q3\n• **Per Capita Income**: ₹2,04,000 (8.5% increase YoY)\n• **FDI Inflow**: $84.8 Billion (12% increase)\n• **CPI Inflation**: 4.1% (within RBI target of 2-6%)\n• **Manufacturing IIP**: 138.7 (5.8% growth)\n• **Services Sector**: Fastest growing at 8.1%\n• **Unemployment**: 3.2% (CMIE data)\n\n**Graph Path**: GDP → Sector Analysis → State Contribution → Employment\n\n*Sources: MOSPI, RBI Bulletin, NDAP NITI Aayog*", graph: true },
    { keywords: ['agriculture', 'crop', 'farm', 'kisan', 'wheat', 'rice', 'msp', 'irrigation'], answer: "**Agricultural Intelligence Report**\n\n• **Kharif 2025**: 156.2M tonnes (4.2% increase YoY)\n• **Rice Production (UP)**: 12,500 tonnes, yield 1,524 kg/ha\n• **Punjab Wheat (Rabi)**: 18,900 tonnes — leads national output\n• **PM-KISAN**: 18th installment disbursed to 12 Cr farmers\n• **Sugarcane (Maharashtra)**: 98,000 tonnes production\n• **Micro-irrigation**: 32% coverage in Rajasthan\n\n**Graph Path**: Agriculture Policy → MSP → Crop Production → State Yield\n\n*Sources: data.gov.in, MOSPI Agriculture Census, PM-KISAN Dashboard*", graph: true },
    { keywords: ['weather', 'rain', 'cyclone', 'flood', 'temperature', 'climate', 'monsoon', 'heat'], answer: "**Weather Intelligence — IMD Mausam**\n\n| City | Temp | Humidity | AQI |\n|------|------|----------|-----|\n| Delhi | 28°C | 45% | 156 |\n| Mumbai | 32°C | 72% | 98 |\n| Chennai | 34°C | 68% | 72 |\n| Bengaluru | 26°C | 55% | 64 |\n\n**⚠️ Active Alerts:**\n1. Cyclone Warning — Odisha Coast (HIGH)\n2. Heavy Rainfall — Western Ghats (MEDIUM)\n3. Heat Wave — Northwest India (HIGH)\n\n*Sources: IMD Mausam API, Bhuvan ISRO Satellite*", graph: false },
    { keywords: ['election', 'voter', 'vote', 'constituency', 'turnout', 'polling', 'eci'], answer: "**Election Data — ECI Analysis**\n\n| State | Electors | Turnout | Seats |\n|-------|----------|---------|-------|\n| UP | 15 Cr | 61.2% | 80 |\n| Maharashtra | 9.5 Cr | 62.8% | 48 |\n| Tamil Nadu | 6.2 Cr | 69.7% | 39 |\n| West Bengal | 6.7 Cr | 73.1% | 42 |\n\n• 2.4M geo-fenced voter notifications deployed in Bihar\n• 78% open rate — highest in 3 months\n• E-Voting pilot: 1,204 blockchain audit records sealed\n\n*Sources: ECI Statistical Reports, Blockchain Audit Log*", graph: true },
    { keywords: ['defence', 'defense', 'military', 'army', 'navy', 'drdo', 'missile', 'border'], answer: "**Defence & Security Intelligence**\n\n• DAC approved ₹18,000 Cr indigenous defence equipment\n• AI-guided missile systems (DRDO) cleared for production\n• Border infrastructure: 4 new tunnels in Ladakh completed\n• Defence exports: $2.1 Billion (2025-26)\n• Indigenous content: 68% (target: 75%)\n• Active defence startups: 380+ under iDEX\n\n**Graph Path**: Defence Policy → Strategic Partners → Procurement\n\n*Sources: PIB Defence, DRDO Reports, MEA Strategic Affairs*", graph: true },
    { keywords: ['grievance', 'complaint', 'issue', 'water supply', 'road', 'pothole', 'electricity'], answer: "**Public Grievance Resolution Status**\n\n• **98,432** grievances processed this month\n• **60%** auto-resolved by AI ✅\n• **40%** faster than manual processing\n\n| Category | Total | Resolved |\n|----------|-------|---------|\n| Water Supply | 18,240 | 14,592 |\n| Road Repair | 12,830 | 8,972 |\n| Electricity | 15,600 | 12,480 |\n| Healthcare | 9,200 | 5,520 |\n\nTo file a grievance, navigate to **Grievance Tracker** in the sidebar.\n\n*Sources: CPGRAMS, State CRM Systems*", graph: false },
    { keywords: ['maharashtra', 'mumbai', 'pune', 'civic issue'], answer: "**Maharashtra — Top Civic Issues (March 2026)**\n\n1. **Water Supply** — 3,240 complaints (Ward 14 Mumbai highest)\n2. **Road Repairs** — 2,180 reports (NH-48, Pune-Mumbai Expressway)\n3. **Power Outages** — 1,890 cases (rural Vidarbha region)\n4. **Sanitation** — 1,450 grievances (post-monsoon cleanup)\n5. **Healthcare** — 980 requests (PHC staffing shortage)\n\n**AI Resolution Rate**: 65% — highest among large states\n**Avg Resolution Time**: 2.3 days\n\n*Sources: Maharashtra State CRM, CPGRAMS, Municipal Corp Data*", graph: true },
    { keywords: ['bihar', 'patna'], answer: "**Bihar District Analysis**\n\n• **Agriculture**: Wheat production up 12% YoY\n• **Irrigation**: Deficit in 3 blocks — auto-escalated to PWD\n• **MGNREGS**: 78% utilization (above state average)\n• **Grievances**: 34 pending water supply issues\n• **Voter Engagement**: 2.4M notifications sent, 78% open rate\n\n**Graph Path**: Bihar Districts → Economic Sector → Agricultural Index\n\n**Recommendation**: Issue advisory to block-level officers on irrigation scheme.\n\n*Sources: Bihar State Portal, data.gov.in*", graph: true },
    { keywords: ['upi', 'digital', 'payment', 'fintech'], answer: "**Digital India — UPI Stack Analysis**\n\n• **UPI Transactions**: 14.2 Billion/month (March 2026)\n• **Transaction Value**: ₹18.3 Lakh Crore/month\n• **Cross-border UPI**: Live in 12 countries\n• **ONDC Integration**: 4.2M merchants onboarded\n• **DigiLocker**: 250M+ documents stored\n\n**Digital Infrastructure Score**: 89/100\n\n*Sources: NPCI, RBI, MeitY Dashboard*", graph: true },
    { keywords: ['health', 'ayushman', 'hospital', 'medical', 'vaccine'], answer: "**Healthcare Intelligence — Ayushman Bharat**\n\n• **Beneficiaries**: 30 Cr Ayushman Bharat cards issued\n• **Hospital admissions**: 6.2 Cr treatments authorized\n• **Average claim**: ₹12,500\n• **PMJAY**: 28,000+ empaneled hospitals\n• **Vaccination**: 220 Cr+ COVID doses administered\n\n**Active Health Alerts**:\n• Free vaccination drive in municipal dispensaries\n• Heat wave health advisory — Northwest India\n\n*Sources: NHA, PMJAY Portal, ICMR*", graph: false },
    { keywords: ['education', 'nep', 'school', 'university', 'student'], answer: "**Education Sector — NEP 2026 Progress**\n\n• **Gross Enrollment Ratio**: 28.4% (Higher Education)\n• **Digital Classrooms**: 4.5 Lakh schools connected\n• **DIKSHA Platform**: 15 Cr+ content pieces accessed\n• **NEP Implementation**: 82% states adopted new curriculum\n• **Atal Tinkering Labs**: 10,000+ operational\n\n**Skill India Mission**: 14M+ certified in FY26\n\n*Sources: AISHE, DIKSHA, Skill India Dashboard*", graph: true },
    { keywords: ['swachh', 'sanitation', 'clean', 'waste', 'toilet'], answer: "**Swachh Bharat Mission Update**\n\n• **ODF+ Status**: 98% Gram Panchayats certified\n• **Urban SBM**: 85,000+ toilets constructed this year\n• **Waste Processing**: 72% of urban waste processed\n• **Gobardhan**: 500+ biogas plants operational\n\n*Sources: SBM Dashboard, MoHUA*", graph: false },
    { keywords: ['trade', 'export', 'import', 'asean', 'fta'], answer: "**India Trade Policy Analysis**\n\n• **Merchandise Exports**: $470B (FY26 target)\n• **Services Exports**: $340B (IT/BPM leading)\n• **India-ASEAN Trade**: $132B (23% growth opportunity)\n• **PLI Schemes**: $26B investment attracted across 14 sectors\n• **China+1 Strategy**: India capturing $45B opportunity in electronics\n\n**Graph Path**: Global Geopolitics → Trade Flows → India Position → Economic Opportunity\n\n*Sources: DGCIS, MOCI, WTO Reports*", graph: true },
];

function findBestResponse(query) {
    const q = query.toLowerCase();
    let bestMatch = null, bestScore = 0;
    for (const entry of govKnowledgeBase) {
        let score = 0;
        for (const kw of entry.keywords) {
            if (q.includes(kw)) score += (kw.length > 4 ? 2 : 1);
        }
        if (score > bestScore) { bestScore = score; bestMatch = entry; }
    }
    if (bestMatch && bestScore > 0) return bestMatch;
    return {
        answer: "**ViksitNetra Intelligence Report**\n\nI've queried the sovereign knowledge graph across all 7 government data sources:\n\n✅ data.gov.in — Open Government Data\n✅ IMD Mausam — Weather Intelligence\n✅ Bhuvan ISRO — Satellite & Geo Data\n✅ NDAP NITI Aayog — Development Analytics\n✅ MOSPI — Statistical Data\n✅ PIB — Government Communications\n✅ ECI — Electoral Data\n\nPlease try asking about specific topics like **agriculture, GDP, weather, elections, defence, grievances, healthcare, education, trade, UPI**, or specific **states** like Maharashtra, Bihar etc.\n\n*Powered by BharatGen-7B Sovereign LLM*",
        graph: false
    };
}

const chatInput = document.getElementById('chatInput');
if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); sendMessage(); }
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';
    showTyping();
    const res = findBestResponse(text);
    const delay = 800 + Math.random() * 600;
    setTimeout(() => { removeTyping(); addAIMessage(res.answer, res.graph); }, delay);
}

function addMessage(text, role) {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `message ${role}`;
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    if (role === 'user') {
        div.innerHTML = `<div class="msg-avatar">U</div><div class="msg-bubble"><p>${escHtml(text)}</p></div><div class="msg-time">${time}</div>`;
    }
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function addAIMessage(text, showGraph) {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'message ai';
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const graphHtml = showGraph ? `
    <div class="msg-graph-preview"><div class="graph-node n1">Policy</div><div class="graph-edge"></div><div class="graph-node n2">Region</div><div class="graph-edge"></div><div class="graph-node n3">Impact</div></div>
    <button class="btn-graph-path" onclick="switchPage('graph')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="12" y1="8" x2="5" y2="16"/><line x1="12" y1="8" x2="19" y2="16"/></svg> Show Graph Path</button>` : '';
    div.innerHTML = `<div class="msg-avatar">N</div><div class="msg-bubble">${markdownToHtml(text)}${graphHtml}</div><div class="msg-time">${time}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

let typingEl = null;
function showTyping() {
    const container = document.getElementById('chatMessages');
    typingEl = document.createElement('div');
    typingEl.className = 'message ai';
    typingEl.id = 'typingIndicator';
    typingEl.innerHTML = `<div class="msg-avatar">N</div><div class="msg-bubble"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
    container.appendChild(typingEl);
    container.scrollTop = container.scrollHeight;
}
function removeTyping() { document.getElementById('typingIndicator')?.remove(); }
function escHtml(str) { return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function markdownToHtml(text) {
    return text
        .replace(/\|(.+)\|/g, (match) => {
            const rows = match.trim().split('\n').filter(r => r.trim() && !r.match(/^\|[\s\-\|]+\|$/));
            if (rows.length < 1) return match;
            let html = '<table class="ai-table">';
            rows.forEach((row, i) => {
                const cells = row.split('|').filter(c => c.trim());
                const tag = i === 0 ? 'th' : 'td';
                html += '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
            });
            return html + '</table>';
        })
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br/>');
}

// ===== MIC BUTTON =====
document.getElementById('micBtn')?.addEventListener('click', function () {
    this.classList.toggle('active');
    const input = document.getElementById('chatInput');
    if (this.classList.contains('active')) {
        this.style.borderColor = '#ef4444'; this.style.color = '#ef4444';
        input.placeholder = 'Listening... (speak in any Indian language)';
        showToast('Voice input activated — speak now', 'info');
        setTimeout(() => {
            this.classList.remove('active');
            this.style.borderColor = ''; this.style.color = '';
            input.placeholder = 'Ask the knowledge graph... (Ctrl+Enter to send)';
            input.value = 'What are the top civic issues in Maharashtra this month?';
            showToast('Voice captured! Press Enter to send.', 'success');
        }, 2500);
    }
});

// ===== FILTER CHIPS =====
function toggleFilter(el) {
    const group = el.closest('.filter-chips');
    if (group) { group.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active')); el.classList.add('active'); }
}

// ===== DASHBOARD CHIP BUTTONS =====
document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const parent = this.parentElement;
        parent.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

// ===== GRAPHRAG KNOWLEDGE ENGINE =====
let graphInitialized = false;
let currentSearchMode = 'hybrid';

function setGraphSearchMode(btn, mode) {
    document.querySelectorAll('.grag-mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSearchMode = mode;
}

function setGragQuery(text) {
    const input = document.getElementById('gragQueryInput');
    if (input) {
        input.value = text;
        executeGraphRAGQuery();
    }
}

function executeGraphRAGQuery() {
    const btn = document.querySelector('.grag-search-btn');
    const input = document.getElementById('gragQueryInput').value;
    if (!input) return;

    btn.style.transform = 'scale(0.9)';
    btn.innerHTML = '<span style="width:14px;height:14px;border:2px solid #000;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;display:block"></span>';

    setTimeout(() => {
        btn.style.transform = 'none';
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';

        // Show generated Cypher
        const cypherDisplay = document.getElementById('gragCypherDisplay');
        const cypherCode = document.getElementById('gragCypherCode');
        const cypherMeta = document.getElementById('gragCypherMeta');

        if (currentSearchMode === 'hybrid' || currentSearchMode === 'cypher') {
            cypherCode.textContent = `MATCH (p:Policy)-[r:AFFECTS]->(e:EconomicNode)
WHERE p.name CONTAINS "Wheat" OR p.name CONTAINS "Agriculture"
CALL db.index.vector.queryNodes('policy_embeddings', 3, $embedding)
YIELD node AS semantic_match, score
RETURN p, r, e, semantic_match
ORDER BY score DESC LIMIT 10;`;
            cypherMeta.innerHTML = '<span>Execution: <strong style="color:#22c55e">42ms</strong></span><span>Vector Hit: <strong>0.912</strong></span><span>Nodes retrieved: <strong>14</strong></span>';
            cypherDisplay.style.display = 'block';
        } else {
            cypherDisplay.style.display = 'none';
        }

        // Show path strip
        const pathStrip = document.getElementById('gragPathStrip');
        if (currentSearchMode === 'path' || currentSearchMode === 'hybrid') {
            pathStrip.innerHTML = `
                <span class="grag-path-node" style="border-color:#FF9933;color:#FF9933">UP Wheat Subsidies</span>
                <span class="grag-path-arrow">⟶</span>
                <span class="grag-path-rel">AFFECTS_PRICE</span>
                <span class="grag-path-arrow">⟶</span>
                <span class="grag-path-node" style="border-color:#138808;color:#138808">Punjab Agri Markets</span>
                <span class="grag-path-arrow">⟶</span>
                <span class="grag-path-rel">IMPACTS</span>
                <span class="grag-path-arrow">⟶</span>
                <span class="grag-path-node" style="border-color:#3b82f6;color:#3b82f6">National GDP (Q3)</span>
            `;
            pathStrip.style.display = 'flex';
        } else {
            pathStrip.style.display = 'none';
        }

    }, 800);
}

function filterGraphDomain(btn, domain) {
    document.querySelectorAll('.filter-chips .filter-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}
function filterGraphRegion(region) { }

function exploreSubgraph() {
    executeGraphRAGQuery();
}
function traceImpact() {
    setGraphSearchMode(document.querySelectorAll('.grag-mode-btn')[3], 'path');
    setGragQuery('Trace impact for current selected policy');
}

function initGraphCanvas() {
    if (graphInitialized) return;
    graphInitialized = true;
    const canvas = document.getElementById('graphCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let scale = 1, offsetX = 0, offsetY = 0, dragging = false, lastX, lastY;
    function resizeCanvas() { const wrap = canvas.parentElement; canvas.width = wrap.clientWidth; canvas.height = wrap.clientHeight; }
    resizeCanvas(); window.addEventListener('resize', resizeCanvas);

    // GraphRAG Node Ontology Colors
    const nodeColors = { policy: '#FF9933', economic: '#138808', geo: '#3b82f6', civic: '#a855f7', env: '#f59e0b', scheme: '#06b6d4', infra: '#ec4899' };

    // Extrapolated Graph Data mimicking Neo4j output
    const nodes = [
        { id: 1, x: 400, y: 250, r: 28, label: 'PM-KISAN\nScheme', type: 'scheme' },
        { id: 2, x: 220, y: 140, r: 22, label: 'UP Agri\nEconomy', type: 'economic' },
        { id: 3, x: 580, y: 140, r: 22, label: 'FDI Policy\n2025', type: 'policy' },
        { id: 4, x: 180, y: 310, r: 20, label: 'Bihar Drought\nZone', type: 'env' },
        { id: 5, x: 620, y: 300, r: 20, label: 'Cyclone\nTracking', type: 'env' },
        { id: 6, x: 340, y: 400, r: 22, label: 'Gati Shakti', type: 'infra' },
        { id: 7, x: 500, y: 420, r: 18, label: 'Voter CRM', type: 'civic' },
        { id: 8, x: 120, y: 220, r: 18, label: 'Punjab Wheat', type: 'economic' },
        { id: 9, x: 680, y: 200, r: 18, label: 'Ayushman\nBharat', type: 'scheme' },
        { id: 10, x: 270, y: 60, r: 16, label: 'Bhashini API', type: 'civic' },
        { id: 11, x: 540, y: 60, r: 16, label: 'IMD Sensors', type: 'env' },
        { id: 12, x: 700, y: 380, r: 16, label: 'NDRF Base 4', type: 'infra' },
        { id: 13, x: 90, y: 370, r: 16, label: 'UPI Stack', type: 'policy' },
        { id: 14, x: 460, y: 170, r: 16, label: 'MOF Finance', type: 'policy' }
    ];

    const edges = [[1, 2], [1, 4], [1, 8], [1, 13], [2, 4], [2, 8], [3, 14], [3, 9], [4, 6], [5, 11], [5, 12], [6, 1], [6, 12], [7, 10], [8, 13], [9, 14], [13, 10], [14, 1]];
    let selectedNode = null, animFrame = 0;

    function drawGraph() {
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H); ctx.save(); ctx.translate(offsetX, offsetY); ctx.scale(scale, scale);

        ctx.strokeStyle = 'rgba(255,153,51,0.03)'; ctx.lineWidth = 1;
        for (let x = 0; x < W / scale; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H / scale); ctx.stroke(); }
        for (let y = 0; y < H / scale; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W / scale, y); ctx.stroke(); }

        edges.forEach(([a, b]) => {
            const n1 = nodes.find(n => n.id === a), n2 = nodes.find(n => n.id === b);
            if (!n1 || !n2) return;
            const c1 = nodeColors[n1.type], c2 = nodeColors[n2.type];
            const grad = ctx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
            grad.addColorStop(0, c1 + '55'); grad.addColorStop(1, c2 + '55');
            ctx.beginPath(); ctx.moveTo(n1.x, n1.y); ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = grad; ctx.lineWidth = 1.5; ctx.stroke();

            // Flowing data particles
            const t = ((animFrame * 0.012) % 1);
            const px = n1.x + (n2.x - n1.x) * t, py = n1.y + (n2.y - n1.y) * t;
            ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = c1; ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;
        });

        nodes.forEach(node => {
            const color = nodeColors[node.type];
            const isSelected = selectedNode && selectedNode.id === node.id;
            const glow = isSelected ? 24 : 10;

            const radGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r + glow);
            radGrad.addColorStop(0, color + (isSelected ? '80' : '50'));
            radGrad.addColorStop(1, 'transparent');

            ctx.beginPath(); ctx.arc(node.x, node.y, node.r + glow, 0, Math.PI * 2); ctx.fillStyle = radGrad; ctx.fill();
            ctx.beginPath(); ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
            ctx.fillStyle = color + '22'; ctx.fill();
            ctx.strokeStyle = color; ctx.lineWidth = isSelected ? 3 : 1.5; ctx.stroke();

            // Animated pulse
            const pulseR = node.r + 4 + 4 * Math.sin(animFrame * 0.04 + node.id);
            ctx.beginPath(); ctx.arc(node.x, node.y, pulseR, 0, Math.PI * 2);
            ctx.strokeStyle = color + '40'; ctx.lineWidth = 1; ctx.stroke();

            ctx.fillStyle = '#f8fafc'; ctx.font = `bold ${Math.max(9, node.r * 0.4)}px Inter`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            node.label.split('\n').forEach((line, i, arr) => {
                ctx.fillText(line, node.x, node.y + (i - (arr.length - 1) / 2) * (node.r * 0.4 + 2));
            });
        });
        ctx.restore(); animFrame++; requestAnimationFrame(drawGraph);
    }

    drawGraph();

    // Interactions
    canvas.addEventListener('mousedown', e => { dragging = true; lastX = e.offsetX; lastY = e.offsetY; });
    canvas.addEventListener('mousemove', e => {
        if (dragging) { offsetX += e.offsetX - lastX; offsetY += e.offsetY - lastY; lastX = e.offsetX; lastY = e.offsetY; }
        const mx = (e.offsetX - offsetX) / scale, my = (e.offsetY - offsetY) / scale;
        canvas.style.cursor = nodes.find(n => Math.hypot(n.x - mx, n.y - my) < n.r) ? 'pointer' : (dragging ? 'grabbing' : 'grab');
    });
    canvas.addEventListener('mouseup', e => {
        if (!dragging) return; dragging = false;
        const mx = (e.offsetX - offsetX) / scale, my = (e.offsetY - offsetY) / scale;
        const hit = nodes.find(n => Math.hypot(n.x - mx, n.y - my) < n.r);
        if (hit) {
            selectedNode = hit;
            updateGraphRAGDetailPanel(hit);
        }
    });
    canvas.addEventListener('wheel', e => { e.preventDefault(); scale = Math.max(0.3, Math.min(3, scale * (e.deltaY > 0 ? 0.9 : 1.1))); }, { passive: false });

    window.zoomIn = () => { scale = Math.min(3, scale * 1.2); };
    window.zoomOut = () => { scale = Math.max(0.3, scale * 0.8); };
    window.resetGraph = () => { scale = 1; offsetX = 0; offsetY = 0; };
}

function updateGraphRAGDetailPanel(node) {
    const nameEl = document.getElementById('detailNodeName');
    const typeEl = document.getElementById('detailNodeType');
    const simEl = document.getElementById('detailSimilarity');
    const sourceEl = document.getElementById('detailSource');

    if (nameEl) nameEl.textContent = node.label.replace('\n', ' ');
    if (typeEl) typeEl.textContent = `Type: ${node.type.toUpperCase()}`;
    if (simEl) simEl.textContent = (0.85 + Math.random() * 0.14).toFixed(3);

    const sources = ['data.gov.in', 'Bhuvan ISRO', 'IMD + NDMA', 'PIB News', 'RBI Database'];
    if (sourceEl) sourceEl.textContent = sources[node.id % sources.length];

    // Auto-update relations mock
    const rels = document.getElementById('detailRelList');
    if (rels) {
        rels.innerHTML = `
            <div class="rel-item"><span class="rel-type">&rarr; DEPENDS_ON</span><span>${['Infrastructure', 'Budget 2026', 'Monsoon Data'][node.id % 3]}</span></div>
            <div class="rel-item"><span class="rel-type">&larr; IMPACTS</span><span>Local District ${node.id}</span></div>
            <div class="rel-item"><span class="rel-type">&harr; CORRELATED</span><span>Vector Search Sim: 0.92</span></div>
        `;
    }
}

if (document.getElementById('page-graph')?.classList.contains('active')) initGraphCanvas();


// ===== GRIEVANCE MODAL =====
function openGrievanceModal() {
    let modal = document.getElementById('grievanceModal');
    if (modal) { modal.classList.add('show'); return; }
    modal = document.createElement('div'); modal.id = 'grievanceModal'; modal.className = 'modal-overlay show';
    modal.innerHTML = `<div class="modal-box">
        <div class="modal-header"><h3>📋 File New Grievance</h3><button class="modal-close" onclick="closeModal('grievanceModal')">✕</button></div>
        <form id="grievanceForm" onsubmit="submitGrievance(event)">
            <label>Category</label>
            <select id="gCat" required><option value="">Select Category</option><option>Water Supply</option><option>Road Repair</option><option>Electricity</option><option>Healthcare</option><option>Education</option><option>Sanitation</option><option>Document Verification</option><option>Other</option></select>
            <label>District/Location</label><input type="text" id="gLoc" placeholder="e.g. Ward 14, Mumbai" required/>
            <label>Description</label><textarea id="gDesc" rows="3" placeholder="Describe your issue in detail..." required></textarea>
            <label>Priority</label>
            <select id="gPri"><option>Normal</option><option>High</option><option>Urgent</option></select>
            <button type="submit" class="btn-primary" style="width:100%;margin-top:1rem;justify-content:center;">Submit Grievance</button>
        </form></div>`;
    document.body.appendChild(modal);
}
function submitGrievance(e) {
    e.preventDefault();
    const id = 'GRV-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    const cat = document.getElementById('gCat').value;
    const loc = document.getElementById('gLoc').value;
    closeModal('grievanceModal');
    showToast(`✅ Grievance ${id} filed for ${cat} in ${loc}. AI auto-routing in progress...`, 'success');
    // Add to table
    const tbody = document.querySelector('.grievance-table tbody');
    if (tbody) {
        const tr = document.createElement('tr');
        tr.style.animation = 'fadeUp 0.5s ease';
        tr.innerHTML = `<td>${id}</td><td>${cat}</td><td>${loc}</td><td><span class="status-badge new"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New</span></td><td>Mar 4</td><td>5 days</td>`;
        tbody.insertBefore(tr, tbody.firstChild);
    }
}
function closeModal(id) {
    const m = document.getElementById(id); if (m) m.classList.remove('show');
    setTimeout(() => m?.remove(), 300);
}

// ===== PDF REPORT DOWNLOAD =====
function downloadReport(reportType) {
    showToast(`Generating ${reportType} report...`, 'info');
    setTimeout(() => {
        const reports = {
            'governance': generateGovernanceReport(),
            'grievance': generateGrievanceReport(),
            'economic': generateEconomicReport(),
            'state-wise': generateStateReport(),
        };
        const content = reports[reportType] || reports['governance'];
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const printWin = window.open(url, '_blank');
        if (printWin) {
            printWin.onload = () => { printWin.print(); };
        } else {
            const a = document.createElement('a'); a.href = url;
            a.download = `ViksitNetra_${reportType}_Report_${new Date().toISOString().slice(0, 10)}.html`;
            a.click(); URL.revokeObjectURL(url);
        }
        showToast(`✅ ${reportType} report ready!`, 'success');
    }, 1000);
}

function generateGovernanceReport() {
    return `<!DOCTYPE html><html><head><title>ViksitNetra Governance Report</title><style>
    body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#1a1a1a}
    h1{color:#FF9933;margin-bottom:5px} h2{color:#138808;border-bottom:2px solid #FF9933;padding-bottom:8px}
    table{width:100%;border-collapse:collapse;margin:15px 0} th,td{border:1px solid #ddd;padding:10px;text-align:left}
    th{background:#f4f4f4} .footer{margin-top:40px;text-align:center;color:#666;font-size:12px;border-top:3px solid;border-image:linear-gradient(to right,#FF9933,#fff,#138808) 1}
    @media print{body{padding:20px}}
    </style></head><body>
    <h1>🇮🇳 ViksitNetra — Governance Report</h1>
    <p><em>Generated: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })} | Viksit Bharat Intelligence Eye v1.0</em></p>
    <h2>Executive Summary</h2>
    <table><tr><th>Metric</th><th>Value</th><th>Trend</th></tr>
    <tr><td>Active Users</td><td>12,47,832</td><td>▲ 12.4%</td></tr>
    <tr><td>Grievances Resolved</td><td>98,432</td><td>▲ 40%</td></tr>
    <tr><td>Knowledge Graph Nodes</td><td>100M+</td><td>▲ 2.3M</td></tr>
    <tr><td>AI Queries/Hour</td><td>18,432</td><td>▲ &lt;5s response</td></tr>
    <tr><td>Data Sources Active</td><td>7</td><td>All Healthy ✅</td></tr></table>
    <h2>Sector Activity</h2>
    <table><tr><th>Sector</th><th>Activity Index</th></tr>
    <tr><td>Geopolitics</td><td>82%</td></tr><tr><td>Economics</td><td>75%</td></tr>
    <tr><td>Defense</td><td>68%</td></tr><tr><td>Climate</td><td>91%</td></tr><tr><td>Civic</td><td>59%</td></tr></table>
    <h2>Grievance Resolution</h2>
    <p>60% Resolved | 24% In Progress | 16% Escalated</p>
    <h2>Intelligence Alerts</h2>
    <ul><li><strong>HIGH:</strong> Cyclone Warning — Odisha Coast</li>
    <li><strong>MED:</strong> Economic Anomaly — Punjab Wheat Prices</li>
    <li><strong>INFO:</strong> Voter Engagement Milestone — Bihar</li></ul>
    <div class="footer"><p>© 2026 ViksitNetra | Sovereign AI Platform | Confidential</p></div></body></html>`;
}
function generateGrievanceReport() {
    return `<!DOCTYPE html><html><head><title>Grievance Report</title><style>body{font-family:Arial;max-width:800px;margin:0 auto;padding:40px}h1{color:#FF9933}h2{color:#138808;border-bottom:2px solid #FF9933;padding-bottom:8px}table{width:100%;border-collapse:collapse;margin:15px 0}th,td{border:1px solid #ddd;padding:10px;text-align:left}th{background:#f4f4f4}.footer{margin-top:40px;text-align:center;color:#666;font-size:12px}</style></head><body>
    <h1>📋 Grievance Resolution Report — March 2026</h1>
    <h2>Summary</h2><table><tr><th>Status</th><th>Count</th><th>Percentage</th></tr>
    <tr><td>✅ Resolved</td><td>58,920</td><td>60%</td></tr><tr><td>⏳ In Progress</td><td>23,624</td><td>24%</td></tr>
    <tr><td>⚠️ Escalated</td><td>15,888</td><td>16%</td></tr></table>
    <h2>Category Breakdown</h2><table><tr><th>Category</th><th>Total</th><th>Resolved</th></tr>
    <tr><td>Water Supply</td><td>18,240</td><td>14,592</td></tr><tr><td>Road Repair</td><td>12,830</td><td>8,972</td></tr>
    <tr><td>Electricity</td><td>15,600</td><td>12,480</td></tr><tr><td>Healthcare</td><td>9,200</td><td>5,520</td></tr></table>
    <div class="footer">© 2026 ViksitNetra | Auto-generated Report</div></body></html>`;
}
function generateEconomicReport() { return generateGovernanceReport(); }
function generateStateReport() { return generateGovernanceReport(); }

// ===== LIVE ALERTS =====
const alertMessages = [
    { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>', title: 'GDP Node Update — India Q1 2026', body: 'Preliminary data: 7.4% growth. Knowledge graph updated with 234 new economic nodes.', badge: 'INFO', type: 'green' },
    { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 16.9A5 5 0 0018 7h-1.26a8 8 0 10-11.62 9"/><polyline points="13 11 9 17 15 17 11 23"/></svg>', title: 'Rainfall Alert — Northeast India', body: 'Heavy rainfall predicted for Assam, Meghalaya. 2.1L citizens notified.', badge: 'MED', type: 'orange' },
    { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>', title: 'AI Co-Pilot Milestone', body: '1M queries resolved this month with 94% satisfaction.', badge: 'INFO', type: 'green' },
    { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>', title: 'Security Audit Complete', body: 'Monthly blockchain audit passed. 0 anomalies in 2.4M records.', badge: 'LOW', type: 'blue' }
];
let alertIdx = 0;
setInterval(() => {
    const list = document.getElementById('alertsList');
    if (!list) return;
    const a = alertMessages[alertIdx % alertMessages.length];
    const div = document.createElement('div');
    div.className = `alert-item alert-${a.type}`;
    div.style.opacity = '0'; div.style.transform = 'translateX(-20px)';
    div.innerHTML = `<div class="alert-icon-wrap">${a.icon}</div><div class="alert-body"><strong>${a.title}</strong><p>${a.body}</p></div><div class="alert-meta"><span class="alert-badge ${a.badge === 'INFO' ? 'info' : a.badge === 'MED' ? 'medium' : 'low'}">${a.badge}</span><span class="alert-time">Just now</span></div>`;
    list.insertBefore(div, list.firstChild);
    requestAnimationFrame(() => { div.style.transition = 'opacity .5s ease, transform .5s ease'; div.style.opacity = '1'; div.style.transform = 'translateX(0)'; });
    if (list.children.length > 5) list.removeChild(list.lastChild);
    alertIdx++;
}, 8000);

console.log('%cViksitNetra — Viksit Bharat Intelligence Eye', 'color:#FF9933;font-size:16px;font-weight:bold;');
console.log('%cSee. Simulate. Serve. Shape 2047. | 100M+ Knowledge Graph Nodes | 22+ Languages', 'color:#138808;font-size:12px;');

// ===== SESSION MANAGEMENT =====
(function initSession() {
    const session = sessionStorage.getItem('bharatjnana_session');
    if (session) {
        try {
            const user = JSON.parse(session);
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            const avatarEl = document.getElementById('headerAvatar');
            const nameEl = document.getElementById('headerProfileName');
            if (avatarEl) avatarEl.textContent = initials;
            if (nameEl) nameEl.textContent = user.name;
            // Update profile dropdown
            const pdAvatar = document.querySelector('.pd-avatar');
            const pdName = document.querySelector('.pd-header strong');
            const pdEmail = document.querySelector('.pd-header small');
            if (pdAvatar) pdAvatar.textContent = initials;
            if (pdName) pdName.textContent = user.name;
            if (pdEmail) pdEmail.textContent = user.role + ' • ' + (user.extra || 'ViksitNetra');
        } catch (e) { }
    }
    // Update logout handler
    const logoutItem = document.querySelector('.pd-logout');
    if (logoutItem) {
        logoutItem.onclick = function () {
            sessionStorage.removeItem('bharatjnana_session');
            showToast('Logged out successfully!', 'info');
            setTimeout(() => { window.location.href = 'login.html'; }, 800);
        };
    }
})();

// ===== FEATURE 1: POLICY IMPACT SIMULATOR =====
function setSimQuery(q) { document.getElementById('simQuery').value = q; }
function runSimulation() {
    const query = document.getElementById('simQuery').value.trim();
    if (!query) { showToast('Please enter a What-If scenario', 'warning'); return; }
    showToast('🔮 Running predictive simulation...', 'info');
    const container = document.getElementById('simResultsContainer');
    container.innerHTML = '<div style="text-align:center;padding:2rem"><div class="sim-empty-icon" style="animation:pulse 1s infinite">⚡</div><p style="color:var(--text-muted);font-size:0.78rem">Analyzing across 100M+ graph nodes...</p></div>';
    setTimeout(() => {
        const economic = 40 + Math.random() * 55;
        const social = 30 + Math.random() * 60;
        const climate = 20 + Math.random() * 50;
        const fiscal = 35 + Math.random() * 55;
        const employment = 25 + Math.random() * 65;
        const riskScore = Math.floor(20 + Math.random() * 60);
        const districts = ['Lucknow', 'Varanasi', 'Agra', 'Kanpur', 'Prayagraj', 'Gorakhpur', 'Meerut', 'Aligarh'];
        const districtImpacts = districts.map(d => ({ name: d, val: Math.floor(30 + Math.random() * 60) }));
        container.innerHTML = `
            <div class="sim-result-card"><h4>📊 Economic Impact</h4>
                <div class="sim-impact-bar"><span class="sib-label">GDP Growth</span><div class="sib-track"><div class="sib-fill" style="width:${economic}%;background:linear-gradient(90deg,#22c55e,#4ade80)"></div></div><span class="sib-value" style="color:#22c55e">+${(economic * 0.06).toFixed(1)}%</span></div>
                <div class="sim-impact-bar"><span class="sib-label">Fiscal Impact</span><div class="sib-track"><div class="sib-fill" style="width:${fiscal}%;background:linear-gradient(90deg,#f59e0b,#fbbf24)"></div></div><span class="sib-value" style="color:#f59e0b">₹${Math.floor(fiscal * 120)}Cr</span></div>
                <div class="sim-impact-bar"><span class="sib-label">Employment</span><div class="sib-track"><div class="sib-fill" style="width:${employment}%;background:linear-gradient(90deg,#3b82f6,#60a5fa)"></div></div><span class="sib-value" style="color:#3b82f6">+${Math.floor(employment * 0.8)}K jobs</span></div>
            </div>
            <div class="sim-result-card"><h4>🌍 Social & Climate Impact</h4>
                <div class="sim-impact-bar"><span class="sib-label">Social Score</span><div class="sib-track"><div class="sib-fill" style="width:${social}%;background:linear-gradient(90deg,#a855f7,#c084fc)"></div></div><span class="sib-value" style="color:#a855f7">${social.toFixed(0)}/100</span></div>
                <div class="sim-impact-bar"><span class="sib-label">Climate Score</span><div class="sib-track"><div class="sib-fill" style="width:${climate}%;background:linear-gradient(90deg,#10b981,#34d399)"></div></div><span class="sib-value" style="color:#10b981">${climate.toFixed(0)}/100</span></div>
            </div>
            <div class="sim-result-card"><h4>🗺️ District-wise Impact Forecast</h4>
                <div class="sim-chart-mini">${districtImpacts.map(d => `<div class="sim-bar" style="height:${d.val}%;background:linear-gradient(180deg,#FF9933,rgba(255,153,51,0.3))"><span class="sim-bar-label">${d.name}</span></div>`).join('')}</div>
            </div>`;
        // Risk card
        const riskCard = document.getElementById('simRiskCard');
        riskCard.style.display = 'block';
        const riskColor = riskScore < 35 ? '#22c55e' : riskScore < 65 ? '#f59e0b' : '#ef4444';
        const riskLevel = riskScore < 35 ? 'LOW' : riskScore < 65 ? 'MEDIUM' : 'HIGH';
        document.getElementById('simRiskContent').innerHTML = `
            <div class="sim-risk-gauge">
                <div class="risk-circle" style="background:rgba(${riskScore < 35 ? '34,197,94' : riskScore < 65 ? '245,158,11' : '239,68,68'},0.15);border:2px solid ${riskColor};color:${riskColor}">${riskScore}<small>${riskLevel} RISK</small></div>
                <div style="flex:1"><p style="font-size:0.72rem;color:var(--text-secondary);line-height:1.6">
                <strong>Key Risks:</strong><br>
                • Budget overrun probability: ${Math.floor(20 + Math.random() * 40)}%<br>
                • Implementation delay: ${Math.floor(2 + Math.random() * 8)} months<br>
                • Political sensitivity: ${['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]}<br>
                • Ecological footprint: ${['Minimal', 'Moderate', 'Significant'][Math.floor(Math.random() * 3)]}
                </p></div>
            </div>`;
        showToast('✅ Simulation complete! Review results.', 'success');
    }, 2000);
}

// ===== FEATURE 2: DISTRICT SCORECARD =====
const scorecardData = [
    { district: 'Lucknow', state: 'UP', score: 82, jobs: 78, aqi: 65, literacy: 88, health: 74, infra: 80, digital: 85 },
    { district: 'Mumbai', state: 'MH', score: 91, jobs: 92, aqi: 52, literacy: 95, health: 88, infra: 94, digital: 96 },
    { district: 'Bengaluru Urban', state: 'KA', score: 89, jobs: 90, aqi: 58, literacy: 93, health: 85, infra: 91, digital: 97 },
    { district: 'Chennai', state: 'TN', score: 87, jobs: 85, aqi: 62, literacy: 92, health: 86, infra: 88, digital: 90 },
    { district: 'Patna', state: 'BR', score: 58, jobs: 45, aqi: 70, literacy: 72, health: 52, infra: 55, digital: 48 },
    { district: 'Jaipur', state: 'RJ', score: 74, jobs: 68, aqi: 60, literacy: 80, health: 70, infra: 75, digital: 72 },
    { district: 'Ahmedabad', state: 'GJ', score: 84, jobs: 82, aqi: 55, literacy: 87, health: 78, infra: 86, digital: 88 },
    { district: 'Pune', state: 'MH', score: 88, jobs: 87, aqi: 56, literacy: 94, health: 84, infra: 89, digital: 93 },
    { district: 'Varanasi', state: 'UP', score: 65, jobs: 55, aqi: 68, literacy: 76, health: 60, infra: 62, digital: 58 },
    { district: 'Hyderabad', state: 'TN', score: 86, jobs: 88, aqi: 54, literacy: 90, health: 82, infra: 87, digital: 92 },
    { district: 'Agra', state: 'UP', score: 60, jobs: 50, aqi: 72, literacy: 74, health: 55, infra: 58, digital: 52 },
    { district: 'Gaya', state: 'BR', score: 45, jobs: 35, aqi: 75, literacy: 65, health: 42, infra: 40, digital: 35 },
];
function updateScorecard() {
    const state = document.getElementById('scorecardState')?.value || 'all';
    const grid = document.getElementById('scorecardGrid');
    if (!grid) return;
    const filtered = state === 'all' ? scorecardData : scorecardData.filter(d => d.state === state);
    const sorted = [...filtered].sort((a, b) => b.score - a.score);
    grid.innerHTML = sorted.map((d, i) => {
        const color = d.score >= 80 ? '#22c55e' : d.score >= 60 ? '#f59e0b' : '#ef4444';
        const rankBg = i === 0 ? 'rgba(34,197,94,0.15)' : i === 1 ? 'rgba(59,130,246,0.15)' : i === 2 ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.04)';
        const rankColor = i === 0 ? '#22c55e' : i === 1 ? '#3b82f6' : i === 2 ? '#a855f7' : 'var(--text-muted)';
        return `<div class="scorecard-card" style="animation-delay:${i * 0.08}s"><div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,${color},transparent)"></div>
            <span class="sc-rank-badge" style="background:${rankBg};color:${rankColor}">#${i + 1}</span>
            <div class="sc-header"><div><div class="sc-district">${d.district}</div><div class="sc-state">${d.state}</div></div><div class="sc-score" style="color:${color}">${d.score}<small>/100</small></div></div>
            <div class="sc-metrics">
                <div class="sc-metric"><span class="sc-metric-label">Jobs Index</span><span class="sc-metric-val" style="color:#3b82f6">${d.jobs}%</span></div>
                <div class="sc-metric"><span class="sc-metric-label">AQI Score</span><span class="sc-metric-val" style="color:${d.aqi > 65 ? '#ef4444' : '#22c55e'}">${d.aqi}</span></div>
                <div class="sc-metric"><span class="sc-metric-label">Women Literacy</span><span class="sc-metric-val" style="color:#a855f7">${d.literacy}%</span></div>
                <div class="sc-metric"><span class="sc-metric-label">Health Index</span><span class="sc-metric-val" style="color:#10b981">${d.health}%</span></div>
                <div class="sc-metric"><span class="sc-metric-label">Infrastructure</span><span class="sc-metric-val" style="color:#FF9933">${d.infra}%</span></div>
                <div class="sc-metric"><span class="sc-metric-label">Digital Score</span><span class="sc-metric-val" style="color:#06b6d4">${d.digital}%</span></div>
            </div>
            <div class="sc-progress"><div class="sc-progress-label"><span>2047 Goal Progress</span><span>${d.score}%</span></div><div class="sc-progress-bar"><div class="sc-progress-fill" style="width:${d.score}%;background:linear-gradient(90deg,${color},${color}80)"></div></div></div>
        </div>`;
    }).join('');
}
// Auto-load scorecard
const scObs = new MutationObserver(() => { if (document.getElementById('page-scorecard')?.classList.contains('active')) updateScorecard(); });
scObs.observe(document.body, { attributes: true, subtree: true });

// ===== FEATURE 3: CITIZEN DATA HUB =====
function handleCitizenUpload(input) {
    if (input.files.length) {
        const file = input.files[0];
        const dropzone = document.getElementById('uploadDropzone');
        dropzone.innerHTML = `<div style="color:#22c55e;font-size:0.82rem"><strong>✅ ${file.name}</strong><br><span style="font-size:0.68rem;color:var(--text-muted)">${(file.size / 1024).toFixed(1)} KB • Ready for AI validation</span></div>`;
        showToast(`File "${file.name}" selected`, 'success');
    }
}
function submitCitizenData() {
    const cat = document.getElementById('issueCategory').value;
    if (!cat) { showToast('Please select an issue category', 'warning'); return; }
    showToast('🤖 AI validating submission...', 'info');
    setTimeout(() => {
        const aadhaar = '****' + Math.floor(1000 + Math.random() * 9000);
        const feed = document.getElementById('citizenFeed');
        const icons = { pothole: '🕳️', streetlight: '💡', water: '💧', garbage: '🗑️', crop: '🌾', other: '📋' };
        const labels = { pothole: 'Road Pothole', streetlight: 'Broken Streetlight', water: 'Water Issue', garbage: 'Garbage Dumping', crop: 'Crop Damage', other: 'Civic Issue' };
        const desc = document.getElementById('issueDesc').value || 'AI auto-classified from uploaded media.';
        const newItem = document.createElement('div');
        newItem.className = 'feed-item'; newItem.style.animation = 'fadeUp 0.5s ease';
        newItem.innerHTML = `<div class="feed-icon" style="background:rgba(34,197,94,0.15);color:#22c55e">${icons[cat]}</div><div class="feed-body"><strong>${labels[cat]} — Citizen Report</strong><p>${desc}</p><span class="feed-time">Verified just now • Aadhaar: ${aadhaar}</span></div><span class="status-badge resolved">✓ Validated</span>`;
        feed.insertBefore(newItem, feed.firstChild);
        showToast('✅ Issue validated by AI! Auto-added to knowledge graph.', 'success');
        document.getElementById('issueCategory').value = '';
        document.getElementById('issueDesc').value = '';
    }, 1500);
}

// ===== FEATURE 4: VILLAGE AI AGENT =====
const villageResponses = {
    farming: { hi: '🌾 <strong>फसल सलाह:</strong><br>• रबी सीजन: गेहूं, सरसों, चना बोने का अच्छा समय<br>• MSP गेहूं: ₹2,275/क्विंटल (2026-27)<br>• PM-KISAN: अगली किस्त 15 मार्च को<br>• मिट्टी परीक्षण: नजदीकी KVK, दूरी 8 km', en: 'Crop advisory loaded for your region.' },
    schemes: { hi: '📋 <strong>आपके लिए योजनाएं:</strong><br>• PM-KISAN: ₹6,000/वर्ष (पात्र ✅)<br>• PM Fasal Bima Yojana: बीमा करें<br>• MGNREGS: 100 दिन रोजगार<br>• Ujjwala Yojana: मुफ्त गैस कनेक्शन<br>• आयुष्मान भारत: ₹5 लाख बीमा', en: 'Schemes loaded for your profile.' },
    weather: { hi: '🌤️ <strong>मौसम रिपोर्ट:</strong><br>• आज: 28°C, साफ आसमान<br>• कल: हल्की बारिश की संभावना<br>• अगले 7 दिन: सामान्य तापमान<br>• फसल सिंचाई: 2 दिन बाद करें<br><br><em>Source: IMD ऑफलाइन डेटा (अंतिम sync: 6 घंटे पहले)</em>', en: 'Weather report loaded from offline cache.' },
    health: { hi: '🏥 <strong>स्वास्थ्य सेवाएं:</strong><br>• नजदीकी PHC: 3 km (रामपुर)<br>• आयुष्मान भारत: पात्र ✅<br>• टीकाकरण: शुक्रवार, सुबह 9-5<br>• 108 एम्बुलेंस: उपलब्ध<br>• ANM विज़िट: बुधवार', en: 'Health services info loaded.' },
};
function sendVillageMsg() {
    const input = document.getElementById('villageInput');
    const text = input.value.trim();
    if (!text) return;
    const chat = document.getElementById('villageChat');
    chat.innerHTML += `<div class="v-msg user"><div class="v-msg-bubble">${text}</div></div>`;
    input.value = '';
    setTimeout(() => {
        const q = text.toLowerCase();
        let response = '';
        if (q.includes('fasal') || q.includes('crop') || q.includes('kheti') || q.includes('farming') || q.includes('फसल')) response = villageResponses.farming.hi;
        else if (q.includes('yojana') || q.includes('scheme') || q.includes('योजना')) response = villageResponses.schemes.hi;
        else if (q.includes('mausam') || q.includes('weather') || q.includes('barish') || q.includes('मौसम')) response = villageResponses.weather.hi;
        else if (q.includes('doctor') || q.includes('hospital') || q.includes('health') || q.includes('दवाई')) response = villageResponses.health.hi;
        else response = '🤖 मैं आपकी मदद कर सकता हूँ! कृपया पूछें:<br>• फसल/खेती संबंधित<br>• सरकारी योजनाएं<br>• मौसम की जानकारी<br>• स्वास्थ्य सेवाएं<br><br><em style="font-size:0.6rem;opacity:0.7">All data served from offline cache. Last sync: 6 hours ago.</em>';
        chat.innerHTML += `<div class="v-msg agent"><div class="v-msg-bubble">${response}</div></div>`;
        chat.scrollTop = chat.scrollHeight;
    }, 800);
}
function villageQuick(topic) {
    const chat = document.getElementById('villageChat');
    const labels = { farming: '🌾 Tell me about farming', schemes: '📋 Which schemes am I eligible for?', weather: '🌤️ What is the weather today?', health: '🏥 Nearest health center?' };
    chat.innerHTML += `<div class="v-msg user"><div class="v-msg-bubble">${labels[topic]}</div></div>`;
    setTimeout(() => {
        chat.innerHTML += `<div class="v-msg agent"><div class="v-msg-bubble">${villageResponses[topic].hi}</div></div>`;
        chat.scrollTop = chat.scrollHeight;
    }, 600);
}

// ===== FEATURE 5: SMART GRIEVANCE =====
function handleSmartGrievance(input) {
    if (!input.files.length) return;
    const file = input.files[0];
    showToast('🤖 Vision AI analyzing image...', 'info');
    const result = document.getElementById('smartGrievanceResult');
    result.innerHTML = '<div style="text-align:center;padding:1rem"><div style="animation:pulse 1s infinite;font-size:2rem">🔍</div><p style="font-size:0.72rem;color:var(--text-muted)">AI analyzing: ' + file.name + '</p></div>';
    setTimeout(() => {
        const issueTypes = ['Road Pothole', 'Waterlogging', 'Broken Infrastructure', 'Garbage Accumulation', 'Street Damage'];
        const detected = issueTypes[Math.floor(Math.random() * issueTypes.length)];
        const severity = ['Minor', 'Moderate', 'Severe'][Math.floor(Math.random() * 3)];
        const ticketId = 'SGR-' + Math.random().toString(36).substr(2, 5).toUpperCase();
        result.innerHTML = `<div style="padding:1rem;background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.2);border-radius:8px;animation:fadeUp 0.5s ease">
            <h4 style="font-size:0.85rem;color:#06b6d4;margin-bottom:0.75rem">🤖 AI Vision Analysis Complete</h4>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;font-size:0.72rem">
                <div><span style="color:var(--text-muted)">Issue Type:</span><br><strong>${detected}</strong></div>
                <div><span style="color:var(--text-muted)">Severity:</span><br><strong style="color:${severity === 'Severe' ? '#ef4444' : severity === 'Moderate' ? '#f59e0b' : '#22c55e'}">${severity}</strong></div>
                <div><span style="color:var(--text-muted)">Ticket ID:</span><br><strong style="color:#06b6d4">${ticketId}</strong></div>
                <div><span style="color:var(--text-muted)">Assigned To:</span><br><strong>PWD Officer Ward-12</strong></div>
            </div>
            <div style="margin-top:0.75rem;padding:0.5rem;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:6px;font-size:0.68rem;color:#22c55e">
                ✅ Complaint auto-created • Officer notified • SLA: 72 hours • Track at grievance portal
            </div>
        </div>`;
        showToast(`✅ ${detected} detected! Ticket ${ticketId} auto-created.`, 'success');
    }, 2500);
}

// ===== FEATURE 6: WAR ROOM =====
let wrTimer = null, wrSeconds = 0;
function unlockWarRoom() {
    const pin = document.getElementById('warRoomPin').value;
    if (pin !== '247365') { showToast('❌ Invalid PIN. Access denied.', 'error'); return; }
    document.getElementById('warRoomLocked').style.display = 'none';
    document.getElementById('warRoomContent').style.display = 'block';
    wrSeconds = 0;
    wrTimer = setInterval(() => {
        wrSeconds++;
        const m = String(Math.floor(wrSeconds / 60)).padStart(2, '0');
        const s = String(wrSeconds % 60).padStart(2, '0');
        document.getElementById('wrSessionTime').textContent = m + ':' + s;
    }, 1000);
    showToast('🔓 War Room unlocked. Session encrypted.', 'success');
}
function lockWarRoom() {
    if (wrTimer) clearInterval(wrTimer);
    document.getElementById('warRoomContent').style.display = 'none';
    document.getElementById('warRoomLocked').style.display = 'flex';
    document.getElementById('warRoomPin').value = '';
    showToast('🔒 War Room locked. Session purged.', 'info');
}
function sendWarRoomQuery() {
    const input = document.getElementById('wrInput');
    const text = input.value.trim();
    if (!text) return;
    const chat = document.getElementById('wrChat');
    chat.innerHTML += `<div class="wr-msg user">${text}</div>`;
    input.value = '';
    setTimeout(() => {
        const responses = [
            '🔒 <strong>[CLASSIFIED]</strong> Analysis complete. Law enforcement deployment in subject district shows 12% improvement. 3 sensitive nodes auto-redacted from graph traversal. No data exported.',
            '🔒 <strong>[CLASSIFIED]</strong> Border surveillance data indicates normal activity. 4 patrol routes optimized via graph analysis. Satellite imagery cross-referenced with Bhuvan data. Report auto-redacted.',
            '🔒 <strong>[CLASSIFIED]</strong> Intelligence assessment: Subject area shows stable communal harmony index (85/100). Social media sentiment analysis: Neutral-Positive. No escalation triggers detected.',
            '🔒 <strong>[CLASSIFIED]</strong> Economic threat assessment complete. No unauthorized capital movements detected. Banking node analysis shows normal transaction patterns across 12 monitored districts.',
        ];
        chat.innerHTML += `<div class="wr-msg ai">${responses[Math.floor(Math.random() * responses.length)]}<br><br><em style="font-size:0.6rem;opacity:0.6">🔐 Response encrypted • Graph paths hidden • Auto-redaction applied • Session log: encrypted</em></div>`;
        chat.scrollTop = chat.scrollHeight;
    }, 1200);
}

// ===== FEATURE 7: SCHEME OUTREACH ENGINE =====
let selectedScheme = '';
function demoSchemeOutreach(name) { selectedScheme = name; showToast(`Selected: ${name}`, 'info'); }
function handleSchemeUpload(input) { if (input.files.length) { selectedScheme = input.files[0].name.replace('.pdf', ''); showToast(`PDF uploaded: ${input.files[0].name}`, 'success'); } }
function generateOutreach() {
    if (!selectedScheme) { showToast('Please select or upload a scheme first', 'warning'); return; }
    showToast('🌐 Generating multilingual campaign...', 'info');
    const result = document.getElementById('outreachResult');
    result.innerHTML = '<div style="text-align:center;padding:2rem"><div style="animation:pulse 1s infinite;font-size:2rem">🌐</div><p style="font-size:0.72rem;color:var(--text-muted)">AI translating to 22 languages...</p></div>';
    setTimeout(() => {
        const langs = [
            { name: 'Hindi', native: 'हिंदी', status: '✅ Voice Ready' }, { name: 'Bengali', native: 'বাংলা', status: '✅ Voice Ready' },
            { name: 'Tamil', native: 'தமிழ்', status: '✅ Voice Ready' }, { name: 'Telugu', native: 'తెలుగు', status: '✅ Voice Ready' },
            { name: 'Marathi', native: 'मराठी', status: '✅ Voice Ready' }, { name: 'Gujarati', native: 'ગુજરાતી', status: '✅ Voice Ready' },
            { name: 'Kannada', native: 'ಕನ್ನಡ', status: '✅ Voice Ready' }, { name: 'Malayalam', native: 'മലയാളം', status: '✅ Voice Ready' },
            { name: 'Odia', native: 'ଓଡ଼ିଆ', status: '✅ Voice Ready' }, { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', status: '✅ Voice Ready' },
            { name: 'Assamese', native: 'অসমীয়া', status: '⏳ Processing' }, { name: 'Urdu', native: 'اردو', status: '✅ Voice Ready' },
            { name: 'Maithili', native: 'मैथिली', status: '⏳ Processing' }, { name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ', status: '⏳ Processing' },
            { name: 'Kashmiri', native: 'كٲشُر', status: '⏳ Processing' }, { name: 'Dogri', native: 'डोगरी', status: '✅ Voice Ready' },
        ];
        result.innerHTML = `
            <div style="padding:0.75rem;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:8px;margin-bottom:1rem">
                <h4 style="font-size:0.85rem;color:#10b981;margin-bottom:0.5rem">✅ Campaign Ready: ${selectedScheme}</h4>
                <p style="font-size:0.72rem;color:var(--text-secondary)">AI extracted key benefits, eligibility, and application steps. Voice avatars generated in 16/22 languages. Geo-targeted to 766 districts.</p>
            </div>
            <h4 style="font-size:0.82rem;margin-bottom:0.5rem">🗣️ Voice Avatars Generated</h4>
            <div class="outreach-lang-grid">${langs.map(l => `<div class="outreach-lang-item"><span class="lang-name">${l.native}</span><span style="font-size:0.6rem;color:var(--text-muted)">${l.name}</span><br><span class="lang-status">${l.status}</span></div>`).join('')}</div>
            <h4 style="font-size:0.82rem;margin:1rem 0 0.5rem">📱 Distribution Channels</h4>
            <div class="outreach-channels">
                <div class="outreach-channel" style="background:rgba(34,197,94,0.1);color:#22c55e">📱 WhatsApp — 12.4Cr reach</div>
                <div class="outreach-channel" style="background:rgba(59,130,246,0.1);color:#3b82f6">💬 SMS — 28.7Cr reach</div>
                <div class="outreach-channel" style="background:rgba(168,85,247,0.1);color:#a855f7">📻 IVR Call — 4.2Cr reach</div>
                <div class="outreach-channel" style="background:rgba(255,153,51,0.1);color:#FF9933">📺 DD Regional — 8 States</div>
            </div>`;
        showToast(`✅ Campaign for "${selectedScheme}" generated in 16 languages!`, 'success');
    }, 2500);
}

// ===== FEATURE 8: MY SCHEMES =====
function linkAadhaarSchemes() {
    const aadhaar = document.getElementById('aadhaarInput').value;
    if (aadhaar.length < 12) { showToast('Please enter a valid 12-digit Aadhaar number', 'warning'); return; }
    showToast('🔐 Verifying Aadhaar via DigiLocker...', 'info');
    setTimeout(() => {
        document.getElementById('schemesLocked').style.display = 'none';
        document.getElementById('schemesContent').style.display = 'block';
        const schemes = [
            { name: 'PM-KISAN Samman Nidhi', amount: '₹6,000/yr', desc: 'Direct income support for farming families. Next installment: March 15, 2026.', status: 'claimed', ministry: 'Agriculture' },
            { name: 'Ayushman Bharat PMJAY', amount: '₹5,00,000', desc: 'Health insurance cover for hospitalization. Free treatment at 28,000+ hospitals.', status: 'claimed', ministry: 'Health' },
            { name: 'PM Ujjwala Yojana', amount: '₹1,600', desc: 'Free LPG connection + first refill. Available at nearest gas agency.', status: 'claimed', ministry: 'Petroleum' },
            { name: 'PM Awas Yojana (Gramin)', amount: '₹1,20,000', desc: 'Housing assistance for rural families. Apply through Gram Panchayat.', status: 'apply', ministry: 'Housing' },
            { name: 'Skill India Mission', amount: '₹8,000', desc: 'Free skill training + certification. 40+ courses available in your district.', status: 'apply', ministry: 'Skill Dev' },
            { name: 'PM SVANidhi', amount: '₹50,000', desc: 'Micro-credit for street vendors. No collateral needed. Apply at nearest bank.', status: 'apply', ministry: 'Housing' },
            { name: 'Atal Pension Yojana', amount: '₹5,000/mo', desc: 'Guaranteed pension after age 60. Monthly contribution as low as ₹42.', status: 'apply', ministry: 'Finance' },
        ];
        const list = document.getElementById('schemesList');
        list.innerHTML = schemes.map((s, i) => `
            <div class="scheme-card" style="animation-delay:${i * 0.1}s">
                <div class="scheme-card-header">
                    <h4>${s.name}</h4>
                    <span class="scheme-amount" style="color:${s.status === 'claimed' ? '#22c55e' : '#FF9933'}">${s.amount}</span>
                </div>
                <p>${s.desc}</p>
                <div class="scheme-card-footer">
                    <span class="scheme-eligibility">Ministry: ${s.ministry}</span>
                    ${s.status === 'claimed' ?
                '<button class="scheme-apply-btn claimed">✅ Already Claimed</button>' :
                `<button class="scheme-apply-btn apply" onclick="applyScheme('${s.name}')">Apply Now →</button>`}
                </div>
            </div>`).join('');
        showToast('✅ Identity verified! 7 eligible schemes found worth ₹1,84,000.', 'success');
    }, 2000);
}
function applyScheme(name) {
    showToast(`📋 Redirecting to apply for ${name}...`, 'info');
    setTimeout(() => showToast(`✅ Application initiated for ${name}. Track in your dashboard.`, 'success'), 1500);
}

// ===== AUTO-INIT SCORECARD ON PAGE SWITCH =====
const origSwitchPage = window.switchPage || switchPage;
window.switchPage = function (pageId) {
    origSwitchPage(pageId);
    if (pageId === 'scorecard') setTimeout(updateScorecard, 100);
};
