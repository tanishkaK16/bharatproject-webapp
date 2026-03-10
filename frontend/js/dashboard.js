/**
 * ViksitNetra — Live Dashboard Controller
 * Manages real-time data updates and interactive dashboard features.
 */

class LiveDashboard {
    constructor() {
        this.refreshInterval = null;
        this.weatherData = [];
        this.newsData = [];
        this.graphData = null;
        this.init();
    }

    async init() {
        // Connect WebSocket for real-time updates
        if (window.bjgAPI) {
            window.bjgAPI.connectWebSocket((data) => this.handleWSUpdate(data));
        }

        // Initial data load
        await this.loadAllData();

        // Periodic refresh every 30 seconds
        this.refreshInterval = setInterval(() => this.refreshKPIs(), 30000);

        // Set up event listeners
        this.setupEventListeners();

        console.log('[Dashboard] Initialized with live data connections');
    }

    async loadAllData() {
        // Load all data in parallel
        const promises = [
            this.loadKPIs(),
            this.loadWeather(),
            this.loadNews(),
            this.loadETLStatus(),
        ];
        await Promise.allSettled(promises);
    }

    // ---- KPI Updates ----
    async loadKPIs() {
        const data = await window.bjgAPI?.getKPIs();
        if (!data) return;
        this.updateKPICards(data);
    }

    async refreshKPIs() {
        await this.loadKPIs();
    }

    updateKPICards(data) {
        const mappings = [
            { selector: '#kpi1 .kpi-value', value: data.active_users, format: 'number' },
            { selector: '#kpi2 .kpi-value', value: data.grievances_resolved, format: 'number' },
            { selector: '#kpi3 .kpi-value', value: data.graph_connections, format: 'millions' },
            { selector: '#kpi4 .kpi-value', value: data.ai_queries_per_hour, format: 'number' },
        ];

        mappings.forEach(({ selector, value, format }) => {
            const el = document.querySelector(selector);
            if (!el) return;
            if (format === 'millions') {
                el.textContent = (value / 1000000).toFixed(1) + 'M';
            } else {
                el.textContent = value.toLocaleString('en-IN');
            }
        });

        // Update additional live indicators
        const etlBadge = document.getElementById('etlRecordsToday');
        if (etlBadge && data.etl_records_today) {
            etlBadge.textContent = data.etl_records_today.toLocaleString('en-IN');
        }
    }

    // ---- Weather ----
    async loadWeather() {
        const data = await window.bjgAPI?.getWeather();
        if (!data || !data.data) return;
        this.weatherData = data.data;
        this.renderWeatherCards(data.data);
    }

    renderWeatherCards(weatherData) {
        const container = document.getElementById('weatherCardsContainer');
        if (!container) return;

        const weatherIcons = {
            'Clear Sky': '☀️', 'Clear': '☀️', 'Partly Cloudy': '⛅',
            'Scattered Showers': '🌦️', 'Light Rain': '🌧️', 'Heavy Rain': '⛈️',
            'Hazy': '🌫️', 'Hot & Dry': '🔥', 'Thunderstorm': '⛈️',
        };

        container.innerHTML = weatherData.slice(0, 6).map(w => {
            const props = w.properties || w;
            const icon = weatherIcons[props.condition] || '🌡️';
            const aqiClass = props.aqi > 150 ? 'aqi-poor' : props.aqi > 100 ? 'aqi-moderate' : 'aqi-good';

            return `
                <div class="weather-card">
                    <div class="weather-city">${icon} ${props.city}</div>
                    <div class="weather-temp">${props.temperature_c || props.temp_c}°C</div>
                    <div class="weather-condition">${props.condition || props.weather_desc}</div>
                    <div class="weather-details">
                        <span>💧 ${props.humidity}%</span>
                        <span>💨 ${props.wind_speed_kmh || props.wind_kmh} km/h</span>
                        <span class="${aqiClass}">AQI: ${props.aqi}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ---- News ----
    async loadNews() {
        const data = await window.bjgAPI?.getNews();
        if (!data || !data.data) return;
        this.newsData = data.data;
        this.renderNewsTicker(data.data);
        this.renderNewsAlerts(data.data);
    }

    renderNewsTicker(newsData) {
        const ticker = document.getElementById('tickerContent');
        if (!ticker || !newsData.length) return;

        ticker.innerHTML = newsData.slice(0, 8).map(item => {
            const props = item.properties || item;
            const icons = {
                'Economics': '📊', 'Defence': '🛡️', 'Governance': '🏛️',
                'Geopolitics': '🌐', 'Climate': '🌍', 'Civic': '🗳️'
            };
            const icon = icons[item.category] || '📰';
            return `<span>${icon} ${props.title}</span>`;
        }).join('');
    }

    renderNewsAlerts(newsData) {
        const alertsList = document.getElementById('alertsList');
        if (!alertsList) return;

        const alertClasses = {
            'Economics': 'alert-orange', 'Defence': 'alert-red',
            'Governance': 'alert-blue', 'Geopolitics': 'alert-blue',
            'Climate': 'alert-green', 'Civic': 'alert-green',
        };

        const severities = {
            'Economics': 'MED', 'Defence': 'HIGH', 'Governance': 'INFO',
            'Geopolitics': 'MED', 'Climate': 'LOW', 'Civic': 'INFO',
        };

        // Keep existing alerts and prepend live ones
        const liveAlerts = newsData.slice(0, 4).map(item => {
            const props = item.properties || item;
            const alertClass = alertClasses[item.category] || 'alert-blue';
            const severity = severities[item.category] || 'INFO';

            return `
                <div class="alert-item ${alertClass}">
                    <div class="alert-icon">📡</div>
                    <div class="alert-body">
                        <strong>${props.title}</strong>
                        <p>${(props.summary || '').substring(0, 120)}...</p>
                    </div>
                    <div class="alert-meta">
                        <span class="alert-badge ${severity === 'HIGH' ? 'high' : severity === 'MED' ? 'medium' : 'low'}">${severity}</span>
                        <span class="alert-time">LIVE</span>
                    </div>
                </div>
            `;
        }).join('');

        // Prepend live alerts
        const existingAlerts = alertsList.innerHTML;
        alertsList.innerHTML = liveAlerts;
    }

    // ---- ETL Status ----
    async loadETLStatus() {
        const data = await window.bjgAPI?.getETLStatus();
        if (!data) return;

        const statusEl = document.getElementById('etlStatusPanel');
        if (statusEl) {
            const connectorsList = Object.entries(data.connectors || {}).map(([name, info]) => {
                const statusIcon = info.status === 'active' ? '🟢' : '🟡';
                return `<div class="etl-connector-item">${statusIcon} <strong>${name}</strong> — Fetches: ${info.fetch_count}</div>`;
            }).join('');

            statusEl.innerHTML = `
                <div class="etl-summary">
                    <span>Pipeline: <strong>${data.pipeline_status}</strong></span>
                    <span>Runs: <strong>${data.run_count}</strong></span>
                    <span>Records: <strong>${data.total_records_processed.toLocaleString()}</strong></span>
                </div>
                <div class="etl-connectors">${connectorsList}</div>
            `;
        }
    }

    // ---- WebSocket Handler ----
    handleWSUpdate(data) {
        if (data.type === 'live_update' && data.data) {
            this.updateKPICards({
                active_users: data.data.active_users,
                grievances_resolved: data.data.grievances_resolved,
                graph_connections: data.data.graph_connections,
                ai_queries_per_hour: data.data.ai_queries,
            });
        }

        // Show live notification
        if (data.alerts) {
            this.showLiveNotification(data.alerts);
        }
    }

    showLiveNotification(alert) {
        if (!alert) return;
        const container = document.getElementById('liveNotifContainer');
        if (!container) return;

        const notif = document.createElement('div');
        notif.className = 'live-notif animate-in';
        notif.innerHTML = `
            <span class="notif-dot"></span>
            <span>${alert.message}</span>
        `;
        container.appendChild(notif);

        setTimeout(() => {
            notif.classList.add('animate-out');
            setTimeout(() => notif.remove(), 500);
        }, 5000);
    }

    // ---- Event Listeners ----
    setupEventListeners() {
        // ETL trigger button
        const etlBtn = document.getElementById('triggerETLBtn');
        if (etlBtn) {
            etlBtn.addEventListener('click', async () => {
                etlBtn.disabled = true;
                etlBtn.textContent = '⏳ Running...';
                const result = await window.bjgAPI?.runETL();
                if (result) {
                    etlBtn.textContent = `✅ ${result.total_records} records`;
                    await this.loadAllData();
                } else {
                    etlBtn.textContent = '❌ Failed';
                }
                setTimeout(() => {
                    etlBtn.disabled = false;
                    etlBtn.textContent = '🔄 Run ETL Pipeline';
                }, 3000);
            });
        }
    }

    destroy() {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.liveDashboard = new LiveDashboard();
});
