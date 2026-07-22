/* ============================================
   Dashboard Module — Fleet CRM
   ============================================ */

const Dashboard = {
    charts: {},

    init() {
        this.render();
    },

    render() {
        const stats = Storage.getStats();
        this.updateStatCards(stats);
        this.renderSectorChart(stats);
        this.renderWeeklyCallsChart(stats);
        this.renderFollowUps();
        this.renderActivities();
        this.updateCurrentDate();
    },

    updateStatCards(stats) {
        this._animateNumber('dash-total-companies', stats.totalCompanies);
        this._animateNumber('dash-calls-today', stats.callsToday);
        this._animateNumber('dash-open-deals', stats.openDeals);
        document.getElementById('dash-pipeline-value').textContent = Storage.formatCurrency(stats.pipelineValue);
        
        // Sidebar stats
        document.getElementById('sidebar-total-companies').textContent = stats.totalCompanies;
        document.getElementById('sidebar-total-deals').textContent = stats.openDeals;
    },

    _animateNumber(elementId, target) {
        const el = document.getElementById(elementId);
        if (!el) return;
        const current = parseInt(el.textContent) || 0;
        if (current === target) { el.textContent = target; return; }
        
        const duration = 600;
        const steps = 30;
        const increment = (target - current) / steps;
        let step = 0;
        
        const timer = setInterval(() => {
            step++;
            if (step >= steps) {
                el.textContent = target;
                clearInterval(timer);
            } else {
                el.textContent = Math.round(current + increment * step);
            }
        }, duration / steps);
    },

    renderSectorChart(stats) {
        if (typeof Chart === 'undefined') return;
        const ctx = document.getElementById('chart-sectors');
        if (!ctx) return;

        if (this.charts.sectors) this.charts.sectors.destroy();

        const sectorData = stats.companiesBySector;
        const labels = [];
        const data = [];
        const colors = [
            '#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444',
            '#8b5cf6', '#06b6d4', '#14b8a6', '#f97316', '#ec4899',
            '#3b82f6', '#84cc16', '#a855f7', '#64748b', '#e11d48'
        ];

        Object.entries(sectorData).forEach(([key, count]) => {
            const sector = Storage.SECTORS[key];
            labels.push(sector ? sector.ar : key);
            data.push(count);
        });

        if (labels.length === 0) {
            labels.push('لا توجد بيانات');
            data.push(1);
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
    },

    renderWeeklyCallsChart(stats) {
        if (typeof Chart === 'undefined') return;
        const ctx = document.getElementById('chart-calls-weekly');
        if (!ctx) return;

        if (this.charts.weeklyCalls) this.charts.weeklyCalls.destroy();

        const weekData = stats.weeklyCallData;

        this.charts.weeklyCalls = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: weekData.map(d => d.day),
                datasets: [{
                    label: 'المكالمات',
                    data: weekData.map(d => d.count),
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const { ctx: c, chartArea } = chart;
                        if (!chartArea) return '#6366f1';
                        const gradient = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
                        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.8)');
                        return gradient;
                    },
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
                        ticks: { color: '#64748b', font: { family: 'Cairo', size: 11 } }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.04)' },
                        ticks: {
                            color: '#64748b',
                            font: { family: 'Inter', size: 11 },
                            stepSize: 1
                        }
                    }
                }
            }
        });
    },

    renderFollowUps() {
        const container = document.getElementById('followups-list');
        const countBadge = document.getElementById('followup-count');
        if (!container) return;

        const followups = Storage.getTodaysFollowUps();
        countBadge.textContent = followups.length;

        if (followups.length === 0) {
            container.innerHTML = `
                <div class="empty-state small">
                    <i class="fas fa-check-circle"></i>
                    <p>لا توجد متابعات لليوم 🎉</p>
                </div>`;
            return;
        }

        container.innerHTML = followups.map(call => {
            const company = Storage.getCompany(call.companyId);
            const companyName = company ? company.nameAr : 'شركة غير معروفة';
            return `
                <div class="followup-item">
                    <div class="followup-icon"><i class="fas fa-bell"></i></div>
                    <div class="followup-info">
                        <div class="name">${companyName}</div>
                        <div class="detail">${call.contactPerson || ''} — ${Storage.getCallResultLabel(call.result)}</div>
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
        const container = document.getElementById('activity-list');
        if (!container) return;

        const activities = Storage.getActivities(10);

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
                        <div class="name">${act.action}</div>
                        <div class="detail">${act.detail || ''} — ${timeAgo}</div>
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
