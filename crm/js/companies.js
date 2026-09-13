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
    selectedSectors: new Set(),
    selectedCities: new Set(),

    init() {
        this.viewMode = (window.innerWidth <= 768) ? 'cards' : 'table';
        this.populateSectorSelects();
        this.initMultiSelects();
        this.bindEvents();
        this.refreshUserFilter();
        if (typeof App !== 'undefined' && App.currentPage === 'companies') {
            this.render();
        }
    },

    initMultiSelects() {
        const sectors = window.AppStorage ? window.AppStorage.SECTORS : null;
        const cities = window.AppStorage ? window.AppStorage.CITIES : null;
        const allCompanies = window.AppStorage ? window.AppStorage.getCompanies() : [];

        // Count companies per sector and city
        const sectorCounts = {};
        const cityCounts = {};
        allCompanies.forEach(c => {
            const sec = c.sector || 'other';
            const ct = c.city || 'other';
            sectorCounts[sec] = (sectorCounts[sec] || 0) + 1;
            cityCounts[ct] = (cityCounts[ct] || 0) + 1;
        });

        // 1. Populate Sectors List
        const sectorsListEl = document.getElementById('multiselect-sectors-list');
        if (sectorsListEl && sectors) {
            let html = '';
            const sortedSectors = Object.keys(sectors).sort((a, b) => (sectorCounts[b] || 0) - (sectorCounts[a] || 0));
            sortedSectors.forEach(key => {
                const s = sectors[key];
                const count = sectorCounts[key] || 0;
                const isChecked = this.selectedSectors.has(key);
                html += `
                    <div class="multiselect-item ${isChecked ? 'selected' : ''}" data-key="${key}" onclick="Companies.toggleDropdownItem('sectors', '${key}')">
                        <input type="checkbox" class="multiselect-checkbox" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); Companies.toggleDropdownItem('sectors', '${key}')">
                        <span class="multiselect-item-label">${s.icon || '🏢'} ${s.ar}</span>
                        <span class="multiselect-item-count">${count.toLocaleString()}</span>
                    </div>
                `;
            });
            sectorsListEl.innerHTML = html;
        }

        // 2. Populate Cities List
        const citiesListEl = document.getElementById('multiselect-cities-list');
        if (citiesListEl && cities) {
            let html = '';
            const sortedCities = Object.keys(cities).sort((a, b) => (cityCounts[b] || 0) - (cityCounts[a] || 0));
            sortedCities.forEach(key => {
                const c = cities[key];
                const count = cityCounts[key] || 0;
                const isChecked = this.selectedCities.has(key);
                html += `
                    <div class="multiselect-item ${isChecked ? 'selected' : ''}" data-key="${key}" onclick="Companies.toggleDropdownItem('cities', '${key}')">
                        <input type="checkbox" class="multiselect-checkbox" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); Companies.toggleDropdownItem('cities', '${key}')">
                        <span class="multiselect-item-label">📍 ${c.ar}</span>
                        <span class="multiselect-item-count">${count.toLocaleString()}</span>
                    </div>
                `;
            });
            citiesListEl.innerHTML = html;
        }

        this.updateMultiSelectLabels();
    },

    toggleMultiDropdown(type, event) {
        if (event) event.stopPropagation();
        const wrapper = document.getElementById(`multiselect-${type}-wrapper`);
        if (!wrapper) return;
        const wasOpen = wrapper.classList.contains('open');
        this.closeAllMultiDropdowns();
        if (!wasOpen) {
            wrapper.classList.add('open');
            const input = wrapper.querySelector('.multiselect-search-box input');
            if (input) setTimeout(() => input.focus(), 50);
        }
    },

    closeAllMultiDropdowns() {
        document.querySelectorAll('.custom-multiselect.open').forEach(el => el.classList.remove('open'));
    },

    toggleDropdownItem(type, key) {
        const set = (type === 'sectors') ? this.selectedSectors : this.selectedCities;
        if (set.has(key)) {
            set.delete(key);
        } else {
            set.add(key);
        }
        this._syncDropdownDOM(type);
        this.updateMultiSelectLabels();
        this.onFilterChange(true);
    },

    selectAllDropdown(type) {
        const set = (type === 'sectors') ? this.selectedSectors : this.selectedCities;
        const source = (type === 'sectors') ? (window.AppStorage?.SECTORS || {}) : (window.AppStorage?.CITIES || {});
        Object.keys(source).forEach(k => set.add(k));
        this._syncDropdownDOM(type);
        this.updateMultiSelectLabels();
        this.onFilterChange(true);
    },

    clearDropdown(type) {
        const set = (type === 'sectors') ? this.selectedSectors : this.selectedCities;
        set.clear();
        this._syncDropdownDOM(type);
        this.updateMultiSelectLabels();
        this.onFilterChange(true);
    },

    selectCityGroup(groupKey) {
        const industrialCities = ['6october', '10thramadan', 'obour', 'badr', 'sadat', 'helwan'];
        const cairoMetroCities = ['cairo', 'giza', 'nasr_city', 'new_cairo', 'maadi', 'qalyubia', 'shorouk'];
        this.selectedCities.clear();
        const targetList = groupKey === 'industrial' ? industrialCities : cairoMetroCities;
        targetList.forEach(k => this.selectedCities.add(k));
        this._syncDropdownDOM('cities');
        this.updateMultiSelectLabels();
        this.onFilterChange(true);
        if (typeof App !== 'undefined' && App.showToast) {
            App.showToast(groupKey === 'industrial' ? 'تم تحديد المدن والمجمعات الصناعية الكبرى' : 'تم تحديد نطاق القاهرة الكبرى والجيزة', 'info');
        }
    },

    filterDropdownList(type, query) {
        const listEl = document.getElementById(`multiselect-${type}-list`);
        if (!listEl) return;
        const q = String(query || '').toLowerCase().trim();
        const items = listEl.querySelectorAll('.multiselect-item');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = (!q || text.includes(q)) ? 'flex' : 'none';
        });
    },

    _syncDropdownDOM(type) {
        const set = (type === 'sectors') ? this.selectedSectors : this.selectedCities;
        const listEl = document.getElementById(`multiselect-${type}-list`);
        if (!listEl) return;
        listEl.querySelectorAll('.multiselect-item').forEach(item => {
            const key = item.dataset.key;
            const isSelected = set.has(key);
            item.classList.toggle('selected', isSelected);
            const cb = item.querySelector('.multiselect-checkbox');
            if (cb) cb.checked = isSelected;
        });
    },

    updateMultiSelectLabels() {
        const sectors = window.AppStorage?.SECTORS || {};
        const cities = window.AppStorage?.CITIES || {};

        // Sectors
        const secLabel = document.getElementById('multiselect-sectors-label');
        const secBadge = document.getElementById('multiselect-sectors-badge');
        if (secLabel && secBadge) {
            const size = this.selectedSectors.size;
            if (size === 0) {
                secLabel.innerHTML = '<i class="fas fa-industry" style="color:#38bdf8;"></i> كل القطاعات (الكل)';
                secBadge.style.display = 'none';
            } else if (size === 1) {
                const singleKey = Array.from(this.selectedSectors)[0];
                const s = sectors[singleKey];
                secLabel.innerHTML = `${s?.icon || '🏢'} ${s?.ar || singleKey}`;
                secBadge.style.display = 'none';
            } else {
                secLabel.innerHTML = `<i class="fas fa-industry" style="color:#38bdf8;"></i> ${size} قطاعات محددة`;
                secBadge.textContent = size;
                secBadge.style.display = 'inline-block';
            }
        }

        // Cities
        const cityLabel = document.getElementById('multiselect-cities-label');
        const cityBadge = document.getElementById('multiselect-cities-badge');
        if (cityLabel && cityBadge) {
            const size = this.selectedCities.size;
            if (size === 0) {
                cityLabel.innerHTML = '<i class="fas fa-map-marker-alt" style="color:#f43f5e;"></i> كل المحافظات والمدن (الكل)';
                cityBadge.style.display = 'none';
            } else if (size === 1) {
                const singleKey = Array.from(this.selectedCities)[0];
                const c = cities[singleKey];
                cityLabel.innerHTML = `📍 ${c?.ar || singleKey}`;
                cityBadge.style.display = 'none';
            } else {
                cityLabel.innerHTML = `<i class="fas fa-map-marker-alt" style="color:#f43f5e;"></i> ${size} مناطق محددة`;
                cityBadge.textContent = size;
                cityBadge.style.display = 'inline-block';
            }
        }
    },

    renderActiveFilterChips() {
        const container = document.getElementById('active-filters-bar');
        const chipsBox = document.getElementById('active-chips-container');
        if (!container || !chipsBox) return;

        const sectors = window.AppStorage?.SECTORS || {};
        const cities = window.AppStorage?.CITIES || {};

        const search = document.getElementById('filter-search')?.value?.trim() || '';
        const contactType = document.getElementById('filter-contact-type')?.value || '';
        const fleetSize = document.getElementById('filter-fleet-size')?.value || '';
        const priority = document.getElementById('filter-priority')?.value || '';
        const assigned = document.getElementById('filter-assigned')?.value || '';

        const hasActiveFilters = (
            this.selectedSectors.size > 0 ||
            this.selectedCities.size > 0 ||
            search ||
            contactType ||
            fleetSize ||
            priority ||
            assigned
        );

        if (!hasActiveFilters) {
            container.style.display = 'none';
            chipsBox.innerHTML = '';
            return;
        }

        container.style.display = 'flex';
        let chipsHtml = '';

        // Sectors Chips
        this.selectedSectors.forEach(k => {
            const s = sectors[k];
            chipsHtml += `
                <span class="active-filter-chip">
                    <span>${s?.icon || '🏢'} ${s?.ar || k}</span>
                    <i class="fas fa-times chip-remove" title="إزالة" onclick="Companies.removeActiveFilter('sector', '${k}')"></i>
                </span>
            `;
        });

        // Cities Chips
        this.selectedCities.forEach(k => {
            const c = cities[k];
            chipsHtml += `
                <span class="active-filter-chip" style="background:rgba(244, 63, 94, 0.18); border-color:rgba(244, 63, 94, 0.35); color:#fecdd3;">
                    <span>📍 ${c?.ar || k}</span>
                    <i class="fas fa-times chip-remove" title="إزالة" onclick="Companies.removeActiveFilter('city', '${k}')"></i>
                </span>
            `;
        });

        // Contact Type Chip
        if (contactType) {
            const labelMap = {
                has_phone: '📱 بها هاتف مباشر',
                has_maps: '📍 خرائط جوجل و GPS',
                has_website: '🌐 موقع رسمي'
            };
            chipsHtml += `
                <span class="active-filter-chip" style="background:rgba(6, 182, 212, 0.18); border-color:rgba(6, 182, 212, 0.35); color:#a5f3fc;">
                    <span>${labelMap[contactType] || contactType}</span>
                    <i class="fas fa-times chip-remove" title="إزالة" onclick="Companies.removeActiveFilter('contactType')"></i>
                </span>
            `;
        }

        // Fleet Size Chip
        if (fleetSize) {
            const labelMap = {
                giant_fleet: '👑 أساطيل عملاقة (100+)',
                large_fleet: '🏆 أساطيل ضخمة (50 - 99)',
                medium_fleet: '🚚 أساطيل متوسطة (15 - 49)',
                small_fleet: '🚐 أساطيل صغيرة (< 15)'
            };
            chipsHtml += `
                <span class="active-filter-chip" style="background:rgba(16, 185, 129, 0.18); border-color:rgba(16, 185, 129, 0.35); color:#a7f3d0;">
                    <span>${labelMap[fleetSize] || fleetSize}</span>
                    <i class="fas fa-times chip-remove" title="إزالة" onclick="Companies.removeActiveFilter('fleetSize')"></i>
                </span>
            `;
        }

        // Priority Chip
        if (priority) {
            chipsHtml += `
                <span class="active-filter-chip" style="background:rgba(245, 158, 11, 0.18); border-color:rgba(245, 158, 11, 0.35); color:#fde68a;">
                    <span>🎯 أولوية ${priority}</span>
                    <i class="fas fa-times chip-remove" title="إزالة" onclick="Companies.removeActiveFilter('priority')"></i>
                </span>
            `;
        }

        // Search Chip
        if (search) {
            chipsHtml += `
                <span class="active-filter-chip" style="background:rgba(56, 189, 248, 0.18); border-color:rgba(56, 189, 248, 0.35); color:#bae6fd;">
                    <span>🔍 "${search}"</span>
                    <i class="fas fa-times chip-remove" title="إزالة" onclick="Companies.removeActiveFilter('search')"></i>
                </span>
            `;
        }

        chipsBox.innerHTML = chipsHtml;
    },

    removeActiveFilter(type, key) {
        if (type === 'sector' && key) {
            this.selectedSectors.delete(key);
            this._syncDropdownDOM('sectors');
            this.updateMultiSelectLabels();
        } else if (type === 'city' && key) {
            this.selectedCities.delete(key);
            this._syncDropdownDOM('cities');
            this.updateMultiSelectLabels();
        } else if (type === 'contactType') {
            const el = document.getElementById('filter-contact-type');
            if (el) el.value = '';
        } else if (type === 'fleetSize') {
            const el = document.getElementById('filter-fleet-size');
            if (el) el.value = '';
        } else if (type === 'priority') {
            const el = document.getElementById('filter-priority');
            if (el) el.value = '';
        } else if (type === 'search') {
            const el = document.getElementById('filter-search');
            if (el) el.value = '';
        }
        this.onFilterChange(true);
    },

    populateSectorSelects() {
        const sectors = window.AppStorage ? window.AppStorage.SECTORS : null;
        if (!sectors) return;

        const modalSec = document.getElementById('company-sector');
        let modalOptionsHtml = '<option value="">اختر القطاع</option>';

        Object.keys(sectors).forEach(key => {
            const s = sectors[key];
            modalOptionsHtml += `<option value="${key}">${s.icon} ${s.ar}</option>`;
        });

        if (modalSec) {
            const curValModal = modalSec.value;
            modalSec.innerHTML = modalOptionsHtml;
            if (curValModal) modalSec.value = curValModal;
        }
    },

    renderSectorPills() {
        const container = document.getElementById('sector-quick-pills-bar');
        if (!container) return;

        const allCompanies = window.AppStorage.getCompanies() || [];
        const sectors = window.AppStorage.SECTORS;
        if (!sectors) return;

        const sectorCounts = {};
        allCompanies.forEach(c => {
            const secKey = c.sector || 'other';
            sectorCounts[secKey] = (sectorCounts[secKey] || 0) + 1;
        });

        const isAllActive = this.selectedSectors.size === 0;

        let html = `<span style="font-size: 13px; font-weight: 800; color: #38bdf8; margin-left: 6px;"><i class="fas fa-layer-group" style="color:#38bdf8;"></i> قطاعات الأعمال والإنتاج (اضغط للتصفية المباشرة):</span>`;
        
        const allStyle = isAllActive 
            ? 'background: rgba(56, 189, 248, 0.3); color: #7dd3fc; border: 1px solid #38bdf8; font-weight: 800;'
            : 'background: rgba(30, 41, 59, 0.6); color: #94a3b8; border: 1px solid #475569;';

        html += `<button type="button" class="btn btn-sm sector-pill ${isAllActive ? 'active' : ''}" onclick="Companies.setSectorFilter('', this)" style="${allStyle} border-radius: 20px; font-size: 12px; padding: 5px 13px; cursor: pointer; transition: all 0.2s;">🌐 جميع القطاعات (${allCompanies.length})</button>`;

        Object.keys(sectors).forEach(key => {
            const s = sectors[key];
            const count = sectorCounts[key] || 0;
            const isActive = this.selectedSectors.has(key);
            const pillStyle = isActive 
                ? 'background: rgba(16, 185, 129, 0.3); color: #6ee7b7; border: 1px solid #10b981; font-weight: 800;' 
                : 'background: rgba(30, 41, 59, 0.6); color: #cbd5e1; border: 1px solid #475569;';

            html += `<button type="button" class="btn btn-sm sector-pill ${isActive ? 'active' : ''}" onclick="Companies.setSectorFilter('${key}', this)" style="${pillStyle} border-radius: 20px; font-size: 12px; padding: 5px 13px; cursor: pointer; transition: all 0.2s;">${s.icon} ${s.ar} (${count})</button>`;
        });

        container.innerHTML = html;
    },

    setSectorFilter(sectorKey, btnEl) {
        if (!sectorKey) {
            this.selectedSectors.clear();
        } else {
            if (this.selectedSectors.has(sectorKey) && this.selectedSectors.size === 1) {
                this.selectedSectors.clear();
            } else {
                this.selectedSectors.clear();
                this.selectedSectors.add(sectorKey);
            }
        }
        this._syncDropdownDOM('sectors');
        this.updateMultiSelectLabels();
        this.renderSectorPills();
        this.onFilterChange(true);
    },

    _lastUsersCount: 0,
    refreshUserFilter() {
        const currentUser = window.AppStorage.getCurrentUser();
        const isAdmin = window.AppStorage.isAdmin(currentUser);
        const canViewAll = window.AppStorage.canViewAll(currentUser);
        const allUsers = window.AppStorage.getUsers() || [];

        // 1. Filter dropdown container visibility: Admin & Supervisor ONLY
        const filterGroup = document.getElementById('filter-assigned-group') || document.getElementById('filter-assigned')?.parentElement;
        if (filterGroup) {
            filterGroup.style.display = canViewAll ? 'block' : 'none';
        }

        const sel = document.getElementById('filter-assigned');
        const bulkSel = document.getElementById('bulk-assign-user-select');

        // Avoid rebuilding DOM if already populated with same user count
        if (sel && sel.options.length > 3 && this._lastUsersCount === allUsers.length && bulkSel && bulkSel.options.length > 2) {
            return;
        }
        this._lastUsersCount = allUsers.length;

        if (sel) {
            const currentVal = sel.value;
            const userOptions = allUsers.map(u => {
                const icon = u.role === 'admin' ? '👑' : u.role === 'supervisor' ? '👁️' : (u.avatar || '👨‍💼');
                const roleTag = u.role === 'admin' ? 'مدير' : u.role === 'supervisor' ? 'مشرف' : 'مبيعات';
                return `<option value="${u.id}">${icon} ${u.name} (${roleTag})</option>`;
            }).join('');

            sel.innerHTML = `
                <option value="">👤 جميع الموظفين / التخصيص</option>
                <option value="my_leads">⭐ شركاتي أنا فقط</option>
                <option value="unassigned">⚪ غير مسندة لأحد (Unassigned)</option>
                ${userOptions}
            `;
            if (currentVal) sel.value = currentVal;
        }

        // 2. Bulk assign user select dropdown
        if (bulkSel) {
            const currentVal = bulkSel.value;
            const optionsHtml = allUsers.map(u =>
                `<option value="${u.id}">${u.role === 'admin' ? '👑' : (u.avatar || '👨‍💼')} ${u.name}</option>`
            ).join('');
            bulkSel.innerHTML = `
                <option value="">تخصيص لـ...</option>
                ${optionsHtml}
                <option value="">⚪ إلغاء التخصيص</option>
            `;
            if (currentVal) bulkSel.value = currentVal;
        }
    },

    _searchDebounceTimer: null,

    onFilterChange(isImmediate = false) {
        if (this._searchDebounceTimer) clearTimeout(this._searchDebounceTimer);
        if (isImmediate) {
            this.currentPage = 1;
            this.render();
        } else {
            this._searchDebounceTimer = setTimeout(() => {
                this.currentPage = 1;
                this.render();
            }, 75);
        }
    },

    bindEvents() {
        // Filters
        document.getElementById('filter-sector')?.addEventListener('change', () => this.onFilterChange(true));
        document.getElementById('filter-city')?.addEventListener('change', () => this.onFilterChange(true));
        document.getElementById('filter-contact-type')?.addEventListener('change', () => this.onFilterChange(true));
        document.getElementById('filter-priority')?.addEventListener('change', () => this.onFilterChange(true));
        document.getElementById('filter-fleet-type')?.addEventListener('change', () => this.onFilterChange(true));
        document.getElementById('filter-fleet-size')?.addEventListener('change', () => this.onFilterChange(true));
        document.getElementById('filter-added-date')?.addEventListener('change', () => this.onFilterChange(true));
        document.getElementById('filter-sort')?.addEventListener('change', () => this.onFilterChange(true));
        document.getElementById('filter-assigned')?.addEventListener('change', () => this.onFilterChange(true));
        document.getElementById('filter-search')?.addEventListener('input', () => this.onFilterChange(false));
        document.getElementById('btn-clear-filters')?.addEventListener('click', () => this.clearFilters());

        // Close multi-select dropdowns on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-multiselect')) {
                Companies.closeAllMultiDropdowns();
            }
        });

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
                this.currentPage = 1;
                this.render();
            });
        });
    },

    setQuickFilter(presetKey, btnEl) {
        document.querySelectorAll('.company-quick-pill').forEach(b => {
            b.style.opacity = '0.6';
            b.classList.remove('active');
        });
        if (btnEl) {
            btnEl.style.opacity = '1';
            btnEl.classList.add('active');
        }

        const fleetSel = document.getElementById('filter-fleet-size');
        const dateSel = document.getElementById('filter-added-date');
        const sortSel = document.getElementById('filter-sort');

        if (presetKey === 'fleet_desc' || presetKey === 'fleet_asc') {
            if (sortSel) sortSel.value = presetKey;
        } else if (presetKey === 'large_fleet') {
            if (fleetSel) fleetSel.value = 'large_fleet';
        } else if (presetKey === 'recent_7days') {
            if (dateSel) dateSel.value = 'recent_7days';
        } else if (!presetKey) {
            if (fleetSel) fleetSel.value = '';
            if (dateSel) dateSel.value = '';
            if (sortSel) sortSel.value = 'latest';
        }

        this.currentPage = 1;
        this.render();
    },

    confirmWipeAllCompanies() {
        if (!window.AppStorage.isAdmin()) {
            App.showToast('🔒 مسح الشركات مقتصر على المدير العام فقط', 'warning');
            return;
        }
        App.confirm('⚠️ مسح جميع الشركات بالكامل', 'هل أنت متأكد من رغبتك في مسح وتفريغ جميع الشركات من المنظومة والسحابة بالكامل؟ لا يمكن التراجع عن هذا الإجراء.', () => {
            window.AppStorage.deleteAllCompanies();
            this.currentPage = 1;
            this.selectedCompanies.clear();
            this.render();
            if (typeof Dashboard !== 'undefined') Dashboard.render();
            App.showToast('تم مسح وتفريغ جميع الشركات بالكامل بنجاح', 'success');
        });
    },

    clearFilters() {
        ['filter-sector', 'filter-city', 'filter-contact-type', 'filter-priority', 'filter-fleet-type', 'filter-fleet-size', 'filter-added-date', 'filter-sort', 'filter-assigned', 'filter-search'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const sortSelect = document.getElementById('filter-sort');
        if (sortSelect) sortSelect.value = 'latest';

        // Reset multi-select sets & UI
        this.selectedSectors.clear();
        this.selectedCities.clear();
        this._syncDropdownDOM('sectors');
        this._syncDropdownDOM('cities');
        this.updateMultiSelectLabels();
        this.renderSectorPills();
        this.renderActiveFilterChips();

        document.querySelectorAll('.company-quick-pill').forEach(b => {
            b.style.opacity = '0.6';
            b.classList.remove('active');
        });
        const firstPill = document.querySelector('.company-quick-pill');
        if (firstPill) {
            firstPill.style.opacity = '1';
            firstPill.classList.add('active');
        }

        this.currentPage = 1;
        this.sortField = 'createdAt';
        this.sortDir = 'desc';
        this.render();
    },

    getFilteredCompanies() {
        let rawCompanies = window.AppStorage ? window.AppStorage.getScopedCompanies() : [];
        if (!rawCompanies || rawCompanies.length === 0) {
            rawCompanies = window.AppStorage ? window.AppStorage.getCompanies() : [];
        }
        if (!rawCompanies || rawCompanies.length === 0) return [];

        const legacySector = document.getElementById('filter-sector')?.value;
        const legacyCity = document.getElementById('filter-city')?.value;
        const contactType = document.getElementById('filter-contact-type')?.value;
        const priority = document.getElementById('filter-priority')?.value;
        const fleetType = document.getElementById('filter-fleet-type')?.value;
        const fleetSize = document.getElementById('filter-fleet-size')?.value;
        const addedDate = document.getElementById('filter-added-date')?.value;
        const sortMode = document.getElementById('filter-sort')?.value || 'latest';
        const assigned = document.getElementById('filter-assigned')?.value;
        const search = document.getElementById('filter-search')?.value?.toLowerCase().trim();
        const currentUser = window.AppStorage.getCurrentUser();
        const now = Date.now();
        const todayStr = new Date().toISOString().split('T')[0];

        const sectorSet = this.selectedSectors.size > 0 ? this.selectedSectors : (legacySector ? new Set([legacySector]) : null);
        const citySet = this.selectedCities.size > 0 ? this.selectedCities : (legacyCity ? new Set([legacyCity]) : null);

        // 1 SINGLE OPTIMIZED PASS FILTER (100X Faster!)
        const companies = rawCompanies.filter(c => {
            if (sectorSet && !sectorSet.has(c.sector)) return false;
            if (citySet && !citySet.has(c.city)) return false;
            if (priority && c.priority !== priority) return false;
            if (fleetType && c.fleetType !== fleetType) return false;

            if (contactType === 'has_phone' && !c.phone1 && !c.mobile && !c.phone2) return false;
            if (contactType === 'has_maps' && !((c.latitude && c.longitude) || (c.lat && c.lng))) return false;
            if (contactType === 'has_website' && (!c.website || c.website === '—')) return false;

            if (fleetSize) {
                const size = Number(c.fleetSize) || 0;
                if (fleetSize === 'giant_fleet' && size < 100) return false;
                if (fleetSize === 'large_fleet' && (size < 50 || size >= 100)) return false;
                if (fleetSize === 'medium_fleet' && (size < 15 || size >= 50)) return false;
                if (fleetSize === 'small_fleet' && (size <= 0 || size >= 15)) return false;
                if (fleetSize === 'no_fleet' && size > 0) return false;
            }

            if (addedDate) {
                if (addedDate === 'today' && (!c.createdAt || !c.createdAt.startsWith(todayStr))) return false;
                if (addedDate === 'recent_7days') {
                    const ts = c.createdAt ? new Date(c.createdAt).getTime() : 0;
                    if ((now - ts) > (7 * 24 * 60 * 60 * 1000)) return false;
                }
                if (addedDate === 'recent_30days') {
                    const ts = c.createdAt ? new Date(c.createdAt).getTime() : 0;
                    if ((now - ts) > (30 * 24 * 60 * 60 * 1000)) return false;
                }
            }

            if (assigned) {
                if (assigned === 'my_leads') {
                    if (!c.assignedTo) return false;
                    const matchesMy = c.assignedTo === currentUser?.id || c.assignedTo === currentUser?.username || c.assignedTo === currentUser?.email || c.assignedTo === currentUser?.name;
                    if (!matchesMy) return false;
                } else if (assigned === 'unassigned') {
                    if (c.assignedTo) return false;
                } else {
                    const targetUser = window.AppStorage.getUser(assigned);
                    const matchesUser = c.assignedTo === assigned || 
                                        (targetUser && (c.assignedTo === targetUser.id || c.assignedTo === targetUser.username || c.assignedTo === targetUser.email || c.assignedTo === targetUser.name));
                    if (!matchesUser) return false;
                }
            }

            if (search) {
                const matches = (c.nameAr && c.nameAr.includes(search)) ||
                                (c.nameEn && c.nameEn.toLowerCase().includes(search)) ||
                                (c.phone1 && c.phone1.includes(search)) ||
                                (c.mobile && c.mobile.includes(search)) ||
                                (c.contactPerson && c.contactPerson.includes(search));
                if (!matches) return false;
            }

            return true;
        });

        // Fast Sort
        return companies.sort((a, b) => {
            if (sortMode === 'oldest') {
                return (new Date(a.createdAt || 0)) - (new Date(b.createdAt || 0));
            }
            if (sortMode === 'latest') {
                return (new Date(b.createdAt || 0)) - (new Date(a.createdAt || 0));
            }
            if (sortMode === 'fleet_desc') {
                return (Number(b.fleetSize) || 0) - (Number(a.fleetSize) || 0);
            }
            if (sortMode === 'fleet_asc') {
                return (Number(a.fleetSize) || 0) - (Number(b.fleetSize) || 0);
            }
            if (sortMode === 'priority') {
                const order = { A: 1, B: 2, C: 3 };
                const pA = order[a.priority] || 2;
                const pB = order[b.priority] || 2;
                return pA - pB;
            }
            if (sortMode === 'name' || sortMode === 'name_asc') {
                return (a.nameAr || a.nameEn || '').localeCompare(b.nameAr || b.nameEn || '', 'ar');
            }

            // Fallback column header sort
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

    async render() {
        this.refreshUserFilter();

        const sectorsListEl = document.getElementById('multiselect-sectors-list');
        if (sectorsListEl && sectorsListEl.children.length === 0) {
            this.initMultiSelects();
        }
        const pillsContainer = document.getElementById('sector-quick-pills-bar');
        if (pillsContainer && pillsContainer.children.length === 0) {
            this.renderSectorPills();
        }

        const sectors = Array.from(this.selectedSectors);
        const cities = Array.from(this.selectedCities);
        const legacySector = document.getElementById('filter-sector')?.value || '';
        const legacyCity = document.getElementById('filter-city')?.value || '';
        const finalSectors = sectors.length > 0 ? sectors : (legacySector ? [legacySector] : []);
        const finalCities = cities.length > 0 ? cities : (legacyCity ? [legacyCity] : []);

        const contactType = document.getElementById('filter-contact-type')?.value || '';
        const priority = document.getElementById('filter-priority')?.value || '';
        const fleetType = document.getElementById('filter-fleet-type')?.value || '';
        const fleetSize = document.getElementById('filter-fleet-size')?.value || '';
        const addedDate = document.getElementById('filter-added-date')?.value || '';
        const sortMode = document.getElementById('filter-sort')?.value || 'latest';
        const assigned = document.getElementById('filter-assigned')?.value || '';
        const search = document.getElementById('filter-search')?.value?.trim() || '';

        const result = await window.AppStorage.queryCompanies({
            search,
            sector: finalSectors.length === 1 ? finalSectors[0] : '',
            sectors: finalSectors,
            city: finalCities.length === 1 ? finalCities[0] : '',
            cities: finalCities,
            contactType,
            priority,
            fleetType,
            fleetSize,
            assigned,
            addedDate,
            sortMode,
            page: this.currentPage,
            pageSize: this.pageSize
        });

        this.renderActiveFilterChips();

        const pageCompanies = result.items || [];
        const total = result.total || 0;
        const totalPages = result.totalPages || 1;
        this.currentPage = result.page || 1;

        // Update count & view mode toggle buttons
        const currentUser = window.AppStorage.getCurrentUser();
        const canViewAll = window.AppStorage.canViewAll(currentUser);
        if (window.AppStorage && window.AppStorage.updateLiveCounters) {
            window.AppStorage.updateLiveCounters();
        }
        const masterTotal = window.AppStorage.getCompanies().length;
        const countDisplay = document.getElementById('companies-count-display');
        if (countDisplay) {
            if (!canViewAll) {
                countDisplay.textContent = `معروض: ${total.toLocaleString()} شركة فقط`;
            } else if (total === masterTotal) {
                countDisplay.textContent = `📊 إجمالي شركات السيستم: ${total.toLocaleString()} شركة`;
            } else {
                countDisplay.textContent = `🔍 نتائج البحث والفلترة: ${total.toLocaleString()} شركة مطابقة (من إجمالي ${masterTotal.toLocaleString()} شركة في السيستم)`;
            }
        }

        const btnTable = document.getElementById('btn-view-table');
        const btnCards = document.getElementById('btn-view-cards');
        if (btnTable) btnTable.classList.toggle('active', this.viewMode === 'table');
        if (btnCards) btnCards.classList.toggle('active', this.viewMode === 'cards');

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
        const currentUser = window.AppStorage.getCurrentUser();
        const isAdmin = window.AppStorage.isAdmin(currentUser);

        const thSelectAll = document.getElementById('th-select-all-companies');
        if (thSelectAll) thSelectAll.style.display = isAdmin ? 'table-cell' : 'none';

        if (!tbody || !tableView) return;
        tableView.style.display = 'block';
        if (cardsView) cardsView.style.display = 'none';

        if (total === 0) {
            tbody.innerHTML = '';
            if (empty) {
                empty.style.display = 'block';
                if (!window.AppStorage.canViewAll(currentUser)) {
                    empty.innerHTML = `
                        <i class="fas fa-user-shield" style="font-size:3rem; color:#818cf8; margin-bottom:1rem; display:block;"></i>
                        <h3 style="color:var(--text-primary); margin-bottom:0.5rem;">لا توجد شركات مخصصة لك حالياً</h3>
                        <p style="color:var(--text-muted); max-width:420px; margin:0 auto; line-height:1.6;">ستظهر الشركات الخاصة بك هنا فور قيام الإدارة بتخصيص وإسناد قائمة العملاء والمصانع لك لبدء التواصل ومتابعة المكالمات.</p>
                    `;
                }
            }
            return;
        }
        if (empty) empty.style.display = 'none';

        tbody.innerHTML = companies.map(c => {
            const esc = (s) => window.AppStorage.escapeHtml(s || '');
            const sectorLabel = window.AppStorage.getSectorLabel(c.sector);
            const cityLabel = window.AppStorage.getCityLabel(c.city);
            const phone = esc(c.phone1 || c.mobile || c.phone2 || '—');
            const fleet = c.fleetSize ? `🚛 ${c.fleetSize}` : '—';
            const contact = esc(c.contactPerson || '—');
            const contactTitle = esc(c.contactTitle || '');
            const linkedinRaw = typeof c.linkedinUrl === 'string' ? c.linkedinUrl : (typeof c.linkedin === 'string' ? c.linkedin : '');
            const linkedinLink = (linkedinRaw && linkedinRaw.includes('linkedin.com') && !linkedinRaw.includes('google.com')) ? esc(linkedinRaw) : '';
            const linkedinIcon = linkedinLink ? ` <a href="${linkedinLink}" target="_blank" style="color: #0077b5; margin-right: 6px; font-size: 14px;" title="LinkedIn الشركة" onclick="event.stopPropagation();"><i class="fab fa-linkedin"></i></a>` : '';

            const facebookLink = esc(typeof c.facebook === 'string' ? c.facebook : '');
            const facebookIcon = facebookLink ? ` <a href="${facebookLink}" target="_blank" style="color: #1877f2; margin-right: 6px; font-size: 14px;" title="Facebook الشركة" onclick="event.stopPropagation();"><i class="fab fa-facebook-f"></i></a>` : '';
            const rawMaps = window.AppStorage.getGoogleMapsUrl ? window.AppStorage.getGoogleMapsUrl(c) : (c.google_maps_url || '');
            const mapsLink = esc(rawMaps);
            const mapsIcon = mapsLink ? ` <a href="${mapsLink}" target="_blank" style="color: #ea4335; margin-right: 6px; font-size: 14px;" title="موقع الشركة على خرائط جوجل" onclick="event.stopPropagation();"><i class="fas fa-map-marker-alt"></i></a>` : '';

            const contactLinkedinRaw = typeof c.linkedinContactUrl === 'string' ? c.linkedinContactUrl : (typeof c.contactLinkedin === 'string' ? c.contactLinkedin : '');
            const contactLinkedin = (contactLinkedinRaw && contactLinkedinRaw.includes('linkedin.com') && !contactLinkedinRaw.includes('google.com')) ? esc(contactLinkedinRaw) : '';
            const contactLinkedinIcon = contactLinkedin ? ` <a href="${contactLinkedin}" target="_blank" style="color: #0077b5; margin-right: 6px; font-size: 12px;" title="LinkedIn المسؤول" onclick="event.stopPropagation();"><i class="fab fa-linkedin"></i></a>` : '';

            const isChecked = this.selectedCompanies && this.selectedCompanies.has(c.id) ? 'checked' : '';
            const assignedBadge = this.buildAssignedWidget(c);

            const mainName = esc(c.nameAr || c.nameEn || 'شركة بدون اسم');
            const subName = (c.nameAr && c.nameEn) ? esc(c.nameEn) : '';

            let callResultBadge = '';
            if (c.lastCallResult) {
                callResultBadge = `
                    <div>
                        <span class="result-badge result-${c.lastCallResult}" style="font-size:0.75rem;">${window.AppStorage.getCallResultLabel(c.lastCallResult)}</span>
                        ${c.lastCallDate ? `<small style="display:block; font-size:10px; color:var(--text-muted); margin-top:2px;">${c.lastCallDate}</small>` : ''}
                    </div>`;
            } else if (c.status === 'interested') {
                callResultBadge = `<span class="badge" style="background:#10b98122; color:#10b981; border:1px solid #10b981; font-size:0.75rem;">💚 عميل مهتم</span>`;
            } else {
                callResultBadge = `<span style="color:var(--text-muted); font-size:11px;">⚪ لم يتواصل بعد</span>`;
            }

            const isTitan = Boolean(c.isTitan || (c.id && String(c.id).startsWith('eg_titan_')));
            const titanBadge = isTitan ? `<span class="badge" style="background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff; font-size:10px; padding:2px 6px; border-radius:5px; font-weight:800; display:inline-flex; align-items:center; gap:3px;"><i class="fas fa-crown"></i> قلعة معتمدة</span>` : '';
            const hotlineBadge = c.hotline ? `<span class="badge" style="background:rgba(59,130,246,0.15); color:#3b82f6; font-size:11px; padding:1px 6px; border-radius:4px; font-family:Inter; font-weight:800;" title="الخط الساخن"><i class="fas fa-headset"></i> ${esc(c.hotline)}</span>` : '';

            return `
                <tr class="${isChecked ? 'row-selected' : ''}" onclick="Companies.showDetail('${c.id}')" style="cursor: pointer;">
                    ${isAdmin ? `
                        <td style="text-align:center;" onclick="event.stopPropagation();">
                            <input type="checkbox" class="company-checkbox" data-id="${c.id}" ${isChecked} onchange="Companies.toggleSelectCompany('${c.id}', this.checked)" onclick="event.stopPropagation();">
                        </td>
                    ` : ''}
                    <td>
                        <div class="company-name-cell">
                            <div style="display:flex; align-items:center; gap: 6px; flex-wrap:wrap;">
                                <span class="name-ar" style="font-weight:700;">${mainName}</span>
                                ${titanBadge}
                                ${linkedinIcon}
                                ${facebookIcon}
                                ${mapsIcon}
                            </div>
                            <div style="display:flex; align-items:center; gap:8px; margin-top:2px;">
                                ${subName ? `<span class="name-en" style="font-size:0.75rem; color:var(--text-muted);">${subName}</span>` : ''}
                                ${hotlineBadge}
                            </div>
                        </div>
                    </td>
                    <td><span class="badge sector-badge">${sectorLabel}</span></td>
                    <td>${cityLabel}</td>
                    <td style="direction:ltr; text-align:right; font-family:Inter; font-weight:600;">${phone}</td>
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
                        <div class="table-actions" onclick="event.stopPropagation();">
                            <button class="btn-icon btn-view" onclick="event.stopPropagation(); Companies.showDetail('${c.id}')" title="تفاصيل">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon btn-call" onclick="event.stopPropagation(); App.logCallForCompany('${c.id}')" title="مكالمة">
                                <i class="fas fa-phone"></i>
                            </button>
                            ${window.AppStorage.canModify(currentUser) ? `
                                <button class="btn-icon btn-edit" onclick="event.stopPropagation(); Companies.edit('${c.id}')" title="تعديل">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon btn-delete" onclick="event.stopPropagation(); Companies.confirmDelete('${c.id}')" title="حذف">
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
            if (empty) {
                empty.style.display = 'block';
                const currentUser = (window.AppStorage && typeof window.AppStorage.getCurrentUser === 'function') ? window.AppStorage.getCurrentUser() : null;
                if (currentUser && !window.AppStorage.canViewAll(currentUser)) {
                    empty.innerHTML = `
                        <i class="fas fa-user-shield" style="font-size:3rem; color:#818cf8; margin-bottom:1rem; display:block;"></i>
                        <h3 style="color:var(--text-primary); margin-bottom:0.5rem;">لا توجد شركات مخصصة لك حالياً</h3>
                        <p style="color:var(--text-muted); max-width:420px; margin:0 auto; line-height:1.6;">ستظهر الشركات الخاصة بك هنا فور قيام الإدارة بتخصيص وإسناد قائمة العملاء والمصانع لك لبدء التواصل ومتابعة المكالمات.</p>
                    `;
                }
            }
            return;
        }
        if (empty) empty.style.display = 'none';

        const currentUser = (window.AppStorage && typeof window.AppStorage.getCurrentUser === 'function') ? window.AppStorage.getCurrentUser() : null;

        cardsView.innerHTML = companies.map(c => {
            const esc = (s) => window.AppStorage.escapeHtml(s || '');
            const sectorLabel = window.AppStorage.getSectorLabel(c.sector);
            const cityLabel = window.AppStorage.getCityLabel(c.city);
            const rawPhone = String(c.phone1 || c.mobile || c.phone2 || '');
            const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');
            const phone = esc(rawPhone || '—');
            const rawMaps = window.AppStorage.getGoogleMapsUrl ? window.AppStorage.getGoogleMapsUrl(c) : (c.google_maps_url || '');
            const mapsLink = esc(rawMaps);
            const mapsIcon = mapsLink ? ` <a href="${mapsLink}" target="_blank" style="color: #ea4335; margin-right: 6px; font-size: 14px;" title="موقع الشركة على خرائط جوجل" onclick="event.stopPropagation();"><i class="fas fa-map-marker-alt"></i></a>` : '';
            const linkedinLink = esc(c.linkedinUrl || c.linkedin);
            const linkedinIcon = linkedinLink ? ` <a href="${linkedinLink}" target="_blank" style="color: #0077b5; margin-right: 6px; font-size: 14px;" title="LinkedIn الشركة" onclick="event.stopPropagation();"><i class="fab fa-linkedin"></i></a>` : '';
            const facebookLink = esc(c.facebook);
            const facebookIcon = facebookLink ? ` <a href="${facebookLink}" target="_blank" style="color: #1877f2; margin-right: 6px; font-size: 14px;" title="Facebook الشركة" onclick="event.stopPropagation();"><i class="fab fa-facebook-f"></i></a>` : '';
            const contactLinkedin = esc(c.linkedinContactUrl || c.contactLinkedin);
            const contactLinkedinIcon = contactLinkedin ? ` <a href="${contactLinkedin}" target="_blank" style="color: #0077b5; margin-right: 6px; font-size: 12px;" title="LinkedIn المسؤول" onclick="event.stopPropagation();"><i class="fab fa-linkedin"></i></a>` : '';
            const nameAr = esc(c.nameAr);
            const nameEn = esc(c.nameEn);
            const contactPerson = esc(c.contactPerson);
            const contactTitle = esc(c.contactTitle);

            const assignedBadge = this.buildAssignedWidget(c);

            return `
                <div class="company-card" data-priority="${c.priority || 'B'}" onclick="Companies.showDetail('${c.id}')" style="cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: rgba(99, 102, 241, 0.2);">
                    <div class="company-card__header">
                        <div>
                            <div class="company-card__name" style="display:flex; align-items:center;">
                                <span>${nameAr}</span>
                                ${linkedinIcon}
                                ${facebookIcon}
                                ${mapsIcon}
                            </div>
                            <div class="company-card__name-en">${nameEn}</div>
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
                        ${c.contactPerson ? `<div class="company-card__detail" style="display:flex; align-items:center; gap: 4px;"><i class="fas fa-user"></i> <span>${contactPerson}${contactTitle ? ' — ' + contactTitle : ''}</span>${contactLinkedinIcon}</div>` : ''}
                    </div>
                    <div class="company-card__footer" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; padding-top: 10px; border-top: 1px solid var(--border-light); margin-top: 8px;">
                        <div style="display: flex; gap: 6px; align-items: center;">
                            ${cleanPhone ? `
                                <a href="tel:${cleanPhone}" class="btn btn-sm" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;" onclick="event.stopPropagation();" title="اتصال مباشر">
                                    <i class="fas fa-phone"></i> اتصال
                                </a>
                            ` : ''}
                            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); App.logCallForCompany('${c.id}')" style="font-size: 12px; padding: 6px 14px; border-radius: 8px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 3px 10px rgba(124, 58, 237, 0.3);">
                                <i class="fas fa-phone-alt"></i> + تسجيل مكالمة
                            </button>
                        </div>
                        <div class="table-actions" onclick="event.stopPropagation();">
                            <button class="btn-icon btn-view" onclick="event.stopPropagation(); Companies.showDetail('${c.id}')" title="تفاصيل"><i class="fas fa-eye"></i></button>
                            ${window.AppStorage.canModify(currentUser) ? `
                                <button class="btn-icon btn-edit" onclick="event.stopPropagation(); Companies.edit('${c.id}')" title="تعديل"><i class="fas fa-edit"></i></button>
                                <button class="btn-icon btn-delete" onclick="event.stopPropagation(); Companies.confirmDelete('${c.id}')" title="حذف"><i class="fas fa-trash"></i></button>
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

    claimLead(companyId) {
        const currentUser = window.AppStorage.getCurrentUser();
        window.AppStorage.assignCompany(companyId, currentUser.id);
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
        const currentUser = window.AppStorage.getCurrentUser();
        const isAdmin = window.AppStorage.isAdmin(currentUser);
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
        const currentUser = window.AppStorage.getCurrentUser();
        if (!window.AppStorage.isAdmin(currentUser)) {
            App.showToast('⚠️ إعادة التخصيص التجميعي مسموحة فقط للمدير العام', 'error');
            return;
        }
        const select = document.getElementById('bulk-assign-user-select');
        const userId = select ? select.value : '';
        if (this.selectedCompanies.size === 0) return;

        const ids = Array.from(this.selectedCompanies);
        const count = window.AppStorage.bulkAssignCompanies(ids, userId);
        const userName = userId ? (window.AppStorage.getUser(userId)?.name || userId) : 'إلغاء المسند إليه';

        App.showToast(`✅ تم تعيين ${count} شركة لـ ${userName}`);
        this.clearSelection();
    },

    removeDuplicatesNow() {
        if (!window.AppStorage.isAdmin()) {
            App.showToast('⛔ عذراً، تصفية التكرارات مقتصرة على المدير العام فقط!', 'error');
            return;
        }

        const currentCompanies = window.AppStorage.getCompanies() || [];
        const oldLength = currentCompanies.length;
        const cleaned = window.AppStorage.cleanAndFixCompanyData(currentCompanies);
        const removedCount = oldLength - cleaned.length;

        if (removedCount > 0) {
            window.AppStorage.companiesMemory = cleaned;
            window.AppStorage.saveAllCompaniesToDB(cleaned);
            App.showToast(`🧹 تم بنجاح تصفية وإزالة ${removedCount} شركة مكررة! إجمالي الشركات الآن: ${cleaned.length.toLocaleString()}`, 'success');
            this.render();
            if (typeof Dashboard !== 'undefined') Dashboard.render();
            const sideCounter = document.getElementById('sidebar-total-companies');
            if (sideCounter) sideCounter.textContent = cleaned.length.toLocaleString();
        } else {
            App.showToast('✨ ممتاز! قاعدة البيانات نظيفة تماماً ولا يوجد أي شركات مكررة.', 'info');
        }
    },

    bulkDeleteSelected() {
        if (!window.AppStorage.isAdmin()) {
            App.showToast('⚠️ حذف الشركات مقتصر على المدير العام فقط', 'error');
            return;
        }
        if (this.selectedCompanies.size === 0) return;

        const count = this.selectedCompanies.size;
        App.confirm('🗑️ حذف الشركات المحددة', `هل أنت متأكد من حذف ${count} شركة محددة نهائياً من السيستم؟ لا يمكن التراجع عن هذه العملية.`, () => {
            const ids = Array.from(this.selectedCompanies);
            ids.forEach(id => window.AppStorage.deleteCompany(id));
            App.showToast(`✅ تم حذف ${count} شركة محددة بنجاح`, 'success');
            this.clearSelection();
            this.render();
            if (typeof Dashboard !== 'undefined') Dashboard.render();
        });
    },

    // ---- Data Audit & Quality Engine ----
    openAuditModal() {
        if (!window.AppStorage.isAdmin()) {
            App.showToast('⛔ عذراً، فحص البيانات مقتصر على المدير العام فقط!', 'error');
            return;
        }
        const report = window.AppStorage.auditCompanyData();
        const body = document.getElementById('data-audit-body');
        if (!body) return;

        let duplicatesHtml = '';
        if (report.duplicateGroups.length === 0) {
            duplicatesHtml = `
                <div style="background:rgba(16, 185, 129, 0.15); border:1px solid #10b981; border-radius:12px; padding:16px; text-align:center; color:#10b981; margin-top:16px;">
                    <i class="fas fa-check-circle" style="font-size:28px; margin-bottom:8px;"></i>
                    <h3 style="margin:0 0 4px 0; font-size:1.1rem; color:#10b981;">بيانات رائعة! لا يوجد أي شركات مكررة على النظام 🎉</h3>
                    <p style="margin:0; font-size:0.85rem; color:#94a3b8;">جميع الشركات المسجلة تتضمن بيانات فريدة وغير مكررة بنسبة 100%.</p>
                </div>`;
        } else {
            duplicatesHtml = `
                <div style="margin-top:20px;">
                    <h4 style="color:#f8fafc; font-size:0.95rem; font-weight:800; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
                        <i class="fas fa-copy" style="color:#f59e0b;"></i> المجموعات المكتشفة كـ شركات مكررة (${report.duplicateGroups.length} مجموعة):
                    </h4>
                    <div style="max-height:260px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding-left:4px;">
                        ${report.duplicateGroups.map((g, idx) => `
                            <div style="background:rgba(30, 41, 59, 0.6); border:1px solid rgba(245, 158, 11, 0.3); border-radius:10px; padding:12px;">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                    <span style="font-size:0.8rem; font-weight:800; color:#f59e0b;">مجموعة ${idx + 1}: ${g.reason} ("${g.key}")</span>
                                    <span style="font-size:0.75rem; color:#94a3b8;">${g.items.length} سجلات مكررة</span>
                                </div>
                                <div style="display:flex; flex-direction:column; gap:4px;">
                                    ${g.items.map(item => `
                                        <div style="font-size:0.78rem; background:rgba(15, 23, 42, 0.5); padding:6px 10px; border-radius:6px; display:flex; justify-content:space-between;">
                                            <span><strong>${item.nameAr || item.nameEn}</strong> (${item.city || 'المنطقة غير محددة'})</span>
                                            <span style="color:#94a3b8;">📞 ${item.phone1 || item.mobile || 'بدون هاتف'} | ID: ${item.id}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
        }

        body.innerHTML = `
            <!-- Stats Dashboard Grid -->
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap:12px; margin-bottom:16px;">
                <div style="background:rgba(99, 102, 241, 0.12); border:1px solid rgba(99, 102, 241, 0.3); border-radius:12px; padding:12px; text-align:center;">
                    <div style="font-size:1.5rem; font-weight:800; color:#818cf8;">${report.total}</div>
                    <div style="font-size:0.75rem; color:#94a3b8; font-weight:700;">إجمالي الشركات</div>
                </div>
                <div style="background:rgba(16, 185, 129, 0.12); border:1px solid rgba(16, 185, 129, 0.3); border-radius:12px; padding:12px; text-align:center;">
                    <div style="font-size:1.5rem; font-weight:800; color:#10b981;">${report.cleanDataCount}</div>
                    <div style="font-size:0.75rem; color:#94a3b8; font-weight:700;">شركات فريدة وسليمة 100%</div>
                </div>
                <div style="background:rgba(245, 158, 11, 0.12); border:1px solid rgba(245, 158, 11, 0.3); border-radius:12px; padding:12px; text-align:center;">
                    <div style="font-size:1.5rem; font-weight:800; color:#f59e0b;">${report.totalDuplicates}</div>
                    <div style="font-size:0.75rem; color:#94a3b8; font-weight:700;">سجلات مكررة مكتشفة</div>
                </div>
                <div style="background:rgba(239, 68, 68, 0.12); border:1px solid rgba(239, 68, 68, 0.3); border-radius:12px; padding:12px; text-align:center;">
                    <div style="font-size:1.5rem; font-weight:800; color:#ef4444;">${report.missingPhone}</div>
                    <div style="font-size:0.75rem; color:#94a3b8; font-weight:700;">بدون أرقام تليفون</div>
                </div>
            </div>

            <!-- Health Summary Box -->
            <div style="background:rgba(30, 41, 59, 0.5); border:1px solid var(--border-color); border-radius:12px; padding:14px; font-size:0.85rem; color:#cbd5e1; line-height:1.6;">
                <div style="font-weight:800; color:#f8fafc; margin-bottom:6px; display:flex; align-items:center; gap:8px;">
                    <i class="fas fa-microchip" style="color:#06b6d4;"></i> تقرير فحص جودة قاعدة البيانات:
                </div>
                <ul style="margin:0; padding-right:20px; color:#a78bfa;">
                    <li>نسبة اكتمال أرقام الهواتف: <strong style="color:#f8fafc;">${Math.round(((report.total - report.missingPhone) / (report.total || 1)) * 100)}%</strong></li>
                    <li>نسبة اكتمال تصنيف القطاعات والمناطق: <strong style="color:#f8fafc;">${Math.round(((report.total - report.missingSector) / (report.total || 1)) * 100)}%</strong></li>
                    <li>دقة وتفرد البيانات (Deduplication Score): <strong style="color:#10b981;">${Math.round((report.cleanDataCount / (report.total || 1)) * 100)}%</strong></li>
                </ul>
            </div>

            ${duplicatesHtml}
        `;

        App.openModal('modal-data-audit');
    },

    runAutoCleanAndMerge() {
        const res = window.AppStorage.autoCleanAndMergeDuplicates();
        if (res.mergedCount > 0) {
            App.showToast(`🎉 تم بنجاح دمج وتوحيد ${res.mergedCount} سجل مكرر وحفظ كافة أرقام الهواتف! الإجمالي الآن: ${res.remainingTotal.toLocaleString()} شركة فريدة 100%`, 'success');
        } else {
            App.showToast(`✨ قاعدة البيانات نظيفة تماماً! لا توجد سجلات مكررة (إجمالي ${res.remainingTotal.toLocaleString()} شركة فريدة 100%)`, 'info');
        }
        this.openAuditModal();
        this.render();
        if (typeof Dashboard !== 'undefined') Dashboard.render();
    },

    resetToPristinePool() {
        if (!window.AppStorage.isAdmin()) {
            App.showToast('⛔ عذراً، إعادة ضبط قاعدة البيانات مقتصرة على المدير العام فقط!', 'error');
            return;
        }
        App.confirm(
            '🔄 إعادة ضبط وهيكلة قاعدة البيانات بالكامل',
            'سيتم تنظيف وحذف أي كيانات عشوائية أو شوارع أو مطالع أو نتائج سحب قديمة، وإعادة ضبط قاعدة البيانات بالكامل على مجمع الـ 6,500 شركة الصناعية والتجارية المعتمدة 100%. هل تريد المتابعة؟',
            async () => {
                App.showToast('⏳ جاري إعادة الهيكلة والتنظيف الشامل من الصفر...', 'info');
                localStorage.removeItem('fleetcrm_user_wiped_companies');
                window.AppStorage.companiesMemory = [];
                await window.AppStorage._seedInitialJsonData([]);
                App.showToast('✨ تم بنجاح إعادة هيكلة قاعدة البيانات وتطهيرها بالكامل (6,500 شركة B2B معتمدة)!', 'success');
                Companies.render();
                if (typeof Dashboard !== 'undefined') Dashboard.render();
                if (document.getElementById('modal-data-audit')) App.closeModal('modal-data-audit');
            }
        );
    },

    openLinkedinEnricherModal(id) {
        const company = window.AppStorage.getCompany(id);
        if (!company) {
            App.showToast('⚠️ الشركة غير موجودة', 'error');
            return;
        }

        let existingModal = document.getElementById('modal-linkedin-enricher');
        if (existingModal) existingModal.remove();

        const nameAr = company.nameAr || company.nameEn || '';
        const linkedinSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(nameAr + ' مدير الحركة والمشتريات')}`;
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent('site:linkedin.com/in "' + nameAr + '" (مدير OR مشتريات OR حركة)')}`;

        const modalHtml = `
            <div id="modal-linkedin-enricher" class="modal show" style="display:flex; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15, 23, 42, 0.85); backdrop-filter:blur(8px); z-index:999999; align-items:center; justify-content:center;">
                <div style="background:var(--bg-secondary); border:1px solid var(--border-color); width:92%; max-width:540px; border-radius:20px; padding:28px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5); text-align:right;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--border-color); padding-bottom:12px;">
                        <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:#0077b5;"><i class="fab fa-linkedin" style="font-size:22px; margin-left:8px;"></i> محرك الكشف وإثراء المسؤولين عبر LinkedIn</h3>
                        <button onclick="document.getElementById('modal-linkedin-enricher').remove()" style="background:none; border:none; color:var(--text-muted); font-size:18px; cursor:pointer;">✕</button>
                    </div>

                    <div style="background:rgba(0, 119, 181, 0.1); border:1px solid rgba(0, 119, 181, 0.3); border-radius:12px; padding:14px; margin-bottom:20px;">
                        <div style="font-weight:800; font-size:0.95rem; color:#f8fafc; margin-bottom:4px;">🏢 شركة: ${company.nameAr}</div>
                        <div style="font-size:0.8rem; color:#94a3b8;">📍 ${company.city || ''} — 🚛 أسطول: ${company.fleetSize || 0} سيارة — 📞 ${company.phone1 || company.mobile || 'بدون هاتف'}</div>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
                        <a href="${linkedinSearchUrl}" target="_blank" rel="noopener noreferrer" style="background:#0077b5; color:#fff; border:none; padding:12px 16px; border-radius:12px; font-weight:800; text-decoration:none; display:flex; align-items:center; justify-content:space-between; font-size:0.9rem; box-shadow:0 4px 15px rgba(0,119,181,0.3);">
                            <span><i class="fab fa-linkedin" style="font-size:18px; margin-left:6px;"></i> البحث المباشر عن صُنّاع القرار بالشركة على LinkedIn</span>
                            <i class="fas fa-external-link-alt"></i>
                        </a>

                        <a href="${googleSearchUrl}" target="_blank" rel="noopener noreferrer" style="background:var(--bg-tertiary); color:var(--text-primary); border:1px solid var(--border-color); padding:12px 16px; border-radius:12px; font-weight:700; text-decoration:none; display:flex; align-items:center; justify-content:space-between; font-size:0.85rem;">
                            <span><i class="fab fa-google" style="color:#ea4335; margin-left:6px;"></i> البحث عن بروفايلات مديري الحركة عبر جوجل (Google LinkedIn Search)</span>
                            <i class="fas fa-search"></i>
                        </a>
                    </div>

                    <div style="border-top:1px solid var(--border-color); padding-top:16px;">
                        <label style="font-size:0.85rem; font-weight:700; color:var(--text-primary); display:block; margin-bottom:6px;">حفظ اسم وتفاصيل المسؤول المكتشف في CRM:</label>
                        <div style="display:flex; gap:8px; margin-bottom:12px;">
                            <input type="text" id="li-contact-person" placeholder="اسم المسؤول (مثال: م. أحمد عبد العزيز)" value="${company.contactPerson || ''}" style="flex:1; padding:10px 14px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:10px; color:var(--text-primary); font-size:0.85rem;">
                            <input type="text" id="li-contact-title" placeholder="المسمى الوظيفي (مثال: مدير الحركة)" value="${company.contactTitle || ''}" style="flex:1; padding:10px 14px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:10px; color:var(--text-primary); font-size:0.85rem;">
                        </div>

                        <button onclick="Companies.saveLinkedinEnrichment('${company.id}')" style="width:100%; background:linear-gradient(135deg, #10b981, #059669); color:#fff; border:none; padding:12px; border-radius:12px; font-weight:800; cursor:pointer; font-size:0.9rem; box-shadow:0 4px 15px rgba(16,185,129,0.3);">
                            <i class="fas fa-save" style="margin-left:6px;"></i> حفظ وتحديث بيانات المسؤول في السيستم أونلاين
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    saveLinkedinEnrichment(id) {
        const company = window.AppStorage.getCompany(id);
        if (!company) return;

        const personInput = document.getElementById('li-contact-person');
        const titleInput = document.getElementById('li-contact-title');

        company.contactPerson = personInput ? personInput.value.trim() : '';
        company.contactTitle = titleInput ? titleInput.value.trim() : '';
        company.lastUpdated = new Date().toISOString().split('T')[0];

        window.AppStorage.saveCompany(company);

        const modal = document.getElementById('modal-linkedin-enricher');
        if (modal) modal.remove();

        App.showToast('✅ تم حفظ بيانات المسؤول المكتشف وتحديثها بنجاح!', 'success');
        this.render();
    },

    // ---- CRUD ----
    openAddModal() {
        if (!window.AppStorage.isAdmin()) {
            App.showToast('🔒 إضافة شركات جديدة مقتصرة على المدير العام فقط', 'warning');
            return;
        }
        document.getElementById('form-company').reset();
        document.getElementById('company-id').value = '';
        document.getElementById('modal-company-title').innerHTML = '<i class="fas fa-building"></i> إضافة شركة جديدة';
        App.openModal('modal-company');
    },

    edit(id) {
        if (!window.AppStorage.isAdmin()) {
            App.showToast('🔒 تعديل بيانات الشركة مقتصر على المدير العام فقط', 'warning');
            return;
        }
        const company = window.AppStorage.getCompany(id);
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

        window.AppStorage.saveCompany(company);
        App.closeModal('modal-company');
        App.showToast(id ? 'تم تحديث بيانات الشركة' : 'تم إضافة الشركة بنجاح', 'success');
        this.render();
        Dashboard.render();
    },

    confirmDelete(id) {
        if (!window.AppStorage.isAdmin()) {
            App.showToast('🔒 حذف الشركات مقتصر على المدير العام فقط', 'warning');
            return;
        }
        const company = window.AppStorage.getCompany(id);
        if (!company) return;

        App.confirm('🗑️ حذف الشركة', `هل أنت متأكد من حذف "${company.nameAr || company.nameEn}"؟ سيتم حذف جميع المكالمات والصفقات المرتبطة بها.`, () => {
            window.AppStorage.deleteCompany(id);
            App.showToast('تم حذف الشركة بنجاح', 'success');
            this.render();
            if (typeof Dashboard !== 'undefined') Dashboard.render();
        });
    },

    showDetail(id) {
        this.currentDetailId = id;
        const company = window.AppStorage.getCompany(id);
        if (!company) return;

        const currentUser = window.AppStorage ? window.AppStorage.getCurrentUser() : null;
        const esc = (s) => window.AppStorage.escapeHtml(s || '');
        document.getElementById('detail-company-name').textContent = company.nameAr || company.nameEn;

        const calls = window.AppStorage.getCallsForCompany(id);

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
            timelineList.push({ date: call.date, event: `تم تسجيل اتصال مبيعات: نتيجة (${window.AppStorage.getCallResultLabel(call.result).replace(/<\/?[^>]+(>|$)/g, "")})` });
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
                        ${this._detailRow('الاسم (عربي)', esc(company.nameAr))}
                        ${this._detailRow('الاسم (إنجليزي)', esc(company.nameEn))}
                        ${this._detailRow('القطاع', window.AppStorage.getSectorLabel(company.sector))}
                        ${this._detailRow('نشاط الخرائط', esc(company.sector_details))}
                        ${this._detailRow('حالة النشاط', statusLabel)}
                        ${this._detailRow('المنطقة', window.AppStorage.getCityLabel(company.city))}
                        ${this._detailRow('المحافظة', esc(company.governorate))}
                        ${this._detailRow('العنوان', esc(company.address))}
                        ${this._detailRow('الموقع على الخريطة', (function(){
                            const mUrl = window.AppStorage.getGoogleMapsUrl ? window.AppStorage.getGoogleMapsUrl(company) : (company.google_maps_url || '');
                            let html = `<div style="display:flex; flex-direction:column; gap:6px;">`;
                            html += `<a href="${esc(mUrl)}" target="_blank" rel="noopener noreferrer" style="color:#ea4335; font-weight:700; display:inline-flex; align-items:center; gap:6px;"><i class="fas fa-map-marked-alt"></i> <span>📍 عرض بروفايل وبطاقة الشركة الرسمية على Google Maps</span></a>`;
                            if ((company.latitude && company.longitude) || (company.lat && company.lng)) {
                                const lat = company.latitude || company.lat;
                                const lng = company.longitude || company.lng;
                                html += `<a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; font-size:12px; font-weight:700; display:inline-flex; align-items:center; gap:6px;"><i class="fas fa-route"></i> <span>🧭 بدء الملاحة وتوجيه الـ GPS (بوابة المصنع)</span></a>`;
                            }
                            html += `</div>`;
                            return html;
                        })())}
                        ${this._detailRow('تقييم الشركة (Maps)', company.rating ? `⭐ ${company.rating} / 5 ${company.reviews_count ? `(${company.reviews_count} تقييم)` : ''}` : '—')}
                        ${this._detailRow('حجم الشركة', company.companySize || '—')}
                        ${this._detailRow('عدد الفروع', company.branchesCount || '—')}
                        ${this._detailRow('الأولوية', `<span class="badge priority-badge priority-${company.priority}">${company.priority}</span>`)}
                    </div>
                    <div class="detail-section">
                        <h3><i class="fas fa-truck"></i> بيانات الأسطول</h3>
                        ${this._detailRow('حجم الأسطول', company.fleetSize ? company.fleetSize + ' سيارة' : '—')}
                        ${this._detailRow('نوع الأسطول', window.AppStorage.getFleetTypeLabel(company.fleetType))}
                    </div>
                </div>
                <div>
                    <div class="detail-section">
                        <h3><i class="fas fa-phone"></i> بيانات الاتصال</h3>
                        ${company.hotline ? this._detailRow('الخط الساخن (Hotline)', `<span style="color:#3b82f6; font-weight:800; font-family:Inter; font-size:1.1rem;"><i class="fas fa-headset"></i> ${esc(company.hotline)}</span>`) : ''}
                        ${this._detailRow('هاتف 1', esc(company.phone1), true)}
                        ${this._detailRow('هاتف 2', esc(company.phone2), true)}
                        ${this._detailRow('موبايل', esc(company.mobile), true)}
                        ${company.otherPhones ? this._detailRow('أرقام إضافية / مدمجة', `<span style="direction:ltr; font-family:Inter; color:#22d3ee; font-weight:700;">${esc(company.otherPhones)}</span>`, true) : ''}
                        ${company.branches && company.branches.length > 0 ? this._detailRow('الفروع والمجمعات', `<div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:4px;">${company.branches.map(b => `<span style="background:rgba(124,58,237,0.2); color:#c4b5fd; border:1px solid rgba(124,58,237,0.3); padding:2px 8px; border-radius:6px; font-size:11px; font-weight:700;">${esc(b)}</span>`).join('')}</div>`) : ''}
                        ${this._detailRow('البريد', company.email ? `<a href="mailto:${esc(company.email)}">${esc(company.email)}</a>` : '—')}
                        ${this._detailRow('الموقع', company.website ? `<a href="${esc(company.website)}" target="_blank">${esc(company.website)}</a>` : '—')}
                        ${this._detailRow('LinkedIn الشركة', (company.linkedinUrl || company.linkedin) ? `<a href="${esc(company.linkedinUrl || company.linkedin)}" target="_blank" style="color:#0077b5;"><i class="fab fa-linkedin"></i> عرض الصفحة</a>` : '—')}
                        ${this._detailRow('Facebook', company.facebook ? `<a href="${esc(company.facebook)}" target="_blank" style="color:#1877f2;"><i class="fab fa-facebook-f"></i> عرض الصفحة</a>` : '—')}
                    </div>
                    <div class="detail-section">
                        <h3><i class="fas fa-user-tie"></i> جهة الاتصال</h3>
                        ${this._detailRow('الاسم', esc(company.contactPerson) + (company.linkedinContactUrl ? ` <a href="${esc(company.linkedinContactUrl)}" target="_blank" style="color:#0077b5; margin-right:6px;"><i class="fab fa-linkedin"></i></a>` : ''))}
                        ${this._detailRow('المسمى', esc(company.contactTitle))}
                        ${this._detailRow('التليفون', esc(company.contactPhone), true)}
                        ${this._detailRow('الإيميل', company.contactEmail ? `<a href="mailto:${esc(company.contactEmail)}">${esc(company.contactEmail)}</a>` : '—')}
                        ${this._detailRow('LinkedIn المسؤول', company.linkedinContactUrl ? `<a href="${esc(company.linkedinContactUrl)}" target="_blank" style="color:#0077b5;"><i class="fab fa-linkedin"></i> عرض الملف الشخصي</a>` : '—')}
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

            ${company.notes ? `<div class="detail-section"><h3><i class="fas fa-sticky-note"></i> ملاحظات</h3><p style="font-size:0.85rem; color:var(--text-secondary);">${esc(company.notes)}</p></div>` : ''}

            <div class="detail-section detail-calls-history">
                <h3><i class="fas fa-history"></i> سجل المكالمات (${calls.length})</h3>
                ${calls.length === 0 ? '<p style="color:var(--text-muted); font-size:0.85rem;">لا توجد مكالمات بعد</p>' :
                calls.slice(0, 10).map(call => `
                    <div class="detail-call-item" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:6px; margin-bottom:4px; background:rgba(255,255,255,0.02);">
                        <span style="color:var(--text-muted); font-family:Inter; font-size:0.75rem; min-width:80px;">${call.date}</span>
                        <span class="result-badge result-${call.result}">${window.AppStorage.getCallResultLabel(call.result)}</span>
                        <span style="flex:1; font-size:0.8rem; color:var(--text-secondary);">${esc(call.notes || '')}</span>
                        ${currentUser && currentUser.role === 'admin' ? `
                            <button class="btn-icon btn-delete" style="padding:2px 6px; font-size:11px; margin-right:auto; color:var(--danger, #ef4444); background:transparent; border:none; cursor:pointer;" onclick="event.stopPropagation(); window.AppStorage.deleteCall('${call.id}'); Companies.showDetail('${id}'); if(typeof Calls !== 'undefined') Calls.render(); App.showToast('تم حذف المكالمة بنجاح', 'success');" title="حذف المكالمة"><i class="fas fa-trash"></i></button>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
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
        const currentUser = (window.AppStorage && typeof window.AppStorage.getCurrentUser === 'function') ? window.AppStorage.getCurrentUser() : null;
        const currentName = (currentUser && currentUser.name) ? String(currentUser.name).split(' ')[0] : (currentUser?.username || 'أنا');
        const users = (window.AppStorage && typeof window.AppStorage.getUsers === 'function') ? (window.AppStorage.getUsers() || []) : [];
        const assignedUser = (window.AppStorage && typeof window.AppStorage.getUser === 'function') ? window.AppStorage.getUser(c.assignedTo) : null;

        if (assignedUser) {
            const userName = assignedUser.name || assignedUser.username || 'موظف';
            return `
                <div style="display:inline-flex; align-items:center; gap:6px;" onclick="event.stopPropagation();">
                    <span class="badge" style="background:${assignedUser.color || '#7c3aed'}22; color:${assignedUser.color || '#7c3aed'}; border:1px solid ${assignedUser.color || '#7c3aed'}66; padding:4px 8px; font-weight:700; font-size:0.75rem; border-radius:6px; display:inline-flex; align-items:center; gap:4px;" title="تاريخ التعيين: ${c.assignedAt ? new Date(c.assignedAt).toLocaleDateString('ar-EG') : ''}">
                        ${assignedUser.avatar || '👤'} ${userName}
                    </span>
                    ${window.AppStorage.canModify() ? `
                        <select onchange="Companies.assignToUser('${c.id}', this.value)" style="padding:2px 6px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-muted); font-size:11px; cursor:pointer;" title="تغيير الموظف المسند إليه أو إلغاء التعيين">
                            <option value="${assignedUser.id}" selected>✏️ تغيير</option>
                            <option value="">⚪ إلغاء التعيين</option>
                            ${users.filter(u => u && u.id !== assignedUser.id).map(u => `<option value="${u.id}">👤 ${u.name || u.username || 'موظف'}</option>`).join('')}
                        </select>
                    ` : ''}
                </div>`;
        } else {
            return window.AppStorage.canModify() ? `
                <div onclick="event.stopPropagation();" style="display:inline-block;">
                    <select onchange="Companies.assignToUser('${c.id}', this.value)" style="padding:4px 8px; border-radius:6px; border:1px dashed #7c3aed; background:rgba(124, 58, 237, 0.1); color:#7c3aed; font-size:0.75rem; font-weight:700; cursor:pointer;" title="اختر الموظف لإسناد هذه الشركة له">
                        <option value="" selected>➕ إسناد لموظف...</option>
                        <option value="current_user">🙋‍♂️ حجز لي (${currentName})</option>
                        ${users.map(u => `<option value="${u.id}">👤 ${u.name || u.username || 'موظف'} (${u.role === 'admin' ? 'مدير' : u.role === 'supervisor' ? 'مشرف' : 'مبيعات'})</option>`).join('')}
                    </select>
                </div>` : `<span style="color:var(--text-muted); font-size:11px;">⚪ غير مسندة</span>`;
        }
    },

    assignToUser(companyId, userId) {
        const currentUser = window.AppStorage.getCurrentUser();
        let targetUserId = userId;

        if (userId === 'current_user') {
            targetUserId = currentUser ? currentUser.id : 'admin';
        }

        const comp = window.AppStorage.getCompany(companyId);
        const compName = comp ? (comp.nameAr || comp.nameEn || 'الشركة') : 'الشركة';

        if (!targetUserId) {
            window.AppStorage.assignCompany(companyId, '');
            App.showToast(`🗑️ تم إلغاء حجز وإسناد شركة "${compName}"`, 'info');
        } else {
            window.AppStorage.assignCompany(companyId, targetUserId);
            const targetUser = window.AppStorage.getUser(targetUserId);
            const targetName = targetUser ? targetUser.name : targetUserId;
            App.showToast(`✅ تم إسناد وتخصيص شركة "${compName}" بنجاح إلى: ${targetName}`, 'success');

            // If active filter is 'unassigned', notify user where the company went
            const activeFilterAssigned = document.getElementById('filter-assigned')?.value;
            if (activeFilterAssigned === 'unassigned') {
                setTimeout(() => {
                    App.showToast(`ℹ️ ملحوظة: اصبحت الشركة الآن تابعة لـ (${targetName}). يمكنك فلترة الصفحة بـ (${targetName}) لمشاهدتها.`, 'info');
                }, 1000);
            }
        }

        // Refresh Companies view, Team view & User Filters
        this.refreshUserFilter();
        this.render();
        if (typeof Team !== 'undefined' && Team.render) Team.render();
    },

    claimLead(companyId) {
        const currentUser = window.AppStorage.getCurrentUser();
        if (!currentUser) return;
        window.AppStorage.assignCompany(companyId, currentUser.id);
        App.showToast(`✅ تم حجز هذه الشركة لـ: ${currentUser.name}`);
        this.render();
    },

    printCompanyCard() {
        const body = document.getElementById('company-detail-body');
        const companyName = document.getElementById('detail-company-name')?.textContent || 'بطاقة الشركة';
        if (!body) return;

        const printWindow = window.open('', '_blank', 'width=900,height=800');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>${companyName} - Fleet CRM Report</title>
                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Cairo', sans-serif; padding: 30px; color: #1e293b; background: #fff; line-height: 1.6; }
                    h1 { color: #4f46e5; border-bottom: 2px solid #6366f1; padding-bottom: 10px; font-size: 22px; }
                    h3 { color: #374151; margin-top: 20px; font-size: 16px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; }
                    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                    .detail-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
                    .label { color: #64748b; font-weight: bold; }
                    .value { color: #0f172a; font-weight: 700; }
                    .badge { padding: 3px 8px; border-radius: 6px; font-size: 11px; background: #e0e7ff; color: #3730a3; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <h1>🏢 بطاقة تقرير الشركة: ${companyName}</h1>
                <div>${body.innerHTML}</div>
                <div style="margin-top:40px; text-align:center; font-size:11px; color:#94a3b8; border-top:1px solid #e2e8f0; padding-top:10px;">
                    تم استخراج هذا التقرير من نظام Fleet CRM Enterprise — ${new Date().toLocaleDateString('ar-EG')}
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }
};

window.Companies = Companies;
