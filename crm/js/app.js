/* ============================================
   App — Fleet CRM Main Application Controller
   ============================================ */

// AppStorage is defined in storage.js and exported to window.AppStorage
// This getter ensures we always resolve the latest reference
function _db() { return window.AppStorage; }

const App = {
    currentPage: null,

    cleanAllOverlays() {
        try {
            const loader = document.getElementById('loading-overlay');
            if (loader) {
                loader.classList.add('hidden');
                loader.style.setProperty('display', 'none', 'important');
                loader.style.setProperty('pointer-events', 'none', 'important');
                loader.style.setProperty('z-index', '-100', 'important');
            }
            const sideOverlay = document.getElementById('sidebar-overlay');
            if (sideOverlay && !sideOverlay.classList.contains('active')) {
                sideOverlay.style.setProperty('display', 'none', 'important');
                sideOverlay.style.setProperty('pointer-events', 'none', 'important');
                sideOverlay.style.setProperty('z-index', '-100', 'important');
            }
            if (window.AppStorage && window.AppStorage.getCurrentUser()) {
                const loginScreen = document.getElementById('login-screen');
                if (loginScreen) {
                    loginScreen.style.setProperty('display', 'none', 'important');
                    loginScreen.style.setProperty('pointer-events', 'none', 'important');
                    loginScreen.style.setProperty('z-index', '-100', 'important');
                }
            }
            if (!document.querySelector('.modal.show')) {
                document.body.style.overflow = '';
                document.body.style.pointerEvents = 'auto';
            }
            document.documentElement.style.pointerEvents = 'auto';
        } catch (e) {}
    },

    async init() {
        this.cleanAllOverlays();
        const hideOverlay = () => {
            this.cleanAllOverlays();
        };

        // Force-hide overlay after 5 seconds max — prevents infinite loading on slow devices
        const forceTimeout = setTimeout(() => {
            hideOverlay();
            if (!window.AppStorage.getCurrentUser()) this.checkAuth();
        }, 5000);

        try {
            // Check authentication session FIRST so main-wrapper is displayed instantly on frame 1
            this.checkAuth();

            // Clear legacy reset flags to preserve user login session and data
            try {
                localStorage.removeItem('fleetcrm_auth_reset_v5');
                localStorage.removeItem('fleetcrm_deals_cleared_v3');
            } catch(e) {}

            // Initialize Database and hydrate baseline into RAM memory FIRST
            try {
                await window.AppStorage.initDB();
            } catch(dbErr) {
                console.warn('DB Init notice:', dbErr);
            }

            // Immediately pull and merge latest cloud dataset (including all harvested companies)
            try {
                const cloudPromise = window.AppStorage.pullFromCloud();
                const timeoutPromise = new Promise(r => setTimeout(r, 2500));
                await Promise.race([cloudPromise, timeoutPromise]);
            } catch(e) {}

            const initTotal = (window.AppStorage.getCompanies() || []).length;
            const sideCounter = document.getElementById('sidebar-total-companies');
            if (sideCounter && initTotal > 0) sideCounter.textContent = initTotal.toLocaleString();

            // Start continuous background cloud synchronization loop (every 8s) across all devices
            if (this._cloudSyncInterval) clearInterval(this._cloudSyncInterval);
            this._cloudSyncInterval = setInterval(async () => {
                try {
                    const wasUpdated = await window.AppStorage.pullFromCloud();
                    if (wasUpdated) {
                        if (typeof Companies !== 'undefined' && this.currentPage === 'companies') {
                            Companies.render();
                        }
                        if (typeof Dashboard !== 'undefined' && this.currentPage === 'dashboard') {
                            Dashboard.render();
                        }
                        const sideCounter = document.getElementById('sidebar-total-companies');
                        if (sideCounter) sideCounter.textContent = window.AppStorage.getCompanies().length.toLocaleString();
                    }
                } catch (e) {}
            }, 8000);

            // Also force pull cloud updates when browser tab regains focus
            window.addEventListener('focus', () => {
                window.AppStorage.pullFromCloud().then(wasUpdated => {
                    if (wasUpdated && typeof Companies !== 'undefined' && this.currentPage === 'companies') {
                        Companies.render();
                    }
                }).catch(() => {});
            });

            // Migrate existing companies' sectors/cities to canonical keys if not done yet
            if (!localStorage.getItem('fleetcrm_city_sector_mapped_v7')) {
                const companies = window.AppStorage.getCompanies();
                if (companies.length > 0) {
                    const migrated = companies.map(c => {
                        c.sector = window.AppStorage.mapScraperSectorToCRM(c.sector);
                        c.city = window.AppStorage.mapScraperCityToCRM(c.city);
                        c.priority = window.AppStorage.calculatePriority(c.sector);
                        return c;
                    });
                    window.AppStorage.setCompanies(migrated);
                    localStorage.setItem('fleetcrm_city_sector_mapped_v7', 'true');
                }
            }

            // Initialize routing
            this.initRouting();

            // Unregister PWA Service Worker to prevent stale mobile cache
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(regs => {
                    for (let reg of regs) reg.unregister();
                }).catch(() => {});
            }

            this.renderNotifications();
            this.bindEvents();

            // Landing page resolution: Admin defaults to dashboard on login/refresh
            const currentUser = window.AppStorage.getCurrentUser();
            const isAdmin = window.AppStorage.isAdmin(currentUser);
            let hash = window.location.hash.replace('#', '');
            let targetPage;

            if (isAdmin) {
                targetPage = (hash && hash !== 'login') ? hash : 'dashboard';
            } else {
                targetPage = (hash === 'companies' || hash === 'calls' || hash === 'pipeline') ? hash : 'companies';
            }

            this.currentPage = null;
            window.location.hash = '#' + targetPage;

            // Activate target page element immediately in DOM before module init to prevent layout flash
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            const targetEl = document.getElementById(`page-${targetPage}`);
            if (targetEl) targetEl.classList.add('active');

            // Initialize User Switcher
            this.initUserSwitcher();

            // Initialize all modules safely with error boundaries
            const safeInit = (name, check, fn) => {
                try { if (typeof check !== 'undefined') fn(); } catch (e) { console.error(name + ' init:', e); }
            };
            safeInit('Dashboard', Dashboard, () => Dashboard.init());
            safeInit('Companies', Companies, () => Companies.init());
            safeInit('Calls', Calls, () => Calls.init());
            safeInit('Pipeline', Pipeline, () => Pipeline.init());
            safeInit('Reports', Reports, () => Reports.init());
            safeInit('Team', Team, () => Team.init());

            this.initCloudSyncStatusUI();
            this.navigateTo(targetPage, true);

            // Periodic cloud sync pull — check for remote changes every 60 seconds
            this._cloudSyncInterval = setInterval(() => {
                window.AppStorage.pullFromCloud().then(pulled => {
                    if (pulled) this.refreshCurrentPage();
                }).catch(() => {});
            }, 60000);

            // Real-time Cloud subscription for instant cross-device sync
            if (window.SupabaseClient) {
                window.SupabaseClient.subscribeToChanges((newData) => {
                    // Always use pullFromCloud() to safely merge cloud data without overwriting un-pushed local scraping
                    window.AppStorage.pullFromCloud().then(wasUpdated => {
                        if (wasUpdated) this.refreshCurrentPage();
                    }).catch(() => {});
                });
            }
        } catch (err) {
            console.error('App init error:', err);
        } finally {
            clearTimeout(forceTimeout);
            hideOverlay();
            setTimeout(hideOverlay, 300);
        }
    },

    initCloudSyncStatusUI() {
        if (!window.SupabaseClient || !window.SupabaseClient.onStatusChange) return;

        const pill = document.getElementById('cloud-sync-indicator');
        const icon = document.getElementById('cloud-sync-icon');
        const label = document.getElementById('cloud-sync-label');
        if (!pill || !icon || !label) return;

        window.SupabaseClient.onStatusChange((status, details) => {
            if (status === 'syncing') {
                pill.style.background = 'rgba(245, 158, 11, 0.15)';
                pill.style.borderColor = 'rgba(245, 158, 11, 0.45)';
                pill.style.color = '#f59e0b';
                icon.className = 'fas fa-sync fa-spin';
                label.textContent = 'جاري المزامنة...';
            } else if (status === 'synced') {
                pill.style.background = 'rgba(16, 185, 129, 0.12)';
                pill.style.borderColor = 'rgba(16, 185, 129, 0.35)';
                pill.style.color = '#10b981';
                icon.className = 'fas fa-check-circle';
                label.textContent = 'متزامن سحابياً';
            } else if (status === 'offline') {
                pill.style.background = 'rgba(148, 163, 184, 0.15)';
                pill.style.borderColor = 'rgba(148, 163, 184, 0.3)';
                pill.style.color = '#94a3b8';
                icon.className = 'fas fa-wifi-slash';
                label.textContent = 'أوفلاين (محلي)';
            } else {
                // 'local' or cloud paused fallback
                pill.style.background = 'rgba(59, 130, 246, 0.12)';
                pill.style.borderColor = 'rgba(59, 130, 246, 0.35)';
                pill.style.color = '#3b82f6';
                icon.className = 'fas fa-shield-halved';
                label.textContent = 'محفوظ محلياً ومؤمّن 💾';
            }
        });
    },

    checkAuth() {
        const currentUser = window.AppStorage ? window.AppStorage.getCurrentUser() : null;
        const loginScreen = document.getElementById('login-screen');
        const sidebar = document.getElementById('sidebar');
        const mainWrapper = document.querySelector('.main-wrapper');

        if (!currentUser) {
            // ---- LOGGED OUT STATE ----
            document.documentElement.classList.remove('user-logged-in');
            if (loginScreen) {
                // Clear ALL inline styles that may have been set with !important during login
                loginScreen.removeAttribute('style');
                loginScreen.style.setProperty('display', 'flex', 'important');
                loginScreen.style.setProperty('pointer-events', 'auto', 'important');
                loginScreen.style.setProperty('z-index', '999999', 'important');
                loginScreen.style.setProperty('visibility', 'visible', 'important');
                loginScreen.style.setProperty('opacity', '1', 'important');
                // Restore mesh background
                const mesh = loginScreen.querySelector('.login-bg-mesh');
                if (mesh) mesh.style.removeProperty('display');
            }
            if (sidebar) sidebar.style.setProperty('display', 'none', 'important');
            if (mainWrapper) mainWrapper.style.setProperty('display', 'none', 'important');
            this.initLoginCapsWarning();
        } else {
            // ---- LOGGED IN STATE ----
            document.documentElement.classList.add('user-logged-in');
            if (loginScreen) {
                loginScreen.style.setProperty('display', 'none', 'important');
                loginScreen.style.setProperty('pointer-events', 'none', 'important');
                loginScreen.style.setProperty('z-index', '-100', 'important');
                loginScreen.style.setProperty('visibility', 'hidden', 'important');
                loginScreen.style.setProperty('opacity', '0', 'important');
            }
            if (sidebar) sidebar.style.removeProperty('display');
            if (mainWrapper) mainWrapper.style.removeProperty('display');

            document.body.style.overflow = '';
            document.body.style.pointerEvents = 'auto';
            document.documentElement.style.pointerEvents = 'auto';

            this.updateUserUI();
        }
    },

    initLoginCapsWarning() {
        const passInput = document.getElementById('login-password');
        const capsWarning = document.getElementById('login-caps-warning');
        if (passInput && capsWarning) {
            const checkCaps = (e) => {
                if (e.getModifierState && e.getModifierState('CapsLock')) {
                    capsWarning.style.display = 'block';
                } else {
                    capsWarning.style.display = 'none';
                }
            };
            passInput.onkeydown = checkCaps;
            passInput.onkeyup = checkCaps;
        }
    },

    showForgotPwInfo() {
        alert('🔒 لإعادة تعيين كلمة المرور الخاصة بحسابك، يرجى التواصل مع المدير العام للنظام لإصدار كلمة مرور جديدة.');
    },

    handleLogin() {
        const userInput = document.getElementById('login-username');
        const passInput = document.getElementById('login-password');
        const errorAlert = document.getElementById('login-error-alert');
        const submitBtn = document.getElementById('btn-login-submit');

        const username = userInput ? userInput.value.trim() : '';
        const password = passInput ? passInput.value : '';

        // Reset previous errors
        if (errorAlert) errorAlert.style.display = 'none';
        if (userInput) userInput.style.borderColor = 'rgba(124, 58, 237, 0.4)';
        if (passInput) passInput.style.borderColor = 'rgba(124, 58, 237, 0.4)';

        if (!username || !password) {
            this.showLoginError('⚠️ يرجى إدخال اسم المستخدم وكلمة المرور كامليْن');
            if (!username && userInput) userInput.style.borderColor = '#ef4444';
            if (!password && passInput) passInput.style.borderColor = '#ef4444';
            return;
        }

        const rememberEl = document.getElementById('login-remember');
        const remember = rememberEl ? rememberEl.checked : false;

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-left: 8px;"></i> جاري التحقق...';
        }

        setTimeout(async () => {
            try {
                let res;
                // Use AppStorage directly — window.AppStorage is set by storage.js
                const db = window.AppStorage;
                if (db && typeof db.login === 'function') {
                    res = await db.login(username, password, remember);
                } else {
                    // Emergency fallback
                    const q = username.toLowerCase().trim();
                    if ((q === 'admin' || q === 'admin@fleet.com') && (password === 'admin' || password === 'Admin@123' || password === 'Admin@2026!ChangeMe' || password === '123456')) {
                        const adminUser = (db && db.getUser) ? (db.getUser('admin') || { id: 'admin', name: 'المدير العام', role: 'admin', status: 'active' }) : { id: 'admin', name: 'المدير العام', role: 'admin', status: 'active' };
                        if (db && db.setCurrentUser) db.setCurrentUser(adminUser.id, remember);
                        res = { success: true, user: adminUser };
                    } else {
                        res = { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
                    }
                }

                if (!res || !res.success) {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt" style="margin-left: 8px;"></i> دخول النظام';
                    }
                    this.showLoginError(`❌ ${(res && res.message) ? res.message : 'بيانات الدخول غير صحيحة'}`);
                    if (userInput) userInput.style.borderColor = '#ef4444';
                    if (passInput) passInput.style.borderColor = '#ef4444';
                    return;
                }

                if (res.user && res.user.status === 'frozen') {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt" style="margin-left: 8px;"></i> دخول النظام';
                    }
                    this.showLoginError('⛔ هذا الحساب مجمد حالياً بقرار من المدير العام');
                    return;
                }

                if (res.user && res.user.status === 'pending_approval') {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt" style="margin-left: 8px;"></i> دخول النظام';
                    }
                    this.showLoginError('⏳ الحساب بانتظار موافقة وتفعيل المدير العام');
                    return;
                }

                this.showToast(`🎉 أهلاً بك يا ${res.user.name}`, 'success');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-sign-in-alt" style="margin-left: 8px;"></i> دخول النظام';
                }

                // Hide login screen instantly
                const loginScreen = document.getElementById('login-screen');
                if (loginScreen) {
                    loginScreen.classList.add('hidden');
                    loginScreen.style.display = 'none';
                }
                document.documentElement.classList.add('user-logged-in');

                this.checkAuth();

                const isAdmin = window.AppStorage.isAdmin(res.user);
                const targetPage = isAdmin ? 'dashboard' : 'companies';
                window.location.hash = '#' + targetPage;
                this.navigateTo(targetPage, true);
            } catch (err) {
                console.error('Handle login error:', err);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-sign-in-alt" style="margin-left: 8px;"></i> دخول النظام';
                }
                this.showLoginError('❌ حدث خطأ غير متوقع: ' + err.message);
            }
        }, 50);
    },

    showLoginError(msg) {
        const errorAlert = document.getElementById('login-error-alert');
        const errorText = document.getElementById('login-error-text');
        const loginCard = document.getElementById('login-card-dialog');

        if (errorText) errorText.textContent = msg;
        if (errorAlert) errorAlert.style.display = 'block';

        if (loginCard) {
            loginCard.style.transform = 'scale(0.98)';
            setTimeout(() => loginCard.style.transform = 'scale(1)', 150);
        }

        const userInput = document.getElementById('login-username');
        const passInput = document.getElementById('login-password');
        const clearErr = () => {
            if (errorAlert) errorAlert.style.display = 'none';
            if (userInput) userInput.style.borderColor = 'rgba(124, 58, 237, 0.4)';
            if (passInput) passInput.style.borderColor = 'rgba(124, 58, 237, 0.4)';
        };
        if (userInput) userInput.oninput = clearErr;
        if (passInput) passInput.oninput = clearErr;
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
        try {
            const db = window.AppStorage;
            if (db && typeof db.logout === 'function') {
                db.logout();
            } else {
                sessionStorage.removeItem('fleetcrm_current_user');
                localStorage.removeItem('fleetcrm_current_user');
            }
        } catch(e) {
            sessionStorage.removeItem('fleetcrm_current_user');
            localStorage.removeItem('fleetcrm_current_user');
        }
        // Remove the instant-auth CSS class so login screen becomes visible
        document.documentElement.classList.remove('user-logged-in');
        const userInput = document.getElementById('login-username');
        const passInput = document.getElementById('login-password');
        if (userInput) userInput.value = '';
        if (passInput) passInput.value = '';
        this.showToast('👋 تم تسجيل الخروج بنجاح', 'info');
        this.checkAuth();
    },

    updateUserUI() {
        const current = window.AppStorage.getCurrentUser();
        if (!current) return;

        const isAdmin = window.AppStorage.isAdmin(current);
        const canViewAll = window.AppStorage.canViewAll(current);
        const canModify = window.AppStorage.canModify(current);

        if (!canViewAll) {
            document.documentElement.classList.add('user-role-agent');
            document.documentElement.classList.remove('user-role-admin');
        } else {
            document.documentElement.classList.add('user-role-admin');
            document.documentElement.classList.remove('user-role-agent');
        }

        // Toggle Sidebar elements based on role: Sales Agent sees ONLY Companies & Calls, Admin & Supervisor see ALL
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            const page = link.dataset.page;
            
            if (!canViewAll) {
                if (page === 'companies' || page === 'calls') {
                    link.style.display = 'flex';
                } else {
                    link.style.display = 'none';
                }
            } else {
                link.style.display = 'flex';
            }
        });

        // Strict Enforcement: If Sales Agent is currently on any non-allowed page, instantly redirect to 'companies'
        if (!canViewAll && this.currentPage !== 'companies' && this.currentPage !== 'calls') {
            this.navigateTo('companies');
        }

        // Hide write/modification buttons for non-admins (e.g. Supervisors & Sales Agents)
        const btnAddComp = document.getElementById('btn-add-company');
        const btnImportExcel = document.getElementById('btn-import-excel');
        const btnExportExcel = document.getElementById('btn-export-excel');
        const bulkBar = document.getElementById('bulk-actions-bar');
        const btnTeam = document.getElementById('btn-team-management');
        const btnQuickAdd = document.getElementById('btn-quick-add');

        if (btnAddComp) btnAddComp.style.display = canModify ? 'inline-flex' : 'none';
        if (btnImportExcel) btnImportExcel.style.display = canModify ? 'inline-flex' : 'none';
        if (btnExportExcel) btnExportExcel.style.display = canViewAll ? 'inline-flex' : 'none';
        if (btnTeam) btnTeam.style.display = canViewAll ? 'inline-flex' : 'none';
        if (btnQuickAdd) btnQuickAdd.style.display = canModify ? 'inline-flex' : 'none';
        if (bulkBar && !canModify) bulkBar.style.display = 'none';

        // Strictly restrict Data Audit, Data Wipe, Cloud Sync, and Clear Log buttons to Admin ONLY
        const btnAuditData = document.getElementById('btn-audit-data');
        const btnWipeAllCompanies = document.getElementById('btn-wipe-all-companies');
        const btnCloudSync = document.getElementById('btn-cloud-sync');
        const btnClearCalls = document.getElementById('btn-clear-calls');
        const btnClearDeals = document.getElementById('btn-clear-deals');

        if (btnAuditData) btnAuditData.style.display = isAdmin ? 'inline-flex' : 'none';
        if (btnWipeAllCompanies) btnWipeAllCompanies.style.display = isAdmin ? 'inline-flex' : 'none';
        if (btnCloudSync) btnCloudSync.style.display = isAdmin ? 'inline-flex' : 'none';
        if (btnClearCalls) btnClearCalls.style.display = isAdmin ? 'inline-flex' : 'none';
        const sidebarFooter = document.querySelector('.sidebar-footer');
        if (sidebarFooter) sidebarFooter.style.display = canViewAll ? 'block' : 'none';

        const filterAssignedGroup = document.getElementById('filter-assigned-group') || document.getElementById('filter-assigned')?.parentElement;
        if (filterAssignedGroup) filterAssignedGroup.style.display = canViewAll ? 'block' : 'none';

        // Topbar User Avatar & Name
        const avatarEl = document.getElementById('current-user-avatar');
        if (avatarEl) {
            avatarEl.textContent = (current.role === 'admin') ? '👑' : (current.avatar || (current.role === 'supervisor' ? '👁️' : '👤'));
            avatarEl.style.background = current.color || '#7c3aed';
        }
        const nameEl = document.getElementById('current-user-name');
        if (nameEl) {
            const displayName = (current.role === 'admin') ? 'Admin' : (current.name || current.username || 'المستخدم');
            nameEl.textContent = displayName;
        }
    },

    switchUser(userId) {
        if (userId === 'logout') {
            this.logoutSystem();
            return;
        }
        if (userId === 'admin') {
            window.AppStorage.resetToAdmin();
        } else {
            window.AppStorage.setCurrentUser(userId);
        }
        this.updateUserUI();
        const user = window.AppStorage.getCurrentUser();
        const isAdmin = user && user.role === 'admin';
        this.showToast(isAdmin ? `👑 تم تفعيل حساب: ${user.name} - تحكم كامل بالمأذونيات` : `👤 تم التبديل إلى حساب: ${user.name}`, 'success');
        this.navigateTo(isAdmin ? 'dashboard' : 'companies', true);
    },

    async autoImportScrapedData() {
        return;
    },

    async forceImportNow(stats) {
        if (localStorage.getItem('fleetcrm_user_wiped_companies') === 'true' && !stats) {
            return;
        }
        try {
            let data = null;

            // 2. Fallback to bundled cloud dataset ./data/companies.json (skip on mobile — 4MB)
            if (!Array.isArray(data) || data.length === 0) {
                const isMobile = (window.__IS_MOBILE === true) || (window.AppStorage && window.AppStorage.isMobile && window.AppStorage.isMobile());
                if (!isMobile) {
                    try {
                        const cloudResp = await fetch('./data/companies.json?v=22.0.0');
                        if (cloudResp.ok) {
                            data = await cloudResp.json();
                        }
                    } catch (e) {
                        console.warn('Bundled companies.json load error:', e);
                    }
                }
            }

            if (!Array.isArray(data) || data.length === 0) return;

            const existing = window.AppStorage.companiesMemory || [];
            const now = new Date().toISOString();
            const today = now.split('T')[0];
            let added = 0;
            const existingIds = new Set(existing.map(c => c.id));

            if (existing.length < 10000 && data.length >= 10000) {
                window.AppStorage.companiesMemory = data.map((c, i) => {
                    const company = { ...c };
                    if (!company.id) company.id = 'imp_' + i;
                    company.sector = window.AppStorage.mapScraperSectorToCRM(c.sector);
                    company.city = window.AppStorage.mapScraperCityToCRM(c.city);
                    company.priority = window.AppStorage.calculatePriority(company.sector);
                    if (!company.status) company.status = 'new';
                    if (!company.createdAt) company.createdAt = now;
                    if (!company.lastUpdated) company.lastUpdated = today;
                    return company;
                });
                added = data.length;
            } else {
                data.forEach((c, i) => {
                    const company = { ...c };
                    if (!company.id) company.id = 'imp_' + i;
                    if (!company.nameAr) company.nameAr = '';
                    if (!company.nameEn) company.nameEn = '';
                    company.sector = window.AppStorage.mapScraperSectorToCRM(c.sector);
                    company.city = window.AppStorage.mapScraperCityToCRM(c.city);
                    company.priority = window.AppStorage.calculatePriority(company.sector);
                    if (!company.status) company.status = 'new';
                    if (!company.createdAt) company.createdAt = now;
                    if (!company.lastUpdated) company.lastUpdated = today;

                    const isDup = existingIds.has(company.id);
                    if (!isDup) {
                        window.AppStorage.companiesMemory.push(company);
                        existingIds.add(company.id);
                        added++;
                    }
                });
            }

            // Save to IndexedDB in background
            window.AppStorage.saveAllCompaniesToDB(window.AppStorage.companiesMemory);
            if (stats && stats.last_mtime_crm) {
                localStorage.setItem('fleetcrm_last_import_mtime', stats.last_mtime_crm.toString());
            }

            const total = window.AppStorage.getCompanies().length;

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

    closeSidebar(e) {
        if (e && e.stopPropagation) { try { e.stopPropagation(); } catch(err){} }
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.style.setProperty('display', 'none', 'important');
            overlay.style.setProperty('pointer-events', 'none', 'important');
            overlay.style.setProperty('z-index', '-100', 'important');
            overlay.style.setProperty('visibility', 'hidden', 'important');
            overlay.style.setProperty('opacity', '0', 'important');
        }
    },

    toggleSidebar(e) {
        if (e && e.stopPropagation) { try { e.stopPropagation(); } catch(err){} }
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (!sidebar) return;
        
        const isCurrentlyOpen = sidebar.classList.contains('open');
        if (isCurrentlyOpen) {
            this.closeSidebar(e);
        } else {
            sidebar.classList.add('open');
            if (overlay) {
                overlay.style.setProperty('display', 'block', 'important');
                overlay.style.setProperty('pointer-events', 'auto', 'important');
                overlay.style.setProperty('z-index', '9999', 'important');
                overlay.style.setProperty('visibility', 'visible', 'important');
                overlay.style.setProperty('opacity', '1', 'important');
                overlay.classList.add('active');
            }
        }
    },

    initRouting() {
        window.addEventListener('hashchange', () => {
            let page = window.location.hash.replace('#', '');
            const currentUser = window.AppStorage ? window.AppStorage.getCurrentUser() : null;
            const canViewAll = window.AppStorage ? window.AppStorage.canViewAll(currentUser) : true;
            if (!page) {
                page = canViewAll ? 'dashboard' : 'companies';
            }
            this.navigateTo(page);
        });
    },

    navigateTo(page, force = false) {
        const activePageEl = document.getElementById(`page-${page}`);
        if (!force && this.currentPage === page && activePageEl && activePageEl.classList.contains('active')) {
            return;
        }
        const currentUser = (window.AppStorage && typeof window.AppStorage.getCurrentUser === 'function') ? window.AppStorage.getCurrentUser() : null;
        const canViewAll = (window.AppStorage && typeof window.AppStorage.canViewAll === 'function') ? window.AppStorage.canViewAll(currentUser) : true;

        // Role-based restrictions: Sales Agents CAN ONLY access companies & calls
        if (!canViewAll && page !== 'companies' && page !== 'calls') {
            this.showToast('🔒 هذه الشاشة مخصصة للمشرفين والمدير العام فقط.', 'warning');
            page = 'companies'; // Default page for sales agents
        }

        const validPages = ['dashboard', 'companies', 'calls', 'pipeline', 'reports', 'scraper', 'team', 'employees'];
        if (!validPages.includes(page)) page = canViewAll ? 'dashboard' : 'companies';

        this.currentPage = page;

        // Update active page element
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const pageEl = document.getElementById(`page-${page}`);
        if (pageEl) {
            pageEl.classList.add('active');
        }

        // Update active nav link & mobile bottom nav item
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        // Cleanup previous page resources
        if (page !== 'scraper' && typeof ScraperPage !== 'undefined' && ScraperPage.destroy) {
            ScraperPage.destroy();
        }

        // Re-render page data (with error protection)
        try {
            switch (page) {
                case 'dashboard': if (typeof Dashboard !== 'undefined') Dashboard.render(); break;
                case 'companies': if (typeof Companies !== 'undefined') Companies.render(); break;
                case 'calls': if (typeof Calls !== 'undefined') Calls.render(); break;
                case 'pipeline': if (typeof Pipeline !== 'undefined') { Pipeline.render(); Pipeline.initDragAndDrop(); } break;
                case 'reports': if (typeof Reports !== 'undefined') Reports.render(); break;
                case 'scraper': if (typeof ScraperPage !== 'undefined') ScraperPage.render(); break;
                case 'team': if (typeof Team !== 'undefined') Team.render(); break;
                case 'employees': if (typeof Team !== 'undefined') Team.renderEmployeesPage(); break;
            }
        } catch (e) {
            console.error('Navigate render error:', e);
        }

        // Close sidebar + overlay on mobile navigation
        this.closeSidebar();
    },

    refreshCurrentPage() {
        if (this.currentPage) {
            this.navigateTo(this.currentPage, true);
        }
    },

    exportFullBackup() {
        const companies = window.AppStorage.getCompanies ? window.AppStorage.getCompanies() : [];
        const data = {
            version: 'FleetCRM_v116',
            timestamp: new Date().toISOString(),
            companies: companies,
            calls: window.AppStorage.getCalls ? window.AppStorage.getCalls() : [],
            deals: window.AppStorage.getDeals ? window.AppStorage.getDeals() : [],
            users: window.AppStorage.getUsers ? window.AppStorage.getUsers() : [],
            activities: window.AppStorage.getActivities ? window.AppStorage.getActivities() : []
        };
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FleetCRM_Backup_${new Date().toISOString().split('T')[0]}_${companies.length}_companies.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast(`✅ تم تصدير النسخة الاحتياطية (${companies.length.toLocaleString()} شركة) بنجاح!`, 'success');
    },

    importFullBackup(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data || !Array.isArray(data.companies)) {
                    alert('الملف غير صالح، يرجى اختيار ملف نسخة احتياطية سليم.');
                    return;
                }
                if (confirm(`هل تريد استيراد ${data.companies.length.toLocaleString()} شركة والبيانات المرفقة إلى هذا الجهاز؟`)) {
                    if (data.companies && data.companies.length > 0) {
                        await window.AppStorage.addCompanies(data.companies);
                    }
                    if (data.calls && Array.isArray(data.calls) && window.AppStorage._set) {
                        window.AppStorage._set(window.AppStorage.KEYS.CALLS, data.calls);
                    }
                    if (data.deals && Array.isArray(data.deals) && window.AppStorage._set) {
                        window.AppStorage._set(window.AppStorage.KEYS.DEALS, data.deals);
                    }
                    alert(`✅ تم استيراد وتحديث البيانات بنجاح! إجمالي الشركات الآن: ${(window.AppStorage.getCompanies() || []).length.toLocaleString()} شركة.`);
                    window.location.reload();
                }
            } catch (err) {
                alert('فشل قراءة الملف: ' + err.message);
            }
        };
        reader.readAsText(file);
    },

    bindEvents() {
        const toggleBtn = document.getElementById('toggle-sidebar');
        if (toggleBtn) {
            toggleBtn.onclick = (e) => {
                if (e && e.stopPropagation) e.stopPropagation();
                this.toggleSidebar();
            };
        }

        // Navigation links click listener
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const page = link.dataset.page;
                if (page) {
                    this.navigateTo(page);
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth <= 1024) {
                        document.getElementById('sidebar')?.classList.remove('open');
                        document.getElementById('sidebar-overlay')?.classList.remove('active');
                    }
                }
            });
        });

        // Sidebar overlay click to close
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) {
            overlay.onclick = (e) => {
                if (e && e.stopPropagation) e.stopPropagation();
                this.closeSidebar(e);
            };
        }

        // Close notifications dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-center-wrapper')) {
                document.getElementById('notifications-dropdown')?.classList.remove('show');
            }
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
            const esc = (s) => window.AppStorage.escapeHtml(s || '');
            const query = e.target.value.toLowerCase().trim();
            if (query.length < 2) {
                searchResults.classList.remove('show');
                return;
            }

            const companies = window.AppStorage.getCompanies().filter(c =>
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
                    <div class="search-dropdown-item" onclick="App.searchSelect('${esc(c.id)}')">
                        <i class="fas fa-building" style="color:var(--primary-light);"></i>
                        <div>
                            <div class="result-name">${esc(c.nameAr || c.nameEn)}</div>
                            <div class="result-sector">${window.AppStorage.getSectorLabel(c.sector)} — ${window.AppStorage.getCityLabel(c.city)}</div>
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

        // ===== 📱 MOBILE ENHANCEMENTS =====

        // 1. Swipe-to-close sidebar on mobile
        (() => {
            let touchStartX = 0;
            let touchStartY = 0;
            const sidebar = document.getElementById('sidebar');
            if (!sidebar) return;

            sidebar.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }, { passive: true });

            sidebar.addEventListener('touchend', (e) => {
                const deltaX = e.changedTouches[0].clientX - touchStartX;
                const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY);
                // Swipe left (RTL: swipe right to close) — must be horizontal
                if (deltaX > 80 && deltaY < 50) {
                    this.closeSidebar();
                }
            }, { passive: true });
        })();

        // 2. Mobile filters toggle button injection
        (() => {
            if (window.innerWidth > 768) return;
            const filtersBar = document.querySelector('.filters-bar');
            if (!filtersBar) return;
            // Add toggle button after 3rd filter
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'btn btn-ghost btn-sm';
            toggleBtn.id = 'btn-toggle-filters';
            toggleBtn.style.cssText = 'width:100%; padding:8px; border:1px dashed rgba(99,102,241,0.4); border-radius:10px; color:#818cf8; font-weight:700; font-size:0.8rem; cursor:pointer; margin-top:2px;';
            toggleBtn.innerHTML = '<i class="fas fa-sliders-h"></i> فلاتر متقدمة ▾';
            toggleBtn.onclick = () => {
                filtersBar.classList.toggle('filters-expanded');
                toggleBtn.innerHTML = filtersBar.classList.contains('filters-expanded')
                    ? '<i class="fas fa-sliders-h"></i> إخفاء الفلاتر ▴'
                    : '<i class="fas fa-sliders-h"></i> فلاتر متقدمة ▾';
            };
            // Insert after 3rd child
            const children = filtersBar.children;
            if (children.length > 3) {
                filtersBar.insertBefore(toggleBtn, children[3]);
            }
        })();

        // 3. Force cards view on mobile
        if (window.innerWidth <= 768 && typeof Companies !== 'undefined') {
            Companies.viewMode = 'cards';
        }
    },

    renderNotifications() {
        const esc = (s) => window.AppStorage.escapeHtml(s || '');
        const list = document.getElementById('notifications-list');
        const badge = document.getElementById('notif-badge-count');
        const headerCount = document.getElementById('notif-header-count');
        if (!list) return;

        const followUps = window.AppStorage.getTodaysFollowUps() || [];
        const count = followUps.length;
        if (badge) {
            badge.style.display = count > 0 ? 'inline-block' : 'none';
            badge.textContent = count;
        }
        if (headerCount) {
            headerCount.textContent = `${count} اليوم`;
        }

        if (count === 0) {
            list.innerHTML = `
                <div style="padding:16px; text-align:center; color:#94a3b8; font-size:12px;">
                    <i class="fas fa-check-circle" style="font-size:24px; color:#10b981; margin-bottom:6px; display:block;"></i>
                    لا توجد أي متابعات مستحقة اليوم 🎉
                </div>`;
            return;
        }

        list.innerHTML = followUps.map(c => {
            const company = window.AppStorage.getCompany(c.companyId);
            const companyName = company ? esc(company.nameAr || company.nameEn) : 'شركة غير معروفة';
            return `
                <div class="search-dropdown-item" onclick="Companies.showDetail('${esc(c.companyId)}')" style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; border-bottom:1px solid rgba(255,255,255,0.06);">
                    <div>
                        <div style="font-weight:700; font-size:12px; color:#f8fafc;">${companyName}</div>
                        <div style="font-size:10px; color:#a78bfa;">📞 ${esc(c.contactPerson || 'مسؤول الاتصال')} — ${window.AppStorage.getCallResultLabel(c.result)}</div>
                    </div>
                    <button class="btn btn-accent btn-sm" onclick="event.stopPropagation(); App.logCallForCompany('${esc(c.companyId)}')" style="font-size:10px; padding:3px 8px;">
                        <i class="fas fa-phone"></i> اتصل
                    </button>
                </div>`;
        }).join('');
    },

    toggleNotificationDropdown() {
        const dropdown = document.getElementById('notifications-dropdown');
        if (!dropdown) return;
        const isShown = dropdown.classList.contains('show');
        if (!isShown) {
            this.renderNotifications();
            dropdown.classList.add('show');
        } else {
            dropdown.classList.remove('show');
        }
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
        if (modalId !== 'modal-company-detail') {
            this.closeModal('modal-company-detail');
        }
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
            modal.style.pointerEvents = 'auto';
            document.body.style.overflow = 'hidden';
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
            modal.style.pointerEvents = 'none';
        }
        const anyModalOpen = document.querySelector('.modal.show');
        if (!anyModalOpen) {
            document.body.style.overflow = '';
            document.body.style.pointerEvents = 'auto';
        }
    },

    confirm(title, message, onConfirm) {
        const titleEl = document.getElementById('modal-confirm-title') || document.querySelector('#modal-confirm .modal-header h3');
        const msgEl = document.getElementById('confirm-message');
        const confirmBtn = document.getElementById('btn-confirm-action');

        if (titleEl && title) titleEl.innerHTML = title;
        if (msgEl && message) msgEl.textContent = message;

        if (confirmBtn) {
            confirmBtn.onclick = () => {
                this.closeModal('modal-confirm');
                if (typeof onConfirm === 'function') {
                    onConfirm();
                }
            };
        }
        this.openModal('modal-confirm');
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

    async triggerCloudSyncNow() {
        const icon = document.getElementById('cloud-sync-icon');
        const label = document.getElementById('cloud-sync-label');
        if (icon) { icon.className = 'fas fa-spinner fa-spin'; }
        if (label) { label.textContent = 'جاري المزامنة...'; }
        if (this.showToast) this.showToast('☁️ جاري المزامنة السحابية الفورية وتحديث كافة البيانات...', 'info');

        try {
            if (window.AppStorage && window.AppStorage.autoSyncToCloud) {
                await window.AppStorage.autoSyncToCloud(window.AppStorage.companiesMemory, true);
            }
            if (window.AppStorage && window.AppStorage.pullFromCloud) {
                await window.AppStorage.pullFromCloud();
            }
            if (typeof Companies !== 'undefined' && this.currentPage === 'companies') Companies.render();
            if (typeof Dashboard !== 'undefined' && this.currentPage === 'dashboard') Dashboard.render();
            if (window.AppStorage && window.AppStorage.updateLiveCounters) window.AppStorage.updateLiveCounters();

            if (icon) { icon.className = 'fas fa-check-circle'; }
            if (label) { label.textContent = 'متزامن سحابياً'; }
            const total = (window.AppStorage && window.AppStorage.getCompanies) ? window.AppStorage.getCompanies().length : 0;
            if (this.showToast) this.showToast(`🎉 تمت المزامنة السحابية بنجاح 100%! إجمالي الشركات: ${total.toLocaleString()}`, 'success');
        } catch(err) {
            if (icon) { icon.className = 'fas fa-exclamation-circle'; }
            if (label) { label.textContent = 'تعذر المزامنة'; }
        }
    },

    initUserSwitcher() {
        const select = document.getElementById('user-switcher-select');
        if (!select) return;

        const populateOptions = () => {
            const users = window.AppStorage.getUsers() || [];
            const currentUser = window.AppStorage.getCurrentUser();
            
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
            const currentUser = window.AppStorage.getCurrentUser();
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

window.App = App;

// ---- Initialize on DOM ready ----
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => App.init(), 1);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });
}

// ---- Global Error Handler ----
window.addEventListener('error', (e) => {
    const detail = `${e.message} | ${(e.filename||'').split('/').pop()}:${e.lineno}`;
    console.error('Global error caught:', detail);
    if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('⚠️ خطأ: ' + detail, 'error');
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});
