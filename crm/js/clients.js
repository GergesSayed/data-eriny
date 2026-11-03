/* ============================================
   Clients Module — Fleet CRM
   إدارة الشركات المتعاقدة والعملاء الفعليين (Active Clients)
   ============================================ */

const Clients = {
    selectedCompanyId: null,
    searchDebounceTimer: null,

    init() {
        this.bindEvents();
        this.updateSidebarBadge();
    },

    bindEvents() {
        const searchInput = document.getElementById('filter-client-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                clearTimeout(this.searchDebounceTimer);
                this.searchDebounceTimer = setTimeout(() => this.renderList(), 250);
            });
        }

        const agentFilter = document.getElementById('filter-client-agent');
        if (agentFilter) {
            agentFilter.addEventListener('change', () => this.renderList());
        }

        const typeFilter = document.getElementById('filter-client-type');
        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.renderList());
        }

        const govFilter = document.getElementById('filter-client-gov');
        if (govFilter) {
            govFilter.addEventListener('change', () => this.renderList());
        }
    },

    render() {
        try {
            const clientPage = document.getElementById('page-clients');
            if (!clientPage || !clientPage.classList.contains('active')) return;

            const currentUser = window.AppStorage ? window.AppStorage.getCurrentUser() : null;
            const canViewAll = window.AppStorage ? window.AppStorage.canViewAll(currentUser) : true;

            // Populate filters
            this.populateFilters(canViewAll, currentUser);

            // Update KPI cards
            this.updateKPIs();

            // Render clients list
            this.renderList();

            // Sync sidebar badge
            this.updateSidebarBadge();
        } catch(e) {
            console.error('Clients render error:', e);
        }
    },

    populateFilters(canViewAll, currentUser) {
        const agentFilter = document.getElementById('filter-client-agent');
        if (agentFilter) {
            if (!canViewAll) {
                agentFilter.style.display = 'none';
            } else {
                agentFilter.style.display = 'inline-block';
                const users = window.AppStorage ? window.AppStorage.getUsers() : [];
                const currentVal = agentFilter.value;
                agentFilter.innerHTML = '<option value="">جميع مسؤولي الحسابات</option>' +
                    users.map(u => `<option value="${u.id}" ${currentVal === u.id ? 'selected' : ''}>${u.name || u.username}</option>`).join('');
            }
        }

        const govFilter = document.getElementById('filter-client-gov');
        if (govFilter && govFilter.children.length <= 1) {
            const govs = window.AppStorage ? window.AppStorage.GOVERNORATES : {};
            let html = '<option value="">كل المحافظات</option>';
            for (const [k, g] of Object.entries(govs)) {
                html += `<option value="${g.ar}">${g.ar}</option>`;
            }
            govFilter.innerHTML = html;
        }
    },

    updateKPIs() {
        const clientsMap = window.AppStorage ? window.AppStorage.getStoredClients() : {};
        const currentUser = window.AppStorage ? window.AppStorage.getCurrentUser() : null;
        const canViewAll = window.AppStorage ? window.AppStorage.canViewAll(currentUser) : true;

        const matchedUser = currentUser ? (window.AppStorage ? (window.AppStorage.getUser(currentUser.id) || window.AppStorage.getUserByUsername(currentUser.username) || window.AppStorage.getUserByEmail(currentUser.email) || currentUser) : currentUser) : null;
        const myKeys = matchedUser ? new Set([
            String(matchedUser.id || '').trim().toLowerCase(),
            String(matchedUser.username || '').trim().toLowerCase(),
            String(matchedUser.email || '').trim().toLowerCase(),
            String(matchedUser.name || '').trim().toLowerCase(),
            String(currentUser.id || '').trim().toLowerCase(),
            String(currentUser.username || '').trim().toLowerCase(),
            String(currentUser.email || '').trim().toLowerCase(),
            String(currentUser.name || '').trim().toLowerCase()
        ].filter(Boolean)) : new Set();

        let totalClients = 0;
        let annualContracts = 0;
        let vipClients = 0;
        let totalFleet = 0;

        for (const [cId, rec] of Object.entries(clientsMap)) {
            if (!rec || !rec.isClient) continue;
            if (!canViewAll) {
                const asgn = String(rec.assignedTo || '').toLowerCase();
                if (!myKeys.has(asgn)) continue;
            }

            totalClients++;
            if (rec.clientType === 'contract') annualContracts++;
            if (rec.clientType === 'vip') vipClients++;

            const comp = window.AppStorage ? window.AppStorage.getCompany(cId) : null;
            if (comp) {
                if (comp.isTitan || comp.vip || (comp.id && String(comp.id).startsWith('eg_titan_'))) {
                    vipClients++;
                }
                const fSize = parseInt(comp.fleetSize) || 0;
                totalFleet += fSize;
            }
        }

        const elTotal = document.getElementById('client-kpi-total');
        if (elTotal) elTotal.textContent = totalClients.toLocaleString('en-US');

        const elAnnual = document.getElementById('client-kpi-annual');
        if (elAnnual) elAnnual.textContent = annualContracts.toLocaleString('en-US');

        const elVip = document.getElementById('client-kpi-vip');
        if (elVip) elVip.textContent = vipClients.toLocaleString('en-US');

        const elFleet = document.getElementById('client-kpi-fleet');
        if (elFleet) elFleet.textContent = totalFleet.toLocaleString('en-US');
    },

    getFilteredClients() {
        const clientsMap = window.AppStorage ? window.AppStorage.getStoredClients() : {};
        const currentUser = window.AppStorage ? window.AppStorage.getCurrentUser() : null;
        const canViewAll = window.AppStorage ? window.AppStorage.canViewAll(currentUser) : true;

        const matchedUser = currentUser ? (window.AppStorage ? (window.AppStorage.getUser(currentUser.id) || window.AppStorage.getUserByUsername(currentUser.username) || window.AppStorage.getUserByEmail(currentUser.email) || currentUser) : currentUser) : null;
        const myKeys = matchedUser ? new Set([
            String(matchedUser.id || '').trim().toLowerCase(),
            String(matchedUser.username || '').trim().toLowerCase(),
            String(matchedUser.email || '').trim().toLowerCase(),
            String(matchedUser.name || '').trim().toLowerCase(),
            String(currentUser.id || '').trim().toLowerCase(),
            String(currentUser.username || '').trim().toLowerCase(),
            String(currentUser.email || '').trim().toLowerCase(),
            String(currentUser.name || '').trim().toLowerCase()
        ].filter(Boolean)) : new Set();

        const searchVal = (document.getElementById('filter-client-search')?.value || '').toLowerCase().trim();
        const agentVal = (document.getElementById('filter-client-agent')?.value || '').toLowerCase().trim();
        const typeVal = document.getElementById('filter-client-type')?.value || '';
        const govVal = document.getElementById('filter-client-gov')?.value || '';

        const result = [];

        for (const [companyId, rec] of Object.entries(clientsMap)) {
            if (!rec || !rec.isClient) continue;

            const company = window.AppStorage ? window.AppStorage.getCompany(companyId) : null;
            if (!company) continue;

            const asgn = String(rec.assignedTo || company.assignedTo || '').toLowerCase();

            // Role access check
            if (!canViewAll) {
                if (!myKeys.has(asgn)) continue;
            } else if (agentVal) {
                const targetUser = window.AppStorage.getUser(agentVal);
                const targetKeys = targetUser ? new Set([
                    String(targetUser.id || '').toLowerCase(),
                    String(targetUser.username || '').toLowerCase(),
                    String(targetUser.name || '').toLowerCase()
                ]) : new Set([agentVal]);
                if (!targetKeys.has(asgn)) continue;
            }

            // Type filter
            if (typeVal && rec.clientType !== typeVal) {
                continue;
            }

            // Governorate filter
            if (govVal && company.governorate !== govVal && company.city !== govVal) {
                continue;
            }

            // Search filter
            if (searchVal) {
                const matchNameAr = (company.nameAr || '').toLowerCase().includes(searchVal);
                const matchNameEn = (company.nameEn || '').toLowerCase().includes(searchVal);
                const matchContact = (company.contactPerson || '').toLowerCase().includes(searchVal);
                const matchPhone = (company.phone1 || company.mobile || company.contactPhone || '').includes(searchVal);
                const matchCity = (company.city || '').toLowerCase().includes(searchVal);
                const matchNotes = (rec.notes || rec.dealDetails || '').toLowerCase().includes(searchVal);

                if (!matchNameAr && !matchNameEn && !matchContact && !matchPhone && !matchCity && !matchNotes) {
                    continue;
                }
            }

            result.push({
                company,
                clientRecord: rec
            });
        }

        // Sort descending by contractDate / updatedAt
        result.sort((a, b) => {
            const tsA = a.clientRecord.updatedAt || new Date(a.clientRecord.contractDate || 0).getTime();
            const tsB = b.clientRecord.updatedAt || new Date(b.clientRecord.contractDate || 0).getTime();
            return tsB - tsA;
        });

        return result;
    },

    renderList() {
        const container = document.getElementById('clients-list-container');
        if (!container) return;

        const list = this.getFilteredClients();
        const esc = (s) => (window.AppStorage && window.AppStorage.escapeHtml) ? window.AppStorage.escapeHtml(s || '') : String(s || '');
        const currentUser = window.AppStorage ? window.AppStorage.getCurrentUser() : null;
        const isAdmin = window.AppStorage ? window.AppStorage.isAdmin(currentUser) : false;

        if (list.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 60px 20px; background: var(--bg-surface); border-radius: 16px; border: 1px dashed var(--border-color);">
                    <div style="width: 72px; height: 72px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); color: #10b981; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 16px;">
                        <i class="fas fa-handshake"></i>
                    </div>
                    <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0 0 8px 0;">لا توجد شركات متعاقدة مسجلة حالياً</h3>
                    <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 450px; margin: 0 auto 20px auto;">
                        يمكنك تحويل أي شركة من قاعدة البيانات إلى عميل متعاقد رسمي من خلال زر "إضافة شركة متعاقدة" أو من داخل بطاقة الشركة.
                    </p>
                    <button class="btn btn-primary" onclick="Clients.openConvertModal()" style="background: linear-gradient(135deg, #10b981, #059669); border: none; font-weight: 700; gap: 8px;">
                        <i class="fas fa-plus"></i> إضافة أول شركة متعاقدة 🤝
                    </button>
                </div>
            `;
            return;
        }

        const typeLabels = {
            contract: { label: 'عقد توريد سنوي / دوري', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
            active_orders: { label: 'طلبيات وتوريد مستمر', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
            vip: { label: 'عميل استراتيجي VIP', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
            trial: { label: 'فترة تجربة أولى', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' }
        };

        const rowsHtml = list.map((item, idx) => {
            const c = item.company;
            const r = item.clientRecord;
            const typeConf = typeLabels[r.clientType] || typeLabels.contract;

            const asgnUser = window.AppStorage ? window.AppStorage.getUser(r.assignedTo || c.assignedTo) : null;
            const asgnName = asgnUser ? (asgnUser.name || asgnUser.username) : (r.assignedTo || 'غير محدد');
            const asgnAvatar = asgnUser ? (asgnUser.avatar || '👨‍💼') : '👨‍💼';

            const phone = c.phone1 || c.mobile || c.contactPhone || '';
            const cleanPhone = phone.replace(/[^\d+]/g, '');
            const isVip = Boolean(c.isTitan || (c.id && String(c.id).startsWith('eg_titan_')) || c.isVIP || c.vip);

            return `
                <tr class="client-table-row" style="transition: all 0.2s ease;">
                    <td style="font-weight: 700; text-align: center; color: var(--text-muted); width: 40px;">${idx + 1}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(16, 185, 129, 0.12); color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;">
                                <i class="fas fa-handshake"></i>
                            </div>
                            <div>
                                <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary); cursor: pointer;" onclick="Companies.showDetail('${c.id}')">
                                    ${esc(c.nameAr || c.nameEn)}
                                    ${isVip ? '<span class="badge" style="background: linear-gradient(135deg, #f59e0b, #d97706); color:#fff; font-size:10px; padding:1px 6px; border-radius:4px; margin-right:4px;"><i class="fas fa-crown"></i> VIP</span>' : ''}
                                </div>
                                <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
                                    <span><i class="fas fa-tag"></i> ${esc(c.sector || 'قطاع عام')}</span> • 
                                    <span><i class="fas fa-map-marker-alt"></i> ${esc(c.city || c.governorate || 'مصر')}</span>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div>
                            <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-primary);">
                                <i class="fas fa-user-tie" style="color: #6366f1; margin-left: 4px;"></i>
                                ${esc(c.contactPerson || 'غير مسجل')}
                            </div>
                            ${phone ? `
                                <div style="display: flex; align-items: center; gap: 6px; margin-top: 3px;">
                                    <a href="tel:${cleanPhone}" class="btn-icon" style="color: #10b981; font-size: 12px; text-decoration: none;" title="اتصال">
                                        <i class="fas fa-phone-alt"></i>
                                    </a>
                                    <a href="https://wa.me/${cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone}" target="_blank" class="btn-icon" style="color: #22c55e; font-size: 13px; text-decoration: none;" title="واتساب">
                                        <i class="fab fa-whatsapp"></i>
                                    </a>
                                    <span style="font-family: Inter; font-size: 0.8rem; color: var(--text-secondary); direction: ltr;">${esc(phone)}</span>
                                </div>
                            ` : '<span style="font-size: 0.75rem; color: var(--text-muted);">لا يوجد هاتف</span>'}
                        </div>
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 18px;">${asgnAvatar}</span>
                            <div>
                                <div style="font-weight: 700; font-size: 0.88rem; color: #38bdf8;">${esc(asgnName)}</div>
                                <div style="font-size: 0.72rem; color: var(--text-muted);">المسؤول عن الحساب</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="badge" style="background: ${typeConf.bg}; color: ${typeConf.color}; border: 1px solid ${typeConf.color}44; font-size: 11px; padding: 3px 8px; border-radius: 6px; font-weight: 700; display: inline-block;">
                            ${typeConf.label}
                        </span>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 3px;">
                            بدء: <span style="font-family: Inter;">${esc(r.contractDate || 'غير محدد')}</span>
                        </div>
                    </td>
                    <td>
                        <div style="max-width: 220px; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.35;">
                            ${r.dealDetails ? `<div><strong>التوريد:</strong> ${esc(r.dealDetails)}</div>` : ''}
                            ${r.notes ? `<div style="font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${esc(r.notes)}</div>` : ''}
                            ${(!r.dealDetails && !r.notes) ? '<span style="color:var(--text-muted); font-size:0.75rem;">—</span>' : ''}
                        </div>
                    </td>
                    <td>
                        <div style="display: flex; gap: 6px; align-items: center; justify-content: flex-end;">
                            <button class="btn btn-outline btn-sm" onclick="Companies.showDetail('${c.id}')" title="عرض تفاصيل الشركة" style="padding: 4px 8px; font-size: 11px;">
                                <i class="fas fa-eye"></i> <span>الكارت</span>
                            </button>
                            <button class="btn btn-accent btn-sm" onclick="App.logCallForCompany('${c.id}')" title="تسجيل مكالمة / متابعة" style="padding: 4px 8px; font-size: 11px;">
                                <i class="fas fa-phone-alt"></i> <span>متابعة</span>
                            </button>
                            <button class="btn btn-outline btn-sm" onclick="Clients.openConvertModal('${c.id}')" title="تعديل بيانات التعاقد" style="padding: 4px 8px; font-size: 11px; color: #10b981; border-color: rgba(16, 185, 129, 0.4);">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${isAdmin ? `
                                <button class="btn btn-ghost btn-sm" onclick="Clients.confirmRevert('${c.id}')" title="إلغاء التعاقد وإعادة للشركات العامة" style="padding: 4px 8px; font-size: 11px; color: #ef4444;">
                                    <i class="fas fa-undo"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        container.innerHTML = `
            <div class="table-responsive" style="overflow-x: auto; border-radius: 12px; border: 1px solid var(--border-color); background: var(--bg-surface);">
                <table class="table" style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead>
                        <tr style="background: rgba(255,255,255,0.03); border-bottom: 1.5px solid var(--border-color); font-size: 0.8rem; color: var(--text-muted);">
                            <th style="padding: 12px; text-align: center;">#</th>
                            <th style="padding: 12px;">الشركة والقطاع</th>
                            <th style="padding: 12px;">جهة الاتصال</th>
                            <th style="padding: 12px;">المسؤول عن الحساب</th>
                            <th style="padding: 12px;">نوع وتاريخ التعاقد</th>
                            <th style="padding: 12px;">تفاصيل التوريد</th>
                            <th style="padding: 12px; text-align: left;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; font-size: 0.82rem; color: var(--text-muted);">
                <span>إجمالي الشركات المتعاقدة المعروضة: <b style="color: #10b981;">${list.length}</b> شركة</span>
                <span>نظام إدارة تعاقدات الأساطيل والتوريد • Fleet CRM</span>
            </div>
        `;
    },

    openConvertModal(companyId = null) {
        this.selectedCompanyId = companyId;
        const modal = document.getElementById('modal-convert-client');
        if (!modal) return;

        const users = window.AppStorage ? window.AppStorage.getUsers() : [];
        const currentUser = window.AppStorage ? window.AppStorage.getCurrentUser() : null;
        const currentUserId = currentUser ? (currentUser.id || currentUser.username) : 'admin';

        // Populate users dropdown
        const userSelect = document.getElementById('convert-client-assigned');
        if (userSelect) {
            userSelect.innerHTML = users.map(u => `
                <option value="${u.id}">${u.name || u.username} (${u.role === 'admin' ? 'مدير عام' : 'مبيعات'})</option>
            `).join('');
        }

        const compNameDisplay = document.getElementById('convert-client-comp-display');
        const compSearchWrap = document.getElementById('convert-client-comp-search-wrap');
        const modalTitle = document.getElementById('convert-client-modal-title');

        if (companyId) {
            const comp = window.AppStorage ? window.AppStorage.getCompany(companyId) : null;
            const rec = window.AppStorage ? window.AppStorage.getClientRecord(companyId) : null;

            if (modalTitle) {
                modalTitle.innerHTML = rec ? '<i class="fas fa-handshake" style="color:#10b981;"></i> تعديل بيانات التعاقد' : '<i class="fas fa-handshake" style="color:#10b981;"></i> تحويل الشركة إلى عميل متعاقد';
            }

            if (compNameDisplay) {
                compNameDisplay.innerHTML = `
                    <div style="padding: 10px 14px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; color: #10b981; font-weight: 800; font-size: 1rem;">
                        <i class="fas fa-building"></i> ${comp ? (comp.nameAr || comp.nameEn) : companyId}
                        <small style="color:var(--text-muted); font-size:0.75rem; display:block; margin-top:2px;">${comp ? (comp.city || comp.governorate || '') : ''}</small>
                    </div>
                `;
                compNameDisplay.style.display = 'block';
            }
            if (compSearchWrap) compSearchWrap.style.display = 'none';

            // Populate form fields
            if (rec) {
                if (userSelect) userSelect.value = rec.assignedTo || comp.assignedTo || currentUserId;
                const typeEl = document.getElementById('convert-client-type');
                if (typeEl) typeEl.value = rec.clientType || 'contract';
                const dateEl = document.getElementById('convert-client-date');
                if (dateEl) dateEl.value = rec.contractDate || new Date().toISOString().split('T')[0];
                const dealEl = document.getElementById('convert-client-deal');
                if (dealEl) dealEl.value = rec.dealDetails || '';
                const notesEl = document.getElementById('convert-client-notes');
                if (notesEl) notesEl.value = rec.notes || '';
            } else {
                if (userSelect) userSelect.value = (comp && comp.assignedTo) ? comp.assignedTo : currentUserId;
                const typeEl = document.getElementById('convert-client-type');
                if (typeEl) typeEl.value = 'contract';
                const dateEl = document.getElementById('convert-client-date');
                if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];
                const dealEl = document.getElementById('convert-client-deal');
                if (dealEl) dealEl.value = '';
                const notesEl = document.getElementById('convert-client-notes');
                if (notesEl) notesEl.value = '';
            }
        } else {
            // New conversion without pre-selected company
            if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-handshake" style="color:#10b981;"></i> إضافة شركة إلى قائمة العملاء المتعاقدين';
            if (compNameDisplay) compNameDisplay.style.display = 'none';
            if (compSearchWrap) compSearchWrap.style.display = 'block';

            const searchInput = document.getElementById('convert-search-company-input');
            if (searchInput) searchInput.value = '';
            const resultsBox = document.getElementById('convert-company-results');
            if (resultsBox) resultsBox.innerHTML = '';

            const dateEl = document.getElementById('convert-client-date');
            if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];
            const dealEl = document.getElementById('convert-client-deal');
            if (dealEl) dealEl.value = '';
            const notesEl = document.getElementById('convert-client-notes');
            if (notesEl) notesEl.value = '';
        }

        App.openModal('modal-convert-client');
    },

    searchCompaniesForConversion(keyword) {
        const resultsBox = document.getElementById('convert-company-results');
        if (!resultsBox) return;

        const kw = (keyword || '').toLowerCase().trim();
        if (kw.length < 2) {
            resultsBox.innerHTML = '';
            return;
        }

        const companies = window.AppStorage ? window.AppStorage.getCompanies() : [];
        const matches = [];

        for (let i = 0; i < companies.length; i++) {
            const c = companies[i];
            if (!c) continue;
            if ((c.nameAr && c.nameAr.toLowerCase().includes(kw)) || (c.nameEn && c.nameEn.toLowerCase().includes(kw))) {
                matches.push(c);
                if (matches.length >= 8) break;
            }
        }

        if (matches.length === 0) {
            resultsBox.innerHTML = '<div style="padding:10px; color:var(--text-muted); font-size:0.8rem; text-align:center;">لا توجد شركات مطابقة لهذا الاسم.</div>';
            return;
        }

        resultsBox.innerHTML = matches.map(c => `
            <div onclick="Clients.selectCompanyForConversion('${c.id}')" style="padding: 8px 12px; border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background 0.15s ease;" onmouseover="this.style.background='rgba(16, 185, 129, 0.1)'" onmouseout="this.style.background='transparent'">
                <div style="font-weight: 700; color: var(--text-primary); font-size: 0.9rem;">${c.nameAr || c.nameEn}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${c.sector || ''} • ${c.city || c.governorate || ''}</div>
            </div>
        `).join('');
    },

    selectCompanyForConversion(companyId) {
        this.selectedCompanyId = companyId;
        const comp = window.AppStorage ? window.AppStorage.getCompany(companyId) : null;
        const compNameDisplay = document.getElementById('convert-client-comp-display');
        const compSearchWrap = document.getElementById('convert-client-comp-search-wrap');

        if (comp && compNameDisplay) {
            compNameDisplay.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; padding: 10px 14px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; color: #10b981; font-weight: 800; font-size: 1rem;">
                    <div>
                        <i class="fas fa-building"></i> ${comp.nameAr || comp.nameEn}
                        <small style="color:var(--text-muted); font-size:0.75rem; display:block; margin-top:2px;">${comp.city || comp.governorate || ''}</small>
                    </div>
                    <button type="button" onclick="Clients.selectedCompanyId=null; document.getElementById('convert-client-comp-display').style.display='none'; document.getElementById('convert-client-comp-search-wrap').style.display='block';" style="background:transparent; border:none; color:#ef4444; font-size:12px; cursor:pointer;">
                        تغيير
                    </button>
                </div>
            `;
            compNameDisplay.style.display = 'block';
            if (compSearchWrap) compSearchWrap.style.display = 'none';
        }
    },

    async saveConvertForm() {
        if (!this.selectedCompanyId) {
            if (window.App && App.showToast) App.showToast('⚠️ يرجى اختيار الشركة أولاً!', 'warning');
            return;
        }

        const assignedTo = document.getElementById('convert-client-assigned')?.value || '';
        const clientType = document.getElementById('convert-client-type')?.value || 'contract';
        const contractDate = document.getElementById('convert-client-date')?.value || new Date().toISOString().split('T')[0];
        const dealDetails = document.getElementById('convert-client-deal')?.value || '';
        const notes = document.getElementById('convert-client-notes')?.value || '';

        const saveBtn = document.getElementById('btn-save-convert-client');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري حفظ وتثبيت التعاقد...';
        }

        try {
            await window.AppStorage.convertToClient(this.selectedCompanyId, {
                assignedTo,
                clientType,
                contractDate,
                dealDetails,
                notes
            });

            if (window.App && App.showToast) {
                App.showToast('🎉 تم اعتماد التعاقد وتثبيت الشركة كعميل رسمي بنجاح!', 'success');
            }

            App.closeModal('modal-convert-client');

            // Refresh views
            this.render();
            if (typeof Companies !== 'undefined') {
                Companies.render();
            }
            if (typeof Dashboard !== 'undefined') {
                Dashboard.render();
            }
        } catch(e) {
            console.error('Error saving client conversion:', e);
            if (window.App && App.showToast) App.showToast('حدث خطأ أثناء الحفظ. يرجى المحاولة ثانية.', 'danger');
        } finally {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-check"></i> تثبيت التعاقد كعميل رسمي 🤝';
            }
        }
    },

    confirmRevert(companyId) {
        this.selectedCompanyId = companyId;
        const comp = window.AppStorage ? window.AppStorage.getCompany(companyId) : null;
        const compNameEl = document.getElementById('revert-client-comp-name');
        if (compNameEl) {
            compNameEl.textContent = comp ? (comp.nameAr || comp.nameEn) : companyId;
        }
        App.openModal('modal-revert-client');
    },

    async executeRevert() {
        if (!this.selectedCompanyId) return;
        const compId = this.selectedCompanyId;

        const btn = document.getElementById('btn-confirm-revert-client');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإلغاء...';
        }

        try {
            await window.AppStorage.revertFromClient(compId);
            if (window.App && App.showToast) {
                App.showToast('ℹ️ تم إلغاء التعاقد وإعادة الشركة إلى قائمة الشركات العامة بنجاح.', 'info');
            }
            App.closeModal('modal-revert-client');
            this.render();
            if (typeof Companies !== 'undefined') Companies.render();
            if (typeof Dashboard !== 'undefined') Dashboard.render();
        } catch(e) {
            console.error('Revert client error:', e);
            if (window.App && App.showToast) App.showToast('حدث خطأ أثناء إلغاء التعاقد.', 'danger');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-undo"></i> نعم، إلغاء التعاقد وإعادتها للشركات العامة';
            }
        }
    },

    exportExcel() {
        if (typeof XLSX === 'undefined') {
            if (window.App && App.showToast) App.showToast('مكتبة Excel غير جاهزة بعد.', 'warning');
            return;
        }

        const list = this.getFilteredClients();
        if (list.length === 0) {
            if (window.App && App.showToast) App.showToast('لا توجد بيانات شركات متعاقدة لتصديرها.', 'info');
            return;
        }

        const typeLabels = {
            contract: 'عقد توريد سنوي / دوري',
            active_orders: 'طلبيات وتوريد مستمر',
            vip: 'عميل استراتيجي VIP',
            trial: 'فترة تجربة أولى'
        };

        const rows = list.map((item, idx) => {
            const c = item.company;
            const r = item.clientRecord;
            const asgnUser = window.AppStorage ? window.AppStorage.getUser(r.assignedTo || c.assignedTo) : null;
            return {
                'م': idx + 1,
                'اسم الشركة': c.nameAr || c.nameEn,
                'القطاع': c.sector || '',
                'المحافظة': c.governorate || '',
                'المنطقة / المدينة': c.city || '',
                'جهة الاتصال': c.contactPerson || '',
                'المسمى الوظيفي': c.contactTitle || '',
                'رقم الهاتف': c.phone1 || c.mobile || '',
                'المسؤول عن الحساب': asgnUser ? (asgnUser.name || asgnUser.username) : (r.assignedTo || ''),
                'نوع التعاقد': typeLabels[r.clientType] || r.clientType || 'عقد توريد',
                'تاريخ بدء التعاقد': r.contractDate || '',
                'تفاصيل التوريد والأسطول': r.dealDetails || '',
                'ملاحظات': r.notes || '',
                'تاريخ التحويل': (r.convertedAt || '').split('T')[0]
            };
        });

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'الشركات المتعاقدة');

        const fileName = `FleetCRM_Contracted_Clients_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);

        if (window.App && App.showToast) {
            App.showToast(`📊 تم تصدير ${rows.length} شركة متعاقدة إلى Excel بنجاح.`, 'success');
        }
    },

    updateSidebarBadge() {
        if (window.AppStorage && typeof window.AppStorage.updateSidebarBadge === 'function') {
            window.AppStorage.updateSidebarBadge();
        }
    }
};

window.Clients = Clients;
