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
            this.renderTeamGoals();
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

    renderTeamGoals() {
        const grid = document.getElementById('dash-team-goals-grid');
        if (!grid) return;

        const allUsers = (window.AppStorage && window.AppStorage.getUsers) ? window.AppStorage.getUsers() : [];
        const allCompanies = (window.AppStorage && window.AppStorage.getCompanies) ? window.AppStorage.getCompanies() : [];
        const allCalls = (window.AppStorage && window.AppStorage.getCalls) ? window.AppStorage.getCalls() : [];

        // Exclude Admin accounts — the Admin directs the team and does not conduct sales calls
        const users = allUsers.filter(u => {
            if (!u) return false;
            const role = String(u.role || '').toLowerCase();
            const username = String(u.username || '').toLowerCase();
            const id = String(u.id || '').toLowerCase();
            return role !== 'admin' && username !== 'admin' && id !== 'admin';
        });

        if (!users || users.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 28px 16px; color: var(--text-muted); background: rgba(255,255,255,0.02); border-radius: 10px; border: 1px dashed var(--border-color);">
                    <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 8px; display: block; color: #8b5cf6;"></i>
                    <h4 style="margin: 0 0 6px 0; color: var(--text-primary); font-size: 0.95rem;">لا يوجد موظفو مبيعات مسجلون حالياً</h4>
                    <p style="margin: 0; font-size: 12px;">حساب المدير العام (Admin) مستثنى من بطاقات المبيعات لأنه موجه ومسؤول عن إدارة الفريق. يمكنك إضافة موظفي مبيعات من قسم إدارة الفريق.</p>
                </div>`;
            return;
        }

        // High speed single-pass performance aggregation
        const userIndexMap = new Map();
        const usersStats = users.map(user => {
            const s = {
                ...user,
                assignedCompanies: [],
                assignedCount: 0,
                contactedCount: 0,
                remainingCount: 0,
                interestedCount: 0,
                notInterestedCount: 0,
                callsCount: 0
            };
            if (user.id) userIndexMap.set(String(user.id).trim().toLowerCase(), s);
            if (user.username) userIndexMap.set(String(user.username).trim().toLowerCase(), s);
            if (user.name) userIndexMap.set(String(user.name).trim().toLowerCase(), s);
            return s;
        });

        // 1. Assign companies to user buckets
        let totalAssignedAll = 0;
        let totalContactedAll = 0;

        for (let i = 0; i < allCompanies.length; i++) {
            const c = allCompanies[i];
            if (!c || !c.assignedTo) continue;
            const s = userIndexMap.get(String(c.assignedTo).trim().toLowerCase());
            if (s) {
                totalAssignedAll++;
                s.assignedCount++;
                s.assignedCompanies.push(c);

                const isContacted = Boolean(c.lastCallResult || c.status === 'interested' || c.status === 'contacted' || c.status === 'unqualified');
                if (isContacted) {
                    s.contactedCount++;
                    totalContactedAll++;
                } else {
                    s.remainingCount++;
                }

                if (c.status === 'interested' || ['interested', 'meeting_scheduled', 'proposal_sent'].includes(c.lastCallResult)) {
                    s.interestedCount++;
                }
                if (c.status === 'unqualified' || ['not_interested', 'wrong_number'].includes(c.lastCallResult)) {
                    s.notInterestedCount++;
                }
            }
        }

        // 2. Count calls made by each user
        for (let i = 0; i < allCalls.length; i++) {
            const call = allCalls[i];
            if (!call) continue;
            if (call.userId) {
                const s = userIndexMap.get(String(call.userId).trim().toLowerCase());
                if (s) s.callsCount++;
            } else if (call.createdByName) {
                const s = userIndexMap.get(String(call.createdByName).trim().toLowerCase());
                if (s) s.callsCount++;
            }
        }

        // Update the top stat card with team completion
        const teamCountEl = document.getElementById('dash-team-progress-count');
        const teamPercentEl = document.getElementById('dash-team-progress-percent');
        const teamProgressEl = document.getElementById('dash-team-progress-bar');
        if (teamCountEl) teamCountEl.textContent = `${totalContactedAll} / ${totalAssignedAll}`;
        const totalPct = totalAssignedAll > 0 ? Math.min(100, Math.round((totalContactedAll / totalAssignedAll) * 100)) : 0;
        if (teamPercentEl) teamPercentEl.textContent = `${totalPct}%`;
        if (teamProgressEl) teamProgressEl.style.width = `${totalPct}%`;

        // 3. Render employee goal cards
        grid.innerHTML = usersStats.map(u => {
            const pct = u.assignedCount > 0 ? Math.round((u.contactedCount / u.assignedCount) * 100) : 0;
            const roleBadge = u.role === 'admin' ? '👑 مدير عام' : (u.role === 'supervisor' ? '⭐ مشرف' : '💼 مبيعات');
            const userColor = u.color || '#7c3aed';
            const avatar = u.avatar || '👤';
            const uName = u.name || u.username || 'موظف';
            
            // Color of progress based on completion
            let progressGradient = 'linear-gradient(90deg, #6366f1, #8b5cf6)';
            if (pct >= 80) progressGradient = 'linear-gradient(90deg, #10b981, #059669)';
            else if (pct >= 50) progressGradient = 'linear-gradient(90deg, #3b82f6, #06b6d4)';
            else if (pct >= 25) progressGradient = 'linear-gradient(90deg, #f59e0b, #d97706)';

            return `
                <div class="employee-goal-card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px; transition: all 0.2s ease; position: relative;" onmouseover="this.style.borderColor='rgba(124, 58, 237, 0.4)'; this.style.transform='translateY(-2px)';" onmouseout="this.style.borderColor='var(--border-color)'; this.style.transform='none';">
                    <!-- Card Header: Employee info & Role -->
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: ${userColor}22; color: ${userColor}; border: 1px solid ${userColor}55; font-size: 1.2rem;">
                                ${avatar}
                            </span>
                            <div>
                                <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">${uName}</h4>
                                <span style="font-size: 11px; color: var(--text-muted); display: inline-flex; align-items: center; gap: 4px; margin-top: 2px;">
                                    ${roleBadge} • 📞 ${u.callsCount} مكالمة
                                </span>
                            </div>
                        </div>
                        <span style="font-size: 13px; font-weight: 800; color: ${pct >= 50 ? '#10b981' : '#f59e0b'}; background: ${pct >= 50 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)'}; padding: 3px 8px; border-radius: 6px;">
                            ${pct}% إنجاز
                        </span>
                    </div>

                    <!-- Progress Bar & Companies Contacted -->
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; margin-bottom: 5px;">
                            <span style="color: var(--text-secondary); font-weight: 600;">الشركات المنجزة:</span>
                            <span style="font-weight: 700; color: var(--text-primary);"><b style="color: #60a5fa;">${u.contactedCount}</b> من أصل <b>${u.assignedCount}</b> شركة</span>
                        </div>
                        <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.06); border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);">
                            <div style="width: ${pct}%; height: 100%; background: ${progressGradient}; border-radius: 10px; transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);"></div>
                        </div>
                    </div>

                    <!-- 3 Key Result Metrics: Interested / Unqualified / Remaining -->
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center;">
                        <!-- Won / Interested -->
                        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 8px 4px; cursor: pointer;" onclick="Dashboard.filterCompaniesByEmployee('${u.id}', 'interested')" title="عرض الشركات المهتمة والمنضمة">
                            <div style="font-size: 1.1rem; font-weight: 800; color: #10b981;">${u.interestedCount}</div>
                            <div style="font-size: 10.5px; color: #34d399; font-weight: 600; margin-top: 2px;">💚 انضمت / مهتمة</div>
                        </div>

                        <!-- Unqualified / Rejected -->
                        <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 8px; padding: 8px 4px; cursor: pointer;" onclick="Dashboard.filterCompaniesByEmployee('${u.id}', 'unqualified')" title="عرض الشركات المستبعدة وغير المهتمة">
                            <div style="font-size: 1.1rem; font-weight: 800; color: #ef4444;">${u.notInterestedCount}</div>
                            <div style="font-size: 10.5px; color: #f87171; font-weight: 600; margin-top: 2px;">🔴 غير مناسبة</div>
                        </div>

                        <!-- Pending / Remaining -->
                        <div style="background: rgba(148, 163, 184, 0.08); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 8px; padding: 8px 4px; cursor: pointer;" onclick="Dashboard.filterCompaniesByEmployee('${u.id}', 'remaining')" title="عرض الشركات المتبقية في انتظار التواصل">
                            <div style="font-size: 1.1rem; font-weight: 800; color: #94a3b8;">${u.remainingCount}</div>
                            <div style="font-size: 10.5px; color: #cbd5e1; font-weight: 600; margin-top: 2px;">⚪ متبقي للاتصال</div>
                        </div>
                    </div>

                    <!-- Quick Action: Go to Employee's Companies in Companies Table -->
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-light); padding-top: 10px; margin-top: 2px;">
                        <span style="font-size: 11px; color: var(--text-muted);">
                            ${u.assignedCount === 0 ? '⚪ لا توجد شركات مسندة' : (u.remainingCount === 0 ? '🎉 أنجز كل شركاته بالكامل!' : `متبقي ${u.remainingCount} شركة`)}
                        </span>
                        <button class="btn btn-sm" onclick="Dashboard.filterCompaniesByEmployee('${u.id}')" style="background: rgba(124, 58, 237, 0.12); color: #a78bfa; border: 1px solid rgba(124, 58, 237, 0.3); font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                            <i class="fas fa-search"></i> عرض الشركات
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    filterCompaniesByEmployee(userId, filterType = '') {
        if (!userId) return;

        // Defensive Navigation
        if (typeof App !== 'undefined') {
            if (typeof App.navigateTo === 'function') {
                App.navigateTo('companies');
            } else if (typeof App.navigate === 'function') {
                App.navigate('companies');
            } else {
                window.location.hash = '#companies';
            }
        } else {
            window.location.hash = '#companies';
        }

        setTimeout(() => {
            if (typeof Companies !== 'undefined') {
                // Reset other filters so the user sees this employee's scope cleanly
                ['filter-sector', 'filter-city', 'filter-contact-type', 'filter-priority', 'filter-fleet-type', 'filter-fleet-size', 'filter-added-date', 'filter-search'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = '';
                });
                if (Companies.selectedSectors) Companies.selectedSectors.clear();
                if (Companies.selectedCities) Companies.selectedCities.clear();
                if (typeof Companies._syncDropdownDOM === 'function') {
                    Companies._syncDropdownDOM('sectors');
                    Companies._syncDropdownDOM('cities');
                }
                if (typeof Companies.updateMultiSelectLabels === 'function') {
                    Companies.updateMultiSelectLabels();
                }
                if (typeof Companies.renderSectorPills === 'function') {
                    Companies.renderSectorPills();
                }

                // Ensure options in assigned dropdown are up-to-date
                if (typeof Companies.refreshUserFilter === 'function') {
                    Companies.refreshUserFilter();
                }

                const assignedFilter = document.getElementById('filter-assigned');
                if (assignedFilter) {
                    assignedFilter.value = userId;
                }

                Companies.statusFilter = filterType || null;
                Companies.currentPage = 1;
                Companies.render();
            }
        }, 100);
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
