/* ============================================
   Dashboard Module — Fleet CRM
   ============================================ */

const Dashboard = {
    charts: {},

    init() {
        if (typeof App !== 'undefined' && App.currentPage === 'dashboard') {
            this.render();
        }
    },

    render() {
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
        const totalComps = (stats.totalCompanies !== undefined && stats.totalCompanies !== null)
            ? stats.totalCompanies
            : (window.AppStorage ? (window.AppStorage.getCompanies().length || 0) : 0);

        const compEl = document.getElementById('dash-total-companies');
        if (compEl) compEl.textContent = totalComps.toLocaleString('en-US');

        const callsEl = document.getElementById('dash-calls-today');
        if (callsEl) callsEl.textContent = (stats.callsToday || 0).toLocaleString('en-US');

        const followupsEl = document.getElementById('dash-followups-today');
        const followupsCount = window.AppStorage ? (window.AppStorage.getTodaysFollowUps ? window.AppStorage.getTodaysFollowUps().length : 0) : 0;
        if (followupsEl) followupsEl.textContent = followupsCount.toLocaleString('en-US');

        // KPI Daily Target Tracker
        const dailyTarget = parseInt(localStorage.getItem('fleetcrm_daily_target') || '40', 10);
        const callsCount = stats.callsToday || 0;
        const kpiCountEl = document.getElementById('dash-kpi-count');
        const kpiPercentEl = document.getElementById('dash-kpi-percent');
        const kpiProgressEl = document.getElementById('dash-kpi-progress');
        if (kpiCountEl) kpiCountEl.textContent = `${callsCount} / ${dailyTarget}`;
        const pct = Math.min(100, Math.round((callsCount / dailyTarget) * 100));
        if (kpiPercentEl) kpiPercentEl.textContent = `${pct}%`;
        if (kpiProgressEl) kpiProgressEl.style.width = `${pct}%`;

        // Sidebar stats
        const sideComp = document.getElementById('sidebar-total-companies');
        if (sideComp) sideComp.textContent = totalComps.toLocaleString('en-US');
    },

    renderSectorChart(stats) {
        try {
            const ctx = document.getElementById('chart-sectors');
            if (!ctx || typeof Chart === 'undefined') return;

            const sectorData = (stats && stats.companiesBySector) ? stats.companiesBySector : {};
            const keys = Object.keys(sectorData);

            const labels = [];
            const data = [];
            const colors = [
                '#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444',
                '#8b5cf6', '#06b6d4', '#14b8a6', '#f97316', '#ec4899',
                '#3b82f6', '#84cc16', '#a855f7', '#64748b', '#e11d48'
            ];

            if (keys.length === 0) {
                labels.push('لا توجد شركات');
                data.push(1); // Placeholder segment for empty ring
            } else {
                Object.entries(sectorData).forEach(([key, count]) => {
                    const sector = (window.AppStorage && window.AppStorage.SECTORS) ? window.AppStorage.SECTORS[key] : null;
                    labels.push(sector ? sector.ar : key);
                    data.push(count);
                });
            }

            const bgColors = (keys.length === 0) ? ['rgba(100, 116, 139, 0.25)'] : colors.slice(0, data.length);

            const existingChart = Chart.getChart(ctx);
            if (existingChart) {
                existingChart.data.labels = labels;
                existingChart.data.datasets[0].data = data;
                existingChart.data.datasets[0].backgroundColor = bgColors;
                existingChart.update();
                this.charts.sectors = existingChart;
                return;
            }

            this.charts.sectors = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels,
                    datasets: [{
                        data,
                        backgroundColor: bgColors,
                        borderColor: 'rgba(11, 14, 23, 0.8)',
                        borderWidth: 2,
                        hoverOffset: keys.length > 0 ? 8 : 0
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
            if (!ctx || typeof Chart === 'undefined') return;

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

            const existingCallsChart = Chart.getChart(ctx);
            if (existingCallsChart) {
                existingCallsChart.data.labels = weekData.map(d => d.day || '');
                existingCallsChart.data.datasets[0].data = weekData.map(d => d.count);
                existingCallsChart.update();
                this.charts.weeklyCalls = existingCallsChart;
                return;
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
                    <i class="fas fa-check-circle" style="color: #10b981;"></i>
                    <p>لا توجد متابعات مستحقة لليوم 🎉</p>
                </div>`;
            return;
        }

        const today = new Date().toISOString().split('T')[0];

        container.innerHTML = followups.map(call => {
            const company = window.AppStorage.getCompany(call.companyId);
            const companyName = company ? esc(company.nameAr || company.nameEn) : 'شركة غير معروفة';
            const isOverdue = call.followUpDate && call.followUpDate < today;
            const phone = company ? (company.mobile || company.phone1 || company.phone || '') : '';
            const statusBadge = isOverdue
                ? `<span style="font-size: 10px; color: #ef4444; background: rgba(239, 68, 68, 0.12); padding: 2px 6px; border-radius: 6px; font-weight: 700; border: 1px solid rgba(239, 68, 68, 0.25);">⚠️ متأخرة (${call.followUpDate})</span>`
                : `<span style="font-size: 10px; color: #3b82f6; background: rgba(59, 130, 246, 0.12); padding: 2px 6px; border-radius: 6px; font-weight: 700; border: 1px solid rgba(59, 130, 246, 0.25);">📅 مستحقة اليوم</span>`;

            return `
                <div class="followup-item" style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; background: var(--bg-card); border: 1px solid var(--border-light); border-radius: 10px; margin-bottom: 8px;">
                    <div class="followup-icon" style="width: 36px; height: 36px; border-radius: 8px; background: ${isOverdue ? 'rgba(239,68,68,0.15)' : 'rgba(124,58,237,0.15)'}; color: ${isOverdue ? '#ef4444' : '#7c3aed'}; display: flex; align-items: center; justify-content: center; font-size: 16px;">
                        <i class="fas ${isOverdue ? 'fa-exclamation-triangle' : 'fa-bell'}"></i>
                    </div>
                    <div class="followup-info" style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                            <span class="name" style="font-weight: 700; font-size: 13px; cursor: pointer; color: var(--text-primary);" onclick="Companies.showDetail('${call.companyId}')">${companyName}</span>
                            ${statusBadge}
                        </div>
                        <div class="detail" style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">
                            ${call.contactPerson ? `👤 ${esc(call.contactPerson)} — ` : ''}${phone ? `📞 <a href="tel:${phone}" style="color: var(--primary-light); text-decoration: none;">${phone}</a> — ` : ''}<span style="color: var(--text-secondary);">${esc(call.notes || window.AppStorage.getCallResultLabel(call.result))}</span>
                        </div>
                    </div>
                    <div class="followup-action" style="display: flex; gap: 6px;">
                        <button class="btn btn-accent btn-sm" onclick="App.logCallForCompany('${call.companyId}')" title="تسجيل مكالمة متابعة">
                            <i class="fas fa-phone-alt"></i>
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

window.Dashboard = Dashboard;
