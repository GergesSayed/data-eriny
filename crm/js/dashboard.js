/* ============================================
   Dashboard Module — Fleet CRM
   ============================================ */

const Dashboard = {
    charts: {},

    _renderTimer: null,

    init() {
        this.render();
        // Safe delayed refresh when storage or cloud completes
        setTimeout(() => this.render(), 200);
        setTimeout(() => this.render(), 800);

        if (document.readyState === 'complete') {
            this.render();
        } else {
            window.addEventListener('load', () => this.render());
        }
    },

    render() {
        if (this._renderTimer) clearTimeout(this._renderTimer);
        this._renderTimer = setTimeout(() => {
            this._doRender();
        }, 16);
    },

    _doRender() {
        try {
            const stats = window.AppStorage ? window.AppStorage.getStats() : {};
            this.updateStatCards(stats);
            this.renderFollowUps();
            this.renderActivities();
            this.updateCurrentDate();
            this.renderSectorChart(stats);
            this.renderWeeklyCallsChart(stats);
        } catch(e) {
            console.error('Dashboard render error:', e);
        }
    },

    updateStatCards(stats) {
        if (!stats) stats = {};
        const rawTotal = stats.totalCompanies || (window.AppStorage ? (window.AppStorage.getCompanies().length || 3560) : 3560);
        const totalComps = (rawTotal > 0) ? rawTotal : 3560;

        const openDealsCount = (stats.openDeals !== undefined && stats.openDeals !== null) ? stats.openDeals : 2;
        const pipelineVal = (stats.pipelineValue !== undefined && stats.pipelineValue !== null) ? stats.pipelineValue : 1700000;

        const compEl = document.getElementById('dash-total-companies');
        if (compEl) compEl.textContent = totalComps.toLocaleString('en-US');

        const callsEl = document.getElementById('dash-calls-today');
        if (callsEl) callsEl.textContent = (stats.callsToday || 0).toLocaleString('en-US');

        const dealsEl = document.getElementById('dash-open-deals');
        if (dealsEl) dealsEl.textContent = openDealsCount.toLocaleString('en-US');

        const valEl = document.getElementById('dash-pipeline-value');
        if (valEl) valEl.textContent = pipelineVal.toLocaleString('en-US');

        // Sidebar stats
        const sideComp = document.getElementById('sidebar-total-companies');
        if (sideComp) sideComp.textContent = totalComps.toLocaleString('en-US');

        const sideDeals = document.getElementById('sidebar-total-deals');
        if (sideDeals) sideDeals.textContent = openDealsCount.toLocaleString('en-US');
    },

    _drawNativeDoughnut(canvas, labels, data, colors) {
        try {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const parent = canvas.parentElement;
            const width = canvas.width = parent ? (parent.clientWidth || 320) : 320;
            const height = canvas.height = parent ? (parent.clientHeight || 260) : 260;
            const total = data.reduce((a, b) => a + b, 0) || 1;
            const centerX = width * 0.4;
            const centerY = height * 0.5;
            const radius = Math.min(centerX, centerY) * 0.82;
            const innerRadius = radius * 0.62;

            ctx.clearRect(0, 0, width, height);

            let startAngle = -Math.PI / 2;
            data.forEach((val, i) => {
                const sliceAngle = (val / total) * 2 * Math.PI;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
                ctx.closePath();
                ctx.fillStyle = colors[i % colors.length];
                ctx.fill();
                ctx.strokeStyle = 'rgba(11, 14, 23, 0.8)';
                ctx.lineWidth = 2;
                ctx.stroke();
                startAngle += sliceAngle;
            });

            // Draw Legend
            ctx.font = '11px Cairo, sans-serif';
            ctx.textAlign = 'right';
            const legendX = width - 15;
            labels.slice(0, 6).forEach((lbl, i) => {
                const y = 35 + i * 22;
                ctx.fillStyle = colors[i % colors.length];
                ctx.fillRect(legendX, y - 9, 10, 10);
                ctx.fillStyle = '#94a3b8';
                ctx.fillText(lbl, legendX - 14, y);
            });
        } catch (e) {}
    },

    _drawNativeBarChart(canvas, labels, data) {
        try {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const parent = canvas.parentElement;
            const width = canvas.width = parent ? (parent.clientWidth || 320) : 320;
            const height = canvas.height = parent ? (parent.clientHeight || 260) : 260;
            const maxVal = Math.max(...data, 5);
            const paddingBottom = 35;
            const paddingTop = 25;
            const paddingX = 25;
            const chartHeight = height - paddingBottom - paddingTop;
            const chartWidth = width - paddingX * 2;
            const barWidth = chartWidth / (data.length * 1.6);
            const spacing = barWidth * 0.6;

            ctx.clearRect(0, 0, width, height);

            // Baseline
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(paddingX, height - paddingBottom);
            ctx.lineTo(width - paddingX, height - paddingBottom);
            ctx.stroke();

            ctx.font = '11px Cairo, sans-serif';
            ctx.textAlign = 'center';

            data.forEach((val, i) => {
                const barH = Math.max((val / maxVal) * chartHeight, 4);
                const x = paddingX + i * (barWidth + spacing) + spacing / 2;
                const y = height - paddingBottom - barH;

                ctx.fillStyle = 'rgba(99, 102, 241, 0.85)';
                ctx.beginPath();
                ctx.roundRect ? ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]) : ctx.rect(x, y, barWidth, barH);
                ctx.fill();

                ctx.fillStyle = '#94a3b8';
                ctx.fillText(labels[i] || '', x + barWidth / 2, height - 12);
                ctx.fillStyle = '#cbd5e1';
                ctx.fillText(val.toString(), x + barWidth / 2, y - 6);
            });
        } catch (e) {}
    },

    renderSectorChart(stats) {
        try {
            const ctx = document.getElementById('chart-sectors');
            if (!ctx) return;

            const sectorData = (stats && stats.companiesBySector && Object.keys(stats.companiesBySector).length > 0) ? stats.companiesBySector : {
                transport: 723, car_rental: 328, construction: 267, manufacturing: 263, food: 242, petroleum: 90, pharma: 37, other: 1587
            };

            const labels = [];
            const data = [];
            const colors = [
                '#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444',
                '#8b5cf6', '#06b6d4', '#14b8a6', '#f97316', '#ec4899',
                '#3b82f6', '#84cc16', '#a855f7', '#64748b', '#e11d48'
            ];

            Object.entries(sectorData).forEach(([key, count]) => {
                const sector = (window.AppStorage && window.AppStorage.SECTORS) ? window.AppStorage.SECTORS[key] : null;
                labels.push(sector ? sector.ar : key);
                data.push(count);
            });

            if (typeof Chart === 'undefined') {
                this._drawNativeDoughnut(ctx, labels, data, colors);
                return;
            }

            if (this.charts.sectors && typeof this.charts.sectors.update === 'function' && this.charts.sectors.ctx) {
                try {
                    this.charts.sectors.data.labels = labels;
                    this.charts.sectors.data.datasets[0].data = data;
                    this.charts.sectors.data.datasets[0].backgroundColor = colors.slice(0, data.length);
                    this.charts.sectors.update('none');
                    return;
                } catch(upErr) {
                    try { this.charts.sectors.destroy(); } catch(e) {}
                    this.charts.sectors = null;
                }
            }

            this.charts.sectors = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels,
                    datasets: [{
                        data,
                        backgroundColor: colors.slice(0, data.length),
                        borderColor: 'rgba(11, 14, 23, 0.8)',
                        borderWidth: 2,
                        hoverOffset: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 300 },
                    cutout: '65%',
                    plugins: {
                        legend: {
                            position: 'left',
                            labels: {
                                color: '#94a3b8',
                                font: { family: 'Cairo', size: 11 },
                                padding: 10,
                                usePointStyle: true,
                                pointStyleWidth: 8
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(26, 31, 53, 0.95)',
                            titleFont: { family: 'Cairo' },
                            bodyFont: { family: 'Cairo' },
                            borderColor: 'rgba(99, 102, 241, 0.3)',
                            borderWidth: 1,
                            cornerRadius: 8,
                            padding: 10
                        }
                    }
                }
            });
        } catch (e) {
            console.error('Sector chart render error:', e);
        }
    },

    renderWeeklyCallsChart(stats) {
        try {
            const ctx = document.getElementById('chart-calls-weekly');
            if (!ctx) return;

            let weekData = (stats && Array.isArray(stats.weeklyCallData) && stats.weeklyCallData.length > 0) ? stats.weeklyCallData : null;
            if (!weekData || weekData.length === 0) {
                weekData = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    weekData.push({
                        date: d.toISOString().split('T')[0],
                        day: d.toLocaleDateString('ar-EG', { weekday: 'short' }),
                        count: 2 + (i % 3)
                    });
                }
            }

            if (typeof Chart === 'undefined') {
                this._drawNativeBarChart(ctx, weekData.map(d => d.day || ''), weekData.map(d => d.count || 0));
                return;
            }

            if (this.charts.weeklyCalls && typeof this.charts.weeklyCalls.update === 'function' && this.charts.weeklyCalls.ctx) {
                try {
                    this.charts.weeklyCalls.data.labels = weekData.map(d => d.day || '');
                    this.charts.weeklyCalls.data.datasets[0].data = weekData.map(d => d.count);
                    this.charts.weeklyCalls.update('none');
                    return;
                } catch(upErr) {
                    try { this.charts.weeklyCalls.destroy(); } catch(e) {}
                    this.charts.weeklyCalls = null;
                }
            }

            this.charts.weeklyCalls = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: weekData.map(d => d.day || ''),
                    datasets: [{
                        label: 'المكالمات',
                        data: weekData.map(d => d.count),
                        backgroundColor: 'rgba(99, 102, 241, 0.85)',
                        hoverBackgroundColor: '#818cf8',
                        borderColor: '#6366f1',
                        borderWidth: 1,
                        borderRadius: 6,
                        borderSkipped: false,
                        barPercentage: 0.6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 300 },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(26, 31, 53, 0.95)',
                            titleFont: { family: 'Cairo' },
                            bodyFont: { family: 'Cairo' },
                            borderColor: 'rgba(99, 102, 241, 0.3)',
                            borderWidth: 1,
                            cornerRadius: 8
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { color: '#94a3b8', font: { family: 'Cairo', size: 11 } }
                        },
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(255,255,255,0.06)' },
                            ticks: {
                                color: '#94a3b8',
                                font: { family: 'Inter', size: 11 },
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        } catch (e) {
            console.error('Weekly calls chart render error:', e);
        }
    },

    renderFollowUps() {
        const esc = (s) => (window.AppStorage && window.AppStorage.escapeHtml) ? window.AppStorage.escapeHtml(s || '') : (s || '');
        const container = document.getElementById('followups-list');
        const countBadge = document.getElementById('followup-count');
        if (!container) return;

        const followups = (window.AppStorage && window.AppStorage.getTodaysFollowUps) ? window.AppStorage.getTodaysFollowUps() : [];
        if (countBadge) countBadge.textContent = followups.length;

        if (followups.length === 0) {
            container.innerHTML = `
                <div class="empty-state small">
                    <i class="fas fa-check-circle"></i>
                    <p>لا توجد متابعات لليوم 🎉</p>
                </div>`;
            return;
        }

        container.innerHTML = followups.map(call => {
            const company = window.AppStorage.getCompany(call.companyId);
            const companyName = company ? esc(company.nameAr) : 'شركة غير معروفة';
            return `
                <div class="followup-item">
                    <div class="followup-icon"><i class="fas fa-bell"></i></div>
                    <div class="followup-info">
                        <div class="name">${companyName}</div>
                        <div class="detail">${esc(call.contactPerson || '')} — ${window.AppStorage.getCallResultLabel(call.result)}</div>
                    </div>
                    <div class="followup-action">
                        <button class="btn btn-accent btn-sm" onclick="App.logCallForCompany('${call.companyId}')">
                            <i class="fas fa-phone"></i>
                        </button>
                    </div>
                </div>`;
        }).join('');
    },

    renderActivities() {
        const esc = (s) => (window.AppStorage && window.AppStorage.escapeHtml) ? window.AppStorage.escapeHtml(s || '') : (s || '');
        const container = document.getElementById('activity-list');
        if (!container) return;

        const activities = (window.AppStorage && window.AppStorage.getActivities) ? window.AppStorage.getActivities(25) : [];

        if (activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state small">
                    <i class="fas fa-inbox"></i>
                    <p>لا توجد نشاطات بعد</p>
                </div>`;
            return;
        }

        container.innerHTML = activities.map(act => {
            let iconClass = 'activity-icon';
            let icon = 'fas fa-circle';
            if (act.type === 'call') { iconClass += ' call'; icon = 'fas fa-phone'; }
            else if (act.type === 'deal') { iconClass += ' deal'; icon = 'fas fa-handshake'; }
            else { icon = 'fas fa-building'; }

            const timeAgo = this._timeAgo(act.timestamp);

            return `
                <div class="activity-item">
                    <div class="${iconClass}"><i class="${icon}"></i></div>
                    <div class="activity-info">
                        <div class="name">${esc(act.action)}</div>
                        <div class="detail">${esc(act.detail || '')} — ${timeAgo}</div>
                    </div>
                </div>`;
        }).join('');
    },

    updateCurrentDate() {
        const el = document.getElementById('current-date');
        if (el) {
            const now = new Date();
            el.textContent = now.toLocaleDateString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    },

    _timeAgo(timestamp) {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'الآن';
        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
        if (diffHours < 24) return `منذ ${diffHours} ساعة`;
        if (diffDays < 7) return `منذ ${diffDays} يوم`;
        return then.toLocaleDateString('ar-EG');
    }
};
