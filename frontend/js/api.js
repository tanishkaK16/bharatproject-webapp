/**
 * ViksitNetra — Live API Service
 * Connects the frontend to the FastAPI backend with real-time data.
 */

const API_BASE = window.location.origin + '/api/v1';
const WS_BASE = (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + window.location.host + '/api/v1';

class ViksitNetraAPI {
    constructor() {
        this.token = localStorage.getItem('bjg_token') || null;
        this.ws = null;
        this.wsListeners = [];
        this.retryCount = 0;
    }

    headers() {
        const h = { 'Content-Type': 'application/json' };
        if (this.token) h['Authorization'] = `Bearer ${this.token}`;
        return h;
    }

    async request(method, path, body = null) {
        try {
            const opts = { method, headers: this.headers() };
            if (body) opts.body = JSON.stringify(body);
            const res = await fetch(`${API_BASE}${path}`, opts);
            if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
            return await res.json();
        } catch (err) {
            console.warn(`[API] ${method} ${path} failed:`, err.message);
            return null;
        }
    }

    // ---- Auth ----
    async login(username, password, aadhaar = null) {
        const data = await this.request('POST', '/auth/login', { username, password, aadhaar });
        if (data && data.access_token) {
            this.token = data.access_token;
            localStorage.setItem('bjg_token', data.access_token);
            localStorage.setItem('bjg_user', JSON.stringify(data.user));
        }
        return data;
    }

    logout() {
        this.token = null;
        localStorage.removeItem('bjg_token');
        localStorage.removeItem('bjg_user');
    }

    // ---- Dashboard ----
    async getKPIs() { return this.request('GET', '/dashboard/kpis'); }

    // ---- ETL ----
    async runETL() { return this.request('POST', '/etl/run'); }
    async runETLSource(source) { return this.request('POST', `/etl/run/${source}`); }
    async getETLStatus() { return this.request('GET', '/etl/status'); }

    // ---- Government Data ----
    async getWeather(city = null) {
        const params = city ? `?city=${encodeURIComponent(city)}` : '';
        return this.request('GET', `/data/weather${params}`);
    }
    async getWeatherWarnings() { return this.request('GET', '/data/weather/warnings'); }
    async getWeatherForecast(city = 'delhi', days = 5) {
        return this.request('GET', `/data/weather/forecast?city=${city}&days=${days}`);
    }
    async getNews(feed = 'pib_english') { return this.request('GET', `/data/news?feed=${feed}`); }
    async getAgriculture(state = null) {
        const params = state ? `?state=${encodeURIComponent(state)}` : '';
        return this.request('GET', `/data/agriculture${params}`);
    }
    async getEconomicData() { return this.request('GET', '/data/economic'); }
    async getSatelliteData() { return this.request('GET', '/data/satellite'); }
    async getElectionData() { return this.request('GET', '/data/election'); }

    // ---- Knowledge Graph ----
    async getGraphData(domain = 'all', region = 'all', limit = 50) {
        return this.request('GET', `/graph/data?domain=${domain}&region=${region}&limit=${limit}`);
    }

    // ---- AI CoPilot ----
    async queryCoPilot(query, persona = 'collector', language = 'en') {
        return this.request('POST', '/copilot/query', { query, persona, language });
    }

    // ---- Grievances ----
    async submitGrievance(data) { return this.request('POST', '/grievances/submit', data); }
    async getGrievanceStats() { return this.request('GET', '/grievances/stats'); }

    // ---- Notifications ----
    async getNotifications(lat = 28.61, lon = 77.23, radius = 1.0) {
        return this.request('GET', `/notifications/geofenced?lat=${lat}&lon=${lon}&radius_km=${radius}`);
    }

    // ---- Admin ----
    async getSystemMetrics() { return this.request('GET', '/admin/system'); }

    // ---- WebSocket ----
    connectWebSocket(onMessage) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

        try {
            this.ws = new WebSocket(`${WS_BASE}/ws/live`);
            this.ws.onopen = () => {
                console.log('[WS] Connected to live feed');
                this.retryCount = 0;
                this.updateWSIndicator(true);
            };
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (onMessage) onMessage(data);
                    this.wsListeners.forEach(fn => fn(data));
                } catch (e) {
                    console.warn('[WS] Parse error:', e);
                }
            };
            this.ws.onclose = () => {
                console.log('[WS] Disconnected');
                this.updateWSIndicator(false);
                if (this.retryCount < 5) {
                    this.retryCount++;
                    setTimeout(() => this.connectWebSocket(onMessage), 3000 * this.retryCount);
                }
            };
            this.ws.onerror = (err) => {
                console.warn('[WS] Error:', err);
                this.updateWSIndicator(false);
            };
        } catch (e) {
            console.warn('[WS] Connection failed:', e);
        }
    }

    addWSListener(fn) { this.wsListeners.push(fn); }

    updateWSIndicator(connected) {
        const badges = document.querySelectorAll('.live-badge');
        badges.forEach(badge => {
            badge.style.color = connected ? '#22c55e' : '#ef4444';
            badge.textContent = connected ? '● LIVE' : '● OFFLINE';
        });
    }
}

// Global API instance
window.bjgAPI = new ViksitNetraAPI();
