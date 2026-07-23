/* ============================================
   Companies Module — Fleet CRM
   ============================================ */

const Companies = {
    currentPage: 1,
    pageSize: 15,
    sortField: 'priority',
    sortDir: 'asc',
    viewMode: 'table', // 'table' or 'cards'
    selectedCompanies: new Set(),

    init() {
        this.bindEvents();
        this.refreshUserFilter();
        this.render();
    },

    refreshUserFilter() {
        const currentUser = Storage.getCurrentUser();
        const isAdmin = Storage.isAdmin(currentUser);
        const users = (Storage.getUsers() || []).filter(u => u.role !== 'admin');
        const allUsers = Storage.getUsers() || [];

        // 1. Filter dropdown container visibility
        const filterGroup = document.getElementById('filter-assigned-group') || document.getElementById('filter-assigned')?.parentElement;
        if (filterGroup) {
            filterGroup.style.display = isAdmin ? 'block' : 'none';
        }

        const sel = document.getElementById('filter-assigned');
        if (sel) {
            if (!isAdmin) {
                sel.value = '';
            } else {
                const currentVal = sel.value;
                const agentOptions = users.map(u =>
                    `<option value="${u.id}">${u.avatar || '👤'} ${u.name}</option>`
                ).join('');
                sel.innerHTML = `
                    <option value="">👤 كل الموظفين / المسند إليهم</option>
                    <option value="my_leads">⭐ شركاتي أنا فقط</option>
                    <option value="unassigned">⚪ غير مسندة لأحد</option>
                    ${agentOptions}
                `;
                if (currentVal) sel.value = currentVal;
            }
        }

        // 2. Bulk assign user select dropdown
        const bulkSel = document.getElementById('bulk-assign-user-select');
        if (bulkSel) {
            const currentVal = bulkSel.value;
            const optionsHtml = allUsers.map(u =>
                `<option value="${u.id}">${u.role === 'admin' ? '👑' : (u.avatar || '👤')} ${u.name}</option>`
            ).join('');
            bulkSel.innerHTML = `
                <option value="">تخصيص لـ...</option>
                ${optionsHtml}
                <option value="">⚪ إلغاء التخصيص</option>
            `;
            if (currentVal) bulkSel.value = currentVal;
        }
    },

    bindEvents() {
        // Filters
        document.getElementById('filter-sector')?.addEventListener('change', () => this.render());
        document.getElementById('filter-city')?.addEventListener('change', () => this.render());
        document.getElementById('filter-priority')?.addEventListener('change', () => this.render());
        document.getElementById('filter-fleet-type')?.addEventListener('change', () => this.render());
        document.getElementById('filter-assigned')?.addEventListener('change', () => this.render());
        document.getElementById('filter-search')?.addEventListener('input', () => {
            this.currentPage = 1;
            this.render();
        });
        document.getElementById('btn-clear-filters')?.addEventListener('click', () => this.clearFilters());

        // View toggle
        document.getElementById('btn-view-table')?.addEventListener('click', () => this.setView('table'));
        document.getElementById('btn-view-cards')?.addEventListener('click', () => this.setView('cards'));

        // Bulk assignment listeners
        document.getElementById('btn-apply-bulk-assign')?.addEventListener('click', () => this.applyBulkAssign());
        document.getElementById('btn-cancel-bulk-selection')?.addEventListener('click', () => this.clearSelection());

        // Sort
        document.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const field = th.dataset.sort;
                if (this.sortField === field) {
                    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortField = field;
                    this.sortDir = 'asc';
                }
                this.render();
            });
        });
    },

    getFilteredCompanies() {
        let companies = Storage.getScopedCompanies();

        const sector = document.getElementById('filter-sector')?.value;
        const city = document.getElementById('filter-city')?.value;
        const priority = document.getElementById('filter-priority')?.value;
        const fleetType = document.getElementById('filter-fleet-type')?.value;
        const assigned = document.getElementById('filter-assigned')?.value;
        const search = document.getElementById('filter-search')?.value?.toLowerCase().trim();

        if (sector) companies = companies.filter(c => c.sector === sector);
        if (city) companies = companies.filter(c => c.city === city);
        if (priority) companies = companies.filter(c => c.priority === priority);
        if (fleetType) companies = companies.filter(c => c.fleetType === fleetType);
        
        if (assigned) {
            const currentUser = Storage.getCurrentUser();
            if (assigned === 'my_leads') {
                companies = companies.filter(c => c.assignedTo === currentUser.id);
            } else if (assigned === 'unassigned') {
                companies = companies.filter(c => !c.assignedTo);
            } else {
                companies = companies.filter(c => c.assignedTo === assigned);
            }
        }
        if (search) {
            companies = companies.filter(c =>
                (c.nameAr && c.nameAr.includes(search)) ||
                (c.nameEn && c.nameEn.toLowerCase().includes(search)) ||
                (c.phone1 && c.phone1.includes(search)) ||
                (c.phone2 && c.phone2.includes(search)) ||
                (c.mobile && c.mobile.includes(search)) ||
                (c.contactPerson && c.contactPerson.includes(search)) ||
                (c.email && c.email.toLowerCase().includes(search))
            );
        }

        // Sort
        companies.sort((a, b) => {
            let valA = a[this.sortField] || '';
            let valB = b[this.sortField] || '';

            if (this.sortField === 'fleetSize' || this.sortField === 'branchesCount') {
                valA = Number(valA) || 0;
                valB = Number(valB) || 0;
            }

            if (this.sortField === 'priority') {
                const order = { A: 1, B: 2, C: 3 };
                valA = order[valA] || 2;
                valB = order[valB] || 2;
            }

            if (typeof valA === 'number') {
                return this.sortDir === 'asc' ? valA - valB : valB - valA;
            }
            return this.sortDir === 'asc'
                ? String(valA).localeCompare(String(valB), 'ar')
                : String(valB).localeCompare(String(valA), 'ar');
        });

        return companies;
    },

    render() {
        const companies = this.getFilteredCompanies();
        const total = companies.length;
        const totalPages = Math.ceil(total / this.pageSize);
        if (this.currentPage > totalPages) this.currentPage = Math.max(1, totalPages);

        const start = (this.currentPage - 1) * this.pageSize;
        const pageCompanies = companies.slice(start, start + this.pageSize);

        // Update count
        document.getElementById('companies-count-display').textContent = `${total} شركة`;

        if (this.viewMode === 'table') {
            this.renderTable(pageCompanies, total);
        } else {
            this.renderCards(pageCompanies, total);
        }

        this.renderPagination(totalPages);
    },

    renderTable(companies, total) {
        const tbody = document.getElementById('companies-tbody');
        const empty = document.getElementById('companies-empty');
        const tableView = document.getElementById('companies-table-view');
        const cardsView = document.getElementById('companies-cards-view');
        const currentUser = Storage.getCurrentUser();
        const isAdmin = Storage.isAdmin(currentUser);

        const thSelectAll = document.getElementById('th-select-all-companies');
        if (thSelectAll) thSelectAll.style.display = isAdmin ? 'table-cell' : 'none';

        if (!tbody || !tableView) return;
        tableView.style.display = 'block';
        if (cardsView) cardsView.style.display = 'none';

        if (total === 0) {
            tbody.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';

        tbody.innerHTML = companies.map(c => {
            const sectorLabel = Storage.getSectorLabel(c.sector);
            const cityLabel = Storage.getCityLabel(c.city);
            const phone = c.phone1 || c.mobile || c.phone2 || '—';
            const fleet = c.fleetSize ? `🚛 ${c.fleetSize}` : '—';
            const contact = c.contactPerson || '—';
            const contactTitle = c.contactTitle || '';
            const linkedinLink = typeof c.linkedinUrl === 'string' ? c.linkedinUrl : (typeof c.linkedin === 'string' ? c.linkedin : '');
            const linkedinIcon = linkedinLink ? ` <a href="${linkedinLink}" target="_blank" style="color: #0077b5; margin-right: 6px; font-size: 14px;" title="LinkedIn الشركة" onclick="event.stopPropagation();"><i class="fab fa-linkedin"></i></a>` : '';
            const facebookLink = typeof c.facebook === 'string' ? c.facebook : '';
            const facebookIcon = facebookLink ? ` <a href="${facebookLink}" target="_blank" style="color: #1877f2; margin-right: 6px; font-size: 14px;" title="Facebook الشركة" onclick="event.stopPropagation();"><i class="fab fa-facebook-f"></i></a>` : '';
            const mapsLink = typeof c.google_maps_url === 'string' ? c.google_maps_url : '';
            const mapsIcon = mapsLink ? ` <a href="${mapsLink}" target="_blank" style="color: #ea4335; margin-right: 6px; font-size: 14px;" title="موقع الشركة على خرائط جوجل" onclick="event.stopPropagation();"><i class="fas fa-map-marker-alt"></i></a>` : '';
            const contactLinkedin = typeof c.linkedinContactUrl === 'string' ? c.linkedinContactUrl : (typeof c.contactLinkedin === 'string' ? c.contactLinkedin : '');
            const contactLinkedinIcon = contactLinkedin ? ` <a href="${contactLinkedin}" target="_blank" style="color: #0077b5; margin-right: 6px; font-size: 12px;" title="LinkedIn المسؤول" onclick="event.stopPropagation();"><i class="fab fa-linkedin"></i></a>` : '';

            const isChecked = this.selectedCompanies && this.selectedCompanies.has(c.id) ? 'checked' : '';
            const assignedBadge = this.buildAssignedWidget(c);

            const mainName = c.nameAr || c.nameEn || 'شركة بدون اسم';
            const subName = (c.nameAr && c.nameEn) ? c.nameEn : '';

            let callResultBadge = '';
            if (c.lastCallResult) {
                callResultBadge = `
                    <div>
                        <span class="result-badge result-${c.lastCallResult}" style="font-size:0.75rem;">${Storage.getCallResultLabel(c.lastCallResult)}</span>
                        ${c.lastCallDate ? `<small style="display:block; font-size:10px; color:var(--text-muted); margin-top:2px;">${c.lastCallDate}</small>` : ''}
                    </div>`;
            } else if (c.status === 'interested') {
                callResultBadge = `<span class="badge" style="background:#10b98122; color:#10b981; border:1px solid #10b981; font-size:0.75rem;">💚 عميل مهتم</span>`;
            } else {
                callResultBadge = `<span style="color:var(--text-muted); font-size:11px;">⚪ لم يتواصل بعد</span>`;
            }

            return `
                <tr class="${isChecked ? 'row-selected' : ''}">
                    ${isAdmin ? `
                        <td style="text-align:center;">
                            <input type="checkbox" class="company-checkbox" data-id="${c.id}" ${isChecked} onchange="Companies.toggleSelectCompany('${c.id}', this.checked)">
                        </td>
                    ` : ''}
                    <td>
                        <div class="company-name-cell" onclick="Companies.showDetail('${c.id}')">
                            <div style="display:flex; align-items:center; gap: 4px;">
                                <span class="name-ar">${mainName}</span>
                                ${linkedinIcon}
                                ${facebookIcon}
                                ${mapsIcon}
                            </div>
                            ${subName ? `<span class="name-en">${subName}</span>` : ''}
                        </div>
                    </td>
                    <td><span class="badge sector-badge">${sectorLabel}</span></td>
                    <td>${cityLabel}</td>
                    <td style="direction:ltr; text-align:right; font-family:Inter;">${phone}</td>
                    <td><span class="fleet-badge">${fleet}</span></td>
                    <td><span class="badge priority-badge priority-${c.priority || 'B'}">${c.priority || 'B'}</span></td>
                    <td>${assignedBadge}</td>
                    <td>${callResultBadge}</td>
                    <td>
                        <div style="font-size:0.8rem; display:flex; align-items:center; gap: 2px;">
                            <span>${contact}</span>
                            ${contactLinkedinIcon}
                        </div>
                        <div style="font-size:0.65rem; color:var(--text-muted);">${contactTitle}</div>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon btn-view" onclick="Companies.showDetail('${c.id}')" title="تفاصيل">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon btn-call" onclick="App.logCallForCompany('${c.id}')" title="مكالمة">
                                <i class="fas fa-phone"></i>
                            </button>
                            ${Storage.canModify(currentUser) ? `
                                <button class="btn-icon btn-edit" onclick="Companies.edit('${c.id}')" title="تعديل">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon btn-delete" onclick="Companies.confirmDelete('${c.id}')" title="حذف">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>`;
        }).join('');

        // Bind Select All Header
        const selectAllInput = document.getElementById('select-all-companies');
        if (selectAllInput) {
            const pageIds = companies.map(c => c.id);
            selectAllInput.checked = pageIds.length > 0 && pageIds.every(id => this.selectedCompanies.has(id));
            selectAllInput.onchange = (e) => this.toggleSelectAll(e.target.checked, pageIds);
        }
    },

    renderCards(companies, total) {
        const tableView = document.getElementById('companies-table-view');
        const cardsView = document.getElementById('companies-cards-view');
        const empty = document.getElementById('companies-empty');

        if (!cardsView) return;
        if (tableView) tableView.style.display = 'none';
        cardsView.style.display = 'grid';

        if (total === 0) {
            cardsView.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';

        cardsView.innerHTML = companies.map(c => {
            const sectorLabel = Storage.getSectorLabel(c.sector);
            const cityLabel = Storage.getCityLabel(c.city);
            const phone = c.phone1 || c.mobile || '—';
            const mapsLink = c.google_maps_url;
            const mapsIcon = mapsLink ? ` <a href="${mapsLink}" target="_blank" style="color: #ea4335; margin-right: 6px; font-size: 14px;" title="موقع الشركة على خرائط جوجل" onclick="event.stopPropagation();"><i class="fas fa-map-marker-alt"></i></a>` : '';
            const linkedinLink = c.linkedinUrl || c.linkedin;
            const linkedinIcon = linkedinLink ? ` <a href="${linkedinLink}" target="_blank" style="color: #0077b5; margin-right: 6px; font-size: 14px;" title="LinkedIn الشركة" onclick="event.stopPropagation();"><i class="fab fa-linkedin"></i></a>` : '';
            const facebookLink = c.facebook;
            const facebookIcon = facebookLink ? ` <a href="${facebookLink}" target="_blank" style="color: #1877f2; margin-right: 6px; font-size: 14px;" title="Facebook الشركة" onclick="event.stopPropagation();"><i class="fab fa-facebook-f"></i></a>` : '';
            const contactLinkedin = c.linkedinContactUrl || c.contactLinkedin;
            const contactLinkedinIcon = contactLinkedin ? ` <a href="${contactLinkedin}" target="_blank" style="color: #0077b5; margin-right: 6px; font-size: 12px;" title="LinkedIn المسؤول" onclick="event.stopPropagation();"><i class="fab fa-linkedin"></i></a>` : '';

            const assignedBadge = this.buildAssignedWidget(c);

            return `
                <div class="company-card" data-priority="${c.priority || 'B'}" onclick="Companies.showDetail('${c.id}')">
                    <div class="company-card__header">
                        <div>
                            <div class="company-card__name" style="display:flex; align-items:center;">
                                <span>${c.nameAr || ''}</span>
                                ${linkedinIcon}
                                ${facebookIcon}
                                ${mapsIcon}
                            </div>
                            <div class="company-card__name-en">${c.nameEn || ''}</div>
                        </div>
                        <span class="badge priority-badge priority-${c.priority || 'B'}">${c.priority || 'B'}</span>
                    </div>
                    <div class="company-card__details">
                        <div class="company-card__detail"><i class="fas fa-industry"></i> ${sectorLabel}</div>
                        <div class="company-card__detail"><i class="fas fa-map-marker-alt"></i> ${cityLabel}</div>
                        <div class="company-card__detail"><i class="fas fa-phone"></i> <span style="direction:ltr;">${phone}</span></div>
                        <div class="company-card__detail"><i class="fas fa-user-tag"></i> المسند إليه: ${assignedBadge}</div>
                        ${c.rating ? `<div class="company-card__detail"><i class="fas fa-star" style="color:#f59e0b;"></i> التقييم: ${c.rating} / 5</div>` : ''}
                        ${c.fleetSize ? `<div class="company-card__detail"><i class="fas fa-truck"></i> أسطول: ${c.fleetSize} سيارة</div>` : ''}
                        ${c.contactPerson ? `<div class="company-card__detail" style="display:flex; align-items:center; gap: 4px;"><i class="fas fa-user"></i> <span>${c.contactPerson}${c.contactTitle ? ' — ' + c.contactTitle : ''}</span>${contactLinkedinIcon}</div>` : ''}
                    </div>
                    <div class="company-card__footer">
                        <span class="sector-badge" style="font-size:0.65rem;">${sectorLabel}</span>
                        <div class="table-actions" onclick="event.stopPropagation();">
                            <button class="btn-icon btn-call" onclick="App.logCallForCompany('${c.id}')" title="مكالمة">
                                <i class="fas fa-phone"></i>
                            </button>
                            ${Storage.canModify(currentUser) ? `
                                <button class="btn-icon btn-edit" onclick="Companies.edit('${c.id}')" title="تعديل">
                                    <i class="fas fa-edit"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>`;
        }).join('');
    },

    renderPagination(totalPages) {
        const container = document.getElementById('companies-pagination');
        if (!container || totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }

        let html = `<button ${this.currentPage === 1 ? 'disabled' : ''} onclick="Companies.goToPage(${this.currentPage - 1})"><i class="fas fa-chevron-right"></i></button>`;

        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        if (endPage - startPage + 1 < maxVisible) startPage = Math.max(1, endPage - maxVisible + 1);

        if (startPage > 1) html += `<button onclick="Companies.goToPage(1)">1</button>`;
        if (startPage > 2) html += `<span style="color:var(--text-muted);">...</span>`;

        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="${i === this.currentPage ? 'active' : ''}" onclick="Companies.goToPage(${i})">${i}</button>`;
        }

        if (endPage < totalPages - 1) html += `<span style="color:var(--text-muted);">...</span>`;
        if (endPage < totalPages) html += `<button onclick="Companies.goToPage(${totalPages})">${totalPages}</button>`;

        html += `<button ${this.currentPage === totalPages ? 'disabled' : ''} onclick="Companies.goToPage(${this.currentPage + 1})"><i class="fas fa-chevron-left"></i></button>`;

        container.innerHTML = html;
    },

    goToPage(page) {
        this.currentPage = page;
        this.render();
    },

    setView(mode) {
        this.viewMode = mode;
        document.getElementById('btn-view-table').classList.toggle('active', mode === 'table');
        document.getElementById('btn-view-cards').classList.toggle('active', mode === 'cards');
        this.render();
    },

    clearFilters() {
        if (document.getElementById('filter-sector')) document.getElementById('filter-sector').value = '';
        if (document.getElementById('filter-city')) document.getElementById('filter-city').value = '';
        if (document.getElementById('filter-priority')) document.getElementById('filter-priority').value = '';
        if (document.getElementById('filter-fleet-type')) document.getElementById('filter-fleet-type').value = '';
        if (document.getElementById('filter-assigned')) document.getElementById('filter-assigned').value = '';
        if (document.getElementById('filter-search')) document.getElementById('filter-search').value = '';
        this.currentPage = 1;
        this.render();
    },

    claimLead(companyId) {
        const currentUser = Storage.getCurrentUser();
        Storage.assignCompany(companyId, currentUser.id);
        App.showToast(`✅ تم حجز الشركة باسم ${currentUser.name}`);
        this.render();
    },

    toggleSelectCompany(id, isChecked) {
        if (isChecked) {
            this.selectedCompanies.add(id);
        } else {
            this.selectedCompanies.delete(id);
        }
        this.updateBulkBar();
    },

    toggleSelectAll(isChecked, pageIds) {
        if (isChecked) {
            pageIds.forEach(id => this.selectedCompanies.add(id));
        } else {
            pageIds.forEach(id => this.selectedCompanies.delete(id));
        }
        this.render();
        this.updateBulkBar();
    },

    updateBulkBar() {
        const currentUser = Storage.getCurrentUser();
        const isAdmin = Storage.isAdmin(currentUser);
        const bulkBar = document.getElementById('bulk-actions-bar');

        if (!isAdmin) {
            if (bulkBar) bulkBar.style.display = 'none';
            return;
        }

        const count = this.selectedCompanies.size;
        const countDisplay = document.getElementById('selected-companies-count');
        if (bulkBar) {
            bulkBar.style.display = count > 0 ? 'flex' : 'none';
        }
        if (countDisplay) {
            countDisplay.textContent = `${count} شركة محددة`;
        }
    },

    clearSelection() {
        this.selectedCompanies.clear();
        this.updateBulkBar();
        this.render();
    },

    applyBulkAssign() {
        const currentUser = Storage.getCurrentUser();
        if (!Storage.isAdmin(currentUser)) {
            App.showToast('⚠️ إعادة التخصيص التجميعي مسموحة فقط للمدير العام', 'error');
            return;
        }
        const select = document.getElementById('bulk-assign-user-select');
        const userId = select ? select.value : '';
        if (this.selectedCompanies.size === 0) return;

        const ids = Array.from(this.selectedCompanies);
        const count = Storage.bulkAssignCompanies(ids, userId);
        const userName = userId ? (Storage.getUser(userId)?.name || userId) : 'إلغاء المسند إليه';

        App.showToast(`✅ تم تعيين ${count} شركة لـ ${userName}`);
        this.clearSelection();
    },

    // ---- CRUD ----
    openAddModal() {
        if (!Storage.isAdmin()) {
            App.showToast('🔒 إضافة شركات جديدة مقتصرة على المدير العام فقط', 'warning');
            return;
        }
        document.getElementById('form-company').reset();
        document.getElementById('company-id').value = '';
        document.getElementById('modal-company-title').innerHTML = '<i class="fas fa-building"></i> إضافة شركة جديدة';
        App.openModal('modal-company');
    },

    edit(id) {
        if (!Storage.isAdmin()) {
            App.showToast('🔒 تعديل بيانات الشركة مقتصر على المدير العام فقط', 'warning');
            return;
        }
        const company = Storage.getCompany(id);
        if (!company) return;

        document.getElementById('modal-company-title').innerHTML = '<i class="fas fa-edit"></i> تعديل بيانات الشركة';
        document.getElementById('company-id').value = company.id;

        const fields = [
            'nameAr', 'nameEn', 'sector', 'subSector', 'city', 'governorate',
            'address', 'google_maps_url', 'rating', 'reviews_count', 'operating_status', 'working_hours', 'phone1', 'phone2', 'mobile', 'email', 'website',
            'linkedin', 'facebook', 'fleetSize', 'fleetType', 'branchesCount',
            'companySize', 'contactPerson', 'contactTitle', 'contactPhone',
            'contactEmail', 'linkedinContactUrl', 'priority', 'source', 'notes'
        ];

        fields.forEach(field => {
            const el = document.getElementById(`company-${field}`);
            if (el) el.value = company[field] || '';
        });

        App.openModal('modal-company');
    },

    save() {
        const form = document.getElementById('form-company');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const fields = [
            'nameAr', 'nameEn', 'sector', 'subSector', 'city', 'governorate',
            'address', 'google_maps_url', 'rating', 'reviews_count', 'operating_status', 'working_hours', 'phone1', 'phone2', 'mobile', 'email', 'website',
            'linkedin', 'facebook', 'fleetSize', 'fleetType', 'branchesCount',
            'companySize', 'contactPerson', 'contactTitle', 'contactPhone',
            'contactEmail', 'linkedinContactUrl', 'priority', 'source', 'notes'
        ];

        const company = {};
        const id = document.getElementById('company-id').value;
        if (id) company.id = id;

        fields.forEach(field => {
            const el = document.getElementById(`company-${field}`);
            if (el) company[field] = el.value;
        });

        // Convert numbers
        company.fleetSize = parseInt(company.fleetSize) || 0;
        company.branchesCount = parseInt(company.branchesCount) || 0;

        Storage.saveCompany(company);
        App.closeModal('modal-company');
        App.showToast(id ? 'تم تحديث بيانات الشركة' : 'تم إضافة الشركة بنجاح', 'success');
        this.render();
        Dashboard.render();
    },

    confirmDelete(id) {
        if (!Storage.isAdmin()) {
            App.showToast('🔒 حذف الشركات مقتصر على المدير العام فقط', 'warning');
            return;
        }
        const company = Storage.getCompany(id);
        if (!company) return;

        document.getElementById('confirm-message').textContent =
            `هل أنت متأكد من حذف "${company.nameAr}"؟ سيتم حذف جميع المكالمات والصفقات المرتبطة بها.`;

        const confirmBtn = document.getElementById('btn-confirm-action');
        confirmBtn.onclick = () => {
            Storage.deleteCompany(id);
            App.closeModal('modal-confirm');
            App.showToast('تم حذف الشركة', 'success');
            this.render();
            Dashboard.render();
        };

        App.openModal('modal-confirm');
    },

    showDetail(id) {
        const company = Storage.getCompany(id);
        if (!company) return;

        document.getElementById('detail-company-name').textContent = company.nameAr || company.nameEn;

        const calls = Storage.getCallsForCompany(id);
        const deals = Storage.getDeals().filter(d => d.companyId === id);

        // Tire lead logic
        let tirePitchHtml = '';
        if (company.operating_status === 'permanently_closed') {
            tirePitchHtml = `
                <div class="detail-section" style="border-right: 4px solid #ef4444; background: rgba(239, 68, 68, 0.05); padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="color:#ef4444; margin: 0 0 6px 0; font-size:1.05rem;"><i class="fas fa-ban"></i> نصيحة مبيعات الكاوتش: الشركة مغلقة نهائياً</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">الشركة مسجلة كـ <strong>مغلقة نهائياً</strong> على الخرائط. لا يُنصح بالاتصال بها لعدم إهدار الوقت.</p>
                </div>`;
        } else {
            const highFleetSectors = ['transport', 'distribution', 'public_transport', 'construction', 'rental', 'delivery', 'transport_freight', 'shipping', 'logistics', 'courier', 'bus_company', 'moving_company', 'refrigerated', 'tanker', 'security', 'waste_management', 'ambulance'];
            const isHighFleetSector = highFleetSectors.includes(company.sector) || (company.sector_details && highFleetSectors.some(k => company.sector_details.includes(k)));
            const fleetSize = parseInt(company.fleetSize) || 0;
            
            let leadScore = 'C';
            let recommendation = 'اتصال استكشافي لتحديد حجم الأسطول الفعلي والمسؤول عن الشراء.';
            let reason = 'الشركة في قطاع ذو طلب عادي على الإطارات.';
            
            if (fleetSize >= 15) {
                leadScore = 'A';
                recommendation = '<strong>عميل أسطول رئيسي (Key Account)!</strong> اتصل فوراً واعرض عقود توريد سنوية مخصصة مع خصم كميات كبير وخدمات دعم فني.';
                reason = `تمتلك أسطولاً كبيراً ومؤكداً يبلغ (${fleetSize} سيارة).`;
            } else if (isHighFleetSector) {
                leadScore = 'B';
                recommendation = 'اتصل فوراً واعرض باقات إطارات النقل الثقيل / الخفيف واعرض أسعاراً تنافسية للشحن والتوصيل.';
                reason = `تعمل في قطاع لوجستي/نقل ذو حاجة مستمرة وشبه يومية لتغيير الإطارات.`;
            }
            
            let callingAdvice = 'يُنصح بالاتصال بين 9 صباحاً و 3 مساءً خلال أيام العمل الرسمية لمخاطبة المسؤول عن المشتريات / أسطول السيارات.';
            if (company.working_hours) {
                const wh = company.working_hours;
                if (wh.includes('٢٤ ساعة') || wh.includes('24 ساعة') || wh.includes('24 hours') || wh.includes('٢٤ ساعه')) {
                    callingAdvice = '<span style="color:#10b981; font-weight:700;">🚨 شركة نقل تعمل بنظام ورديات 24 ساعة (حركة مستمرة)</span>: استهلاك الكاوتش لديهم ضخم جداً وشبه يومي. يُنصح بالاتصال الهاتفي الفوري لطلب مقابلة مسؤول المشتريات، وتنسيق زيارة ميدانية صباحاً لعرض التعاقدات.';
                } else if (wh.includes('مغلق اليوم') || wh.includes('Closed today')) {
                    callingAdvice = '<span style="color:#ef4444; font-weight:700;">⚠️ النشاط مغلق اليوم</span>: لا يُنصح بالاتصال الهاتفي الآن لعدم وجود المسؤولين، انتظر ليوم العمل التالي.';
                } else if (wh.includes('مفتوح الآن') || wh.includes('Open now')) {
                    callingAdvice = '<span style="color:#10b981; font-weight:700;">🟢 مفتوح الآن للعمل</span>: يُنصح بالاتصال الهاتفي فوراً الآن لاستغلال تواجد الموظفين في مكتبهم.';
                }
            }
            
            const badgeColor = leadScore === 'A' ? '#ef4444' : (leadScore === 'B' ? '#f59e0b' : '#10b981');
            const bgLight = leadScore === 'A' ? 'rgba(239,68,68,0.05)' : (leadScore === 'B' ? 'rgba(245,158,11,0.05)' : 'rgba(16,185,129,0.05)');
            
            tirePitchHtml = `
                <div class="detail-section" style="border-right: 4px solid ${badgeColor}; background: ${bgLight}; padding: 16px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                    <h3 style="color:${badgeColor}; margin: 0 0 10px 0; display:flex; align-items:center; gap:8px; font-size:1.05rem;">
                        <i class="fas fa-lightbulb"></i> 
                        <span>تحليل فرصة بيع إطارات: درجة (${leadScore})</span>
                    </h3>
                    <div style="font-size: 0.85rem; line-height: 1.6; color: var(--text-secondary);">
                        <div><strong>المبرر:</strong> ${reason}</div>
                        <div style="margin-top: 6px;"><strong>التوصية المقترحة للمبيعات:</strong> ${recommendation}</div>
                        ${company.working_hours ? `<div style="margin-top: 6px; color:var(--text-muted);"><i class="fas fa-clock"></i> ساعات عمل الخرائط: <span style="color:var(--text-primary);font-weight:600;">${company.working_hours}</span></div>` : ''}
                        <div style="margin-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 8px;">
                            <strong>📞 التوقيت الأمثل للتواصل البيعي:</strong> ${callingAdvice}
                        </div>
                    </div>
                </div>`;
        }

        // Predictive scoring & confidence indicators
        // Industry score
        const highFleetSectors = ['transport', 'distribution', 'public_transport', 'construction', 'rental', 'delivery', 'transport_freight', 'shipping', 'logistics', 'courier', 'bus_company', 'moving_company', 'refrigerated', 'tanker', 'security', 'waste_management', 'ambulance'];
        const isHighFleet = highFleetSectors.includes(company.sector) || (company.sector_details && highFleetSectors.some(k => company.sector_details.includes(k)));
        
        let industryScore = 30;
        if (isHighFleet) industryScore = 100;
        else if (['manufacturing', 'wholesale_food', 'food_factory', 'dairy', 'beverages', 'meat_poultry', 'food_distribution', 'pharma_company', 'pharma_distribution', 'petroleum', 'gas_station', 'cement_steel'].includes(company.sector)) industryScore = 80;
        else if (['building_materials', 'real_estate', 'factory_plastic', 'factory_chemical', 'factory_textile', 'factory_paper', 'factory_furniture', 'factory_electrical', 'factory_general', 'detergents', 'cosmetics', 'hospital', 'school', 'university', 'tourism', 'hotel', 'telecom', 'agriculture', 'supermarket', 'restaurant_chain', 'ecommerce', 'ceramic_tiles', 'glass_mirrors', 'wood_lumber', 'appliances_distribution', 'paint_distribution', 'poultry_feed', 'packaging_boxes', 'iron_steel_depot', 'furniture_showroom'].includes(company.sector)) industryScore = 60;
        
        // Fleet size score
        const fleetSize = parseInt(company.fleetSize) || 0;
        let fleetScore = 10;
        if (fleetSize > 0) {
            fleetScore = Math.min(Math.round(15 + (Math.log2(fleetSize) * 10)), 100);
        }
        
        // Completeness (confidence) score
        let confidenceScore = 10;
        if (company.phone1) confidenceScore += 15;
        if (company.phone2) confidenceScore += 10;
        if (company.mobile) confidenceScore += 10;
        if (company.email) confidenceScore += 15;
        if (company.website) confidenceScore += 10;
        if (company.linkedinUrl || company.linkedin) confidenceScore += 15;
        if (company.facebook) confidenceScore += 10;
        if (company.contactPerson) confidenceScore += 10;
        if (company.contactTitle) confidenceScore += 5;
        confidenceScore = Math.min(confidenceScore, 100);

        // Working hours score
        let hoursScore = 50;
        if (company.working_hours) {
            const wh = company.working_hours.toLowerCase();
            if (wh.includes('24') || wh.includes('٢٤')) hoursScore = 100;
            else if (wh.includes('مفتوح') || wh.includes('open')) hoursScore = 80;
            else if (wh.includes('مغلق') || wh.includes('closed')) hoursScore = 30;
        }

        // Calculate unified lead score
        let calculatedScore = Math.round((industryScore * 0.35) + (fleetScore * 0.30) + (hoursScore * 0.20) + (confidenceScore * 0.15));
        if (company.operating_status === 'permanently_closed') {
            calculatedScore = 0;
        }
        
        // Color variables
        const scoreColor = calculatedScore >= 75 ? '#10b981' : (calculatedScore >= 45 ? '#f59e0b' : '#ef4444');
        const confColor = confidenceScore >= 75 ? '#10b981' : (confidenceScore >= 50 ? '#3b82f6' : '#f59e0b');

        // Dynamic status badge
        let statusLabel = '<span style="color:#10b981; font-weight:600;"><i class="fas fa-check-circle"></i> تعمل ونشطة / Active</span>';
        if (company.operating_status === 'temporarily_closed') {
            statusLabel = '<span style="color:#f59e0b; font-weight:600;"><i class="fas fa-pause-circle"></i> مغلقة مؤقتاً / Temporarily Closed</span>';
        } else if (company.operating_status === 'permanently_closed') {
            statusLabel = '<span style="color:#ef4444; font-weight:600;"><i class="fas fa-times-circle"></i> مغلقة نهائياً / Permanently Closed</span>';
        }

        // Generate timeline list
        const timelineList = company.timeline || [
            { date: company.createdAt ? company.createdAt.split('T')[0] : '2026-07-04', event: 'تم سحب الشركة وتأسيس السجل الجغرافي من الخرائط' }
        ];
        
        if (company.linkedinUrl && !timelineList.some(e => e.event.includes('LinkedIn'))) {
            timelineList.push({ date: company.lastUpdated || '2026-07-05', event: 'تم إثراء بيانات LinkedIn والمسؤول عن الشراء بنجاح' });
        }
        if (company.facebook && !timelineList.some(e => e.event.includes('Facebook'))) {
            timelineList.push({ date: company.lastUpdated || '2026-07-05', event: 'تم إثراء وسحب بيانات التواصل الإضافية من فيسبوك' });
        }
        
        // Add manual calls to timeline
        calls.forEach(call => {
            timelineList.push({ date: call.date, event: `تم تسجيل اتصال مبيعات: نتيجة (${Storage.getCallResultLabel(call.result).replace(/<\/?[^>]+(>|$)/g, "")})` });
        });
        
        // Sort descending
        timelineList.sort((a, b) => new Date(b.date) - new Date(a.date));

        const body = document.getElementById('company-detail-body');
        body.innerHTML = `
            ${tirePitchHtml}
            
            <!-- Lead Score & Data Confidence Gauge Widgets -->
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:20px;">
                <div style="background:var(--bg-tertiary); border-radius:12px; padding:16px; display:flex; align-items:center; gap:16px; border:1px solid rgba(255,255,255,0.05);">
                    <div style="position:relative; width:64px; height:64px; border-radius:50%; background:conic-gradient(${scoreColor} ${calculatedScore * 3.6}deg, var(--bg-primary) 0deg); display:flex; align-items:center; justify-content:center;">
                        <div style="position:absolute; width:52px; height:52px; border-radius:50%; background:var(--bg-tertiary); display:flex; align-items:center; justify-content:center; font-family:Inter; font-weight:800; font-size:16px; color:#fff;">
                            ${calculatedScore}%
                        </div>
                    </div>
                    <div>
                        <h4 style="margin:0 0 4px 0; font-size:0.95rem; color:#fff;"><i class="fas fa-bullseye" style="color:${scoreColor};"></i> درجة العميل المتوقعة</h4>
                        <p style="margin:0; font-size:0.75rem; color:var(--text-muted);">تقدير فرصة بيع الكاوتش وتوريد الأساطيل</p>
                    </div>
                </div>
                
                <div style="background:var(--bg-tertiary); border-radius:12px; padding:16px; display:flex; align-items:center; gap:16px; border:1px solid rgba(255,255,255,0.05);">
                    <div style="position:relative; width:64px; height:64px; border-radius:50%; background:conic-gradient(${confColor} ${confidenceScore * 3.6}deg, var(--bg-primary) 0deg); display:flex; align-items:center; justify-content:center;">
                        <div style="position:absolute; width:52px; height:52px; border-radius:50%; background:var(--bg-tertiary); display:flex; align-items:center; justify-content:center; font-family:Inter; font-weight:800; font-size:16px; color:#fff;">
                            ${confidenceScore}%
                        </div>
                    </div>
                    <div>
                        <h4 style="margin:0 0 4px 0; font-size:0.95rem; color:#fff;"><i class="fas fa-shield-alt" style="color:${confColor};"></i> ثقة واكتمال البيانات</h4>
                        <p style="margin:0; font-size:0.75rem; color:var(--text-muted);">مدى اكتمال وتوثيق حقول الاتصال</p>
                    </div>
                </div>
            </div>

            <div class="detail-grid">
                <div>
                    <div class="detail-section">
                        <h3><i class="fas fa-info-circle"></i> معلومات الشركة</h3>
                        ${this._detailRow('الاسم (عربي)', company.nameAr)}
                        ${this._detailRow('الاسم (إنجليزي)', company.nameEn)}
                        ${this._detailRow('القطاع', Storage.getSectorLabel(company.sector))}
                        ${this._detailRow('نشاط الخرائط', company.sector_details)}
                        ${this._detailRow('حالة النشاط', statusLabel)}
                        ${this._detailRow('المنطقة', Storage.getCityLabel(company.city))}
                        ${this._detailRow('المحافظة', company.governorate)}
                        ${this._detailRow('العنوان', company.address)}
                        ${this._detailRow('الموقع على الخريطة', company.google_maps_url ? `<a href="${company.google_maps_url}" target="_blank" style="color:#ea4335;"><i class="fas fa-map-marker-alt"></i> عرض على Google Maps</a>` : '—')}
                        ${this._detailRow('تقييم الشركة (Maps)', company.rating ? `⭐ ${company.rating} / 5 ${company.reviews_count ? `(${company.reviews_count} تقييم)` : ''}` : '—')}
                        ${this._detailRow('حجم الشركة', company.companySize || '—')}
                        ${this._detailRow('عدد الفروع', company.branchesCount || '—')}
                        ${this._detailRow('الأولوية', `<span class="badge priority-badge priority-${company.priority}">${company.priority}</span>`)}
                    </div>
                    <div class="detail-section">
                        <h3><i class="fas fa-truck"></i> بيانات الأسطول</h3>
                        ${this._detailRow('حجم الأسطول', company.fleetSize ? company.fleetSize + ' سيارة' : '—')}
                        ${this._detailRow('نوع الأسطول', Storage.getFleetTypeLabel(company.fleetType))}
                    </div>
                </div>
                <div>
                    <div class="detail-section">
                        <h3><i class="fas fa-phone"></i> بيانات الاتصال</h3>
                        ${this._detailRow('هاتف 1', company.phone1, true)}
                        ${this._detailRow('هاتف 2', company.phone2, true)}
                        ${this._detailRow('موبايل', company.mobile, true)}
                        ${this._detailRow('البريد', company.email ? `<a href="mailto:${company.email}">${company.email}</a>` : '—')}
                        ${this._detailRow('الموقع', company.website ? `<a href="${company.website}" target="_blank">${company.website}</a>` : '—')}
                        ${this._detailRow('LinkedIn الشركة', (company.linkedinUrl || company.linkedin) ? `<a href="${company.linkedinUrl || company.linkedin}" target="_blank" style="color:#0077b5;"><i class="fab fa-linkedin"></i> عرض الصفحة</a>` : '—')}
                        ${this._detailRow('Facebook', company.facebook ? `<a href="${company.facebook}" target="_blank" style="color:#1877f2;"><i class="fab fa-facebook-f"></i> عرض الصفحة</a>` : '—')}
                    </div>
                    <div class="detail-section">
                        <h3><i class="fas fa-user-tie"></i> جهة الاتصال</h3>
                        ${this._detailRow('الاسم', company.contactPerson + (company.linkedinContactUrl ? ` <a href="${company.linkedinContactUrl}" target="_blank" style="color:#0077b5; margin-right:6px;"><i class="fab fa-linkedin"></i></a>` : ''))}
                        ${this._detailRow('المسمى', company.contactTitle)}
                        ${this._detailRow('التليفون', company.contactPhone, true)}
                        ${this._detailRow('الإيميل', company.contactEmail ? `<a href="mailto:${company.contactEmail}">${company.contactEmail}</a>` : '—')}
                        ${this._detailRow('LinkedIn المسؤول', company.linkedinContactUrl ? `<a href="${company.linkedinContactUrl}" target="_blank" style="color:#0077b5;"><i class="fab fa-linkedin"></i> عرض الملف الشخصي</a>` : '—')}
                    </div>
                </div>
            </div>

            <!-- Audit Trail Timeline Event Flow -->
            <div class="detail-section">
                <h3><i class="fas fa-stream"></i> الخط الزمني لتفاعل الشركة (Company Timeline)</h3>
                <div style="position:relative; padding-right:20px; border-right:2px solid var(--border-color); margin-top:12px;">
                    ${timelineList.map(item => `
                        <div style="margin-bottom:16px; position:relative;">
                            <div style="position:absolute; right:-26px; top:4px; width:10px; height:10px; border-radius:50%; background:#7c3aed; border:2px solid var(--bg-tertiary);"></div>
                            <span style="font-family:Inter; font-size:11px; color:var(--text-muted); font-weight:600;">${item.date}</span>
                            <p style="margin:2px 0 0 0; font-size:0.82rem; color:var(--text-secondary);">${item.event}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            ${company.notes ? `<div class="detail-section"><h3><i class="fas fa-sticky-note"></i> ملاحظات</h3><p style="font-size:0.85rem; color:var(--text-secondary);">${company.notes}</p></div>` : ''}

            <div class="detail-section detail-calls-history">
                <h3><i class="fas fa-history"></i> سجل المكالمات (${calls.length})</h3>
                ${calls.length === 0 ? '<p style="color:var(--text-muted); font-size:0.85rem;">لا توجد مكالمات بعد</p>' :
                calls.slice(0, 10).map(call => `
                    <div class="detail-call-item">
                        <span style="color:var(--text-muted); font-family:Inter; font-size:0.75rem; min-width:80px;">${call.date}</span>
                        <span class="result-badge result-${call.result}">${Storage.getCallResultLabel(call.result)}</span>
                        <span style="flex:1; font-size:0.8rem; color:var(--text-secondary);">${call.notes || ''}</span>
                    </div>
                `).join('')}
            </div>

            ${deals.length > 0 ? `
                <div class="detail-section">
                    <h3><i class="fas fa-handshake"></i> الصفقات (${deals.length})</h3>
                    ${deals.map(deal => `
                        <div class="detail-call-item">
                            <span style="font-weight:600; font-size:0.85rem;">${deal.title}</span>
                            <span class="badge badge-accent" style="font-family:Inter;">${Storage.formatCurrency(deal.value)} ج.م</span>
                            <span class="badge badge-primary">${Storage.PIPELINE_STAGES[deal.stage]?.ar || deal.stage}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;

        // Wire up detail modal buttons
        document.getElementById('btn-detail-call').onclick = () => {
            App.closeModal('modal-company-detail');
            App.logCallForCompany(id);
        };
        document.getElementById('btn-detail-edit').onclick = () => {
            App.closeModal('modal-company-detail');
            this.edit(id);
        };

        App.openModal('modal-company-detail');
    },

    _detailRow(label, value, isPhone = false) {
        if (!value) value = '—';
        const phoneStyle = isPhone ? ' style="direction:ltr; font-family:Inter;"' : '';
        return `<div class="detail-item"><span class="label">${label}</span><span class="value"${phoneStyle}>${value}</span></div>`;
    },

    buildAssignedWidget(c) {
        const currentUser = Storage.getCurrentUser();
        const users = Storage.getUsers() || [];
        const assignedUser = Storage.getUser(c.assignedTo);

        if (assignedUser) {
            return `
                <div style="display:inline-flex; align-items:center; gap:6px;" onclick="event.stopPropagation();">
                    <span class="badge" style="background:${assignedUser.color || '#7c3aed'}22; color:${assignedUser.color || '#7c3aed'}; border:1px solid ${assignedUser.color || '#7c3aed'}66; padding:4px 8px; font-weight:700; font-size:0.75rem; border-radius:6px; display:inline-flex; align-items:center; gap:4px;" title="تاريخ التعيين: ${c.assignedAt ? new Date(c.assignedAt).toLocaleDateString('ar-EG') : ''}">
                        ${assignedUser.avatar || '👤'} ${assignedUser.name}
                    </span>
                    ${Storage.canModify() ? `
                        <select onchange="Companies.assignToUser('${c.id}', this.value)" style="padding:2px 6px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-muted); font-size:11px; cursor:pointer;" title="تغيير الموظف المسند إليه أو إلغاء التعيين">
                            <option value="${assignedUser.id}" selected>✏️ تغيير</option>
                            <option value="">⚪ إلغاء التعيين</option>
                            ${users.filter(u => u.id !== assignedUser.id).map(u => `<option value="${u.id}">👤 ${u.name}</option>`).join('')}
                        </select>
                    ` : ''}
                </div>`;
        } else {
            return Storage.canModify() ? `
                <div onclick="event.stopPropagation();" style="display:inline-block;">
                    <select onchange="Companies.assignToUser('${c.id}', this.value)" style="padding:4px 8px; border-radius:6px; border:1px dashed #7c3aed; background:rgba(124, 58, 237, 0.1); color:#7c3aed; font-size:0.75rem; font-weight:700; cursor:pointer;" title="اختر الموظف لإسناد هذه الشركة له">
                        <option value="" selected>➕ إسناد لموظف...</option>
                        <option value="current_user">🙋‍♂️ حجز لي (${currentUser ? currentUser.name.split(' ')[0] : 'أنا'})</option>
                        ${users.map(u => `<option value="${u.id}">👤 ${u.name} (${u.role === 'admin' ? 'مدير' : 'موظف'})</option>`).join('')}
                    </select>
                </div>` : `<span style="color:var(--text-muted); font-size:11px;">⚪ غير مسندة</span>`;
        }
    },

    assignToUser(companyId, userId) {
        const currentUser = Storage.getCurrentUser();
        let targetUserId = userId;

        if (userId === 'current_user') {
            targetUserId = currentUser ? currentUser.id : 'admin';
        }

        if (!targetUserId) {
            Storage.assignCompany(companyId, '');
            App.showToast('🗑️ تم إلغاء حجز وتخصيص الشركة');
        } else {
            Storage.assignCompany(companyId, targetUserId);
            const targetUser = Storage.getUser(targetUserId);
            App.showToast(`✅ تم حجز وإسناد الشركة لـ: ${targetUser ? targetUser.name : targetUserId}`);
        }

        this.render();
    },

    claimLead(companyId) {
        const currentUser = Storage.getCurrentUser();
        if (!currentUser) return;
        Storage.assignCompany(companyId, currentUser.id);
        App.showToast(`✅ تم حجز هذه الشركة لـ: ${currentUser.name}`);
        this.render();
    }
};
