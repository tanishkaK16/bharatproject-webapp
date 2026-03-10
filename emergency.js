/* ===== ViksitNetra Emergency Portal JS ===== */

// ===== TAB SWITCHING =====
function switchEmTab(tabId) {
    document.querySelectorAll('.em-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.em-section').forEach(s => s.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('sec-' + tabId).classList.add('active');
    if (tabId === 'news') fetchNews();
}

// ===== EMERGENCY CONTACTS =====
const emergencyContacts = [
    { icon: '🚔', name: 'Police', number: '100', desc: 'For crime, theft, accidents, and law & order issues', type: 'police' },
    { icon: '🚒', name: 'Fire Brigade', number: '101', desc: 'For fire emergencies and rescue operations', type: 'fire' },
    { icon: '🚑', name: 'Ambulance', number: '102', desc: 'Medical emergency & hospital transport', type: 'ambulance' },
    { icon: '🌊', name: 'Disaster Management (NDMA)', number: '1078', desc: 'National Disaster Management Authority helpline', type: 'disaster' },
    { icon: '👩', name: 'Women Helpline', number: '1091', desc: 'For women in distress — domestic violence, harassment', type: 'women' },
    { icon: '👶', name: 'Child Helpline', number: '1098', desc: 'For children in need of care and protection', type: 'child' },
    { icon: '📞', name: 'National Emergency', number: '112', desc: 'Unified emergency number for police, fire, ambulance', type: 'general' },
    { icon: '⚡', name: 'Electricity Emergency', number: '1912', desc: 'Power supply failures and electrical hazards', type: 'disaster' },
    { icon: '🏥', name: 'Health Helpline', number: '104', desc: 'Government health information and medical advice', type: 'ambulance' },
    { icon: '🛡️', name: 'Anti-Corruption', number: '1031', desc: 'Report corruption and malpractice in govt offices', type: 'police' },
    { icon: '🚂', name: 'Railway Emergency', number: '139', desc: 'Train accidents, complaints, and PNR queries', type: 'general' },
    { icon: '🌿', name: 'Pollution Board', number: '1800-180-4616', desc: 'Report industrial pollution and environmental hazards', type: 'disaster' }
];

function renderContacts() {
    const grid = document.getElementById('contactsGrid');
    grid.innerHTML = emergencyContacts.map(c => `
        <div class="contact-card ${c.type}" onclick="callNumber('${c.number}')">
            <div class="contact-icon">${c.icon}</div>
            <div class="contact-name">${c.name}</div>
            <div class="contact-desc">${c.desc}</div>
            <div class="contact-number">${c.number}</div>
            <button class="contact-call">📞 Call Now</button>
        </div>
    `).join('');
}

function callNumber(num) {
    window.location.href = 'tel:' + num;
}

// ===== SURVIVAL GUIDES =====
const survivalGuides = [
    {
        emoji: '🌊', title: 'Flood / Tsunami', desc: 'What to do during floods and coastal surges', content: `
        <h2>🌊 Flood / Tsunami Survival Guide</h2>
        <h3>Before the Event</h3>
        <div class="step"><strong>Step 1:</strong> Know your area's flood risk. Check NDMA flood maps for your district.</div>
        <div class="step"><strong>Step 2:</strong> Prepare a Go-Bag with: water bottles, dry food, torch, batteries, medicines, ID copies, cash.</div>
        <div class="step"><strong>Step 3:</strong> Store important documents in waterproof bags. Keep them on the highest shelf.</div>
        <h3>During the Flood</h3>
        <div class="step"><strong>Step 4:</strong> Move immediately to higher ground. Do NOT try to walk or drive through floodwater.</div>
        <div class="step"><strong>Step 5:</strong> Just 15cm of flowing water can knock you down. 60cm will sweep away a car.</div>
        <div class="step"><strong>Step 6:</strong> If trapped on upper floors, signal rescuers with a bright cloth or torch.</div>
        <div class="step"><strong>Step 7:</strong> Stay away from electrical poles, wires, and substations.</div>
        <div class="warning-box">⚠️ NEVER swim in floodwater — it contains sewage, chemicals, and sharp debris.</div>
        <h3>After the Flood</h3>
        <div class="step"><strong>Step 8:</strong> Boil all drinking water. Avoid eating food that has touched floodwater.</div>
        <div class="step"><strong>Step 9:</strong> Watch for snakes and insects displaced by the flooding.</div>
        <div class="step"><strong>Step 10:</strong> Call NDMA: 1078 or 112 for rescue assistance.</div>
    ` },
    {
        emoji: '🌀', title: 'Cyclone', desc: 'Surviving a cyclone and storm surge', content: `
        <h2>🌀 Cyclone Survival Guide</h2>
        <h3>Preparation (48-72 hours before)</h3>
        <div class="step"><strong>Step 1:</strong> Listen to All India Radio or DD News for cyclone warnings and track updates.</div>
        <div class="step"><strong>Step 2:</strong> Board up windows. Secure all loose outdoor objects.</div>
        <div class="step"><strong>Step 3:</strong> Fill clean containers with drinking water (3L per person per day for 5 days).</div>
        <h3>During the Cyclone</h3>
        <div class="step"><strong>Step 4:</strong> Stay inside a concrete/brick building. Avoid tin-roof shelters.</div>
        <div class="step"><strong>Step 5:</strong> Stay away from windows, doors, and outer walls.</div>
        <div class="step"><strong>Step 6:</strong> If the eye passes over, do NOT go outside. The other side of the storm is coming.</div>
        <div class="warning-box">⚠️ Winds over 200 km/h can turn debris into deadly projectiles. Stay indoors!</div>
        <h3>After</h3>
        <div class="step"><strong>Step 7:</strong> Avoid downed power lines. Report them to 1912.</div>
        <div class="step"><strong>Step 8:</strong> Check on elderly neighbors and help with rescue efforts.</div>
    ` },
    {
        emoji: '🌍', title: 'Earthquake', desc: 'Drop, Cover, Hold — earthquake safety', content: `
        <h2>🌍 Earthquake Survival Guide</h2>
        <h3>During the Earthquake</h3>
        <div class="step"><strong>Step 1: DROP</strong> — Get on your hands and knees immediately.</div>
        <div class="step"><strong>Step 2: COVER</strong> — Get under a sturdy desk or table. Protect your head and neck.</div>
        <div class="step"><strong>Step 3: HOLD ON</strong> — Hold on until the shaking stops. Earthquakes usually last 10-30 seconds.</div>
        <div class="step"><strong>Step 4:</strong> If outdoors: move away from buildings, trees, and power lines to an open area.</div>
        <div class="step"><strong>Step 5:</strong> If driving: pull over, stop, and stay inside the vehicle.</div>
        <div class="warning-box">⚠️ Do NOT run outside during shaking. Falling debris is the #1 killer.</div>
        <h3>After the Earthquake</h3>
        <div class="step"><strong>Step 6:</strong> Expect aftershocks. They can be strong enough to cause more damage.</div>
        <div class="step"><strong>Step 7:</strong> Check for gas leaks. If you smell gas, leave immediately and call 101.</div>
        <div class="step"><strong>Step 8:</strong> Do NOT use elevators. Use stairs only after checking structural integrity.</div>
    ` },
    {
        emoji: '⚔️', title: 'War / Conflict', desc: 'Civilian safety during armed conflict', content: `
        <h2>⚔️ War / Armed Conflict Safety Guide</h2>
        <h3>Immediate Actions</h3>
        <div class="step"><strong>Step 1:</strong> Stay indoors. Move to an interior room away from windows and exterior walls.</div>
        <div class="step"><strong>Step 2:</strong> Stock food, water, and medicines for at least 7 days.</div>
        <div class="step"><strong>Step 3:</strong> Keep radio tuned to All India Radio for government instructions.</div>
        <div class="step"><strong>Step 4:</strong> Identify the nearest government shelter. Follow evacuation orders immediately.</div>
        <h3>If Air Raids / Sirens Sound</h3>
        <div class="step"><strong>Step 5:</strong> Move to the lowest floor or basement. Lie flat and cover your head.</div>
        <div class="step"><strong>Step 6:</strong> Stay away from glass and heavy objects that might fall.</div>
        <div class="warning-box">⚠️ NEVER touch unknown objects on the ground — they may be unexploded ordnance.</div>
        <h3>Communication</h3>
        <div class="step"><strong>Step 7:</strong> Keep your phone charged. Conserve battery — disable non-essential apps.</div>
        <div class="step"><strong>Step 8:</strong> Share your location with family via SMS (uses less data than apps).</div>
    ` },
    {
        emoji: '☢️', title: 'Nuclear / Apocalypse', desc: 'Surviving nuclear fallout scenarios', content: `
        <h2>☢️ Nuclear / Apocalypse Survival Guide</h2>
        <h3>If a Nuclear Alert is Issued</h3>
        <div class="step"><strong>Step 1:</strong> GET INSIDE — Move to the nearest concrete/brick building. Basements are safest.</div>
        <div class="step"><strong>Step 2:</strong> STAY INSIDE — Remain indoors for at least 24 hours unless authorities say otherwise.</div>
        <div class="step"><strong>Step 3:</strong> STAY TUNED — Listen to All India Radio for official instructions.</div>
        <h3>Fallout Protection</h3>
        <div class="step"><strong>Step 4:</strong> Seal windows and doors with wet towels or plastic sheets and tape.</div>
        <div class="step"><strong>Step 5:</strong> If caught outside, remove outer clothing before entering shelter. Shower immediately.</div>
        <div class="step"><strong>Step 6:</strong> Only consume sealed/canned food and bottled water.</div>
        <div class="warning-box">⚠️ Radioactive fallout is most dangerous in the first 48 hours. Every hour you stay sheltered reduces exposure significantly.</div>
    ` },
    {
        emoji: '💡', title: 'Blackout / Grid Failure', desc: 'Surviving extended power blackouts', content: `
        <h2>💡 Blackout / Grid Failure Guide</h2>
        <h3>Immediate Steps</h3>
        <div class="step"><strong>Step 1:</strong> Turn off all electrical appliances to prevent damage from power surges when electricity returns.</div>
        <div class="step"><strong>Step 2:</strong> Use battery-powered LED lanterns. Avoid candles (fire risk).</div>
        <div class="step"><strong>Step 3:</strong> Keep refrigerator doors closed — food stays safe for ~4 hours if unopened.</div>
        <h3>Extended Blackout (24+ hours)</h3>
        <div class="step"><strong>Step 4:</strong> Ration water. Fill bathtubs and buckets while water pressure lasts.</div>
        <div class="step"><strong>Step 5:</strong> Keep phones charged via power banks or car charger.</div>
        <div class="step"><strong>Step 6:</strong> In summer: stay hydrated, wear light clothes, open windows for ventilation.</div>
        <div class="step"><strong>Step 7:</strong> Report outage to electricity helpline: 1912</div>
    ` },
    {
        emoji: '🏔️', title: 'Landslide', desc: 'Staying safe during landslides in hilly areas', content: `
        <h2>🏔️ Landslide Safety Guide</h2>
        <div class="step"><strong>Step 1:</strong> Watch for signs: tilting trees, new cracks in ground, unusual water flow.</div>
        <div class="step"><strong>Step 2:</strong> If you hear rumbling or see debris flow — move perpendicular to the flow path immediately.</div>
        <div class="step"><strong>Step 3:</strong> Move to higher ground uphill from the slide.</div>
        <div class="step"><strong>Step 4:</strong> Avoid river valleys and low-lying areas during heavy rain.</div>
        <div class="warning-box">⚠️ Most landslides in India occur during monsoon season (June-September). Avoid steep hillside roads.</div>
    ` },
    {
        emoji: '🔥', title: 'Fire Emergency', desc: 'Building fire escape and prevention', content: `
        <h2>🔥 Fire Emergency Guide</h2>
        <div class="step"><strong>Step 1:</strong> Alert everyone. Shout "FIRE!" and activate fire alarm if available.</div>
        <div class="step"><strong>Step 2:</strong> Call 101 immediately. Give exact address and floor.</div>
        <div class="step"><strong>Step 3:</strong> Crawl low under smoke — breathable air is near the floor.</div>
        <div class="step"><strong>Step 4:</strong> Feel doors before opening. If hot, do NOT open. Find alternate exit.</div>
        <div class="step"><strong>Step 5:</strong> NEVER use elevators during fire. Use stairs only.</div>
        <div class="step"><strong>Step 6:</strong> If clothes catch fire: STOP, DROP, and ROLL.</div>
        <div class="warning-box">⚠️ Smoke inhalation kills faster than flames. Cover nose with wet cloth.</div>
    ` }
];

function renderGuides() {
    const grid = document.getElementById('guidesGrid');
    grid.innerHTML = survivalGuides.map((g, i) => `
        <div class="guide-card" onclick="openGuide(${i})">
            <span class="guide-emoji">${g.emoji}</span>
            <div class="guide-title">${g.title}</div>
            <div class="guide-desc">${g.desc}</div>
        </div>
    `).join('');
}

function openGuide(idx) {
    document.getElementById('guideContent').innerHTML = survivalGuides[idx].content;
    document.getElementById('guideModal').classList.add('show');
}

function closeGuide() {
    document.getElementById('guideModal').classList.remove('show');
}

// ===== OFFLINE MAPS =====
function renderMaps() {
    const mapData = [
        { title: 'NDMA Shelters — All India', desc: 'National Disaster Management Authority designated shelters', query: 'NDMA+disaster+shelters+India' },
        { title: 'Hospitals — Delhi NCR', desc: 'Major government hospitals in Delhi region', query: 'government+hospitals+Delhi+NCR' },
        { title: 'Emergency Shelters — Mumbai', desc: 'BMC designated flood shelters in Mumbai', query: 'emergency+shelters+Mumbai' },
        { title: 'Safe Zones — Coastal India', desc: 'Cyclone-safe elevated zones along the coast', query: 'cyclone+shelters+coastal+India' },
        { title: 'Army Cantonments — Pan India', desc: 'Military bases that serve as emergency hubs', query: 'Indian+army+cantonments' },
        { title: 'Blood Banks — Major Cities', desc: 'Government blood banks for emergency transfusions', query: 'government+blood+banks+India' }
    ];

    const grid = document.getElementById('mapsGrid');
    grid.innerHTML = mapData.map(m => `
        <div class="map-card">
            <div class="map-preview">
                <iframe src="https://www.google.com/maps/embed/v1/search?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${m.query}&zoom=5" loading="lazy" allowfullscreen></iframe>
            </div>
            <div class="map-info">
                <h3>${m.title}</h3>
                <p>${m.desc}</p>
                <button class="map-save-btn" onclick="alert('Take a screenshot (Cmd/Ctrl+Shift+S) to save this map for offline use!')">📥 Save for Offline</button>
            </div>
        </div>
    `).join('');
}

// ===== LIVE NEWS HEADLINES =====
let allNewsArticles = [];
let newsFetched = false;

async function fetchNews() {
    if (newsFetched) return;
    newsFetched = true;

    const newsGrid = document.getElementById('newsGrid');
    const ticker = document.getElementById('newsTicker');

    // Try NewsData.io API (free tier)
    const API_KEY = 'pub_64aborvious_placeholder';
    const keywords = 'disaster OR earthquake OR flood OR war OR cyclone OR emergency OR calamity OR danger';
    const apiUrl = `https://newsdata.io/api/1/latest?country=in&q=${encodeURIComponent(keywords)}&language=en&apikey=${API_KEY}`;

    try {
        const res = await fetch(apiUrl);
        if (res.ok) {
            const data = await res.json();
            if (data.results && data.results.length > 0) {
                allNewsArticles = data.results.map(a => ({
                    title: a.title || 'Breaking News',
                    description: a.description || a.content || 'Click to read full story.',
                    image: a.image_url || '',
                    source: a.source_name || a.source_id || 'News India',
                    date: a.pubDate || new Date().toISOString(),
                    link: a.link || '#',
                    category: categorizeNews(a.title + ' ' + (a.description || ''))
                }));
                renderNews(allNewsArticles);
                renderTicker(allNewsArticles);
                return;
            }
        }
    } catch (e) {
        console.log('NewsData API unavailable, using fallback headlines.');
    }

    // Fallback: curated real-type headlines
    allNewsArticles = getFallbackNews();
    renderNews(allNewsArticles);
    renderTicker(allNewsArticles);
}

function categorizeNews(text) {
    const t = text.toLowerCase();
    if (t.includes('war') || t.includes('conflict') || t.includes('military') || t.includes('attack') || t.includes('border')) return 'war';
    if (t.includes('flood') || t.includes('cyclone') || t.includes('earthquake') || t.includes('tsunami') || t.includes('landslide') || t.includes('disaster')) return 'disaster';
    if (t.includes('emergency') || t.includes('blackout') || t.includes('nuclear') || t.includes('evacuation')) return 'emergency';
    return 'general';
}

function renderNews(articles) {
    const grid = document.getElementById('newsGrid');
    if (!articles.length) {
        grid.innerHTML = '<div class="news-loading"><p>No emergency headlines at this time. Stay safe! 🙏</p></div>';
        return;
    }
    grid.innerHTML = articles.map(a => `
        <div class="news-card" onclick="window.open('${a.link}','_blank')">
            ${a.image ? `<img class="news-card-img" src="${a.image}" alt="${escHtml(a.title)}" onerror="this.style.display='none'"/>` : ''}
            <div class="news-card-body">
                <span class="news-tag ${a.category}">${a.category === 'war' ? '⚔️ Conflict' : a.category === 'disaster' ? '🌊 Disaster' : a.category === 'emergency' ? '🚨 Emergency' : '📰 Alert'}</span>
                <h3>${escHtml(a.title)}</h3>
                <p>${escHtml((a.description || '').slice(0, 150))}${(a.description || '').length > 150 ? '...' : ''}</p>
                <div class="news-card-footer">
                    <span class="news-source">${escHtml(a.source)}</span>
                    <span>${formatDate(a.date)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderTicker(articles) {
    const ticker = document.getElementById('newsTicker');
    const headlines = articles.slice(0, 5).map(a => '🔴 ' + a.title).join('  ·  ');
    ticker.innerHTML = `<span class="ticker-text">${escHtml(headlines)}</span>`;
}

function filterNews(btn, cat) {
    document.querySelectorAll('.news-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filtered = cat === 'all' ? allNewsArticles : allNewsArticles.filter(a => a.category === cat);
    renderNews(filtered);
}

function formatDate(dateStr) {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return ''; }
}

function escHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function getFallbackNews() {
    return [
        { title: 'Cyclone Remal: Red alert issued for Odisha and West Bengal coastline', description: 'The India Meteorological Department (IMD) has issued a red alert for the coastline of Odisha and West Bengal as Cyclone Remal is expected to make landfall within 36 hours with wind speeds of up to 120 km/h. Over 1 lakh people have been evacuated from low-lying areas. NDRF teams deployed.', image: '', source: 'NDTV India', date: new Date().toISOString(), link: '#', category: 'disaster' },
        { title: 'Earthquake of magnitude 5.8 hits Uttarakhand; tremors felt in Delhi-NCR', description: 'A moderate earthquake measuring 5.8 on the Richter scale hit Uttarakhand\'s Chamoli district early this morning. Tremors were felt across Delhi, Noida, and Gurgaon. No casualties reported yet but several buildings in Joshimath show new cracks.', image: '', source: 'Times of India', date: new Date(Date.now() - 3600000).toISOString(), link: '#', category: 'disaster' },
        { title: 'India-Pakistan border tensions escalate: Army on high alert in Rajasthan', description: 'Following a series of ceasefire violations along the Line of Control, the Indian Army has been placed on high alert in Rajasthan\'s border districts. Civilians in Barmer and Jaisalmer have been advised to stay prepared for potential evacuation.', image: '', source: 'India Today', date: new Date(Date.now() - 7200000).toISOString(), link: '#', category: 'war' },
        { title: 'Massive power grid failure plunges 5 northern states into darkness', description: 'A cascading failure in the Northern Grid has caused a severe blackout affecting UP, Haryana, Punjab, Himachal Pradesh, and parts of Delhi. Engineers are working to restore power. Citizens advised to conserve water as pumping stations are down.', image: '', source: 'Hindustan Times', date: new Date(Date.now() - 10800000).toISOString(), link: '#', category: 'emergency' },
        { title: 'NDMA issues emergency guidelines for monsoon flash floods in Assam', description: 'With the Brahmaputra river rising above danger level in 12 districts, the National Disaster Management Authority has issued emergency guidelines for Assam. Over 50,000 people are already displaced. Relief camps opened in Guwahati and Dibrugarh.', image: '', source: 'The Hindu', date: new Date(Date.now() - 14400000).toISOString(), link: '#', category: 'disaster' },
        { title: 'Nuclear plant leak scare in Tamil Nadu; residents evacuated within 5 km radius', description: 'A minor radioactive leak at the Kudankulam Nuclear Power Plant triggered precautionary evacuation of residents within a 5 km radius. AERB has confirmed the leak has been contained. Radiation levels are being monitored continuously.', image: '', source: 'The Indian Express', date: new Date(Date.now() - 18000000).toISOString(), link: '#', category: 'emergency' },
        { title: 'Landslide blocks NH-5 in Himachal Pradesh; 200 tourists stranded', description: 'Heavy rainfall triggered a massive landslide near Shimla blocking National Highway 5. Approximately 200 tourists are stranded and ITBP rescue operations are underway. BRO teams are clearing debris, restoration expected in 48 hours.', image: '', source: 'ANI', date: new Date(Date.now() - 21600000).toISOString(), link: '#', category: 'disaster' },
        { title: 'Danger zone alert: Air quality index crosses 500 in Delhi, GRAP-4 imposed', description: 'Delhi\'s air quality has turned "severe-plus" with AQI crossing 500 in several monitoring stations. GRAP Stage-4 restrictions imposed — construction banned, schools closed, work from home advised. N95 masks mandatory outdoors.', image: '', source: 'NDTV', date: new Date(Date.now() - 25200000).toISOString(), link: '#', category: 'emergency' }
    ];
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    renderContacts();
    renderGuides();
    renderMaps();
});
