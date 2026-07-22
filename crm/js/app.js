/* ============================================
   App — Fleet CRM Main Application Controller
   ============================================ */

const App = {
    currentPage: 'dashboard',

    async init() {
        const hideOverlay = () => {
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) loadingOverlay.classList.add('hidden');
        };

        try {
            // Ensure clean initial state flags if needed
            try {
                if (!localStorage.getItem('fleetcrm_deals_cleared_v3')) {
                    localStorage.setItem('fleetcrm_calls', '[]');
                    localStorage.setItem('fleetcrm_deals', '[]');
                    localStorage.setItem('fleetcrm_activities', '[]');
                    localStorage.setItem('fleetcrm_deals_cleared_v3', 'true');
                }
            } catch (e) {
                console.error('Storage flag error:', e);
            }

            // Initialize Database
            await Storage.initDB();

            // Migrate existing companies' sectors/cities to canonical keys if not done yet
            if (!localStorage.getItem('fleetcrm_city_sector_mapped_v7')) {
                const companies = Storage.getCompanies();
                if (companies.length > 0) {
                    const migrated = companies.map(c => {
                        c.sector = Storage.mapScraperSectorToCRM(c.sector);
                        c.city = Storage.mapScraperCityToCRM(c.city);
                        c.priority = Storage.calculatePriority(c.sector);
                        return c;
                    });
                    Storage.setCompanies(migrated);
                    localStorage.setItem('fleetcrm_city_sector_mapped_v7', 'true');
                }
            }

            // Try to import from scraper FIRST, before rendering anything
            await this.forceImportNow(null);

            // Initialize routing
            this.initRouting();

            // Bind global events
            this.bindEvents();

            // Initialize all modules safely
            try { if (typeof Dashboard !== 'undefined') Dashboard.init(); } catch (e) { console.error('Dashboard init:', e); }
            try { if (typeof Companies !== 'undefined') Companies.init(); } catch (e) { console.error('Companies init:', e); }
            try { if (typeof Calls !== 'undefined') Calls.init(); } catch (e) { console.error('Calls init:', e); }
            try { if (typeof Pipeline !== 'undefined') Pipeline.init(); } catch (e) { console.error('Pipeline init:', e); }
            try { if (typeof Reports !== 'undefined') Reports.init(); } catch (e) { console.error('Reports init:', e); }
            try { if (typeof Team !== 'undefined') Team.init(); } catch (e) { console.error('Team init:', e); }

            // Initialize User Switcher
            this.initUserSwitcher();

            // Check authentication session
            this.checkAuth();

            // Navigate to current hash or appropriate home
            const currentUser = Storage.getCurrentUser();
            const isAdmin = Storage.isAdmin(currentUser);
            let hash = window.location.hash.replace('#', '');
            if (!hash || (!isAdmin && hash !== 'companies' && hash !== 'calls')) {
                hash = isAdmin ? 'dashboard' : 'companies';
            }
            this.navigateTo(hash);

            // Keep checking every 60 seconds for new scraper data
            setInterval(() => this.autoImportScrapedData(), 60000);
        } catch (err) {
            console.error('App init error:', err);
        } finally {
            hideOverlay();
            setTimeout(hideOverlay, 300);
        }
    },

    initLoginScreen() {
        const userSelect = document.getElementById('login-user-select');
        const quickUsers = document.getElementById('login-quick-users');
        const users = Storage.getUsers();

        if (userSelect) {
            userSelect.innerHTML = users.map(u => `
                <option value="${u.id}">
                    ${u.avatar || '👤'} ${u.name} (${u.role === 'admin' ? 'مدير عام' : 'موظف مبيعات'})
                </option>
            `).join('');

            userSelect.onchange = () => {
                const selectedId = userSelect.value;
                const user = Storage.getUser(selectedId);
                const passInput = document.getElementById('login-password');
                if (passInput && user) {
                    passInput.value = user.password || (user.role === 'admin' ? 'admin123' : '123');
                }
            };
        }

        if (quickUsers) {
            quickUsers.innerHTML = users.map(u => `
                <button type="button" onclick="App.quickLogin('${u.id}')" style="background: rgba(124, 58, 237, 0.18); color: #c4b5fd; border: 1px solid rgba(124, 58, 237, 0.4); padding: 5px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s;" title="دخول سريع بـ ${u.name}">
                    ${u.avatar || '👤'} ${u.name.split(' ')[0]} ${u.role === 'admin' ? '👑' : ''}
                </button>
            `).join('');
        }
    },

    checkAuth() {
        this.initLoginScreen();
        const currentUser = Storage.getCurrentUser();
        const loginScreen = document.getElementById('login-screen');
        const sidebar = document.getElementById('sidebar');
        const mainWrapper = document.querySelector('.main-wrapper');

        if (!currentUser) {
            if (loginScreen) loginScreen.style.display = 'flex';
            if (sidebar) sidebar.style.display = 'none';
            if (mainWrapper) mainWrapper.style.display = 'none';
        } else {
            if (loginScreen) loginScreen.style.display = 'none';
            if (sidebar) sidebar.style.display = 'flex';
            if (mainWrapper) mainWrapper.style.display = 'flex';
            this.updateUserUI();
        }
    },

    handleLogin() {
        const userSelect = document.getElementById('login-user-select');
        const passInput = document.getElementById('login-password');
        const userId = userSelect ? userSelect.value : 'admin';
        const password = passInput ? passInput.value : '';

        const user = Storage.getUser(userId);
        if (!user) {
            this.showToast('❌ الحساب المحدد غير موجود', 'error');
            return;
        }

        if (user.password && user.password !== password) {
            this.showToast('❌ كلمة المرور غير صحيحة', 'error');
            return;
        }

        localStorage.setItem(Storage.KEYS.CURRENT_USER, user.id);
        this.showToast(`🎉 أهلاً بك يا ${user.name}`, 'success');
        this.checkAuth();

        const isAdmin = Storage.isAdmin(user);
        this.navigateTo(isAdmin ? 'dashboard' : 'companies');
    },

    loginWithGoogle() {
        const email = prompt('ادخل بريد Google (Gmail) الخاص بك لتسجيل الدخول أو تقديم طلب انضمام:');
        if (!email || !email.includes('@')) {
            if (email) this.showToast('⚠️ يرجى إدخال بريد إلكتروني صحيح (Gmail)', 'warning');
            return;
        }

        const name = prompt('ادخل اسمك بالكامل:', email.split('@')[0]);

        const user = Storage.registerGoogleUser({ email, name });

        if (user.status === 'pending_approval') {
            alert(`⏳ تم استلام طلب تسجيلك بنجاح ببريد (${user.email})!\n\nحسابك حالياً في حالة (بانتظار موافقة وتفعيل المدير العام).\nيرجى التواصل مع الإدارة لإتاحة الصلاحيات ودخول النظام.`);
            return;
        }

        if (user.status === 'frozen') {
            alert(`⛔ حسابك مجمد حالياً بقرار من الإدارة.`);
            return;
        }

        // Active user -> Login!
        localStorage.setItem(Storage.KEYS.CURRENT_USER, user.id);
        this.showToast(`🎉 مرحباً بك يا ${user.name}`, 'success');
        this.checkAuth();
        const isAdmin = Storage.isAdmin(user);
        this.navigateTo(isAdmin ? 'dashboard' : 'companies');
    },

    quickLogin(userId) {
        const userSelect = document.getElementById('login-user-select');
        const passInput = document.getElementById('login-password');
        const user = Storage.getUser(userId);
        if (userSelect && user) userSelect.value = user.id;
        if (passInput && user) passInput.value = user.password || (user.role === 'admin' ? 'admin123' : '123');
        this.handleLogin();
    },

    toggleLoginPasswordVisibility() {
        const passInput = document.getElementById('login-password');
        const icon = document.getElementById('login-eye-icon');
        if (!passInput) return;
        if (passInput.type === 'password') {
            passInput.type = 'text';
            if (icon) icon.className = 'fas fa-eye-slash';
        } else {
            passInput.type = 'password';
            if (icon) icon.className = 'fas fa-eye';
        }
    },

    logoutSystem() {
        Storage.logout();
        this.showToast('👋 تم تسجيل الخروج بنجاح', 'info');
        this.checkAuth();
    },

    updateUserUI() {
        const current = Storage.getCurrentUser();
        if (!current) return;

        const isAdmin = Storage.isAdmin(current);

        // Toggle Sidebar elements based on role: Sales Agent sees ONLY Companies & Calls
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            const page = link.dataset.page;
            
            if (!isAdmin) {
                if (page === 'companies' || page === 'calls') {
                    link.style.display = 'flex';
                } else {
                    link.style.display = 'none';
                }
            } else {
                link.style.display = 'flex';
            }
        });

        // Hide Admin-only buttons on Companies page and topbar for Sales Agents
        const btnAddComp = document.getElementById('btn-add-company');
        const btnImportExcel = document.getElementById('btn-import-excel');
        const btnExportExcel = document.getElementById('btn-export-excel');
        const bulkBar = document.getElementById('bulk-actions-bar');
        const btnTeam = document.getElementById('btn-team-management');
        const btnQuickAdd = document.getElementById('btn-quick-add');

        if (btnAddComp) btnAddComp.style.display = isAdmin ? 'inline-flex' : 'none';
        if (btnImportExcel) btnImportExcel.style.display = isAdmin ? 'inline-flex' : 'none';
        if (btnExportExcel) btnExportExcel.style.display = isAdmin ? 'inline-flex' : 'none';
        if (btnTeam) btnTeam.style.display = isAdmin ? 'inline-flex' : 'none';
        if (btnQuickAdd) btnQuickAdd.style.display = isAdmin ? 'inline-flex' : 'none';
        if (bulkBar && !isAdmin) bulkBar.style.display = 'none';

        const filterAssignedGroup = document.getElementById('filter-assigned-group') || document.getElementById('filter-assigned')?.parentElement;
        if (filterAssignedGroup) filterAssignedGroup.style.display = isAdmin ? 'block' : 'none';

        // Topbar User Avatar & Active User Bar
        const avatarEl = document.getElementById('current-user-avatar');
        if (avatarEl) {
            avatarEl.textContent = current.avatar || '👤';
            avatarEl.style.background = current.color || '#7c3aed';
        }
        const select = document.getElementById('user-switcher-select');
        if (select && select.value !== current.id) {
            select.value = current.id;
        }

        // Active User Status Banner Update
        const activeNameEl = document.getElementById('active-user-display-name');
        const activeRoleEl = document.getElementById('active-user-display-role');
        const pillsContainer = document.getElementById('quick-user-pills');

        if (activeNameEl) {
            activeNameEl.innerHTML = `${current.avatar || '👤'} ${current.name}`;
            activeNameEl.style.borderColor = current.color || '#7c3aed';
        }
        if (activeRoleEl) {
            activeRoleEl.textContent = isAdmin ? '👑 المدير العام (عرض وتصديق كافة الشركات)' : `👨‍💼 مسؤول مبيعات (${Storage.getRegionLabel(current.region)})`;
        }

        if (pillsContainer) {
            const users = Storage.getUsers() || [];
            pillsContainer.innerHTML = users.map(u => {
                const isActive = u.id === current.id;
                const bg = isActive ? (u.color || '#7c3aed') : 'var(--bg-surface)';
                const color = isActive ? '#ffffff' : 'var(--text-primary)';
                const border = isActive ? 'none' : '1px solid var(--border-color)';
                const shadow = isActive ? '0 2px 8px rgba(0,0,0,0.2)' : 'none';

                return `
                    <button onclick="App.switchUser('${u.id}')" style="background:${bg}; color:${color}; border:${border}; box-shadow:${shadow}; padding:4px 10px; border-radius:16px; font-size:11px; font-weight:700; cursor:pointer; transition:all 0.2s;" title="تحويل الحساب لـ ${u.name}">
                        ${u.avatar || '👤'} ${u.name.split(' ')[0]} ${isActive ? '✓' : ''}
                    </button>`;
            }).join('');
        }
    },

    switchUser(userId) {
        if (userId === 'logout') {
            this.logoutSystem();
            return;
        }
        if (userId === 'admin') {
            Storage.resetToAdmin();
        } else {
            Storage.setCurrentUser(userId);
        }
        this.updateUserUI();
        const user = Storage.getCurrentUser();
        const isAdmin = user && user.role === 'admin';
        this.showToast(isAdmin ? `👑 تم تفعيل حساب: ${user.name} - تحكم كامل بالمأذونيات` : `👤 تم التبديل إلى حساب: ${user.name}`, 'success');
        this.navigateTo(isAdmin ? 'dashboard' : 'companies');
    },

    async autoImportScrapedData() {
        try {
            const statsResp = await fetch('http://localhost:8888/api/scraper-stats?' + Date.now());
            if (!statsResp.ok) return;
            const stats = await statsResp.json();

            // Calculate total from sector stats object
            let scraperTotal = 0;
            if (stats.stats && typeof stats.stats === 'object') {
                scraperTotal = Object.values(stats.stats).reduce((s, v) => s + (Number(v) || 0), 0);
            }
            if (!scraperTotal && stats.total) scraperTotal = Number(stats.total);

            const dbTotal = Storage.getCompanies().length;

            // Import if scraper has more companies than DB, or DB is nearly empty
            if (scraperTotal > dbTotal || dbTotal < 50) {
                await this.forceImportNow(stats);
            }
        } catch (err) {
            console.log('Scraper auto-import skipped:', err.message);
        }
    },

    async forceImportNow(stats) {
        try {
            const SCRAPER_URL = 'http://localhost:8888/output/crm_import_ready.json';
            const resp = await fetch(SCRAPER_URL + '?' + Date.now());
            if (!resp.ok) return;

            const data = await resp.json();
            if (!Array.isArray(data) || data.length === 0) return;

            const now = new Date().toISOString();
            const today = now.split('T')[0];
            const existing = Storage.getCompanies();
            const existingIds = new Set(existing.map(c => c.id));
            const existingNames = new Set(existing.map(c => c.nameAr || c.nameEn).filter(Boolean));
            let added = 0;

            data.forEach((c, i) => {
                const company = { ...c };
                if (!company.id) company.id = 'imp_' + i;
                if (!company.nameAr) company.nameAr = '';
                if (!company.nameEn) company.nameEn = '';
                company.sector = Storage.mapScraperSectorToCRM(c.sector);
                company.city = Storage.mapScraperCityToCRM(c.city);
                company.priority = Storage.calculatePriority(company.sector);
                if (!company.status) company.status = 'new';
                if (!company.createdAt) company.createdAt = now;
                if (!company.lastUpdated) company.lastUpdated = today;

                const isDup = existingIds.has(company.id) ||
                    ((company.nameAr || company.nameEn) && existingNames.has(company.nameAr || company.nameEn));
                if (!isDup) {
                    Storage.companiesMemory.push(company);
                    existingIds.add(company.id);
                    if (company.nameAr) existingNames.add(company.nameAr);
                    added++;
                }
            });

            // Save to IndexedDB in background
            Storage.saveAllCompaniesToDB(Storage.companiesMemory);
            if (stats && stats.last_mtime_crm) {
                localStorage.setItem('fleetcrm_last_import_mtime', stats.last_mtime_crm.toString());
            }

            const total = Storage.getCompanies().length;

            const sideCounter = document.getElementById('sidebar-total-companies');
            if (sideCounter) sideCounter.textContent = total.toLocaleString();

            // Always refresh companies view after import
            if (typeof Companies !== 'undefined') {
                Companies.refreshUserFilter();
                Companies.render();
            }
            if (this.currentPage === 'dashboard' && typeof Dashboard !== 'undefined') {
                Dashboard.render();
            }

            if (added > 0) {
                this.showToast(`✅ تم تحميل ${total.toLocaleString()} شركة`, 'success');
            }
        } catch (err) {
            console.error('Force import error:', err);
        }
    },

    initRouting() {
        window.addEventListener('hashchange', () => {
            const page = window.location.hash.replace('#', '') || 'companies';
            this.navigateTo(page);
        });
    },

    navigateTo(page) {
        const currentUser = Storage.getCurrentUser();
        const isAdmin = Storage.isAdmin(currentUser);

        // Role-based restrictions: Sales Agents CAN ONLY access companies & calls
        if (!isAdmin && page !== 'companies' && page !== 'calls') {
            this.showToast('🔒 شاشة "متابعة الفريق" مخصصة للمدير العام فقط. قم بالتحويل لحساب المدير من أعلى الصفحة.', 'warning');
            page = 'companies'; // Default page for employees
        }

        const validPages = ['dashboard', 'companies', 'calls', 'pipeline', 'reports', 'scraper', 'team'];
        if (!validPages.includes(page)) page = isAdmin ? 'dashboard' : 'companies';

        this.currentPage = page;

        // Update active page element
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const pageEl = document.getElementById(`page-${page}`);
        if (pageEl) {
            pageEl.classList.add('active');
        }

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        // Re-render page data
        switch (page) {
            case 'dashboard': Dashboard.render(); break;
            case 'companies': Companies.render(); break;
            case 'calls': Calls.render(); break;
            case 'pipeline': Pipeline.render(); Pipeline.initDragAndDrop(); break;
            case 'reports': Reports.render(); break;
            case 'scraper': ScraperPage.render(); break;
            case 'team': if (typeof Team !== 'undefined') Team.render(); break;
        }

        // Close sidebar on mobile
        if (window.innerWidth <= 1024) {
            document.getElementById('sidebar')?.classList.remove('open');
        }
    },

    bindEvents() {
        // Navigation links click listener
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const page = link.dataset.page;
                if (page) {
                    this.navigateTo(page);
                }
            });
        });

        // Sidebar toggle
        document.getElementById('toggle-sidebar')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        // Team management button
        document.getElementById('btn-team-management')?.addEventListener('click', () => this.navigateTo('team'));

        // Quick add company button
        document.getElementById('btn-quick-add')?.addEventListener('click', () => Companies.openAddModal());
        document.getElementById('btn-add-company')?.addEventListener('click', () => Companies.openAddModal());

        // Quick call button
        document.getElementById('btn-quick-call')?.addEventListener('click', () => Calls.openAddModal());
        document.getElementById('btn-add-call')?.addEventListener('click', () => Calls.openAddModal());

        // Add deal button
        document.getElementById('btn-add-deal')?.addEventListener('click', () => Pipeline.openAddModal());

        // Save buttons
        document.getElementById('btn-save-company')?.addEventListener('click', () => Companies.save());
        document.getElementById('btn-save-call')?.addEventListener('click', () => Calls.save());
        document.getElementById('btn-save-deal')?.addEventListener('click', () => Pipeline.save());

        // Modal close buttons
        document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
            el.addEventListener('click', (e) => {
                const modalId = el.dataset?.modal || el.closest('.modal')?.id;
                if (modalId) this.closeModal(modalId);
            });
        });

        // Ghost buttons that close modals
        document.querySelectorAll('.btn-ghost[data-modal]').forEach(el => {
            el.addEventListener('click', () => this.closeModal(el.dataset.modal));
        });

        // Excel import/export
        document.getElementById('btn-import-excel')?.addEventListener('click', () => {
            document.getElementById('excel-file-input').click();
        });
        document.getElementById('excel-file-input')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                ExcelHandler.importCompanies(file, (count) => {
                    if (count > 0) {
                        Companies.render();
                        Dashboard.render();
                    }
                });
                e.target.value = ''; // Reset
            }
        });
        document.getElementById('btn-export-excel')?.addEventListener('click', () => {
            const companies = Companies.getFilteredCompanies();
            ExcelHandler.exportCompanies(companies);
        });

        // Global search
        const searchInput = document.getElementById('global-search');
        const searchResults = document.getElementById('search-results');

        searchInput?.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length < 2) {
                searchResults.classList.remove('show');
                return;
            }

            const companies = Storage.getCompanies().filter(c =>
                (c.nameAr && c.nameAr.includes(query)) ||
                (c.nameEn && c.nameEn.toLowerCase().includes(query)) ||
                (c.contactPerson && c.contactPerson.includes(query)) ||
                (c.phone1 && c.phone1.includes(query)) ||
                (c.mobile && c.mobile.includes(query))
            ).slice(0, 8);

            if (companies.length === 0) {
                searchResults.innerHTML = '<div class="search-dropdown-item"><span class="result-name">لا توجد نتائج</span></div>';
            } else {
                searchResults.innerHTML = companies.map(c => `
                    <div class="search-dropdown-item" onclick="App.searchSelect('${c.id}')">
                        <i class="fas fa-building" style="color:var(--primary-light);"></i>
                        <div>
                            <div class="result-name">${c.nameAr || c.nameEn}</div>
                            <div class="result-sector">${Storage.getSectorLabel(c.sector)} — ${Storage.getCityLabel(c.city)}</div>
                        </div>
                    </div>
                `).join('');
            }
            searchResults.classList.add('show');
        });

        searchInput?.addEventListener('blur', () => {
            setTimeout(() => searchResults.classList.remove('show'), 200);
        });

        // ESC to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) this.closeModal(openModal.id);
            }
        });
    },

    searchSelect(companyId) {
        document.getElementById('global-search').value = '';
        document.getElementById('search-results').classList.remove('show');
        window.location.hash = '#companies';
        setTimeout(() => Companies.showDetail(companyId), 100);
    },

    logCallForCompany(companyId) {
        Calls.openAddModal(companyId);
    },

    // ---- Modal Management ----
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    },

    // ---- Toast Notifications ----
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <i class="toast-icon ${icons[type] || icons.info}"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
        `;

        container.appendChild(toast);

        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    initUserSwitcher() {
        const select = document.getElementById('user-switcher-select');
        if (!select) return;

        const populateOptions = () => {
            const users = Storage.getUsers() || [];
            const currentUser = Storage.getCurrentUser();
            
            select.innerHTML = users.map(u => `
                <option value="${u.id}" ${currentUser && u.id === currentUser.id ? 'selected' : ''}>
                    ${u.role === 'admin' ? '👑' : '👨‍💼'} ${u.name} (${u.role === 'admin' ? 'المدير العام' : 'موظف مبيعات'})
                </option>
            `).join('') + `
                <option value="logout">🔴 تسجيل الخروج (Logout)</option>
            `;

            if (currentUser) select.value = currentUser.id;
            updateAvatar();
        };

        const updateAvatar = () => {
            const currentUser = Storage.getCurrentUser();
            const avatarEl = document.getElementById('current-user-avatar');
            if (avatarEl && currentUser) {
                avatarEl.textContent = currentUser.avatar || '👤';
                avatarEl.style.background = currentUser.color || '#7c3aed';
            }
        };

        select.onchange = (e) => {
            const userId = e.target.value;
            App.switchUser(userId);
        };

        populateOptions();
        this.refreshUserSwitcher = populateOptions;
    }
};

// ---- Initialize on DOM ready ----
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
