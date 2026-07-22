/* ============================================
   Scraper Dashboard — Fleet CRM
   Real-time data collection monitoring & auto-sync
   ============================================ */

const ScraperPage = {
    SCRAPER_URL: 'http://localhost:8888/output/crm_import_ready.json',
    PROGRESS_URL: 'http://localhost:8888/output/_ultra_progress.json',
    refreshInterval: null,
    syncInterval: null,
    history: [],
    startTime: Date.now(),
    activeLog: 'scraper',

    setActiveLog(target) {
        this.activeLog = target;
        const btnSc = document.getElementById('btn-show-scraper-log');
        const btnEn = document.getElementById('btn-show-enricher-log');
        if (btnSc && btnEn) {
            if (target === 'scraper') {
                btnSc.style.background = '#7c3aed';
                btnSc.style.color = '#fff';
                btnEn.style.background = 'var(--bg-tertiary)';
                btnEn.style.color = 'var(--text-secondary)';
            } else {
                btnEn.style.background = '#7c3aed';
                btnEn.style.color = '#fff';
                btnSc.style.background = 'var(--bg-tertiary)';
                btnSc.style.color = 'var(--text-secondary)';
            }
        }
        this.fetchData();
    },

    render() {
        const main = document.getElementById('scraper-content');
        main.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <h1><i class="fas fa-download"></i> سحب البيانات <span class="en-subtitle">Data Collector</span></h1>
                <p>متابعة سحب البيانات مباشرة مع التحديث التلقائي</p>
            </div>
        </div>

        <!-- Live Status Bar -->
        <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); border-radius: 16px; padding: 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div id="scraper-status-dot" style="width:14px;height:14px;border-radius:50%;background:#4ade80;animation:pulse 2s infinite;"></div>
                <span style="font-size:18px;font-weight:700;color:#fff;" id="scraper-status-text">جاري الفحص...</span>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button id="btn-toggle-scraper" onclick="ScraperPage.toggleProcess('scraper')" style="background:#10b981;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">
                    <i class="fas fa-play"></i> تشغيل السكرابر (Maps)
                </button>
                <button id="btn-toggle-enricher" onclick="ScraperPage.toggleProcess('enricher')" style="background:#0077b5;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">
                    <i class="fab fa-linkedin"></i> تشغيل إثراء LinkedIn
                </button>
                <button onclick="ScraperPage.syncNow()" style="background:rgba(255,255,255,0.2);color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:14px;">
                    <i class="fas fa-sync-alt"></i> تحديث الإحصائيات
                </button>
                <button onclick="ScraperPage.forceReload()" style="background:rgba(255,255,255,0.2);color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:14px;">
                    <i class="fas fa-database"></i> تحميل في CRM
                </button>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom: 24px;">
            <div class="stat-card" style="border-right: 4px solid #7c3aed;">
                <div class="stat-icon" style="background: rgba(124,58,237,0.15); color: #7c3aed;">
                    <i class="fas fa-building"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-number" id="sc-total" style="color:#7c3aed;">0</div>
                    <div class="stat-label">إجمالي الشركات</div>
                </div>
            </div>
            <div class="stat-card" style="border-right: 4px solid #10b981;">
                <div class="stat-icon" style="background: rgba(16,185,129,0.15); color: #10b981;">
                    <i class="fas fa-phone-alt"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-number" id="sc-phones" style="color:#10b981;">0</div>
                    <div class="stat-label">بأرقام تليفون</div>
                </div>
            </div>
            <div class="stat-card" style="border-right: 4px solid #0077b5;">
                <div class="stat-icon" style="background: rgba(0,119,181,0.15); color: #0077b5;">
                    <i class="fab fa-linkedin"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-number" id="sc-linkedin" style="color:#0077b5;">0</div>
                    <div class="stat-label">مُثرى بـ LinkedIn</div>
                </div>
            </div>
            <div class="stat-card" style="border-right: 4px solid #3b82f6;">
                <div class="stat-icon" style="background: rgba(59,130,246,0.15); color: #3b82f6;">
                    <i class="fas fa-search"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-number" id="sc-searches" style="color:#3b82f6;">0</div>
                    <div class="stat-label">عمليات بحث</div>
                </div>
            </div>
            <div class="stat-card" style="border-right: 4px solid #f59e0b;">
                <div class="stat-icon" style="background: rgba(245,158,11,0.15); color: #f59e0b;">
                    <i class="fas fa-tachometer-alt"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-number" id="sc-speed" style="color:#f59e0b;">0</div>
                    <div class="stat-label">شركة / دقيقة</div>
                </div>
            </div>
            <div class="stat-card" style="border-right: 4px solid #ec4899;">
                <div class="stat-icon" style="background: rgba(236,72,153,0.15); color: #ec4899;">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-info">
                    <div class="stat-number" id="sc-eta" style="color:#ec4899;">—</div>
                    <div class="stat-label">الوقت المتبقي</div>
                </div>
            </div>
        </div>

        <!-- Progress Bar -->
        <div class="card" style="margin-bottom: 24px;">
            <div class="card-header">
                <h3><i class="fas fa-chart-line"></i> التقدم نحو الهدف</h3>
                <span id="sc-target-label" style="color: var(--text-secondary);">الهدف: جاري التحميل...</span>
            </div>
            <div class="card-body">
                <div style="background: var(--bg-tertiary); border-radius: 999px; height: 36px; overflow: hidden; position: relative;">
                    <div id="sc-progress-bar" style="height:100%;background:linear-gradient(90deg,#7c3aed,#a78bfa,#818cf8);border-radius:999px;transition:width 1s ease;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;min-width:50px;width:0%;">0%</div>
                </div>
                <div id="sc-scale-labels" style="display:flex;justify-content:space-between;margin-top:8px;font-size:12px;color:var(--text-muted);">
                    <span>0</span><span>20,000</span><span>40,000</span><span>60,000</span><span>80,000</span><span>100,000</span><span>120,000</span><span>140,000</span><span>160,000</span><span>180,000</span><span>200,000</span>
                </div>
            </div>
        </div>

        <!-- Three columns: Sectors + Recent Companies + Recent LinkedIn Enriched -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            <!-- Sectors -->
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-th-large"></i> القطاعات</h3>
                </div>
                <div class="card-body" id="sc-sectors" style="max-height: 400px; overflow-y: auto;"></div>
            </div>

            <!-- Recent Companies -->
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-clock"></i> آخر الشركات المضافة</h3>
                    <span id="sc-last-update" style="color: var(--text-secondary); font-size: 12px;">—</span>
                </div>
                <div class="card-body" id="sc-recent" style="max-height: 400px; overflow-y: auto;"></div>
            </div>

            <!-- Recent LinkedIn Enriched -->
            <div class="card">
                <div class="card-header" style="border-bottom: 2px solid #0077b5;">
                    <h3 style="color:#0077b5;"><i class="fab fa-linkedin"></i> آخر إثراء من LinkedIn</h3>
                </div>
                <div class="card-body" id="sc-recent-linkedin" style="max-height: 400px; overflow-y: auto;"></div>
            </div>
        </div>

        <!-- Live Terminal Logs -->
        <div class="card" style="margin-top: 20px; border:1px solid rgba(124,58,237,0.2);">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <h3 style="color:#4ade80;"><i class="fas fa-terminal"></i> سجل السحب والتشغيل اللحظي (Live Logs)</h3>
                <div style="display:flex; gap:8px;">
                    <button id="btn-show-scraper-log" onclick="ScraperPage.setActiveLog('scraper')" style="background:#7c3aed; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600; transition:all 0.2s;">سجل الخرائط (Maps)</button>
                    <button id="btn-show-enricher-log" onclick="ScraperPage.setActiveLog('enricher')" style="background:var(--bg-tertiary); color:var(--text-secondary); border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600; transition:all 0.2s;">سجل الإثراء (LinkedIn/FB)</button>
                </div>
            </div>
            <div class="card-body" style="padding: 0; background: #000;">
                <pre id="sc-live-terminal" style="margin: 0; padding: 16px; background: #000; color: #4ade80; font-family: 'Consolas', 'Courier New', monospace; font-size: 0.82rem; line-height: 1.5; max-height: 250px; overflow-y: auto; text-align: left; direction: ltr; white-space: pre-wrap; height:250px;">Loading live logs...</pre>
            </div>
        </div>

        <!-- CRM Sync Status -->
        <div class="card" style="margin-top: 20px;">
            <div class="card-header">
                <h3><i class="fas fa-database"></i> حالة المزامنة مع CRM</h3>
            </div>
            <div class="card-body" id="sc-sync-status">
                <p style="color: var(--text-secondary);">جاري الفحص...</p>
            </div>
        </div>
        `;

        // Bind header controls dynamically
        const headerScraper = document.getElementById('btn-toggle-scraper-header');
        const headerEnricher = document.getElementById('btn-toggle-enricher-header');
        if (headerScraper) {
            headerScraper.onclick = () => this.toggleProcess('scraper');
        }
        if (headerEnricher) {
            headerEnricher.onclick = () => this.toggleProcess('enricher');
        }

        // Start auto-refresh (4s interval for instant live updates)
        this.fetchData();
        this.refreshInterval = setInterval(() => this.fetchData(), 4000);
        // Auto-sync to CRM every 5 seconds while on page
        this.syncInterval = setInterval(() => this.autoSync(), 5000);
    },

    destroy() {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        if (this.syncInterval) clearInterval(this.syncInterval);
    },

    async fetchData() {
        try {
            // Fetch progress & stats from optimized endpoint (returns counts and slices instead of 11MB file)
            const statsResp = await fetch('http://localhost:8888/api/scraper-stats?' + Date.now());
            let statsData = null;
            if (statsResp.ok) statsData = await statsResp.json();

            if (statsData) {
                this.updateUI(statsData);
            }

            // Fetch active log text terminal
            const logUrl = this.activeLog === 'scraper' 
                ? 'http://localhost:8888/output/scraper.log'
                : 'http://localhost:8888/output/enricher.log';
            const logResp = await fetch(logUrl + '?' + Date.now());
            if (logResp.ok) {
                const logText = await logResp.text();
                const term = document.getElementById('sc-live-terminal');
                if (term) {
                    term.textContent = logText || 'No logs recorded yet.';
                    term.scrollTop = term.scrollHeight;
                }
            }
        } catch (err) {
            document.getElementById('scraper-status-text').textContent = '⏸ السكرابر متوقف — شغّله من الواجهة';
            document.getElementById('scraper-status-dot').style.background = '#ef4444';
            document.getElementById('scraper-status-dot').style.animation = 'none';
        }
    },

    updateUI(statsData) {
        const total = statsData.total;
        const withPhone = statsData.with_phone;
        const searches = statsData.completed_searches_count;
        const target = statsData.target || 200000;
        const stats = statsData.stats || {};
        const recent = statsData.recent_companies || [];
        const recentEnriched = statsData.recent_linkedin || [];

        // Status & active run check
        this.updateProcessButtons();

        // Stats
        document.getElementById('sc-total').textContent = total.toLocaleString();
        document.getElementById('sc-phones').textContent = withPhone.toLocaleString();
        document.getElementById('sc-linkedin').textContent = (statsData.with_linkedin || 0).toLocaleString();
        document.getElementById('sc-searches').textContent = searches.toLocaleString();

        // Speed
        this.history.push({ time: Date.now(), count: total });
        if (this.history.length > 15) this.history.shift();
        if (this.history.length >= 2) {
            const first = this.history[0];
            const last = this.history[this.history.length - 1];
            const elapsed = (last.time - first.time) / 60000;
            const gained = last.count - first.count;
            const speed = elapsed > 0 ? Math.round(gained / elapsed) : 0;
            document.getElementById('sc-speed').textContent = speed;

            if (speed > 0) {
                const remaining = target - total;
                const etaMin = remaining / speed;
                document.getElementById('sc-eta').textContent = etaMin < 60
                    ? Math.round(etaMin) + ' دقيقة'
                    : (etaMin / 60).toFixed(1) + ' ساعة';
            }
        }

        // Progress bar
        const pct = Math.min((total / target) * 100, 100);
        document.getElementById('sc-progress-bar').style.width = pct + '%';
        document.getElementById('sc-progress-bar').textContent = pct.toFixed(1) + '%';
        document.getElementById('sc-target-label').textContent = `الهدف: ${target.toLocaleString()} شركة`;

        // Update scale labels dynamically based on target
        const scaleLabels = document.getElementById('sc-scale-labels');
        if (scaleLabels) {
            const steps = 6;
            let spans = '';
            for (let i = 0; i <= steps; i++) {
                const val = Math.round((target / steps) * i);
                spans += `<span>${val.toLocaleString()}</span>`;
            }
            scaleLabels.innerHTML = spans;
        }

        // Sectors
        const sortedStats = Object.entries(stats).sort((a, b) => b[1] - a[1]);
        document.getElementById('sc-sectors').innerHTML = sortedStats.length > 0
            ? sortedStats.map(([name, count]) => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;margin:4px 0;background:var(--bg-tertiary);border-radius:8px;">
                    <span style="font-size:13px; font-weight:600; color:var(--text-primary);"><i class="fas fa-industry" style="color:#7c3aed;margin-left:6px;font-size:10px;"></i>${Storage.getScraperSectorAr(name)}</span>
                    <span style="background:#7c3aed;color:#fff;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:700;">${count.toLocaleString()}</span>
                </div>
            `).join('')
            : '<p style="color:var(--text-muted);text-align:center;padding:20px;">لا توجد بيانات بعد</p>';

        // Recent companies (already sliced in backend)
        const recentReversed = [...recent].reverse();
        document.getElementById('sc-recent').innerHTML = recentReversed.length > 0
            ? recentReversed.map(c => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;margin:4px 0;background:var(--bg-tertiary);border-radius:8px;">
                    <div>
                        <div style="font-size:13px;font-weight:600;">${c.nameAr || c.nameEn || '—'}</div>
                        <div style="font-size:11px;color:var(--text-muted);">${Storage.getCityLabel(c.city)} • ${Storage.getSectorLabel(c.sector)}</div>
                    </div>
                    <span style="font-size:12px;color:${c.phone1 ? '#10b981' : '#ef4444'};">${c.phone1 || 'بدون رقم'}</span>
                </div>
            `).join('')
            : '<p style="color:var(--text-muted);text-align:center;padding:20px;">لا توجد بيانات بعد</p>';

        // Recent LinkedIn Enriched (already filtered/sliced in backend)
        const linkedinReversed = [...recentEnriched].reverse();
        document.getElementById('sc-recent-linkedin').innerHTML = linkedinReversed.length > 0
            ? linkedinReversed.map(c => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;margin:4px 0;background:var(--bg-tertiary);border-radius:8px;">
                    <div>
                        <div style="font-size:13px;font-weight:600;display:flex;align-items:center;gap:4px;">
                            <span>${c.nameAr || c.nameEn || '—'}</span>
                            ${(c.linkedinUrl || c.linkedin) ? `<a href="${c.linkedinUrl || c.linkedin}" target="_blank" style="color:#0077b5;font-size:12px;"><i class="fab fa-linkedin"></i></a>` : ''}
                        </div>
                        <div style="font-size:11px;color:var(--text-muted);">${c.contactPerson || 'بدون مسؤول'} ${c.contactTitle ? '• ' + c.contactTitle : ''}</div>
                    </div>
                    ${c.linkedinContactUrl ? `
                        <a href="${c.linkedinContactUrl}" target="_blank" style="background:#0077b5;color:#fff;padding:4px 8px;border-radius:6px;font-size:10px;text-decoration:none;display:flex;align-items:center;gap:4px;">
                            <i class="fab fa-linkedin"></i> المسؤول
                        </a>
                    ` : '<span style="font-size:10px;color:var(--text-muted);">لا يوجد مسؤول</span>'}
                </div>
            `).join('')
            : '<p style="color:var(--text-muted);text-align:center;padding:20px;">لم يتم إثراء شركات بعد</p>';

        // CRM Sync status
        const crmCount = Storage.getCompanies().length;
        document.getElementById('sc-sync-status').innerHTML = `
            <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
                <div style="padding:12px 20px;background:var(--bg-tertiary);border-radius:10px;">
                    <span style="color:var(--text-muted);font-size:12px;">في السكرابر</span><br>
                    <span style="font-size:22px;font-weight:700;color:#7c3aed;">${total.toLocaleString()}</span>
                </div>
                <i class="fas fa-arrow-left" style="color:var(--text-muted);font-size:20px;"></i>
                <div style="padding:12px 20px;background:var(--bg-tertiary);border-radius:10px;">
                    <span style="color:var(--text-muted);font-size:12px;">في CRM</span><br>
                    <span style="font-size:22px;font-weight:700;color:#10b981;">${crmCount.toLocaleString()}</span>
                </div>
                <div style="margin-right:auto;padding:8px 16px;background:${crmCount >= total ? '#166534' : '#7f1d1d'};color:${crmCount >= total ? '#4ade80' : '#fca5a5'};border-radius:8px;font-size:13px;">
                    ${crmCount >= total ? '✅ متزامن' : '⚠️ يحتاج تحديث — اضغط "تحميل في CRM"'}
                </div>
            </div>
        `;

        document.getElementById('sc-last-update').textContent = 'تحديث: ' + new Date().toLocaleTimeString('ar-EG');
    },

    async syncNow() {
        await this.fetchData();
    },

    async forceReload() {
        try {
            const resp = await fetch(this.SCRAPER_URL + '?' + Date.now());
            if (!resp.ok) throw new Error('Server not running');
            const data = await resp.json();
            if (data) {
                if (data.length === 0) {
                    if (confirm('⚠️ هل تريد مسح جميع البيانات الحالية في الـ CRM لمزامنة الحالة الفارغة؟')) {
                        Storage.clearAll();
                        alert('✅ تم مسح قاعدة بيانات الـ CRM بنجاح!');
                        this.fetchData();
                        document.getElementById('sidebar-total-companies').textContent = 0;
                    }
                    return;
                }
                const formatted = data.map((c, i) => {
                    const company = { ...c };
                    if (!company.id) company.id = 'imp_' + Date.now() + '_' + i;
                    if (!company.nameAr) company.nameAr = '';
                    if (!company.nameEn) company.nameEn = '';
                    if (!company.sector) company.sector = 'manufacturing';
                    if (!company.city) company.city = 'cairo';
                    if (!company.phone1) company.phone1 = '';
                    if (!company.phone2) company.phone2 = '';
                    if (!company.email) company.email = '';
                    if (!company.website) company.website = '';
                    if (!company.address) company.address = '';
                    if (company.fleetSize === undefined) company.fleetSize = 0;
                    if (!company.contactPerson) company.contactPerson = '';
                    if (!company.contactTitle) company.contactTitle = '';
                    company.priority = Storage.calculatePriority(company.sector);
                    if (!company.status) company.status = 'new';
                    if (!company.notes) company.notes = 'Source: ' + (company.source || 'scraper');
                    if (!company.createdAt) company.createdAt = new Date().toISOString();
                    if (!company.lastUpdated) company.lastUpdated = new Date().toISOString().split('T')[0];
                    return company;
                });
                Storage.setCompanies(formatted);
                alert(`✅ تم تحميل ${formatted.length.toLocaleString()} شركة في CRM!`);
                this.fetchData();
                document.getElementById('sidebar-total-companies').textContent = formatted.length;
            }
        } catch (err) {
            console.error('Reload error:', err);
            alert('❌ فشل تحميل البيانات: ' + err.message);
        }
    },

    async autoSync() {
        try {
            // Check counts and timestamp using the lightweight stats API first
            const statsResp = await fetch('http://localhost:8888/api/scraper-stats?' + Date.now());
            if (!statsResp.ok) return;
            const stats = await statsResp.json();
            
            const lastImportMtime = Number(localStorage.getItem('fleetcrm_last_import_mtime') || '0');
            const hasNewData = stats.last_mtime_crm && stats.last_mtime_crm !== lastImportMtime;
            const crmCount = Storage.getCompanies().length;
            const hasNewCount = stats.total && stats.total !== crmCount;
            
            if (hasNewData || hasNewCount) {
                // Fetch the full file
                const resp = await fetch(this.SCRAPER_URL + '?' + Date.now());
                if (!resp.ok) return;
                const data = await resp.json();
                
                const formatted = data.map((c, i) => {
                    const company = { ...c };
                    if (!company.id) company.id = 'imp_' + Date.now() + '_' + i;
                    if (!company.nameAr) company.nameAr = '';
                    if (!company.nameEn) company.nameEn = '';
                    company.sector = Storage.mapScraperSectorToCRM(c.sector);
                    company.city = Storage.mapScraperCityToCRM(c.city);
                    if (!company.phone1) company.phone1 = '';
                    if (!company.phone2) company.phone2 = '';
                    if (!company.email) company.email = '';
                    if (!company.website) company.website = '';
                    if (!company.address) company.address = '';
                    if (company.fleetSize === undefined) company.fleetSize = 0;
                    if (!company.contactPerson) company.contactPerson = '';
                    if (!company.contactTitle) company.contactTitle = '';
                    company.priority = Storage.calculatePriority(company.sector);
                    if (!company.status) company.status = 'new';
                    if (!company.notes) company.notes = 'Source: ' + (company.source || 'scraper');
                    if (!company.createdAt) company.createdAt = new Date().toISOString();
                    if (!company.lastUpdated) company.lastUpdated = new Date().toISOString().split('T')[0];
                    return company;
                });
                
                await Storage.addCompanies(formatted);
                if (stats.last_mtime_crm) {
                    localStorage.setItem('fleetcrm_last_import_mtime', stats.last_mtime_crm.toString());
                }
                console.log(`🔄 Auto-synced and merged ${formatted.length} companies to CRM`);
                
                const sideCounter = document.getElementById('sidebar-total-companies');
                if (sideCounter) sideCounter.textContent = Storage.getCompanies().length.toLocaleString();
                
                this.fetchData();
            }
        } catch (e) {
            console.error('AutoSync failed:', e);
        }
    },

    async toggleProcess(type) {
        try {
            const statusResp = await fetch('http://localhost:8888/api/status');
            if (!statusResp.ok) return;
            const status = await statusResp.json();
            
            const isRunning = type === 'scraper' ? status.scraper_running : status.enricher_running;
            
            if (isRunning) {
                if (confirm(`هل تريد إيقاف ${type === 'scraper' ? 'السكرابر (Google Maps)' : 'إثراء LinkedIn'}؟`)) {
                    const resp = await fetch(`http://localhost:8888/api/stop?target=${type}`);
                    const data = await resp.json();
                    if (data.status === 'stopped') {
                        App.showToast('تم إيقاف العملية بنجاح', 'info');
                    }
                }
            } else {
                const resp = await fetch(`http://localhost:8888/api/run-${type}`);
                const data = await resp.json();
                if (data.status === 'started') {
                    App.showToast(`تم تشغيل ${type === 'scraper' ? 'السكرابر (Google Maps)' : 'إثراء LinkedIn'} في الخلفية`, 'success');
                } else if (data.status === 'error') {
                    alert('خطأ في تشغيل السكربت: ' + data.message);
                }
            }
            this.fetchData();
        } catch (err) {
            alert('فشل الاتصال بخادم السكرابر: ' + err.message);
        }
    },

    async updateProcessButtons() {
        try {
            const resp = await fetch('http://localhost:8888/api/status');
            if (!resp.ok) return;
            const status = await resp.json();
            
            const btnScraper = document.getElementById('btn-toggle-scraper');
            const btnEnricher = document.getElementById('btn-toggle-enricher');
            const btnScraperHeader = document.getElementById('btn-toggle-scraper-header');
            const btnEnricherHeader = document.getElementById('btn-toggle-enricher-header');
            
            if (btnScraper) {
                if (status.scraper_running) {
                    btnScraper.innerHTML = '<i class="fas fa-stop"></i> إيقاف السكرابر';
                    btnScraper.style.background = '#ef4444';
                } else {
                    btnScraper.innerHTML = '<i class="fas fa-play"></i> تشغيل السكرابر (Maps)';
                    btnScraper.style.background = '#10b981';
                }
            }
            
            if (btnScraperHeader) {
                if (status.scraper_running) {
                    btnScraperHeader.innerHTML = '<i class="fas fa-stop"></i> <span>إيقاف السكرابر</span>';
                    btnScraperHeader.style.background = '#ef4444';
                } else {
                    btnScraperHeader.innerHTML = '<i class="fas fa-play"></i> <span>تشغيل السكرابر</span>';
                    btnScraperHeader.style.background = '#10b981';
                }
            }
            
            if (btnEnricher) {
                if (status.enricher_running) {
                    btnEnricher.innerHTML = '<i class="fas fa-stop"></i> إيقاف إثراء LinkedIn';
                    btnEnricher.style.background = '#ef4444';
                } else {
                    btnEnricher.innerHTML = '<i class="fab fa-linkedin"></i> تشغيل إثراء LinkedIn';
                    btnEnricher.style.background = '#0077b5';
                }
            }
            
            if (btnEnricherHeader) {
                if (status.enricher_running) {
                    btnEnricherHeader.innerHTML = '<i class="fas fa-stop"></i> <span>إيقاف الإثراء</span>';
                    btnEnricherHeader.style.background = '#ef4444';
                } else {
                    btnEnricherHeader.innerHTML = '<i class="fab fa-linkedin"></i> <span>إثراء LinkedIn</span>';
                    btnEnricherHeader.style.background = '#0077b5';
                }
            }

            const statusText = document.getElementById('scraper-status-text');
            const statusDot = document.getElementById('scraper-status-dot');
            
            if (statusText && statusDot) {
                if (status.scraper_running && status.enricher_running) {
                    statusText.textContent = '● جاري السحب والإثراء معاً';
                    statusDot.style.background = '#10b981';
                    statusDot.style.animation = 'pulse 2s infinite';
                } else if (status.scraper_running) {
                    statusText.textContent = '● جاري سحب الخرائط (Maps)';
                    statusDot.style.background = '#10b981';
                    statusDot.style.animation = 'pulse 2s infinite';
                } else if (status.enricher_running) {
                    statusText.textContent = '● جاري إثراء LinkedIn حالياً';
                    statusDot.style.background = '#0077b5';
                    statusDot.style.animation = 'pulse 2s infinite';
                } else {
                    statusText.textContent = '✅ السكرابر متوقف — جاهز للتشغيل';
                    statusDot.style.background = '#fbbf24';
                    statusDot.style.animation = 'none';
                }
            }
        } catch {}
    }
};
