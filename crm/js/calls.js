/* ============================================
   Calls Module — Fleet CRM
   ============================================ */

const Calls = {
    currentPage: 1,
    pageSize: 20,
    groupMode: 'company', // 'company' or 'flat'

    init() {
        this.render();
    },

    setGroupMode(mode) {
        this.groupMode = mode;
        const btnCompany = document.getElementById('btn-calls-group-company');
        const btnFlat = document.getElementById('btn-calls-group-flat');
        if (btnCompany) btnCompany.classList.toggle('active', mode === 'company');
        if (btnFlat) btnFlat.classList.toggle('active', mode === 'flat');
        this.renderTable();
    },

    render() {
        this.renderStats();
        this.renderTable();
    },

    clearAllCalls() {
        if (confirm('هل أنت تأكد من مسح جميع المكالمات المسجلة من السجل؟')) {
            Storage.clearAllCalls();
            this.render();
            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast('🗑️ تم مسح سجل المكالمات بنجاح');
            }
        }
    },

    renderStats() {
        const today = new Date().toISOString().split('T')[0];
        const calls = Storage.getCalls();
        const todayCalls = calls.filter(c => c.date === today);

        document.getElementById('calls-total-today').textContent = todayCalls.length;
        document.getElementById('calls-interested').textContent =
            todayCalls.filter(c => ['interested', 'meeting_scheduled', 'proposal_sent'].includes(c.result)).length;
        document.getElementById('calls-followup').textContent =
            todayCalls.filter(c => c.result === 'callback').length;
        document.getElementById('calls-not-interested').textContent =
            todayCalls.filter(c => ['not_interested', 'wrong_number'].includes(c.result)).length;
    },

    getCallAgentName(call) {
        if (call.createdByName) return call.createdByName;
        if (call.userId) {
            const u = Storage.getUser(call.userId);
            if (u) return u.name;
        }
        if (call.companyId) {
            const c = Storage.getCompany(call.companyId);
            if (c && c.assignedTo) {
                const u = Storage.getUser(c.assignedTo);
                if (u) return u.name;
            }
        }
        return 'غير محدد';
    },

    renderTable() {
        const currentUser = Storage.getCurrentUser();
        const calls = Storage.getCalls().sort((a, b) => {
            const dateA = new Date(a.date + 'T' + (a.time || '23:59'));
            const dateB = new Date(b.date + 'T' + (b.time || '23:59'));
            return dateB - dateA;
        });

        const total = calls.length;
        const countDisplay = document.getElementById('calls-count-display');
        if (countDisplay) countDisplay.textContent = `${total} مكالمة مسجلة`;

        const groupedContainer = document.getElementById('calls-grouped-container');
        const tableContainer = document.getElementById('calls-table-container');
        const empty = document.getElementById('calls-empty');

        if (total === 0) {
            if (groupedContainer) groupedContainer.innerHTML = '';
            if (tableContainer) tableContainer.style.display = 'none';
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';

        if (this.groupMode === 'company') {
            if (tableContainer) tableContainer.style.display = 'none';
            if (groupedContainer) {
                groupedContainer.style.display = 'flex';
                this.renderGroupedByCompany(calls, currentUser, groupedContainer);
            }
        } else {
            if (groupedContainer) groupedContainer.style.display = 'none';
            if (tableContainer) {
                tableContainer.style.display = 'block';
                this.renderFlatTable(calls, currentUser);
            }
        }
    },

    renderGroupedByCompany(calls, currentUser, container) {
        // Group calls by companyId
        const groupsMap = new Map();
        calls.forEach(call => {
            const compId = call.companyId || 'unlinked';
            if (!groupsMap.has(compId)) {
                groupsMap.set(compId, []);
            }
            groupsMap.get(compId).push(call);
        });

        const groupCards = [];
        groupsMap.forEach((companyCalls, compId) => {
            const company = Storage.getCompany(compId);
            const companyName = company ? (company.nameAr || company.nameEn) : 'شركة غير معروفة';
            const sectorLabel = company ? Storage.getSectorLabel(company.sector) : '—';
            const cityLabel = company ? Storage.getCityLabel(company.city) : '—';

            groupCards.push(`
                <div class="card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; overflow: hidden; backdrop-filter: blur(10px);">
                    <div class="card-header" style="background: rgba(124, 58, 237, 0.08); padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid var(--border-light);">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(124, 58, 237, 0.15); color: #7c3aed; display: flex; align-items: center; justify-content: center; font-size: 18px;">🏢</div>
                            <div>
                                <h3 style="margin: 0; font-size: 1.05rem; font-weight: 700; cursor: pointer; color: var(--text-primary);" onclick="Companies.showDetail('${compId}')">
                                    ${companyName}
                                </h3>
                                <div style="display: flex; gap: 6px; margin-top: 3px; align-items: center;">
                                    <span class="badge sector-badge" style="font-size: 10px;">${sectorLabel}</span>
                                    <span style="font-size: 11px; color: var(--text-muted);"><i class="fas fa-map-marker-alt" style="font-size: 10px;"></i> ${cityLabel}</span>
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span class="badge" style="background: rgba(99, 102, 241, 0.15); color: var(--primary-light); font-size: 12px; font-weight: 700; padding: 4px 10px;">
                                📞 ${companyCalls.length} ${companyCalls.length === 1 ? 'مكالمة' : 'مكالمات'}
                            </span>
                            <button class="btn btn-primary btn-sm" style="font-size: 12px; padding: 5px 12px; font-weight: 700;" onclick="App.logCallForCompany('${compId}')">
                                <i class="fas fa-plus"></i> + مكالمة جديدة
                            </button>
                        </div>
                    </div>
                    <div class="card-body" style="padding: 0;">
                        <div style="display: flex; flex-direction: column;">
                            ${companyCalls.map(call => {
                                const agentName = this.getCallAgentName(call);
                                return `
                                <div style="padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid var(--border-light); transition: background 0.15s ease;" onmouseover="this.style.background='rgba(99,102,241,0.04)'" onmouseout="this.style.background='transparent'">
                                    <div style="display: flex; align-items: center; gap: 14px; min-width: 260px;">
                                        <span class="result-badge result-${call.result}" style="font-size: 12px; padding: 4px 10px;">${Storage.getCallResultLabel(call.result)}</span>
                                        <div style="font-size: 12px;">
                                            <span style="color: var(--text-primary); font-weight: 700; font-family: Inter;">📅 ${call.date} ${call.time ? '⏰ ' + call.time : ''}</span>
                                            <div style="display:flex; gap:8px; align-items:center; margin-top:3px; flex-wrap:wrap;">
                                                <span style="background:rgba(124, 58, 237, 0.15); color:#8b5cf6; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:700; border:1px solid rgba(124, 58, 237, 0.25);">
                                                    👤 الموظف: ${agentName}
                                                </span>
                                                ${call.contactPerson ? `<span style="color: var(--text-muted); font-size: 11px;">(جهة الاتصال: ${call.contactPerson})</span>` : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <div style="flex: 1; min-width: 220px; font-size: 12.5px; color: var(--text-secondary);">
                                        ${call.notes ? `📝 ${call.notes}` : '<span style="color: var(--text-muted); font-style: italic;">لا توجد ملاحظات مدونة</span>'}
                                        ${call.followUpDate ? `<span style="display: block; font-size: 11px; color: var(--warning); margin-top: 3px; font-weight: 600;"><i class="fas fa-calendar-check"></i> موعد المتابعة القادمة: ${call.followUpDate}</span>` : ''}
                                    </div>
                                    ${currentUser && currentUser.role === 'admin' ? `
                                        <div class="table-actions">
                                            <button class="btn-icon btn-edit" onclick="Calls.edit('${call.id}')" title="تعديل"><i class="fas fa-edit"></i></button>
                                            <button class="btn-icon btn-delete" onclick="Calls.confirmDelete('${call.id}')" title="حذف"><i class="fas fa-trash"></i></button>
                                        </div>
                                    ` : ''}
                                </div>`;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `);
        });

        container.innerHTML = groupCards.join('');
    },

    renderFlatTable(calls, currentUser) {
        const total = calls.length;
        const totalPages = Math.ceil(total / this.pageSize);
        if (this.currentPage > totalPages) this.currentPage = Math.max(1, totalPages);

        const start = (this.currentPage - 1) * this.pageSize;
        const pageCalls = calls.slice(start, start + this.pageSize);
        const tbody = document.getElementById('calls-tbody');

        if (!tbody) return;

        tbody.innerHTML = pageCalls.map(call => {
            const company = Storage.getCompany(call.companyId);
            const companyName = company ? (company.nameAr || company.nameEn) : 'غير معروفة';
            const resultLabel = Storage.getCallResultLabel(call.result);
            const agentName = this.getCallAgentName(call);

            return `
                <tr>
                    <td style="font-family:Inter; font-size:0.8rem;">${call.date}</td>
                    <td style="font-family:Inter; font-size:0.8rem;">${call.time || '—'}</td>
                    <td>
                        <span style="cursor:pointer; font-weight:600; color:var(--primary-light);" onclick="Companies.showDetail('${call.companyId}')">${companyName}</span>
                    </td>
                    <td>
                        <span style="background:rgba(124, 58, 237, 0.12); color:#8b5cf6; padding:3px 8px; border-radius:10px; font-size:11px; font-weight:700; border:1px solid rgba(124, 58, 237, 0.2);">👤 ${agentName}</span>
                    </td>
                    <td>${call.contactPerson || '—'}</td>
                    <td><span class="result-badge result-${call.result}">${resultLabel}</span></td>
                    <td style="font-family:Inter; font-size:0.8rem;">${call.followUpDate || '—'}</td>
                    <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:0.8rem; color:var(--text-secondary);">${call.notes || '—'}</td>
                    <td>
                        <div class="table-actions">
                            ${currentUser && currentUser.role === 'admin' ? `
                                <button class="btn-icon btn-edit" onclick="Calls.edit('${call.id}')" title="تعديل">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon btn-delete" onclick="Calls.confirmDelete('${call.id}')" title="حذف">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : '<span style="font-size:11px; color:var(--text-muted);"><i class="fas fa-check-circle" style="color:#10b981;"></i> مسجلة</span>'}
                        </div>
                    </td>
                </tr>`;
        }).join('');

        this.renderPagination(totalPages);
    },

    renderPagination(totalPages) {
        const container = document.getElementById('calls-pagination');
        if (!container || totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }

        let html = `<button ${this.currentPage === 1 ? 'disabled' : ''} onclick="Calls.goToPage(${this.currentPage - 1})"><i class="fas fa-chevron-right"></i></button>`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="${i === this.currentPage ? 'active' : ''}" onclick="Calls.goToPage(${i})">${i}</button>`;
        }
        html += `<button ${this.currentPage === totalPages ? 'disabled' : ''} onclick="Calls.goToPage(${this.currentPage + 1})"><i class="fas fa-chevron-left"></i></button>`;
        container.innerHTML = html;
    },

    goToPage(page) {
        this.currentPage = page;
        this.renderTable();
    },

    openAddModal(companyId = '') {
        const form = document.getElementById('form-call');
        if (form) form.reset();

        document.getElementById('call-id').value = '';
        document.getElementById('modal-call-title').innerHTML = '<i class="fas fa-phone-alt"></i> تسجيل مكالمة جديدة';

        // Set today's date & time
        document.getElementById('call-date').value = new Date().toISOString().split('T')[0];
        const now = new Date();
        document.getElementById('call-time').value =
            String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

        this.populateCompanyDropdown('call-companyId', companyId);

        // Pre-fill contact person if available
        if (companyId) {
            const company = Storage.getCompany(companyId);
            if (company && company.contactPerson) {
                document.getElementById('call-contactPerson').value = company.contactPerson;
            }
        }

        App.openModal('modal-call');
    },

    populateCompanyDropdown(selectId, selectedCompanyId = '') {
        const select = document.getElementById(selectId);
        if (!select) return;

        let companies = Storage.getScopedCompanies();

        // If a specific company is selected, ensure it exists in the options even if scoping would filter it out
        if (selectedCompanyId) {
            const targetComp = Storage.getCompany(selectedCompanyId);
            if (targetComp && !companies.some(c => String(c.id) === String(selectedCompanyId))) {
                companies = [targetComp, ...companies];
            }
        }

        let html = '<option value="">اختر الشركة...</option>';
        companies.forEach(c => {
            const isSelected = (String(c.id) === String(selectedCompanyId)) ? 'selected="selected"' : '';
            const name = c.nameAr || c.nameEn || 'بدون اسم';
            html += `<option value="${c.id}" ${isSelected}>${name} (${Storage.getSectorLabel(c.sector)})</option>`;
        });
        select.innerHTML = html;
        select.value = selectedCompanyId || '';
    },

    edit(id) {
        const call = Storage.getCall(id);
        if (!call) return;

        document.getElementById('modal-call-title').innerHTML = '<i class="fas fa-edit"></i> تعديل المكالمة';
        document.getElementById('call-id').value = call.id;

        this.populateCompanyDropdown('call-companyId', call.companyId);

        document.getElementById('call-date').value = call.date || '';
        document.getElementById('call-time').value = call.time || '';
        document.getElementById('call-contactPerson').value = call.contactPerson || '';
        document.getElementById('call-result').value = call.result || 'no_answer';
        document.getElementById('call-followUpDate').value = call.followUpDate || '';
        document.getElementById('call-notes').value = call.notes || '';

        App.openModal('modal-call');
    },

    save() {
        const form = document.getElementById('form-call');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const currentUser = Storage.getCurrentUser();
        const call = {
            companyId: document.getElementById('call-companyId').value,
            date: document.getElementById('call-date').value,
            time: document.getElementById('call-time').value,
            contactPerson: document.getElementById('call-contactPerson').value,
            result: document.getElementById('call-result').value,
            followUpDate: document.getElementById('call-followUpDate').value,
            notes: document.getElementById('call-notes').value,
            userId: currentUser ? currentUser.id : 'admin',
            createdByName: currentUser ? currentUser.name : 'المدير العام'
        };

        const id = document.getElementById('call-id').value;
        if (id) call.id = id;

        Storage.saveCall(call);
        App.closeModal('modal-call');
        App.showToast(id ? 'تم تحديث المكالمة' : 'تم تسجيل المكالمة بنجاح', 'success');
        this.render();
        Dashboard.render();
    },

    confirmDelete(id) {
        document.getElementById('confirm-message').textContent = 'هل أنت متأكد من حذف هذه المكالمة؟';

        const confirmBtn = document.getElementById('btn-confirm-action');
        confirmBtn.onclick = () => {
            Storage.deleteCall(id);
            App.closeModal('modal-confirm');
            App.showToast('تم حذف المكالمة', 'success');
            this.render();
            Dashboard.render();
        };
        App.openModal('modal-confirm');
    }
};
