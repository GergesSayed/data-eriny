// -*- coding: utf-8 -*-
/**
 * Settings Page Controller — Scraper Configuration UI
 * Manages the scraper settings panel: sectors, areas, performance, grid, and monitoring.
 */

const ScraperSettings = (() => {
    // Default config (matches scraper_config.json structure)
    let config = null;
    const CONFIG_STORAGE_KEY = 'scraper_config';

    // ─── INITIALIZATION ───────────────────────────────────
    async function init() {
        await loadConfig();
        setupTabs();
        setupButtons();
        setupRangeInputs();
        setupGridCalculation();
        renderSectors();
        renderAreas();
        loadProgressStats();
    }

    // ─── CONFIG LOAD/SAVE ─────────────────────────────────
    async function loadConfig() {
        // Try fetching from the Python backend server first
        try {
            const resp = await fetch('http://localhost:8888/api/load-config?' + Date.now());
            if (resp.ok) {
                const data = await resp.json();
                if (data && Object.keys(data).length > 0) {
                    config = data;
                    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
                    return;
                }
            }
        } catch (e) {
            console.log('Skipped server config load, using localStorage/default', e);
        }

        // Try localStorage next
        const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
        if (stored) {
            try {
                config = JSON.parse(stored);
                return;
            } catch(e) {}
        }
        // Use embedded default config
        config = getDefaultConfig();
    }

    async function saveConfig() {
        collectConfigFromUI();
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
        
        // Post to the Python backend server
        let serverSaved = false;
        try {
            const resp = await fetch('http://localhost:8888/api/save-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(config)
            });
            if (resp.ok) {
                const data = await resp.json();
                if (data.status === 'saved') {
                    serverSaved = true;
                }
            }
        } catch (e) {
            console.error('Failed to save config to scraper server:', e);
        }
        
        if (serverSaved) {
            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast('تم حفظ الإعدادات على الخادم مباشرة! 🚀', 'success');
            } else {
                alert('تم حفظ الإعدادات على الخادم مباشرة! 🚀');
            }
        } else {
            // Fallback: download config file
            exportConfig();
            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast('تم حفظ الإعدادات محلياً وتنزيل الملف', 'warning');
            } else {
                alert('تم حفظ الإعدادات محلياً وتنزيل الملف');
            }
        }
    }

    function exportConfig() {
        collectConfigFromUI();
        const blob = new Blob([JSON.stringify(config, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'scraper_config.json';
        a.click();
        URL.revokeObjectURL(url);
        if (typeof App !== 'undefined' && App.showToast) {
            App.showToast('تم تصدير ملف الإعدادات', 'info');
        } else {
            alert('تم تصدير ملف الإعدادات');
        }
    }

    function collectConfigFromUI() {
        if (!config) config = getDefaultConfig();
        
        // Collect sectors
        if (config.sectors) {
            Object.keys(config.sectors).forEach(key => {
                const cb = document.getElementById('sector-' + key);
                if (cb) config.sectors[key].enabled = cb.checked;
            });
        }
        
        // Collect areas
        if (config.focus_areas) {
            Object.keys(config.focus_areas).forEach(key => {
                const cb = document.getElementById('area-' + key);
                if (cb) config.focus_areas[key].enabled = cb.checked;
            });
        }
        
        // Collect performance settings
        const perfMap = {
            'perf-delay-min': 'delay_min',
            'perf-delay-max': 'delay_max',
            'perf-restart-every': 'restart_browser_every',
            'perf-zero-restart': 'max_zero_results_before_restart',
            'perf-zero-backoff': 'max_zero_results_before_backoff',
            'perf-backoff-base': 'backoff_base_seconds',
            'perf-scroll-rounds': 'scroll_rounds',
        };
        if (!config.performance) config.performance = {};
        Object.entries(perfMap).forEach(([elId, cfgKey]) => {
            const el = document.getElementById(elId);
            if (el) config.performance[cfgKey] = parseInt(el.value);
        });
        const headlessEl = document.getElementById('perf-headless');
        if (headlessEl) config.performance.headless = headlessEl.checked;

        // Collect grid settings
        if (!config.grid) config.grid = {};
        const gridEnabled = document.getElementById('grid-enabled');
        if (gridEnabled) config.grid.enabled = gridEnabled.checked;
        
        if (!config.grid.cairo_giza_bounds) config.grid.cairo_giza_bounds = {};
        ['south', 'north', 'west', 'east'].forEach(dir => {
            const el = document.getElementById('grid-' + dir);
            if (el) config.grid.cairo_giza_bounds[dir] = parseFloat(el.value);
        });
        const gridRows = document.getElementById('grid-rows');
        const gridCols = document.getElementById('grid-cols');
        if (gridRows) config.grid.rows = parseInt(gridRows.value);
        if (gridCols) config.grid.cols = parseInt(gridCols.value);
    }

    // ─── TAB MANAGEMENT ───────────────────────────────────
    function setupTabs() {
        document.querySelectorAll('.scraper-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.scraper-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.scraper-tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                const targetId = tab.getAttribute('data-tab');
                const targetEl = document.getElementById(targetId);
                if (targetEl) targetEl.classList.add('active');
                
                // Auto-refresh monitor when switching to it
                if (targetId === 'tab-monitor') {
                    loadProgressStats();
                }
            });
        });
    }

    // ─── BUTTONS ──────────────────────────────────────────
    function setupButtons() {
        const btnSave = document.getElementById('btn-save-scraper-config');
        if (btnSave) btnSave.addEventListener('click', saveConfig);

        const btnExport = document.getElementById('btn-export-config');
        if (btnExport) btnExport.addEventListener('click', exportConfig);

        const btnSelectAll = document.getElementById('btn-select-all-sectors');
        if (btnSelectAll) btnSelectAll.addEventListener('click', () => toggleAllSectors(true));

        const btnDeselectAll = document.getElementById('btn-deselect-all-sectors');
        if (btnDeselectAll) btnDeselectAll.addEventListener('click', () => toggleAllSectors(false));

        const btnFleetOnly = document.getElementById('btn-select-fleet-sectors');
        if (btnFleetOnly) btnFleetOnly.addEventListener('click', selectFleetSectorsOnly);

        const btnSelectAllAreas = document.getElementById('btn-select-all-areas');
        if (btnSelectAllAreas) btnSelectAllAreas.addEventListener('click', () => toggleAllAreas(true));

        const btnDeselectAllAreas = document.getElementById('btn-deselect-all-areas');
        if (btnDeselectAllAreas) btnDeselectAllAreas.addEventListener('click', () => toggleAllAreas(false));

        const btnRefresh = document.getElementById('btn-refresh-monitor');
        if (btnRefresh) btnRefresh.addEventListener('click', loadProgressStats);
    }

    // ─── RANGE INPUTS ─────────────────────────────────────
    function setupRangeInputs() {
        const ranges = [
            { id: 'perf-delay-min', suffix: 's' },
            { id: 'perf-delay-max', suffix: 's' },
            { id: 'perf-restart-every', suffix: '' },
            { id: 'perf-zero-restart', suffix: '' },
            { id: 'perf-zero-backoff', suffix: '' },
            { id: 'perf-backoff-base', suffix: 's' },
            { id: 'perf-scroll-rounds', suffix: '' },
        ];
        ranges.forEach(({id, suffix}) => {
            const el = document.getElementById(id);
            const valEl = document.getElementById(id + '-val');
            if (el && valEl) {
                // Set initial value from config
                const cfgKey = {
                    'perf-delay-min': 'delay_min',
                    'perf-delay-max': 'delay_max',
                    'perf-restart-every': 'restart_browser_every',
                    'perf-zero-restart': 'max_zero_results_before_restart',
                    'perf-zero-backoff': 'max_zero_results_before_backoff',
                    'perf-backoff-base': 'backoff_base_seconds',
                    'perf-scroll-rounds': 'scroll_rounds',
                }[id];
                if (config && config.performance && config.performance[cfgKey] !== undefined) {
                    el.value = config.performance[cfgKey];
                }
                valEl.textContent = el.value + suffix;
                el.addEventListener('input', () => {
                    valEl.textContent = el.value + suffix;
                });
            }
        });
        
        // Set headless checkbox
        const headless = document.getElementById('perf-headless');
        if (headless && config && config.performance) {
            headless.checked = config.performance.headless !== false;
        }
    }

    // ─── GRID CALCULATION ─────────────────────────────────
    function setupGridCalculation() {
        const rowsEl = document.getElementById('grid-rows');
        const colsEl = document.getElementById('grid-cols');
        const totalEl = document.getElementById('grid-total-cells');
        
        function updateTotal() {
            const r = parseInt(rowsEl?.value || 7);
            const c = parseInt(colsEl?.value || 9);
            if (totalEl) totalEl.textContent = (r * c).toLocaleString();
        }
        
        if (rowsEl) rowsEl.addEventListener('input', updateTotal);
        if (colsEl) colsEl.addEventListener('input', updateTotal);
        
        // Load grid config
        if (config && config.grid) {
            const g = config.grid;
            if (g.cairo_giza_bounds) {
                ['south', 'north', 'west', 'east'].forEach(dir => {
                    const el = document.getElementById('grid-' + dir);
                    if (el && g.cairo_giza_bounds[dir] !== undefined) el.value = g.cairo_giza_bounds[dir];
                });
            }
            if (rowsEl && g.rows) rowsEl.value = g.rows;
            if (colsEl && g.cols) colsEl.value = g.cols;
            const gridEnabled = document.getElementById('grid-enabled');
            if (gridEnabled) gridEnabled.checked = g.enabled !== false;
        }
        updateTotal();
    }

    // ─── RENDER SECTORS ───────────────────────────────────
    function renderSectors() {
        const container = document.getElementById('sectors-checkboxes');
        if (!container || !config || !config.sectors) return;
        
        const priorityColors = {
            'A+': '#ef4444', 'A': '#f97316', 'B': '#eab308', 'C': '#6b7280'
        };
        const priorityLabels = {
            'A+': '🔴 A+ أسطول مؤكد',
            'A': '🟠 A أسطول مرجح',
            'B': '🟡 B أسطول محتمل',
            'C': '⚪ C أسطول ممكن'
        };

        let html = '';
        // Group by priority
        const groups = {};
        Object.entries(config.sectors).forEach(([key, sector]) => {
            const p = sector.priority || 'C';
            if (!groups[p]) groups[p] = [];
            groups[p].push({key, ...sector});
        });

        ['A+', 'A', 'B', 'C'].forEach(priority => {
            if (!groups[priority]) return;
            html += `<div class="settings-section">
                <h4 style="color:${priorityColors[priority]}; margin-bottom:0.5rem;">
                    ${priorityLabels[priority]}
                </h4>
                <div class="checkbox-grid">`;
            
            groups[priority].forEach(sector => {
                const checked = sector.enabled !== false ? 'checked' : '';
                const queryCount = (sector.queries || []).length;
                html += `
                    <label class="checkbox-card" title="${(sector.queries||[]).join(', ')}">
                        <input type="checkbox" id="sector-${sector.key}" ${checked}>
                        <div class="checkbox-card-content">
                            <strong>${sector.name || sector.key}</strong>
                            <small>${queryCount} queries</small>
                        </div>
                    </label>`;
            });
            
            html += `</div></div>`;
        });
        
        container.innerHTML = html;
    }

    // ─── RENDER AREAS ─────────────────────────────────────
    function renderAreas() {
        const container = document.getElementById('areas-checkboxes');
        if (!container || !config || !config.focus_areas) return;
        
        let html = '<div class="checkbox-grid">';
        Object.entries(config.focus_areas).forEach(([key, area]) => {
            const checked = area.enabled !== false ? 'checked' : '';
            const cities = (area.cities || []).join('، ');
            html += `
                <label class="checkbox-card area-card" title="${cities}">
                    <input type="checkbox" id="area-${key}" ${checked}>
                    <div class="checkbox-card-content">
                        <strong><i class="fas fa-map-marker-alt"></i> ${area.name || key}</strong>
                        <small>${(area.cities || []).length} مدينة</small>
                        <div class="area-cities">${cities}</div>
                    </div>
                </label>`;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    // ─── TOGGLE HELPERS ───────────────────────────────────
    function toggleAllSectors(state) {
        document.querySelectorAll('#sectors-checkboxes input[type="checkbox"]').forEach(cb => {
            cb.checked = state;
        });
    }

    function toggleAllAreas(state) {
        document.querySelectorAll('#areas-checkboxes input[type="checkbox"]').forEach(cb => {
            cb.checked = state;
        });
    }

    function selectFleetSectorsOnly() {
        if (!config || !config.sectors) return;
        Object.entries(config.sectors).forEach(([key, sector]) => {
            const cb = document.getElementById('sector-' + key);
            if (cb) {
                cb.checked = (sector.priority === 'A+' || sector.priority === 'A');
            }
        });
    }

    // ─── LOAD PROGRESS STATS ──────────────────────────────
    function loadProgressStats() {
        // Load from companies data
        try {
            const companies = (typeof Storage !== 'undefined' && Storage.getCompanies)
                ? Storage.getCompanies() : [];
            
            const totalEl = document.getElementById('scraper-total-companies');
            const phoneEl = document.getElementById('scraper-with-phone');
            const searchEl = document.getElementById('scraper-total-searches');
            const lastEl = document.getElementById('scraper-last-update');

            if (totalEl) totalEl.textContent = companies.length.toLocaleString();
            if (phoneEl) {
                const withPhone = companies.filter(c => c.phone1).length;
                phoneEl.textContent = withPhone.toLocaleString();
            }
            
            // Count unique sectors for stats display
            const sectorCounts = {};
            companies.forEach(c => {
                const s = c.sector || 'unknown';
                sectorCounts[s] = (sectorCounts[s] || 0) + 1;
            });

            // Render sector stats in monitor tab
            const statsGrid = document.getElementById('sector-stats-grid');
            if (statsGrid) {
                let html = '';
                const sorted = Object.entries(sectorCounts).sort((a,b) => b[1] - a[1]);
                sorted.forEach(([sector, count]) => {
                    html += `
                        <div class="mini-stat-card">
                            <strong>${sector}</strong>
                            <span class="badge badge-primary">${count.toLocaleString()}</span>
                        </div>`;
                });
                statsGrid.innerHTML = html;
            }

            if (searchEl) searchEl.textContent = '—';
            if (lastEl) lastEl.textContent = new Date().toLocaleDateString('ar-EG');

        } catch(e) {
            console.warn('Settings: Could not load progress stats', e);
        }
    }

    // ─── DEFAULT CONFIG ───────────────────────────────────
    function getDefaultConfig() {
        return {
            mode: 'exhaustive',
            max_companies: 0,
            focus_areas: {
                cairo_central: { enabled: true, name: 'وسط القاهرة', cities: ['القاهرة', 'وسط البلد', 'عابدين'] },
                cairo_east: { enabled: true, name: 'شرق القاهرة', cities: ['مدينة نصر', 'مصر الجديدة', 'المعادي', 'عين شمس'] },
                cairo_north: { enabled: true, name: 'شمال القاهرة', cities: ['شبرا', 'شبرا الخيمة', 'السلام'] },
                cairo_south: { enabled: true, name: 'جنوب القاهرة', cities: ['حلوان', 'التبين', '15 مايو'] },
                new_cairo: { enabled: true, name: 'القاهرة الجديدة', cities: ['التجمع الخامس', 'الشروق', 'بدر', 'العبور'] },
                giza_central: { enabled: true, name: 'وسط الجيزة', cities: ['الجيزة', 'الدقي', 'المهندسين', 'فيصل', 'الهرم'] },
                giza_west: { enabled: true, name: 'غرب الجيزة', cities: ['6 أكتوبر', 'الشيخ زايد', 'أبو رواش'] },
                giza_south: { enabled: true, name: 'جنوب الجيزة', cities: ['الحوامدية', 'البدرشين'] },
                industrial_zones: { enabled: true, name: 'المناطق الصناعية', cities: ['المنطقة الصناعية 6 أكتوبر', 'المنطقة الصناعية العاشر'] },
                qalyubia: { enabled: true, name: 'القليوبية', cities: ['بنها', 'شبرا الخيمة', 'قليوب'] },
            },
            sectors: {
                transport_freight: { enabled: true, priority: 'A+', name: 'نقل بضائع وشحن بري', queries: ['شركة نقل بضائع', 'شحن بري'] },
                shipping: { enabled: true, priority: 'A+', name: 'شحن دولي', queries: ['شركة شحن', 'freight forwarding'] },
                logistics: { enabled: true, priority: 'A+', name: 'لوجستيات', queries: ['شركة لوجستيات', 'logistics company'] },
                courier: { enabled: true, priority: 'A+', name: 'شحن سريع', queries: ['شركة شحن سريع', 'courier company'] },
                delivery: { enabled: true, priority: 'A+', name: 'توصيل', queries: ['شركة توصيل', 'delivery company'] },
                bus_company: { enabled: true, priority: 'A+', name: 'نقل ركاب', queries: ['شركة أتوبيسات', 'نقل ركاب'] },
                car_rental: { enabled: true, priority: 'A+', name: 'تأجير سيارات', queries: ['تأجير سيارات', 'car rental'] },
                limousine: { enabled: true, priority: 'A+', name: 'ليموزين', queries: ['شركة ليموزين'] },
                moving_company: { enabled: true, priority: 'A+', name: 'نقل أثاث', queries: ['شركة نقل اثاث'] },
                refrigerated: { enabled: true, priority: 'A+', name: 'نقل مبرد', queries: ['نقل مبرد', 'cold chain'] },
                security: { enabled: true, priority: 'A', name: 'أمن وحراسة', queries: ['شركة أمن', 'security company'] },
                waste_management: { enabled: true, priority: 'A', name: 'إدارة مخلفات', queries: ['إدارة مخلفات', 'waste management'] },
                food_factory: { enabled: true, priority: 'B', name: 'مصانع أغذية', queries: ['مصنع أغذية'] },
                pharma_company: { enabled: true, priority: 'B', name: 'شركات أدوية', queries: ['شركة أدوية'] },
                construction: { enabled: true, priority: 'B', name: 'مقاولات', queries: ['شركة مقاولات'] },
                hospital: { enabled: true, priority: 'B', name: 'مستشفيات', queries: ['مستشفى خاص'] },
            },
            performance: {
                delay_min: 4, delay_max: 9,
                restart_browser_every: 50,
                max_zero_results_before_restart: 3,
                max_zero_results_before_backoff: 5,
                backoff_base_seconds: 120,
                scroll_rounds: 10,
                headless: true
            },
            grid: {
                enabled: true,
                cairo_giza_bounds: { south: 29.85, north: 30.20, west: 31.05, east: 31.50 },
                rows: 7, cols: 9
            }
        };
    }

    // Public API
    return { init, loadProgressStats };
})();

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Delay init slightly to let other scripts load
    setTimeout(() => ScraperSettings.init(), 500);
});
