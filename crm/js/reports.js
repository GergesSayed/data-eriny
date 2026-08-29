/* ============================================
   Reports Module — Fleet CRM
   ============================================ */

const Reports = {
    charts: {},

    init() {
        document.getElementById('report-period')?.addEventListener('change', () => this.render());
        this.render();
    },

    render() {
        this.renderCallsReport();
        this.renderSalesReport();
        this.renderSectorAnalysis();
        this.renderGeoReport();
        this.renderPerformanceSummary();
    },

    getDateRange() {
        const period = document.getElementById('report-period')?.value || 'month';
        const end = new Date();
        const start = new Date();

        switch (period) {
            case 'week': start.setDate(end.getDate() - 7); break;
            case 'month': start.setMonth(end.getMonth() - 1); break;
            case 'quarter': start.setMonth(end.getMonth() - 3); break;
            case 'year': start.setFullYear(end.getFullYear() - 1); break;
            case 'all': start.setFullYear(2020); break;
        }

        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    },

    renderCallsReport() {
        if (typeof Chart === 'undefined') return;
        const ctx = document.getElementById('chart-calls-report');
        if (!ctx) return;
        if (this.charts.callsReport) this.charts.callsReport.destroy();

        const range = this.getDateRange();
        const calls = window.AppStorage.getCalls().filter(c => c.date >= range.start && c.date <= range.end);

        const resultCounts = {};
        Object.keys(window.AppStorage.CALL_RESULTS).forEach(key => {
            resultCounts[key] = calls.filter(c => c.result === key).length;
        });

        const labels = Object.keys(resultCounts).map(key => window.AppStorage.CALL_RESULTS[key]?.ar || key);
        const data = Object.values(resultCounts);
        const colors = ['#10b981', '#ef4444', '#f59e0b', '#64748b', '#dc2626', '#3b82f6', '#6366f1', '#22d3ee'];

        this.charts.callsReport = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'عدد المكالمات',
                    data,
                    backgroundColor: colors,
                    borderRadius: 6,
                    barPercentage: 0.7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(26, 31, 53, 0.95)',
                        titleFont: { family: 'Cairo' },
                        bodyFont: { family: 'Cairo' },
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.04)' },
                        ticks: { color: '#64748b', font: { family: 'Inter', size: 11 }, stepSize: 1 }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { family: 'Cairo', size: 11 } }
                    }
                }
            }
        });
    },

    renderSalesReport() {
        if (typeof Chart === 'undefined') return;
        const ctx = document.getElementById('chart-sales-report');
        if (!ctx) return;
        if (this.charts.salesReport) this.charts.salesReport.destroy();

        const companies = window.AppStorage.getCompanies();
        const priorityCounts = { A: 0, B: 0, C: 0 };
        companies.forEach(c => {
            const p = c.priority || 'B';
            if (priorityCounts[p] !== undefined) priorityCounts[p]++;
        });

        const labels = ['فئة A (أساطيل ضخمة)', 'فئة B (أساطيل متوسطة)', 'فئة C (أساطيل صغيرة)'];
        const values = [priorityCounts.A, priorityCounts.B, priorityCounts.C];
        const colors = ['#ef4444', '#f59e0b', '#3b82f6'];

        this.charts.salesReport = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'عدد الشركات',
                    data: values,
                    backgroundColor: colors.map(c => c + '80'),
                    borderColor: colors,
                    borderWidth: 2,
                    borderRadius: 6,
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
                        cornerRadius: 8,
                        callbacks: {
                            label: (context) => `عدد المنشآت: ${context.parsed.y.toLocaleString()} شركة`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { family: 'Cairo', size: 11 } }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.04)' },
                        ticks: {
                            color: '#94a3b8',
                            font: { family: 'Inter', size: 10 },
                            callback: (v) => v.toLocaleString()
                        }
                    }
                }
            }
        });
    },

    renderSectorAnalysis() {
        if (typeof Chart === 'undefined') return;
        const ctx = document.getElementById('chart-sector-analysis');
        if (!ctx) return;
        if (this.charts.sectorAnalysis) this.charts.sectorAnalysis.destroy();

        const companies = window.AppStorage.getCompanies();
        const sectorData = {};
        companies.forEach(c => {
            const sector = c.sector || 'unknown';
            if (!sectorData[sector]) sectorData[sector] = { count: 0, totalFleet: 0 };
            sectorData[sector].count++;
            sectorData[sector].totalFleet += Number(c.fleetSize) || 0;
        });

        const sorted = Object.entries(sectorData).sort((a, b) => b[1].totalFleet - a[1].totalFleet);
        const labels = sorted.map(([key]) => window.AppStorage.SECTORS[key]?.ar || key);
        const fleetData = sorted.map(([, val]) => val.totalFleet);
        const countData = sorted.map(([, val]) => val.count);

        const colors = [
            '#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444',
            '#8b5cf6', '#06b6d4', '#14b8a6', '#f97316', '#ec4899',
            '#3b82f6', '#84cc16', '#a855f7', '#64748b', '#e11d48'
        ];

        this.charts.sectorAnalysis = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'حجم الأسطول الإجمالي',
                        data: fleetData,
                        backgroundColor: 'rgba(99, 102, 241, 0.6)',
                        borderColor: '#6366f1',
                        borderWidth: 1,
                        borderRadius: 4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'عدد الشركات',
                        data: countData,
                        backgroundColor: 'rgba(34, 211, 238, 0.6)',
                        borderColor: '#22d3ee',
                        borderWidth: 1,
                        borderRadius: 4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#94a3b8', font: { family: 'Cairo', size: 11 } }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(26, 31, 53, 0.95)',
                        titleFont: { family: 'Cairo' },
                        bodyFont: { family: 'Cairo' },
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { family: 'Cairo', size: 10 }, maxRotation: 45 }
                    },
                    y: {
                        type: 'linear',
                        position: 'right',
                        beginAtZero: true,
                        title: { display: true, text: 'حجم الأسطول', color: '#6366f1', font: { family: 'Cairo', size: 11 } },
                        grid: { color: 'rgba(255,255,255,0.04)' },
                        ticks: { color: '#6366f1', font: { family: 'Inter', size: 10 } }
                    },
                    y1: {
                        type: 'linear',
                        position: 'left',
                        beginAtZero: true,
                        title: { display: true, text: 'عدد الشركات', color: '#22d3ee', font: { family: 'Cairo', size: 11 } },
                        grid: { display: false },
                        ticks: { color: '#22d3ee', font: { family: 'Inter', size: 10 }, stepSize: 1 }
                    }
                }
            }
        });
    },

    renderGeoReport() {
        if (typeof Chart === 'undefined') return;
        const ctx = document.getElementById('chart-geo-report');
        if (!ctx) return;
        if (this.charts.geoReport) this.charts.geoReport.destroy();

        const stats = window.AppStorage.getStats();
        const cityData = stats.companiesByCity;

        const sorted = Object.entries(cityData).sort((a, b) => b[1] - a[1]);
        const labels = sorted.map(([key]) => window.AppStorage.CITIES[key]?.ar || key);
        const data = sorted.map(([, count]) => count);

        const colors = [
            'rgba(99, 102, 241, 0.7)', 'rgba(34, 211, 238, 0.7)', 'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)', 'rgba(239, 68, 68, 0.7)', 'rgba(139, 92, 246, 0.7)',
            'rgba(6, 182, 212, 0.7)', 'rgba(249, 115, 22, 0.7)', 'rgba(236, 72, 153, 0.7)',
            'rgba(59, 130, 246, 0.7)', 'rgba(132, 204, 22, 0.7)', 'rgba(168, 85, 247, 0.7)',
            'rgba(100, 116, 139, 0.7)'
        ];

        this.charts.geoReport = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors.slice(0, data.length),
                    borderColor: 'rgba(11, 14, 23, 0.8)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'left',
                        labels: { color: '#94a3b8', font: { family: 'Cairo', size: 11 }, padding: 8 }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(26, 31, 53, 0.95)',
                        titleFont: { family: 'Cairo' },
                        bodyFont: { family: 'Cairo' },
                        cornerRadius: 8
                    }
                },
                scales: {
                    r: {
                        grid: { color: 'rgba(255,255,255,0.06)' },
                        ticks: { display: false }
                    }
                }
            }
        });
    },

    renderPerformanceSummary() {
        const calls = window.AppStorage.getCalls();
        const companies = window.AppStorage.getCompanies();

        // Response rate: positive calls / total calls
        const positiveCalls = calls.filter(c =>
            ['interested', 'meeting_scheduled', 'proposal_sent', 'visited'].includes(c.result)
        ).length;
        const responseRate = calls.length > 0 ? Math.round((positiveCalls / calls.length) * 100) : 0;

        // Coverage rate: contacted companies / total companies
        const contactedCompanies = companies.filter(c => c.status === 'contacted' || c.status === 'interested' || c.lastCallResult).length;
        const coverageRate = companies.length > 0 ? Math.round((contactedCompanies / companies.length) * 100) : 0;

        // Interested leads count
        const interestedCompanies = companies.filter(c => c.status === 'interested' || c.lastCallResult === 'interested').length;

        // Update UI safely
        const respEl = document.getElementById('perf-response-rate');
        const respValEl = document.getElementById('perf-response-value');
        if (respEl) respEl.style.width = responseRate + '%';
        if (respValEl) respValEl.textContent = responseRate + '%';

        const convEl = document.getElementById('perf-conversion-rate');
        const convValEl = document.getElementById('perf-conversion-value');
        if (convEl) convEl.style.width = coverageRate + '%';
        if (convValEl) convValEl.textContent = coverageRate + '%';

        const avgEl = document.getElementById('perf-avg-deal');
        const avgValEl = document.getElementById('perf-avg-deal-value');
        if (avgEl) avgEl.style.width = Math.min(100, Math.round((interestedCompanies / Math.max(1, contactedCompanies)) * 100)) + '%';
        if (avgValEl) avgValEl.textContent = interestedCompanies + ' شركة';
    }
};

window.Reports = Reports;
