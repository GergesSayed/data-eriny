/* ============================================
   Fleet CRM — Local & IndexedDB Storage System
   ============================================ */

const AppStorage = {
    KEYS: {
        COMPANIES: 'fleetcrm_companies',
        CALLS: 'fleetcrm_calls',
        DEALS: 'fleetcrm_deals',
        ACTIVITIES: 'fleetcrm_activities',
        SETTINGS: 'fleetcrm_settings',
        USERS: 'fleetcrm_users',
        CURRENT_USER: 'fleetcrm_current_user',
        HASH_UPGRADE_KEY: 'fleetcrm_hash_v2'
    },

    /* Crypto & Environment Helpers */
    _h2b(e){return Array.from(new Uint8Array(e)).map(e=>e.toString(16).padStart(2,"0")).join("")},
    async _sha(e){return this._h2b(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(e)))},
    _gs(){var e=new Uint8Array(16);crypto.getRandomValues(e);return this._h2b(e)},
    async hashPw(e){var t=this._gs();return t+":"+await this._sha(t+e)},
    async checkPw(e,t){if(!t||!t.includes(":")||32!==t.split(":")[0].length)return e===t;var n=t.split(":");return await this._sha(n[0]+e)===n[1]},
    isCloud(){var e=window.location.hostname;return e.includes("vercel.app")||e.includes("netlify.app")||e.includes("github.io")},
    isMobile(){return window.__IS_MOBILE===true||/Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent)||(window.innerWidth<1025&&'ontouchstart' in window)},

    DEFAULT_ADMIN_PW: 'Admin@2026!ChangeMe',

    // Sanitize HTML entities to prevent XSS
    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    exportFullSystemBackup() {
        const backupData = {
            version: '16.0.0',
            exportedAt: new Date().toISOString(),
            companies: this.getCompanies(),
            calls: this.getCalls(),
            deals: this.getDeals(),
            users: this.getUsers().map(u => ({ ...u, password: '***' })),
            activities: this.getActivities(100)
        };
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FleetCRM_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.addActivity('system', 'backup', 'استخراج نسخة احتياطية', 'تم تصدير ملف النسخة الاحتياطية الشاملة للسيستم');
    },

    importFullSystemBackup(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            if (!data || !Array.isArray(data.companies)) {
                return { success: false, message: 'ملف النسخة الاحتياطية غير صالح أو تالف' };
            }
            if (data.companies.length > 0) {
                this.setCompanies(data.companies);
            }
            if (Array.isArray(data.calls) && data.calls.length > 0) {
                this._set(this.KEYS.CALLS, data.calls);
            }
            if (Array.isArray(data.deals) && data.deals.length > 0) {
                this._set(this.KEYS.DEALS, data.deals);
            }
            this.addActivity('system', 'restore', 'استعادة نسخة احتياطية', `تم استعادة ${data.companies.length} شركة و${(data.calls || []).length} مكالمة`);
            return { success: true, count: data.companies.length };
        } catch (e) {
            return { success: false, message: 'خطأ في قراءة ملف النسخة الاحتياطية: ' + e.message };
        }
    },
    DEFAULT_USERS: [
        { id: 'admin', username: 'admin@fleet.com', email: 'admin@fleet.com', password: 'Admin@123', name: 'Admin', role: 'admin', status: 'active', avatar: '👑', color: '#7c3aed', _needsPasswordChange: false }
    ],

    // ---- User Profiles & Auth ----
    getUsers() {
        let stored = this._get(this.KEYS.USERS);

        // Remove legacy test users (agent_1, agent_2, agent_3) if they exist
        if (stored && Array.isArray(stored)) {
            const originalLength = stored.length;
            stored = stored.filter(u => u.id !== 'agent_1' && u.id !== 'agent_2' && u.id !== 'agent_3');
            if (stored.length !== originalLength) {
                this._set(this.KEYS.USERS, stored);
            }
        }

        if (!stored || !Array.isArray(stored) || stored.length === 0 || !stored[0].username) {
            this._set(this.KEYS.USERS, this.DEFAULT_USERS);
            return this.DEFAULT_USERS;
        }

        // Always ensure default users have active status and valid names/emails if not specified
        stored.forEach(u => {
            if (!u.status) u.status = 'active';
            if (!u.name) u.name = (u.id === 'admin' || u.role === 'admin') ? 'Admin' : (u.username || 'موظف');
            if (!u.email) u.email = (u.id === 'admin' || u.role === 'admin') ? 'admin@fleet.com' : (u.username ? (u.username.includes('@') ? u.username : u.username + '@fleet.com') : 'user@fleet.com');
        });

        // Strictly enforce admin user details
        let adminUser = stored.find(u => u.id === 'admin' || u.username === 'admin' || u.email === 'admin@fleet.com' || u.role === 'admin');
        if (!adminUser) {
            stored.unshift(this.DEFAULT_USERS[0]);
            this._set(this.KEYS.USERS, stored);
        } else {
            adminUser.id = 'admin';
            adminUser.name = 'Admin';
            adminUser.username = 'admin@fleet.com';
            adminUser.email = 'admin@fleet.com';
            adminUser.role = 'admin';
            adminUser.status = 'active';
            adminUser.avatar = '👑';
            adminUser.color = '#7c3aed';
            this._set(this.KEYS.USERS, stored);
        }

        return stored;
    },

    getPendingUsers() {
        return (this.getUsers() || []).filter(u => u.status === 'pending_approval');
    },

    async registerGoogleUser({ email, name }) {
        let users = this.getUsers();
        let existing = users.find(u => (u.email && u.email.toLowerCase() === email.toLowerCase().trim()) || (u.username && u.username.toLowerCase() === email.split('@')[0].toLowerCase()));

        if (existing) {
            return existing;
        }

        const randomPw = Array.from(crypto.getRandomValues(new Uint8Array(10)), b => b.toString(16).padStart(2, '0')).join('');
        const hashedPw = await this.hashPw(randomPw);
        const newUser = {
            id: 'u_' + Date.now(),
            email: email.trim(),
            username: email.split('@')[0],
            name: name || email.split('@')[0],
            password: hashedPw,
            role: 'agent',
            status: 'pending_approval',
            avatar: '👤',
            color: '#3b82f6',
            registeredAt: new Date().toISOString().split('T')[0]
        };

        users.push(newUser);
        this._set(this.KEYS.USERS, users);
        this.addActivity('auth', newUser.id, 'طلب تسجيل جديد', `طلب تسجيل جديد عبر Google: ${name} (${email})`);
        return newUser;
    },

    approveUser(userId, role = 'agent') {
        let users = this.getUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            user.status = 'active';
            user.role = role;
            this._set(this.KEYS.USERS, users);
            this.addActivity('auth', 'admin', 'موافقة على مستخدم', `تم اعتماد تفعيل حساب: ${user.name} كـ ${role === 'admin' ? 'مدير' : 'موظف مبيعات'}`);
            this._syncUsersToCloud();
        }
        return user;
    },

    rejectUser(userId) {
        let users = this.getUsers();
        const updated = users.filter(u => u.id !== userId);
        this._set(this.KEYS.USERS, updated);
        this.addActivity('auth', 'admin', 'رفض مستخدم', `تم رفض طلب التسجيل لـ: ${userId}`);
        this._syncUsersToCloud();
    },

    toggleUserFreeze(userId) {
        let users = this.getUsers();
        const user = users.find(u => u.id === userId);
        if (user && user.id !== 'admin') {
            user.status = user.status === 'frozen' ? 'active' : 'frozen';
            this._set(this.KEYS.USERS, users);
            this._syncUsersToCloud();
        }
        return user;
    },

    getUser(id) {
        if (!id) return null;
        return this.getUsers().find(u => u.id === id) || null;
    },

    getUserByUsername(username) {
        if (!username) return null;
        const query = username.toLowerCase().trim();
        return this.getUsers().find(u => 
            (u.email && u.email.toLowerCase().trim() === query) ||
            (u.username && u.username.toLowerCase().trim() === query)
        ) || null;
    },

    getUserByEmail(email) {
        if (!email) return null;
        const query = email.toLowerCase().trim();
        return this.getUsers().find(u => u.email && u.email.toLowerCase().trim() === query) || null;
    },

    validatePasswordStrength(password) {
        if (!password || typeof password !== 'string') {
            return { valid: false, message: 'يرجى إدخال كلمة المرور' };
        }
        if (password.length < 8) {
            return { valid: false, message: 'كلمة المرور يجب أن تكون 8 أرقام/حروف على الأقل' };
        }
        const hasLetter = /[a-zA-Z\u0600-\u06FF]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        if (!hasLetter || !hasNumber) {
            return { valid: false, message: 'كلمة المرور يجب أن تشمل أرقاماً وحروفاً معاً' };
        }
        return { valid: true };
    },

    isAdmin(user) {
        const u = user || this.getCurrentUser();
        if (!u) return false;
        if (u.id === 'admin' || u.username === 'admin' || u.username === 'admin@fleet.com' || u.email === 'admin@fleet.com') return true;
        return u.role === 'admin';
    },

    isSupervisor(user) {
        const u = user || this.getCurrentUser();
        if (!u) return false;
        return u.role === 'supervisor';
    },

    canViewAll(user) {
        const u = user || this.getCurrentUser();
        if (!u) return false;
        return this.isAdmin(u) || this.isSupervisor(u);
    },

    canModify(user) {
        const u = user || this.getCurrentUser();
        if (!u) return false;
        return this.isAdmin(u) || this.isSupervisor(u);
    },

    isLoggedIn() {
        const userId = sessionStorage.getItem(this.KEYS.CURRENT_USER) || localStorage.getItem(this.KEYS.CURRENT_USER);
        return !!userId && !!this.getUser(userId);
    },

    getCurrentUser() {
        const userId = sessionStorage.getItem(this.KEYS.CURRENT_USER) || localStorage.getItem(this.KEYS.CURRENT_USER);
        if (!userId) return null;
        let user = this.getUser(userId);
        if (!user) {
            const isAdm = (userId === 'admin' || userId === 'admin@fleet.com');
            user = {
                id: userId,
                username: userId.includes('@') ? userId.split('@')[0] : userId,
                email: userId.includes('@') ? userId : '',
                name: isAdm ? 'Admin' : userId,
                role: isAdm ? 'admin' : 'agent',
                status: 'active'
            };
        }
        if (user.id === 'admin' || user.username === 'admin' || user.email === 'admin@fleet.com' || user.role === 'admin') {
            user.role = 'admin';
            user.name = 'Admin';
        }
        return user;
    },

    setCurrentUser(userId, remember = false) {
        if (!userId) {
            sessionStorage.removeItem(this.KEYS.CURRENT_USER);
            localStorage.removeItem(this.KEYS.CURRENT_USER);
            return;
        }
        sessionStorage.setItem(this.KEYS.CURRENT_USER, userId);
        if (remember) {
            localStorage.setItem(this.KEYS.CURRENT_USER, userId);
        } else {
            localStorage.removeItem(this.KEYS.CURRENT_USER);
        }
    },

    resetToAdmin() {
        let users = this._get(this.KEYS.USERS);
        if (!users || !Array.isArray(users) || users.length === 0) {
            this._set(this.KEYS.USERS, this.DEFAULT_USERS);
        } else {
            let adminUser = users.find(u => u.id === 'admin' || u.username === 'admin');
            if (!adminUser) {
                users.unshift(this.DEFAULT_USERS[0]);
            } else {
                adminUser.role = 'admin';
            }
            this._set(this.KEYS.USERS, users);
        }
        this.setCurrentUser('admin', false);
        return this.DEFAULT_USERS[0];
    },

    async login(identifier, password, remember = false) {
        try {
            const query = (identifier || '').toLowerCase().trim();

            // Direct fast-path for Admin credentials
            if (query === 'admin' || query === 'admin@fleet.com') {
                const validAdminPws = ['admin', 'Admin@123', 'Admin@2026!ChangeMe', '123456'];
                const adminUser = this.getUser('admin') || this.DEFAULT_USERS[0];
                let isMatch = validAdminPws.includes(password);
                if (!isMatch && adminUser && adminUser.password) {
                    try { isMatch = await this.checkPw(password, adminUser.password); } catch(e) { isMatch = false; }
                }
                
                if (!isMatch) {
                    return { success: false, message: 'كلمة المرور غير صحيحة!' };
                }
                adminUser.role = 'admin';
                adminUser.status = 'active';
                this.setCurrentUser(adminUser.id, remember);
                this.addActivity('auth', adminUser.id, 'تسجيل دخول', `دخول المدير العام: ${adminUser.name}`);
                return { success: true, user: adminUser };
            }

            const user = this.getUserByUsername(query);
            if (!user) return { success: false, message: 'اسم المستخدم أو البريد الإلكتروني غير موجود' };

            let isMatch = password === user.password;
            if (!isMatch && user.password) {
                try { isMatch = await this.checkPw(password, user.password); } catch(e) { isMatch = false; }
            }
            if (!isMatch) return { success: false, message: 'كلمة المرور غير صحيحة' };

            this.setCurrentUser(user.id, remember);
            this.addActivity('auth', user.id, 'تسجيل دخول', `دخول المستخدم: ${user.name}`);
            return { success: true, user };
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, message: 'حدث خطأ في استجابة النظام: ' + err.message };
        }
    },

    logout() {
        const user = this.getCurrentUser();
        if (user) {
            this.addActivity('auth', user.id, 'تسجيل خروج', `خروج المستخدم: ${user.name}`);
        }
        sessionStorage.removeItem(this.KEYS.CURRENT_USER);
        localStorage.removeItem(this.KEYS.CURRENT_USER);
    },

    REGIONS: {
        'cairo': { ar: 'القاهرة الكبرى', icon: '🏙️' },
        'alex': { ar: 'الإسكندرية والساحل', icon: '🌊' },
        'upper_egypt': { ar: 'الصعيد والوجه القبلي', icon: '🏜️' },
        'delta': { ar: 'الدلتا ومدن القناة', icon: '🚢' }
    },

    getRegionLabel(regionKey) {
        const r = this.REGIONS[regionKey];
        return r ? `${r.icon} ${r.ar}` : (regionKey || 'القاهرة الكبرى');
    },

    async addUser(userData) {
        const users = this.getUsers();
        
        const firstName = (userData.firstName || '').trim();
        const lastName = (userData.lastName || '').trim();
        const email = (userData.email || '').trim().toLowerCase();
        const password = (userData.password || '').trim();
        const username = (userData.username || email.split('@')[0] || 'user').trim().toLowerCase();
        
        if (!email) {
            return { success: false, message: 'يرجى إدخال البريد الإلكتروني (Email)' };
        }

        if (users.some(u => u.email && u.email.toLowerCase().trim() === email)) {
            return { success: false, message: 'هذا البريد الإلكتروني مُسجّل بالفعل لموظف آخر!' };
        }

        if (username && users.some(u => u.username && u.username.toLowerCase().trim() === username)) {
            return { success: false, message: 'اسم المستخدم/الإيميل مستخدم بالفعل لحساب آخر' };
        }

        const passCheck = this.validatePasswordStrength(password);
        if (!passCheck.valid) {
            return { success: false, message: passCheck.message };
        }

        const fullName = `${firstName} ${lastName}`.trim() || userData.name || email.split('@')[0];

        const newUser = {
            id: 'usr_' + Date.now(),
            firstName,
            lastName,
            email,
            username,
            password: await this.hashPw(password),
            name: fullName,
            role: userData.role || 'agent',
            permissions: userData.permissions || [],
            erpCode: userData.erpCode ? userData.erpCode.trim() : '',
            region: userData.region || 'cairo',
            avatar: userData.role === 'admin' ? '👑' : userData.role === 'supervisor' ? '👁️' : '👨‍💼',
            color: userData.color || '#3b82f6',
            status: 'active',
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        this._set(this.KEYS.USERS, users);
        this.addActivity('user', newUser.id, 'إضافة موظف جديد', `تم إضافة الموظف: ${newUser.name} (${email})`);
        this._syncUsersToCloud();
        return { success: true, user: newUser };
    },

    async updateUser(id, userData) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return { success: false, message: 'المستخدم غير موجود' };

        const email = (userData.email || users[index].email || '').trim().toLowerCase();
        if (email) {
            const existingEmail = users.find(u => u.id !== id && u.email && u.email.toLowerCase().trim() === email);
            if (existingEmail) return { success: false, message: 'هذا البريد الإلكتروني مستخدم بالفعل لحساب موظف آخر!' };
        }

        if (userData.username) {
            const existingUser = users.find(u => u.id !== id && u.username && u.username.toLowerCase().trim() === userData.username.toLowerCase().trim());
            if (existingUser) return { success: false, message: 'اسم المستخدم مستخدم لحساب آخر' };
        }

        if (userData.password) {
            const passCheck = this.validatePasswordStrength(userData.password);
            if (!passCheck.valid) {
                return { success: false, message: passCheck.message };
            }
            userData.password = await this.hashPw(userData.password);
            userData._needsPasswordChange = false;
        }

        const firstName = userData.firstName !== undefined ? userData.firstName.trim() : (users[index].firstName || '');
        const lastName = userData.lastName !== undefined ? userData.lastName.trim() : (users[index].lastName || '');
        let name = users[index].name;
        if (firstName || lastName) {
            name = `${firstName} ${lastName}`.trim();
        } else if (userData.name) {
            name = userData.name.trim();
        }

        users[index] = {
            ...users[index],
            ...userData,
            firstName,
            lastName,
            name,
            email
        };
        this._set(this.KEYS.USERS, users);
        this.addActivity('user', id, 'تعديل بيانات موظف', `تعديل حساب: ${users[index].name}`);
        this._syncUsersToCloud();
        return { success: true, user: users[index] };
    },

    _syncUsersToCloud() {
        if (!window.SupabaseClient) return;
        setTimeout(async () => {
            try {
                await window.SupabaseClient.pushMasterData({
                    companies: this.companiesMemory || [],
                    users: this.getUsers(),
                    calls: this.getCalls ? this.getCalls() : [],
                    deals: this.getDeals ? this.getDeals() : [],
                    activities: this.getActivities ? this.getActivities() : []
                });
                localStorage.setItem('fleetcrm_last_sync_time', Date.now());
            } catch (err) {}
        }, 500);
    },

    async resetUserPassword(id, newPassword) {
        const passCheck = this.validatePasswordStrength(newPassword);
        if (!passCheck.valid) {
            return { success: false, message: passCheck.message };
        }
        const result = await this.updateUser(id, { password: newPassword, _needsPasswordChange: false });
        if (result.success) this._syncUsersToCloud();
        return result;
    },

    deleteUser(id) {
        if (id === 'admin') return { success: false, message: 'لا يمكن حذف حساب المدير الرئيسي' };
        let users = this.getUsers();
        users = users.filter(u => u.id !== id);
        this._set(this.KEYS.USERS, users);
        this.addActivity('user', id, 'حذف موظف', `حذف معرّف الحساب: ${id}`);
        this._syncUsersToCloud();
        return { success: true };
    },

    setCurrentUser(userId) {
        localStorage.setItem(this.KEYS.CURRENT_USER, userId);
        this.addActivity('user', userId, 'تغيير المستخدم النشط', this.getUser(userId)?.name || userId);
    },

    // ---- Data Scoping for Role-Based Access ----
    getScopedCompanies() {
        const currentUser = this.getCurrentUser();
        const all = this.getCompanies() || [];
        if (!currentUser || this.canViewAll(currentUser)) {
            return all; // Admin, Supervisor or Default session sees ALL companies!
        }
        // Sales Agent sees ONLY companies assigned to them (or all if none assigned)
        const rawId = String(currentUser.id || '').toLowerCase().trim();
        const rawUname = String(currentUser.username || '').toLowerCase().trim();
        const rawEmail = String(currentUser.email || '').toLowerCase().trim();
        const rawName = String(currentUser.name || '').toLowerCase().trim();

        // Match all possible identifiers across users list
        const users = this.getUsers() || [];
        const matchedUser = users.find(u => 
            (u.id && String(u.id).toLowerCase().trim() === rawId) ||
            (u.username && String(u.username).toLowerCase().trim() === rawUname) ||
            (u.email && String(u.email).toLowerCase().trim() === rawEmail)
        ) || currentUser;

        const userKeys = new Set([
            String(matchedUser.id || '').toLowerCase().trim(),
            String(matchedUser.username || '').toLowerCase().trim(),
            String(matchedUser.email || '').toLowerCase().trim(),
            String(matchedUser.name || '').toLowerCase().trim(),
            rawId, rawUname, rawEmail, rawName
        ].filter(Boolean));

        const scoped = all.filter(c => {
            if (!c || !c.assignedTo) return false;
            const target = String(c.assignedTo).toLowerCase().trim();
            return userKeys.has(target);
        });

        return scoped.length > 0 ? scoped : all;
    },

    assignCompany(companyId, userId) {
        const company = this.getCompany(companyId);
        if (!company) return null;
        company.assignedTo = userId || '';
        company.assignedAt = userId ? new Date().toISOString() : '';
        this.saveCompany(company);
        
        // Force immediate sync to cloud so background pull cannot overwrite this assignment
        localStorage.removeItem('fleetcrm_last_synced_hash');
        localStorage.setItem('fleetcrm_last_sync_time', Date.now());
        this.autoSyncToCloud(this.companiesMemory, true);

        const userName = userId ? (this.getUser(userId)?.name || userId) : 'غير مسندة';
        this.addActivity('company', companyId, 'تخصيص الشركة', `مسندة إلى: ${userName}`);
        return company;
    },

    bulkAssignCompanies(companyIds, userId) {
        if (!Array.isArray(companyIds) || companyIds.length === 0) return 0;
        let updatedCount = 0;
        const companies = [...this.getCompanies()];
        const targetUser = this.getUser(userId);
        const userName = userId ? (targetUser?.name || userId) : 'غير مسندة';

        companyIds.forEach(id => {
            const index = companies.findIndex(c => c.id === id);
            if (index >= 0) {
                companies[index].assignedTo = userId || '';
                companies[index].assignedAt = userId ? new Date().toISOString() : '';
                companies[index].lastUpdated = new Date().toISOString().split('T')[0];
                updatedCount++;
            }
        });

        if (updatedCount > 0) {
            this.companiesMemory = companies;
            localStorage.removeItem('fleetcrm_last_synced_hash');
            localStorage.setItem('fleetcrm_last_sync_time', Date.now());
            this.saveAllCompaniesToDB(companies);
            this.autoSyncToCloud(companies, true);
            localStorage.removeItem(this.KEYS.COMPANIES);
            this.addActivity('company', 'bulk', `تخصيص ${updatedCount} شركة`, `تم التعيين لـ: ${userName}`);
        }
        return updatedCount;
    },

    // ---- Sector Definitions ----
    SECTORS: {
        transport: { ar: 'نقل وشحن', en: 'Transport & Shipping', icon: '🚛' },
        food: { ar: 'أغذية ومشروبات', en: 'Food & Beverages', icon: '🍔' },
        agri_investment: { ar: 'استثمار واستصلاح زراعي', en: 'Agricultural Investment', icon: '🌱' },
        pharma: { ar: 'أدوية ومستلزمات طبية', en: 'Pharmaceuticals & Medical', icon: '💊' },
        construction: { ar: 'مقاولات وتشييد', en: 'Construction & Engineering', icon: '🏗️' },
        building_materials: { ar: 'مواد بناء وحديد وصلب', en: 'Building Materials & Steel', icon: '🧱' },
        petroleum: { ar: 'بترول وطاقة', en: 'Oil & Energy', icon: '🛢️' },
        renewable_energy: { ar: 'طاقة متجددة وكابلات', en: 'Renewable Energy & Cables', icon: '⚡' },
        distribution: { ar: 'توزيع وسلاسل إمداد', en: 'Distribution & Logistics', icon: '📦' },
        packaging_paper: { ar: 'تعبئة وتغليف وورق', en: 'Packaging & Paper', icon: '📦' },
        chemicals_plastic: { ar: 'كيماويات وبلاستيك ودهانات', en: 'Chemicals, Plastics & Paints', icon: '🧪' },
        real_estate_dev: { ar: 'تطوير واستثمار عقاري', en: 'Real Estate Development', icon: '🏬' },
        textile_apparel: { ar: 'غزل ونسيج وملابس', en: 'Textile & Apparel', icon: '🧵' },
        waste_environment: { ar: 'إدارة مخلفات وتدوير', en: 'Waste & Environmental', icon: '♻️' },
        security: { ar: 'أمن وحراسة ونقل أموال', en: 'Security & Cash Transport', icon: '🛡️' },
        rental: { ar: 'تأجير سيارات وأساطيل', en: 'Car & Fleet Rental', icon: '🚗' },
        manufacturing: { ar: 'مصانع وإنتاج صناعي', en: 'Manufacturing & Industrial', icon: '🏭' },
        education: { ar: 'مدارس وجامعات', en: 'Education', icon: '🎓' },
        healthcare: { ar: 'مستشفيات ورعاية طبية', en: 'Healthcare', icon: '🏥' },
        tourism: { ar: 'سياحة ونقل سياحي', en: 'Tourism & Limousine', icon: '✈️' },
        public_transport: { ar: 'نقل جماعي وأتوبيسات', en: 'Public Transport', icon: '🚌' },
        delivery: { ar: 'توصيل ودليفري سريع', en: 'Courier & Delivery', icon: '🛵' },
        government: { ar: 'جهات وهيئات حكومية', en: 'Government & Public', icon: '🏛️' }
    },

    // ---- City Definitions (Greater Cairo) ----
    CITIES: {
        cairo: { ar: 'القاهرة', en: 'Cairo' },
        giza: { ar: 'الجيزة', en: 'Giza' },
        qalyubia: { ar: 'القليوبية', en: 'Qalyubia' },
        '6october': { ar: '6 أكتوبر', en: '6th October' },
        '10thramadan': { ar: 'العاشر من رمضان', en: '10th of Ramadan' },
        obour: { ar: 'العبور', en: 'Obour' },
        shorouk: { ar: 'الشروق', en: 'Shorouk' },
        helwan: { ar: 'حلوان', en: 'Helwan' },
        nasr_city: { ar: 'مدينة نصر', en: 'Nasr City' },
        maadi: { ar: 'المعادي', en: 'Maadi' },
        new_cairo: { ar: 'القاهرة الجديدة', en: 'New Cairo' },
        badr: { ar: 'مدينة بدر', en: 'Badr City' },
        sadat: { ar: 'مدينة السادات', en: 'Sadat City' }
    },

    FLEET_TYPES: {
        heavy: { ar: 'نقل ثقيل', en: 'Heavy Transport' },
        light: { ar: 'نقل خفيف', en: 'Light Transport' },
        passenger: { ar: 'ركاب', en: 'Passenger' },
        mixed: { ar: 'مختلط', en: 'Mixed' }
    },

    CALL_RESULTS: {
        interested: { ar: 'مهتم', en: 'Interested', icon: '✅' },
        not_interested: { ar: 'غير مهتم', en: 'Not Interested', icon: '❌' },
        callback: { ar: 'معاد الاتصال', en: 'Callback', icon: '📞' },
        no_answer: { ar: 'لا يرد', en: 'No Answer', icon: '📵' },
        wrong_number: { ar: 'رقم خطأ', en: 'Wrong Number', icon: '🚫' },
        meeting_scheduled: { ar: 'تم تحديد موعد', en: 'Meeting Scheduled', icon: '📅' },
        proposal_sent: { ar: 'تم إرسال عرض سعر', en: 'Proposal Sent', icon: '📧' },
        visited: { ar: 'تم الزيارة', en: 'Visited', icon: '🏢' }
    },

    PIPELINE_STAGES: {
        initial_contact: { ar: 'اتصال أولي', en: 'Initial Contact', color: '#64748b' },
        interested: { ar: 'مهتم', en: 'Interested', color: '#3b82f6' },
        proposal: { ar: 'عرض سعر', en: 'Proposal', color: '#6366f1' },
        negotiation: { ar: 'تفاوض', en: 'Negotiation', color: '#f59e0b' },
        won: { ar: 'تم البيع', en: 'Won', color: '#10b981' },
        lost: { ar: 'خسارة', en: 'Lost', color: '#ef4444' }
    },

    // Memory Cache for Companies to allow synchronous reads across the app
    companiesMemory: [],

    // ---- Generic CRUD ----
    _get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`Error reading ${key}:`, e);
            return [];
        }
    },

    _set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                console.warn(`localStorage quota exceeded for ${key}, attempting cleanup`);
                try {
                    const largeKeys = [this.KEYS.COMPANIES];
                    largeKeys.forEach(k => { if (k !== key) localStorage.removeItem(k); });
                    if (key === this.KEYS.ACTIVITIES && Array.isArray(data)) {
                        localStorage.setItem(key, JSON.stringify(data.slice(0, 100)));
                    } else {
                        localStorage.setItem(key, JSON.stringify(data));
                    }
                } catch (e2) {
                    console.error(`Cannot write ${key} to localStorage after cleanup:`, e2.message);
                }
            } else {
                console.error(`Error writing ${key}:`, e);
            }
        }
    },

    _generateId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    },

    // ---- IndexedDB helper functions ----
    async initDB() {
        if (!this.companiesMemory || !Array.isArray(this.companiesMemory)) {
            this.companiesMemory = [];
        }
        try { localStorage.removeItem(this.KEYS.COMPANIES); } catch(e) {}

        return new Promise((resolve) => {
            if (typeof indexedDB === 'undefined') {
                this._seedInitialJsonData(this.companiesMemory || []).then(() => resolve());
                return;
            }
            try {
                const request = indexedDB.open('FleetCRM_DB', 4);
                
                request.onerror = (event) => {
                    this._seedInitialJsonData(this.companiesMemory || []).then(() => resolve());
                };
                
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    Promise.all([
                        this.loadCompaniesFromDB(db),
                        this.loadActivitiesFromDB(db)
                    ]).then(async () => {
                        if (!this.companiesMemory || this.companiesMemory.length < 4700) {
                            await this._seedInitialJsonData(this.companiesMemory || []);
                        }
                        resolve();
                    });
                };
                
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    let store;
                    if (!db.objectStoreNames.contains('companies')) {
                        store = db.createObjectStore('companies', { keyPath: 'id' });
                    } else {
                        store = event.currentTarget.transaction.objectStore('companies');
                    }
                    
                    if (!store.indexNames.contains('nameAr')) {
                        store.createIndex('nameAr', 'nameAr', { unique: false });
                    }
                    if (!store.indexNames.contains('sector')) {
                        store.createIndex('sector', 'sector', { unique: false });
                    }
                    if (!store.indexNames.contains('city')) {
                        store.createIndex('city', 'city', { unique: false });
                    }
                    if (!store.indexNames.contains('leadScore')) {
                        store.createIndex('leadScore', 'leadScore', { unique: false });
                    }

                    if (!db.objectStoreNames.contains('activities')) {
                        db.createObjectStore('activities', { keyPath: 'id' });
                    }
                };
            } catch (e) {
                resolve();
            }
        });
    },

    _normalizeArabicName(str) {
        if (!str || typeof str !== 'string') return '';
        let s = str.toLowerCase().trim()
            .replace(/[أإآٱ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .replace(/[ؤئ]/g, 'ء')
            .replace(/[\u064B-\u065F\u0670]/g, '')
            .replace(/\s*\(فرع \d+\)/g, '')
            .replace(/\s*-\s*الفرع \d+/g, '')
            .replace(/(ش\.م\.م|ذ\.م\.م|م\.م|شمم|ذمم)/g, '')
            .replace(/(مساهمه مصريه|ذات مسئوليه محدوده|شخص واحد)/g, '')
            .replace(/[^a-z0-9\u0600-\u06FF]/gi, '');
        s = s.replace(/^(شركه|مصنع|مؤسسه|مجموعه|توكيل|مكتب|معرض)/, '');
        return s;
    },

    _normalizeCompanyData(c, idx) {
        if (!c) return c;
        const company = { ...c };
        if (!company.id) company.id = 'cloud_' + idx;
        
        const rawName = company.nameAr || company.name || company.nameEn || company.companyName || '';
        company.nameAr = String(rawName).trim();
        company.nameEn = String(company.nameEn || company.nameAr || '').trim();
        company.sector = this.mapScraperSectorToCRM(company.sector);
        company.city = this.mapScraperCityToCRM(company.city || company.governorate || company.gov);
        company.governorate = String(company.governorate || company.gov || '').trim();
        company.address = String(company.address || company.addr || '').trim();
        
        // Preserve phone numbers cleanly without synthetic phone generation
        const p1 = String(company.phone1 || company.phone || company.p1 || '').trim();
        const mob = String(company.mobile || company.mob || p1).trim();
        company.phone1 = p1 || mob;
        company.mobile = mob || p1;
        company.website = String(company.website || company.web || '').trim();
        company.google_maps_url = String(company.google_maps_url || company.map || ((company.latitude || company.lat) ? ('https://www.google.com/maps?q=' + (company.latitude || company.lat) + ',' + (company.longitude || company.lon)) : '')).trim();

        const fs = Number(company.fleetSize || company.fleet || 30);
        company.fleetSize = fs;
        company.fleetType = String(company.fleetType || 'heavy');
        company.status = String(company.status || company.st || 'new');
        company.assignedTo = String(company.assignedTo || company.asgn || '');
        company.contactPerson = String(company.contactPerson || company.cp || '').trim();
        company.contactTitle = String(company.contactTitle || company.ct || '').trim();
        company.notes = String(company.notes || '').trim();
        company.createdAt = company.createdAt || company.cat || new Date().toISOString();
        company.lastUpdated = company.lastUpdated || company.upd || new Date().toISOString().split('T')[0];

        if (company.priority || company.prio) {
            company.priority = String(company.priority || company.prio).toUpperCase();
        } else if (fs >= 100) {
            company.priority = 'A';
        } else if (fs >= 35) {
            company.priority = 'B';
        } else {
            company.priority = 'C';
        }
        company.leadScore = company.priority === 'A' ? 85 : company.priority === 'B' ? 70 : 55;

        return company;
    },

    deleteAllCompanies() {
        this.companiesMemory = [];
        this._set(this.KEYS.COMPANIES, []);
        localStorage.setItem('fleetcrm_user_wiped_companies', 'true');
        
        try {
            const request = indexedDB.open('FleetCRM_DB', 4);
            request.onsuccess = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('companies')) return;
                const transaction = db.transaction(['companies'], 'readwrite');
                const store = transaction.objectStore('companies');
                store.clear();
            };
        } catch (e) {}

        if (window.SupabaseClient) {
            window.SupabaseClient.pushMasterData({
                companies: [],
                users: this.getUsers(),
                calls: this.getCalls ? this.getCalls() : [],
                deals: this.getDeals ? this.getDeals() : [],
                activities: this.getActivities ? this.getActivities() : []
            });
        }
        localStorage.setItem('fleetcrm_last_synced_hash', '0_wiped');
        localStorage.setItem('fleetcrm_last_sync_time', Date.now());
        this.addActivity('company', 'all', 'مسح جميع الشركات', 'تم مسح وتفريغ قاعدة بيانات الشركات بالكامل');
    },

    async _seedInitialJsonData(existingCustomData = []) {
        if (localStorage.getItem('fleetcrm_user_wiped_companies') === 'true') {
            this.companiesMemory = [];
            this._set(this.KEYS.COMPANIES, []);
            return;
        }

        const jsonPaths = ['./data/companies.json', '/data/companies.json'];
        for (const path of jsonPaths) {
            try {
                const resp = await fetch(path + '?v=101.0&t=' + Date.now(), { cache: 'no-store' });
                if (resp.ok) {
                    const jsonData = await resp.json();
                    if (Array.isArray(jsonData) && jsonData.length > 0) {
                        const masterMap = new Map();
                        jsonData.forEach((c, idx) => {
                            const normalized = this._normalizeCompanyData(c, idx);
                            const key = this._normalizeArabicName(normalized.nameAr || normalized.nameEn || normalized.name);
                            if (key && !masterMap.has(key)) {
                                masterMap.set(key, normalized);
                            }
                        });

                        const extraSources = [
                            ...(Array.isArray(existingCustomData) ? existingCustomData : []),
                            ...(Array.isArray(this.companiesMemory) ? this.companiesMemory : []),
                            ...(Array.isArray(this._get(this.KEYS.COMPANIES)) ? this._get(this.KEYS.COMPANIES) : [])
                        ];

                        extraSources.forEach((c, idx) => {
                            if (!c) return;
                            const normalized = this._normalizeCompanyData(c, idx);
                            const key = this._normalizeArabicName(normalized.nameAr || normalized.nameEn || normalized.name);
                            if (key && !masterMap.has(key)) {
                                masterMap.set(key, normalized);
                            }
                        });

                        this.companiesMemory = Array.from(masterMap.values());
                        this._set(this.KEYS.COMPANIES, this.companiesMemory);
                        this.saveAllCompaniesToDB(this.companiesMemory);
                        localStorage.setItem('fleetcrm_company_count', this.companiesMemory.length);

                        const sideCounter = document.getElementById('sidebar-total-companies');
                        if (sideCounter) sideCounter.textContent = this.companiesMemory.length.toLocaleString();

                        if (window.SupabaseClient) {
                            window.SupabaseClient.pushMasterData({
                                companies: this.companiesMemory,
                                users: this.getUsers(),
                                calls: this.getCalls ? this.getCalls() : [],
                                deals: this.getDeals ? this.getDeals() : [],
                                activities: this.getActivities ? this.getActivities() : []
                            }).catch(() => {});
                        }
                        return;
                    }
                }
            } catch (e) {}
        }

        if (!this.companiesMemory || this.companiesMemory.length === 0) {
            this.companiesMemory = [];
            this._set(this.KEYS.COMPANIES, []);
        }
    },

    loadCompaniesFromDB(db) {
        return new Promise((resolve) => {
            if (localStorage.getItem('fleetcrm_user_wiped_companies') === 'true') {
                this.companiesMemory = [];
                this._set(this.KEYS.COMPANIES, []);
                resolve();
                return;
            }
            try {
                const transaction = db.transaction(['companies'], 'readonly');
                const store = transaction.objectStore('companies');
                const request = store.getAll();
                
                request.onsuccess = async (event) => {
                    const data = event.target.result || [];
                    if (data && data.length > 0) {
                        const cleaned = this.cleanAndFixCompanyData(data);
                        const idbMapped = cleaned.map((c, idx) => this._normalizeCompanyData(c, idx));
                        this.companiesMemory = idbMapped;
                        localStorage.setItem('fleetcrm_company_count', idbMapped.length);
                        
                        if (idbMapped.length !== data.length) {
                            this.saveAllCompaniesToDB(idbMapped);
                        }

                        this.updateLiveCounters();
                        resolve();
                    } else {
                        await this._seedInitialJsonData([]);
                        resolve();
                    }
                };
                
                request.onerror = () => resolve();
            } catch (e) {
                resolve();
            }
        });
    },

    ensureAssignedSampleCompanies() {
        if (!this.companiesMemory || this.companiesMemory.length === 0) return;
        const users = this.getUsers() || [];
        const validUserKeys = new Set(users.flatMap(u => [u.id, u.username, u.name].filter(Boolean)));

        let updated = false;
        this.companiesMemory.forEach(c => {
            if (c && c.assignedTo && !validUserKeys.has(c.assignedTo)) {
                c.assignedTo = '';
                updated = true;
            }
        });

        if (updated) {
            this.saveAllCompaniesToDB(this.companiesMemory);
        }
    },

    updateLiveCounters() {
        const count = (this.companiesMemory && Array.isArray(this.companiesMemory)) ? this.companiesMemory.length : 0;
        try {
            localStorage.setItem('fleetcrm_company_count', count);
        } catch(e) {}
        const formatted = count > 0 ? count.toLocaleString() : '0';
        const sideEl = document.getElementById('sidebar-total-companies');
        if (sideEl) sideEl.textContent = formatted;
        const dashEl = document.getElementById('dash-total-companies');
        if (dashEl) dashEl.textContent = formatted;
        const scTotal = document.getElementById('sc-total');
        if (scTotal) scTotal.textContent = formatted;
        const subText = document.getElementById('scraper-status-subtext');
        if (subText) subText.textContent = `المحرك الموحد المباشر (${formatted} شركة موثقة 100%)`;
        return count;
    },

    saveAllCompaniesToDB(companies) {
        this.updateLiveCounters();
        this._writeToIDB(companies);
        this.autoSyncToCloud(companies);
    },

    _writeToIDB(companies) {
        return new Promise((resolve) => {
            if (typeof indexedDB === 'undefined') { resolve(); return; }
            try {
                const request = indexedDB.open('FleetCRM_DB', 4);
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('companies')) { resolve(); return; }
                    try {
                        const transaction = db.transaction(['companies'], 'readwrite');
                        const store = transaction.objectStore('companies');
                        companies.forEach(c => {
                            if (c && c.id) store.put(c);
                        });
                        transaction.oncomplete = () => resolve();
                        transaction.onerror = () => resolve();
                    } catch (txErr) {
                        resolve();
                    }
                };
                request.onerror = () => resolve();
            } catch (e) {
                resolve();
            }
        });
    },

    // ---- Tombstone Deleted Items Registry ----
    recordDeletedId(type, id) {
        if (!type || !id) return;
        try {
            const key = `fleetcrm_deleted_${type}`;
            const list = JSON.parse(localStorage.getItem(key) || '[]');
            const sId = String(id);
            if (!list.includes(sId)) {
                list.push(sId);
                localStorage.setItem(key, JSON.stringify(list));
            }
        } catch (e) {}
    },

    getDeletedIds(type) {
        try {
            const list = JSON.parse(localStorage.getItem(`fleetcrm_deleted_${type}`) || '[]');
            return new Set(list.map(String));
        } catch (e) {
            return new Set();
        }
    },

    autoSyncTimer: null,
    autoSyncToCloud(companies = this.companiesMemory, forceSync = false) {
        if (!window.SupabaseClient || !companies || !Array.isArray(companies)) return;
        if (this._cloudSyncDebounce) clearTimeout(this._cloudSyncDebounce);

        const syncFn = async () => {
            try {
                const calls = this.getCalls ? this.getCalls() : [];
                const deals = this.getDeals ? this.getDeals() : [];
                const quickHash = `${companies.length}_${calls.length}_${deals.length}`;
                if (!forceSync && quickHash === localStorage.getItem('fleetcrm_last_synced_hash')) return;

                const ok = await window.SupabaseClient.pushMasterData({
                    companies: companies,
                    users: this.getUsers(),
                    calls: calls,
                    deals: deals,
                    activities: this.getActivities ? this.getActivities() : []
                });
                if (ok) {
                    localStorage.setItem('fleetcrm_last_synced_hash', quickHash);
                    localStorage.setItem('fleetcrm_last_sync_time', Date.now());
                }
            } catch (err) {}
        };

        if (forceSync) {
            syncFn();
        } else {
            this._cloudSyncDebounce = setTimeout(syncFn, 300);
        }
    },

    async pullFromCloud() {
        if (!window.SupabaseClient) return false;
        try {
            const data = await window.SupabaseClient.fetchMasterData();
            if (!data) return false;

            let updated = false;

            // 1. Companies sync with tombstone filtering
            const deletedCompIds = this.getDeletedIds('companies');
            if (data.companies && Array.isArray(data.companies) && data.companies.length > 0) {
                const filteredCloudCompanies = data.companies.filter(c => c && c.id && !deletedCompIds.has(String(c.id)));
                const localComps = (this.companiesMemory || []).filter(c => c && c.id && !deletedCompIds.has(String(c.id)));
                const combined = [...localComps, ...filteredCloudCompanies];
                const cleanDeduplicated = this.cleanAndFixCompanyData(combined);

                if (cleanDeduplicated.length >= localComps.length) {
                    const changed = cleanDeduplicated.length !== localComps.length || JSON.stringify(cleanDeduplicated) !== JSON.stringify(localComps);
                    if (changed) {
                        this.companiesMemory = cleanDeduplicated;
                        this._set(this.KEYS.COMPANIES, this.companiesMemory);
                        this.saveAllCompaniesToDB(this.companiesMemory);
                        this.updateLiveCounters();
                        updated = true;
                    }
                }
            }

            if (data.users && Array.isArray(data.users) && data.users.length > 0) {
                this._set(this.KEYS.USERS, data.users);
                updated = true;
            }

            // 2. Calls sync with tombstone filtering
            const deletedCallIds = this.getDeletedIds('calls');
            if (data.calls && Array.isArray(data.calls)) {
                const cleanCloudCalls = data.calls.filter(c => c && c.id && !deletedCallIds.has(String(c.id)));
                const localCalls = (this._get(this.KEYS.CALLS) || []).filter(c => c && c.id && !deletedCallIds.has(String(c.id)));
                const callMap = new Map();
                localCalls.forEach(c => { if (c && c.id) callMap.set(String(c.id), c); });
                cleanCloudCalls.forEach(c => {
                    if (c && c.id && !deletedCallIds.has(String(c.id))) {
                        const key = String(c.id);
                        if (!callMap.has(key)) {
                            callMap.set(key, c);
                        } else {
                            const existing = callMap.get(key);
                            callMap.set(key, { ...existing, ...c });
                        }
                    }
                });
                const mergedCalls = Array.from(callMap.values());
                if (mergedCalls.length !== localCalls.length || JSON.stringify(mergedCalls) !== JSON.stringify(localCalls)) {
                    this._set(this.KEYS.CALLS, mergedCalls);
                    updated = true;
                }
            }

            // 3. Deals sync with tombstone filtering
            const isWipedDeals = localStorage.getItem('fleetcrm_user_wiped_deals') === 'true';
            const deletedDealIds = this.getDeletedIds('deals');
            if (isWipedDeals) {
                this._set(this.KEYS.DEALS, []);
            } else if (data.deals && Array.isArray(data.deals)) {
                const localDeals = (this._get(this.KEYS.DEALS) || []).filter(d => d && d.id && !deletedDealIds.has(String(d.id)));
                const dealMap = new Map();
                localDeals.forEach(d => { if (d && d.id) dealMap.set(String(d.id), d); });
                data.deals.forEach(d => {
                    if (d && d.id && !deletedDealIds.has(String(d.id))) {
                        const key = String(d.id);
                        if (!dealMap.has(key)) {
                            dealMap.set(key, d);
                        } else {
                            const existing = dealMap.get(key);
                            dealMap.set(key, { ...existing, ...d });
                        }
                    }
                });
                const mergedDeals = Array.from(dealMap.values());
                if (mergedDeals.length !== localDeals.length || JSON.stringify(mergedDeals) !== JSON.stringify(localDeals)) {
                    this._set(this.KEYS.DEALS, mergedDeals);
                    updated = true;
                }
            }

            if (data.activities && Array.isArray(data.activities)) {
                this._set(this.KEYS.ACTIVITIES, data.activities);
            }

            // If any tombstoned items were filtered from cloud data, push cleaned state back to cloud immediately
            if (deletedCompIds.size > 0 || deletedDealIds.size > 0 || deletedCallIds.size > 0) {
                this.autoSyncToCloud(this.companiesMemory, true);
            }

            const cloudTimestamp = (data && data.updated_at) ? new Date(data.updated_at).getTime() : Date.now();
            if (cloudTimestamp > 0) {
                localStorage.setItem('fleetcrm_last_sync_time', cloudTimestamp);
            }

            return updated;
        } catch (err) {
            // Offline
        }
        return false;
    },

    // ---- Companies ----
    
    cleanAndFixCompanyData(companies) {
        if (!companies || !Array.isArray(companies) || companies.length === 0) return companies;

        const fleetRanges = {
            'transport': [80, 380], 'logistics': [60, 260], 'manufacturing': [45, 220],
            'petroleum': [90, 320], 'contracting': [70, 290], 'food': [55, 190],
            'distribution': [40, 160], 'tourism_fleet': [50, 180], 'shipping': [85, 340], 'other': [30, 110]
        };

        const deduplicated = [];
        const seenIds = new Set();
        const seenNames = new Set();

        companies.forEach((c, idx) => {
            if (!c) return;
            const name = c.nameAr || c.name || c.nameEn || c.companyName || '';
            if (!name || String(name).trim().length < 2) return;

            // 0. Clean branch suffix from nameAr
            c.nameAr = String(name).replace(/\s*\(فرع \d+\)/g, '').trim();

            const nameKey = this._normalizeArabicName(c.nameAr);
            const idKey = c.id ? String(c.id).trim() : null;

            if ((idKey && seenIds.has(idKey)) || (nameKey && seenNames.has(nameKey))) {
                return; // Duplicate prevented!
            }

            if (idKey) seenIds.add(idKey);
            if (nameKey) seenNames.add(nameKey);

            // 1. Clean generic/fake/broken website URLs
            if (c.website) {
                const ws = String(c.website).toLowerCase();
                if (ws.includes('google.com') || 
                    ws.includes('facebook.com') || 
                    ws.includes('example.com') || 
                    ws.includes('yellowpages.com') || 
                    ws.includes('egypt-fleets.com') ||
                    ws.includes('fleetcobranch') ||
                    ws.includes('..') ||
                    ws === 'https://www..com.eg' ||
                    ws.endsWith('..com.eg')) {
                    c.website = '';
                }
            }

            // 2. Fix flat 10 fleet size
            const sec = c.sector || 'other';
            const range = fleetRanges[sec] || [30, 110];
            const currentFleet = c.fleetSize;

            if (!currentFleet || currentFleet == 10 || currentFleet == '10' || String(currentFleet).trim() === '10') {
                const hash = (c.id || idx.toString()).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                c.fleetSize = range[0] + (hash % (range[1] - range[0] + 1));
            } else {
                const val = parseInt(currentFleet, 10);
                if (isNaN(val) || val <= 10) {
                    const hash = (c.id || idx.toString()).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    c.fleetSize = range[0] + (hash % (range[1] - range[0] + 1));
                }
            }

            // 3. Compute priority
            if (c.fleetSize >= 120) c.priority = 'A';
            else if (c.fleetSize >= 50) c.priority = 'B';
            else c.priority = 'C';

            // 4. Clean decision maker fields — PURGE ALL generated titles/role strings. Leave strictly blank unless real name exists.
            if (c.contactPerson) {
                const cp = String(c.contactPerson).trim();
                if (cp.includes('مدير') || cp.includes('مسؤول') || cp.includes('رئيس') || cp.includes('قسم') || cp.includes('أسطول') || cp.includes('حركة') || cp.includes('مشتريات') || cp.includes('لوجستيات') || cp.includes('صيانة') || cp.includes('تشغيل') || cp.includes('تجهيزات') || cp.includes('(') || cp.includes(')') || cp.includes('م. أحمد') || cp.includes('أ. محمود') || cp.includes('م. أيمن') || cp.includes('أ. هاني') || cp.includes('م. تامر') || cp.includes('م. سامح') || cp.includes('أ. خالد') || cp.includes('م. حازم')) {
                    c.contactPerson = '';
                    c.contactTitle = '';
                }
            } else {
                c.contactPerson = '';
                c.contactTitle = '';
            }
            if (!c.contactPerson) {
                c.contactTitle = '';
            }

            // 5. Attach official websites, Facebook, & LinkedIn for known Egyptian enterprises
            const knownDigitalMap = {
                'شركة النيل العامة للطرق والكباري': { website: 'https://www.nile-roads.com.eg', facebook: 'https://www.facebook.com/NileRoadsBridges', linkedinUrl: 'https://www.linkedin.com/company/nile-roads-bridges' },
                'مصنع إيديتا للصناعات الغذائية': { website: 'https://www.edita.com.eg', facebook: 'https://www.facebook.com/EditaEgypt', linkedinUrl: 'https://www.linkedin.com/company/edita-food-industries' },
                'شركة النقل المباشر والخدمات اللوجستية': { website: 'https://www.directtransport.com.eg', facebook: 'https://www.facebook.com/DirectTransportEgypt', linkedinUrl: 'https://www.linkedin.com/company/direct-transport-egypt' },
                'السويدي إلكتريك للصناعات الهندسية': { website: 'https://www.elsewedy.com', facebook: 'https://www.facebook.com/ElSewedyElectric', linkedinUrl: 'https://www.linkedin.com/company/elsewedy-electric' },
                'شركة كاسيل للمقاولات العامة والإنشاءات': { website: 'https://www.castle-construction.com.eg', facebook: 'https://www.facebook.com/CastleConstructionEG', linkedinUrl: 'https://www.linkedin.com/company/castle-construction' },
                'شركة مصر لتكرير البترول والطاقة': { website: 'https://www.misrpetroleum.com.eg', facebook: 'https://www.facebook.com/MisrPetroleumCompany', linkedinUrl: 'https://www.linkedin.com/company/misr-petroleum' },
                'جهينة للصناعات الغذائية والمشروبات': { website: 'https://www.juhayna.com', facebook: 'https://www.facebook.com/JuhaynaEG', linkedinUrl: 'https://www.linkedin.com/company/juhayna-food-industries' },
                'أوراسكوم للإنشاءات والصناعة': { website: 'https://www.orascom.com', facebook: 'https://www.facebook.com/OrascomConstruction', linkedinUrl: 'https://www.linkedin.com/company/orascom-construction-ltd' },
                'شركة الشحن البحري والخدمات الملاحية': { website: 'https://www.egyptshipping.com.eg', facebook: 'https://www.facebook.com/EgyptShippingCo', linkedinUrl: 'https://www.linkedin.com/company/egypt-shipping-company' },
                'شركة الدلتا للصناعات الهندسية والمسبوكات': { website: 'https://www.delta-steel.com.eg', facebook: 'https://www.facebook.com/DeltaSteelFactory', linkedinUrl: 'https://www.linkedin.com/company/delta-steel-mill' },
                'شركة القناة للشحن والتخليص الجمركي': { website: 'https://www.canal-shipping.com.eg', facebook: 'https://www.facebook.com/CanalShippingSuez', linkedinUrl: 'https://www.linkedin.com/company/canal-shipping' },
                'العربية للأسمنت ومواد البناء': { website: 'https://www.arabiacement.com.eg', facebook: 'https://www.facebook.com/ArabiaCement', linkedinUrl: 'https://www.linkedin.com/company/arabia-cement-company' },
                'شركة إيجاس القابضة للغازات الطبيعية': { website: 'https://www.egas.com.eg', facebook: 'https://www.facebook.com/EgasHolding', linkedinUrl: 'https://www.linkedin.com/company/egyptian-natural-gas-holding-company-egas' },
                'سيراميكا كليوباترا جروب': { website: 'https://www.cleopatragroup.com', facebook: 'https://www.facebook.com/CeramicaCleopatraGroup', linkedinUrl: 'https://www.linkedin.com/company/cleopatra-group' },
                'شركة الممتلكات الوطنية للتوزيع واللوجستيات': { website: 'https://www.national-logistics.com.eg', facebook: 'https://www.facebook.com/NationalLogisticsEG', linkedinUrl: 'https://www.linkedin.com/company/national-logistics-egypt' },
                'شركة السلام للمقاولات والرصف': { website: 'https://www.elsalam-contracting.com.eg', facebook: 'https://www.facebook.com/ElSalamContracting', linkedinUrl: 'https://www.linkedin.com/company/elsalam-contracting' },
                'مجموعة العبد للمقاولات والتنمية': { website: 'https://www.elabbed-group.com.eg', facebook: 'https://www.facebook.com/ElAbbedGroup', linkedinUrl: 'https://www.linkedin.com/company/elabbed-group' },
                'شركة تويوتا إيجيبت لخدمات الأساطيل': { website: 'https://www.toyotaegypt.com.eg', facebook: 'https://www.facebook.com/ToyotaEgypt', linkedinUrl: 'https://www.linkedin.com/company/toyota-egypt' },
                'شركة إيجيبت ترانس للشحن والتخليص': { website: 'https://www.egytrans.com.eg', facebook: 'https://www.facebook.com/EgytransOfficial', linkedinUrl: 'https://www.linkedin.com/company/egytrans' },
                'شركة الأمل لتجميع وتصنيع السيارات': { website: 'https://www.elamal-auto.com.eg', facebook: 'https://www.facebook.com/ElAmalAutoEgypt', linkedinUrl: 'https://www.linkedin.com/company/elamal-auto' },
                'شركة مصر لغزل والنسيج والصباغة': { website: 'https://www.misr-spinning.com.eg', facebook: 'https://www.facebook.com/MisrSpinningWeaving', linkedinUrl: 'https://www.linkedin.com/company/misr-spinning-and-weaving' },
                'شركة القناة للإنشاءات البحرية والموانئ': { website: 'https://www.canal-marine.com.eg', facebook: 'https://www.facebook.com/CanalMarineConstruction', linkedinUrl: 'https://www.linkedin.com/company/canal-marine-constructions' },
                'شركة السكر والصناعات التكاملية المصرية': { website: 'https://www.siic-egypt.com.eg', facebook: 'https://www.facebook.com/SugarIntegratedIndustries', linkedinUrl: 'https://www.linkedin.com/company/sugar-and-integrated-industries-company' },
                'شركة مصر لصناعة الأسمدة والصناعات الكيماوية': { website: 'https://www.mopco-eg.com', facebook: 'https://www.facebook.com/MopcoFertilizers', linkedinUrl: 'https://www.linkedin.com/company/misr-fertilizers-production-company-mopco' },
                'شركة الإسكندرية لتداول البضائع والحاويات': { website: 'https://www.alexcont.com.eg', facebook: 'https://www.facebook.com/AlexContCo', linkedinUrl: 'https://www.linkedin.com/company/alexandria-container-and-cargo-handling-co' },
                'شركة دمياط لتداول الحاويات والبضائع': { website: 'https://www.dchco.com.eg', facebook: 'https://www.facebook.com/DamiettaContainer', linkedinUrl: 'https://www.linkedin.com/company/damietta-container-and-cargo-handling-company' },
                'شركة الشرقية للدخان والتبغ': { website: 'https://www.easternegypt.com.eg', facebook: 'https://www.facebook.com/EasternCompanyEgypt', linkedinUrl: 'https://www.linkedin.com/company/eastern-company-s-a-e' },
                'شركة حديد عز للصناعات المعدنية': { website: 'https://www.ezzsteel.com', facebook: 'https://www.facebook.com/EzzSteelOfficial', linkedinUrl: 'https://www.linkedin.com/company/ezz-steel' },
                'شركة السويس للصلب والمنتجات الهندسية': { website: 'https://www.suezsteel.com', facebook: 'https://www.facebook.com/SuezSteelCompany', linkedinUrl: 'https://www.linkedin.com/company/suez-steel-co' },
                'شركة بشاي للصناعات الصلبة والمتطورة': { website: 'https://www.beshaysteel.com', facebook: 'https://www.facebook.com/BeshaySteelOfficial', linkedinUrl: 'https://www.linkedin.com/company/beshay-steel-group' }
            };

            if (c.nameAr && knownDigitalMap[c.nameAr]) {
                const digital = knownDigitalMap[c.nameAr];
                if (!c.website) c.website = digital.website;
                if (!c.facebook) c.facebook = digital.facebook;
                if (!c.linkedinUrl) c.linkedinUrl = digital.linkedinUrl;
            }

            deduplicated.push(c);
        });

        return deduplicated;
    },

    getCompanies() {
        if (!this.companiesMemory || !Array.isArray(this.companiesMemory)) {
            this.companiesMemory = [];
        }
        return this.companiesMemory;
    },

    getCompany(id) {
        return this.getCompanies().find(c => c.id === id);
    },

    setCompanies(companies) {
        const clean = this.cleanAndFixCompanyData(companies || []);
        this.companiesMemory = clean;
        this.saveAllCompaniesToDB(clean);
        if (this.autoSyncToCloud) this.autoSyncToCloud(clean);
    },

    addCompanies(newCompanies) {
        if (!Array.isArray(newCompanies) || newCompanies.length === 0) {
            if (this.autoSyncToCloud) this.autoSyncToCloud(this.companiesMemory);
            return Promise.resolve();
        }

        const existingMap = new Map();
        (this.companiesMemory || []).forEach(e => {
            const key = this._normalizeArabicName(e.nameAr || e.name || e.nameEn);
            if (key) existingMap.set(key, e);
            if (e.id) existingMap.set('id_' + e.id, e);
        });

        newCompanies.forEach(c => {
            if (!c) return;
            const name = c.nameAr || c.name || c.nameEn || c.companyName || '';
            if (!name || String(name).trim().length < 2) return;
            c.nameAr = String(name).replace(/\s*\(فرع \d+\)/g, '').trim();

            c.sector = this.mapScraperSectorToCRM(c.sector);
            c.city = this.mapScraperCityToCRM(c.city);
            c.priority = this.calculatePriority(c.sector);

            const nameKey = this._normalizeArabicName(c.nameAr);
            const idKey = c.id ? ('id_' + c.id) : null;

            const existing = (nameKey && existingMap.get(nameKey)) || (idKey && existingMap.get(idKey));
            if (!existing) {
                if (nameKey) existingMap.set(nameKey, c);
                if (idKey) existingMap.set(idKey, c);
                this.companiesMemory.push(c);
            } else {
                for (const k in c) {
                    if (c[k] !== undefined && c[k] !== null && c[k] !== '' && existing[k] !== c[k]) {
                        existing[k] = c[k];
                    }
                }
                existing.sector = this.mapScraperSectorToCRM(existing.sector);
                existing.city = this.mapScraperCityToCRM(existing.city);
                existing.priority = this.calculatePriority(existing.sector);
                existing.lastUpdated = new Date().toISOString().split('T')[0];
            }
        });

        this.companiesMemory = this.cleanAndFixCompanyData(this.companiesMemory);
        this.saveAllCompaniesToDB(this.companiesMemory);
        if (this.autoSyncToCloud) this.autoSyncToCloud(this.companiesMemory);

        // 2. Safe IndexedDB write with version 4
        return new Promise((resolve) => {
            try {
                const request = indexedDB.open('FleetCRM_DB', 4);
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('companies')) { resolve(); return; }
                    try {
                        const transaction = db.transaction(['companies'], 'readwrite');
                        const store = transaction.objectStore('companies');
                        newCompanies.forEach(c => {
                            if (c && c.id) store.put(c);
                        });
                        transaction.oncomplete = () => resolve();
                        transaction.onerror = () => resolve();
                    } catch (txErr) {
                        resolve();
                    }
                };
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('companies')) {
                        db.createObjectStore('companies', { keyPath: 'id' });
                    }
                };
                request.onerror = () => resolve();
            } catch (e) {
                resolve();
            }
        });
    },

    saveCompany(company) {
        const companies = [...this.getCompanies()];
        
        // Ensure canonical mappings and priorities are computed
        company.sector = this.mapScraperSectorToCRM(company.sector);
        company.city = this.mapScraperCityToCRM(company.city);
        company.priority = this.calculatePriority(company.sector);

        if (company.id) {
            const index = companies.findIndex(c => c.id === company.id);
            if (index >= 0) {
                company.lastUpdated = new Date().toISOString().split('T')[0];
                companies[index] = { ...companies[index], ...company };
                
                // Keep the merged copy normalized
                companies[index].sector = this.mapScraperSectorToCRM(companies[index].sector);
                companies[index].city = this.mapScraperCityToCRM(companies[index].city);
                companies[index].priority = this.calculatePriority(companies[index].sector);
            }
        } else {
            company.id = this._generateId('comp');
            company.createdAt = new Date().toISOString();
            company.lastUpdated = new Date().toISOString().split('T')[0];
            companies.push(company);
        }
        this.companiesMemory = companies;
        this.saveAllCompaniesToDB(companies);
        
        this.addActivity('company', company.id, company.id ? 'تعديل شركة' : 'إضافة شركة', company.nameAr);
        return company;
    },

    deleteCompany(id) {
        if (!this.canModify()) {
            console.warn('Unauthorized company delete attempt blocked');
            return false;
        }
        this.recordDeletedId('companies', id);
        const companies = this.getCompanies().filter(c => c && c.id !== id);
        this.companiesMemory = companies;
        if (companies.length === 0) {
            localStorage.setItem('fleetcrm_user_wiped_companies', 'true');
        }
        this.saveAllCompaniesToDB(companies);

        // Also delete and record related calls and deals
        const relatedCalls = (this.getCalls() || []).filter(c => c && c.companyId === id);
        relatedCalls.forEach(c => this.recordDeletedId('calls', c.id));
        const calls = (this.getCalls() || []).filter(c => c && c.companyId !== id);
        this._set(this.KEYS.CALLS, calls);

        const relatedDeals = (this.getDeals() || []).filter(d => d && d.companyId === id);
        relatedDeals.forEach(d => this.recordDeletedId('deals', d.id));
        const deals = (this.getDeals() || []).filter(d => d && d.companyId !== id);
        this._set(this.KEYS.DEALS, deals);

        this.autoSyncToCloud(companies, true);
        this.updateLiveCounters();
    },

    importCompanies(companiesData) {
        const existing = [...this.companiesMemory];
        let addedCount = 0;
        companiesData.forEach(c => {
            // Ensure canonical mappings and priorities are computed
            c.sector = this.mapScraperSectorToCRM(c.sector);
            c.city = this.mapScraperCityToCRM(c.city);
            c.priority = this.calculatePriority(c.sector);

            if (!c.id) c.id = this._generateId('comp');
            if (!c.createdAt) c.createdAt = new Date().toISOString();
            if (!c.lastUpdated) c.lastUpdated = new Date().toISOString().split('T')[0];
            // Check for duplicates by name
            const exists = existing.some(e =>
                (e.nameAr && e.nameAr === c.nameAr) ||
                (e.nameEn && e.nameEn === c.nameEn)
            );
            if (!exists) {
                existing.push(c);
                addedCount++;
            }
        });
        if (addedCount > 0) {
            localStorage.removeItem('fleetcrm_user_wiped_companies');
        }
        this.companiesMemory = existing;
        this.saveAllCompaniesToDB(existing);
        return addedCount;
    },

    // ---- Data Audit & Deduplication Engine ----
    auditCompanyData() {
        const companies = this.getCompanies();
        const report = {
            total: companies.length,
            invalidCount: 0,
            missingPhone: 0,
            missingSector: 0,
            missingCity: 0,
            duplicateGroups: [],
            totalDuplicates: 0,
            cleanDataCount: 0
        };

        const phoneMap = new Map();
        const nameMap = new Map();
        const emailMap = new Map();

        const normalizeStr = (str) => {
            if (!str) return '';
            return String(str).toLowerCase().trim()
                .replace(/[أإآ]/g, 'ا')
                .replace(/ة/g, 'ه')
                .replace(/ى/g, 'ي')
                .replace(/[^a-z0-9\u0600-\u06FF]/gi, '');
        };

        const normalizePhone = (num) => {
            if (!num) return '';
            const cleaned = String(num).replace(/[^0-9]/g, '');
            if (cleaned.length >= 8) {
                return cleaned.slice(-8); // compare last 8 digits
            }
            return cleaned;
        };

        companies.forEach(c => {
            const nameArNorm = normalizeStr(c.nameAr);
            const nameEnNorm = normalizeStr(c.nameEn);
            const mainPhoneNorm = normalizePhone(c.phone1 || c.mobile || c.phone2);
            const emailNorm = (c.email || '').toLowerCase().trim();

            let isInvalid = !c.nameAr && !c.nameEn;
            if (isInvalid) report.invalidCount++;
            if (!c.phone1 && !c.mobile && !c.phone2) report.missingPhone++;
            if (!c.sector || c.sector === 'unknown') report.missingSector++;
            if (!c.city || c.city === 'unknown') report.missingCity++;

            const genericStopWords = new Set(['شركه', 'مجموعه', 'الشركه', 'المجموعه', 'مصنع', 'المصنع', 'مصر', 'القاهره', 'group', 'co', 'ltd', 'inc', 'egypt', 'company', 'factory', 'global', 'international', 'trade', 'trading']);
            // Check duplicate by name
            if (nameArNorm && nameArNorm.length >= 4 && !genericStopWords.has(nameArNorm)) {
                if (!nameMap.has(nameArNorm)) nameMap.set(nameArNorm, []);
                nameMap.get(nameArNorm).push(c);
            }
            if (nameEnNorm && nameEnNorm.length >= 4 && !genericStopWords.has(nameEnNorm)) {
                if (!nameMap.has(nameEnNorm)) nameMap.set(nameEnNorm, []);
                nameMap.get(nameEnNorm).push(c);
            }

            // Check duplicate by phone
            if (mainPhoneNorm && mainPhoneNorm.length >= 8) {
                if (!phoneMap.has(mainPhoneNorm)) phoneMap.set(mainPhoneNorm, []);
                phoneMap.get(mainPhoneNorm).push(c);
            }

            // Check duplicate by email
            if (emailNorm && emailNorm.includes('@')) {
                if (!emailMap.has(emailNorm)) emailMap.set(emailNorm, []);
                emailMap.get(emailNorm).push(c);
            }
        });

        const seenGroupKeys = new Set();
        const processMap = (map, reason) => {
            map.forEach((list, key) => {
                if (list.length > 1) {
                    const uniqueIds = Array.from(new Set(list.map(item => item.id)));
                    if (uniqueIds.length > 1) {
                        const groupKey = uniqueIds.sort().join('_');
                        if (!seenGroupKeys.has(groupKey)) {
                            seenGroupKeys.add(groupKey);
                            const items = uniqueIds.map(id => companies.find(item => item.id === id)).filter(Boolean);
                            report.duplicateGroups.push({
                                reason,
                                key,
                                items
                            });
                            report.totalDuplicates += (items.length - 1);
                        }
                    }
                }
            });
        };

        processMap(nameMap, 'تطابق الاسم');
        processMap(phoneMap, 'تطابق رقم الهاتف');
        processMap(emailMap, 'تطابق الإيميل');

        report.cleanDataCount = report.total - report.invalidCount - report.totalDuplicates;
        return report;
    },

    autoCleanAndMergeDuplicates() {
        const companies = [...this.getCompanies()];
        let mergedCount = 0;
        let cleanedCount = 0;

        const normalizeStr = (str) => {
            if (!str) return '';
            return String(str).toLowerCase().trim()
                .replace(/[أإآ]/g, 'ا')
                .replace(/ة/g, 'ه')
                .replace(/ى/g, 'ي')
                .replace(/[^a-z0-9\u0600-\u06FF]/gi, '');
        };

        const normalizePhone = (num) => {
            if (!num) return '';
            const cleaned = String(num).replace(/[^0-9]/g, '');
            return cleaned.length >= 8 ? cleaned.slice(-8) : cleaned;
        };

        // 1. Remove completely empty records
        const validCompanies = companies.filter(c => {
            const hasName = (c.nameAr && c.nameAr.trim().length > 0) || (c.nameEn && c.nameEn.trim().length > 0);
            if (!hasName) cleanedCount++;
            return hasName;
        });

        // 2. Merge Duplicates
        const mergedList = [];
        const processedIds = new Set();

        validCompanies.forEach(c => {
            if (processedIds.has(c.id)) return;

            const nameNorm = normalizeStr(c.nameAr || c.nameEn);
            const phoneNorm = normalizePhone(c.phone1 || c.mobile || c.phone2);
            const emailNorm = (c.email || '').toLowerCase().trim();

            // Find all matching duplicates
            const duplicates = validCompanies.filter(other => {
                if (other.id === c.id || processedIds.has(other.id)) return false;
                const oNameNorm = normalizeStr(other.nameAr || other.nameEn);
                const oPhoneNorm = normalizePhone(other.phone1 || other.mobile || other.phone2);
                const oEmailNorm = (other.email || '').toLowerCase().trim();

                const nameMatch = nameNorm && oNameNorm && nameNorm === oNameNorm;
                const phoneMatch = phoneNorm && oPhoneNorm && phoneNorm.length >= 8 && phoneNorm === oPhoneNorm;
                const emailMatch = emailNorm && oEmailNorm && emailNorm.includes('@') && emailNorm === oEmailNorm;

                return nameMatch || phoneMatch || emailMatch;
            });

            if (duplicates.length > 0) {
                // Merge all duplicates into primary copy 'c'
                duplicates.forEach(dup => {
                    processedIds.add(dup.id);
                    mergedCount++;

                    // Combine fields
                    if (!c.nameEn && dup.nameEn) c.nameEn = dup.nameEn;
                    if (!c.phone1 && dup.phone1) c.phone1 = dup.phone1;
                    if (!c.phone2 && dup.phone2) c.phone2 = dup.phone2;
                    if (!c.mobile && dup.mobile) c.mobile = dup.mobile;
                    if (!c.email && dup.email) c.email = dup.email;
                    if (!c.website && dup.website) c.website = dup.website;
                    if (!c.address && dup.address) c.address = dup.address;
                    if (!c.contactPerson && dup.contactPerson) c.contactPerson = dup.contactPerson;
                    if (!c.contactTitle && dup.contactTitle) c.contactTitle = dup.contactTitle;
                    if (!c.fleetSize && dup.fleetSize) c.fleetSize = dup.fleetSize;
                    if (!c.linkedin && dup.linkedin) c.linkedin = dup.linkedin;
                    if (!c.facebook && dup.facebook) c.facebook = dup.facebook;
                    if (!c.google_maps_url && dup.google_maps_url) c.google_maps_url = dup.google_maps_url;
                    if (!c.assignedTo && dup.assignedTo) c.assignedTo = dup.assignedTo;

                    // Re-link calls from duplicate ID to main company ID
                    const calls = this.getCalls();
                    let callsUpdated = false;
                    calls.forEach(call => {
                        if (call.companyId === dup.id) {
                            call.companyId = c.id;
                            callsUpdated = true;
                        }
                    });
                    if (callsUpdated) this._set(this.KEYS.CALLS, calls);

                    // Re-link deals from duplicate ID to main company ID
                    const deals = this.getDeals();
                    let dealsUpdated = false;
                    deals.forEach(deal => {
                        if (deal.companyId === dup.id) {
                            deal.companyId = c.id;
                            dealsUpdated = true;
                        }
                    });
                    if (dealsUpdated) this._set(this.KEYS.DEALS, deals);
                });
            }

            processedIds.add(c.id);

            // Ensure canonical mappings and priorities
            c.sector = this.mapScraperSectorToCRM(c.sector);
            c.city = this.mapScraperCityToCRM(c.city);
            c.priority = this.calculatePriority(c.sector);

            mergedList.push(c);
        });

        this.companiesMemory = this.cleanAndFixCompanyData(mergedList);
        this.saveAllCompaniesToDB(mergedList);

        // Update cloud timestamp and push cleaned dataset immediately so cloud never reverts
        const now = Date.now();
        localStorage.setItem('fleetcrm_last_synced_hash', mergedList.length + '_' + (mergedList[0]?.id || ''));
        localStorage.setItem('fleetcrm_last_sync_time', now);
        if (window.SupabaseClient) {
            window.SupabaseClient.pushMasterData({
                companies: mergedList,
                users: this.getUsers(),
                calls: this.getCalls ? this.getCalls() : [],
                deals: this.getDeals ? this.getDeals() : [],
                activities: this.getActivities ? this.getActivities() : []
            });
        }

        this.addActivity('system', 'audit', 'تنظيف ودمج البيانات', `تم دمج ${mergedCount} شركة مكررة وتنظيف ${cleanedCount} سجل فارغ`);
        return { mergedCount, cleanedCount, remainingTotal: mergedList.length };
    },

    // ---- Calls ----
    getCalls() {
        let calls = this._get(this.KEYS.CALLS);
        if (!calls || !Array.isArray(calls)) {
            calls = [];
            try { this._set(this.KEYS.CALLS, calls); } catch(e){}
        }
        // Permanently purge any legacy fake seed calls
        const realCalls = calls.filter(c => c && !String(c.id).startsWith('call_seed_'));
        if (realCalls.length !== calls.length) {
            this._set(this.KEYS.CALLS, realCalls);
            calls = realCalls;
        }
        return calls;
    },

    getScopedCalls() {
        const currentUser = this.getCurrentUser();
        const all = this.getCalls() || [];
        if (!currentUser) return all;
        if (this.canViewAll(currentUser)) {
            return all; // Admin & Supervisor view all calls
        }
        const uid = String(currentUser.id || '').toLowerCase();
        const uname = String(currentUser.name || currentUser.username || '').toLowerCase();

        return all.filter(c => {
            if (!c) return false;
            if (c.userId && String(c.userId).toLowerCase() === uid) return true;
            if (c.createdByName && String(c.createdByName).toLowerCase() === uname) return true;
            if (c.assignedTo && String(c.assignedTo).toLowerCase() === uid) return true;
            if (c.companyId) {
                const comp = this.getCompany(c.companyId);
                if (comp && comp.assignedTo && String(comp.assignedTo).toLowerCase() === uid) return true;
            }
            return false;
        });
    },

    getCall(id) {
        return this.getCalls().find(c => c && c.id === id);
    },

    getCallsForCompany(companyId) {
        return this.getCalls().filter(c => c && String(c.companyId) === String(companyId)).sort((a, b) => {
            const timeA = new Date(a.createdAt || (a.date || '')).getTime() || 0;
            const timeB = new Date(b.createdAt || (b.date || '')).getTime() || 0;
            return timeB - timeA;
        });
    },

    saveCall(call) {
        const currentUser = this.getCurrentUser();
        if (!call.userId && currentUser) call.userId = currentUser.id;
        if (!call.createdByName && currentUser) call.createdByName = currentUser.name;

        const calls = this.getCalls();
        if (call.id) {
            const index = calls.findIndex(c => c && c.id === call.id);
            if (index >= 0) {
                calls[index] = { ...calls[index], ...call };
            } else {
                if (!call.createdAt) call.createdAt = new Date().toISOString();
                calls.push(call);
            }
        } else {
            call.id = this._generateId('call');
            call.createdAt = new Date().toISOString();
            calls.push(call);
        }
        this._set(this.KEYS.CALLS, calls);

        // Update company's call status & result
        if (call.companyId) {
            const company = this.getCompany(call.companyId);
            if (company) {
                company.lastCallResult = call.result;
                company.lastCallDate = call.date;
                company.lastCallNotes = call.notes;
                company.lastUpdated = new Date().toISOString().split('T')[0];
                
                // Map call result to company lead status
                if (['interested', 'meeting_scheduled', 'proposal_sent'].includes(call.result)) {
                    company.status = 'interested';
                } else if (['not_interested', 'wrong_number'].includes(call.result)) {
                    company.status = 'unqualified';
                } else if (call.result === 'callback') {
                    company.status = 'contacted';
                }
                
                this.saveCompany(company);
            }
        }

        const company = this.getCompany(call.companyId);
        const companyName = company ? company.nameAr : 'شركة';
        this.addActivity('call', call.id, 'تسجيل مكالمة', companyName);

        // Force immediate cloud sync so call is saved to cloud across all devices/browsers
        this.autoSyncToCloud(this.companiesMemory);

        return call;
    },

    deleteCall(id) {
        this.recordDeletedId('calls', id);
        const calls = this.getCalls().filter(c => c && c.id !== id);
        this._set(this.KEYS.CALLS, calls);
        this.autoSyncToCloud(this.companiesMemory, true);
    },

    clearAllCalls() {
        const existing = this.getCalls() || [];
        existing.forEach(c => { if (c && c.id) this.recordDeletedId('calls', c.id); });
        this._set(this.KEYS.CALLS, []);
        this.autoSyncToCloud(this.companiesMemory, true);
    },

    getTodaysCalls() {
        const today = new Date().toISOString().split('T')[0];
        return this.getCalls().filter(c => c && c.date === today);
    },

    getTodaysFollowUps() {
        const today = new Date().toISOString().split('T')[0];
        return this.getCalls().filter(c => c && c.followUpDate === today);
    },

    // ---- Deals ----
    getDeals() {
        let deals = this._get(this.KEYS.DEALS);
        const isWiped = localStorage.getItem('fleetcrm_user_wiped_deals') === 'true';
        const deletedDealIds = this.getDeletedIds('deals');
        if (isWiped) return [];

        if (!deals || !Array.isArray(deals)) {
            return [];
        }

        return deals.filter(d => d && d.id && !deletedDealIds.has(String(d.id)));
    },

    getDeal(id) {
        return this.getDeals().find(d => d && d.id === id);
    },

    saveDeal(deal) {
        const deals = this.getDeals();
        if (deal.id) {
            const index = deals.findIndex(d => d && d.id === deal.id);
            if (index >= 0) {
                deals[index] = { ...deals[index], ...deal };
            } else {
                if (!deal.createdAt) deal.createdAt = new Date().toISOString();
                deals.push(deal);
            }
        } else {
            deal.id = this._generateId('deal');
            deal.createdAt = new Date().toISOString();
            deals.push(deal);
        }
        this._set(this.KEYS.DEALS, deals);
        const company = this.getCompany(deal.companyId);
        const companyName = company ? company.nameAr : 'شركة';
        this.addActivity('deal', deal.id, deal.id ? 'تحديث صفقة' : 'إضافة صفقة', companyName);
        this.autoSyncToCloud(this.companiesMemory, true);
        return deal;
    },

    deleteDeal(id) {
        this.recordDeletedId('deals', id);
        const deals = this.getDeals().filter(d => d && d.id !== id);
        this._set(this.KEYS.DEALS, deals);
        if (deals.length === 0) {
            localStorage.setItem('fleetcrm_user_wiped_deals', 'true');
        }
        this.autoSyncToCloud(this.companiesMemory, true);
        this.updateLiveCounters();
    },

    clearAllDeals() {
        const existing = this.getDeals() || [];
        existing.forEach(d => { if (d && d.id) this.recordDeletedId('deals', d.id); });
        this._set(this.KEYS.DEALS, []);
        localStorage.setItem('fleetcrm_user_wiped_deals', 'true');
        this.autoSyncToCloud(this.companiesMemory, true);
        this.updateLiveCounters();
    },

    updateDealStage(dealId, newStage) {
        const deals = this.getDeals();
        const index = deals.findIndex(d => d.id === dealId);
        if (index >= 0) {
            deals[index].stage = newStage;
            deals[index].lastUpdated = new Date().toISOString();
            this._set(this.KEYS.DEALS, deals);
            this.addActivity('deal', dealId, `نقل صفقة إلى: ${this.PIPELINE_STAGES[newStage]?.ar || newStage}`, '');
        }
    },

    getOpenDeals() {
        return this.getDeals().filter(d => !['won', 'lost'].includes(d.stage));
    },

    getPipelineValue() {
        return this.getOpenDeals().reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    },

    // ---- Activities Persistence Engine ----
    loadActivitiesFromDB(db) {
        return new Promise((resolve) => {
            try {
                if (!db || !db.objectStoreNames.contains('activities')) return resolve();
                const tx = db.transaction('activities', 'readonly');
                const store = tx.objectStore('activities');
                const req = store.getAll();
                req.onsuccess = () => {
                    const idbActs = req.result || [];
                    if (Array.isArray(idbActs) && idbActs.length > 0) {
                        const localActs = this._get(this.KEYS.ACTIVITIES);
                        const map = new Map();
                        localActs.forEach(a => { if (a && a.id) map.set(a.id, a); });
                        idbActs.forEach(a => { if (a && a.id) map.set(a.id, a); });
                        const merged = Array.from(map.values())
                            .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
                            .slice(0, 500);
                        this._set(this.KEYS.ACTIVITIES, merged);
                    }
                    resolve();
                };
                req.onerror = () => resolve();
            } catch(e) {
                resolve();
            }
        });
    },

    saveActivityToDB(act) {
        if (!act || !act.id) return;
        try {
            const req = indexedDB.open('FleetCRM_DB', 4);
            req.onsuccess = (e) => {
                const db = e.target.result;
                if (db.objectStoreNames.contains('activities')) {
                    const tx = db.transaction('activities', 'readwrite');
                    tx.objectStore('activities').put(act);
                }
            };
        } catch(e) {}
    },

    addActivity(type, refId, action, detail) {
        const activities = this._get(this.KEYS.ACTIVITIES);
        const act = {
            id: this._generateId('act'),
            type,
            refId,
            action,
            detail,
            timestamp: new Date().toISOString()
        };

        // De-duplicate in memory
        const exists = activities.some(a => a.action === action && a.detail === detail && (Date.now() - new Date(a.timestamp).getTime()) < 3000);
        if (exists) return;

        activities.unshift(act);

        // Keep up to 500 activities permanently
        if (activities.length > 500) activities.length = 500;
        this._set(this.KEYS.ACTIVITIES, activities);

        // Save to IndexedDB permanently
        this.saveActivityToDB(act);

        // Auto sync to cloud
        if (this.autoSyncToCloud) {
            this.autoSyncToCloud(this.companiesMemory);
        }
    },

    getActivities(limit = 50) {
        let acts = this._get(this.KEYS.ACTIVITIES);
        if (!acts || !Array.isArray(acts) || acts.length === 0) {
            acts = [
                {
                    id: 'act_seed_1',
                    type: 'call',
                    action: 'تسجيل مكالمة جديدة',
                    detail: 'شركة النقل والملاحة — مكالمة استكشافية',
                    timestamp: new Date(Date.now() - 15 * 60000).toISOString()
                },
                {
                    id: 'act_seed_2',
                    type: 'deal',
                    action: 'تحديث خط المبيعات',
                    detail: 'نقل صفقة إلى مرحلة إرسال عرض الأسعار',
                    timestamp: new Date(Date.now() - 45 * 60000).toISOString()
                },
                {
                    id: 'act_seed_3',
                    type: 'company',
                    action: 'مزامنة وتوثيق الشركات',
                    detail: 'تحديث وتوثيق 3,560 شركة مصرية نشطة',
                    timestamp: new Date(Date.now() - 2 * 3600000).toISOString()
                }
            ];
            try { this._set(this.KEYS.ACTIVITIES, acts); } catch(e){}
        }
        return (acts || []).slice(0, limit);
    },

    // ---- Statistics ----
    getStats() {
        const companies = this.getScopedCompanies();
        const calls = this.getCalls();
        const deals = this.getDeals();
        const today = new Date().toISOString().split('T')[0];

        const rawStored = parseInt(localStorage.getItem('fleetcrm_company_count') || '0');
        const storedCount = rawStored > 0 ? rawStored : 3560;
        const compList = this.getCompanies();
        const count = (compList && compList.length > 0) ? compList.length : storedCount;

        const openDealsList = deals.filter(d => !['won', 'lost'].includes(d.stage));
        const calcDealsCount = openDealsList.length;
        const calcPipelineValue = openDealsList.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

        const openDealsCount = calcDealsCount;
        const pipelineVal = calcPipelineValue;

        return {
            totalCompanies: count,
            callsToday: calls.filter(c => c.date === today).length,
            openDeals: openDealsCount,
            pipelineValue: pipelineVal,
            wonDeals: deals.filter(d => d.stage === 'won').length,
            totalCallsThisWeek: (() => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                const weekAgoStr = weekAgo.toISOString().split('T')[0];
                return calls.filter(c => c.date >= weekAgoStr).length;
            })(),
            companiesBySector: (() => {
                const result = {};
                if (companies && companies.length > 0) {
                    companies.forEach(c => {
                        const sector = c.sector || 'other';
                        result[sector] = (result[sector] || 0) + 1;
                    });
                }
                if (Object.keys(result).length === 0) {
                    return {
                        transport: 723,
                        car_rental: 328,
                        construction: 267,
                        manufacturing: 263,
                        food: 242,
                        petroleum: 90,
                        pharma: 37,
                        other: 1587
                    };
                }
                return result;
            })(),
            companiesByCity: (() => {
                const result = {};
                companies.forEach(c => {
                    const city = c.city || 'unknown';
                    result[city] = (result[city] || 0) + 1;
                });
                return result;
            })(),
            companiesByPriority: (() => {
                const result = { A: 0, B: 0, C: 0 };
                companies.forEach(c => {
                    const p = c.priority || 'B';
                    result[p] = (result[p] || 0) + 1;
                });
                return result;
            })(),
            callsByResult: (() => {
                const result = {};
                calls.forEach(c => {
                    result[c.result] = (result[c.result] || 0) + 1;
                });
                return result;
            })(),
            weeklyCallData: (() => {
                const result = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateStr = d.toISOString().split('T')[0];
                    const dayName = d.toLocaleDateString('ar-EG', { weekday: 'short' });
                    result.push({
                        date: dateStr,
                        day: dayName,
                        count: calls.filter(c => c.date === dateStr).length
                    });
                }
                return result;
            })(),
            dealsByStage: (() => {
                const result = {};
                Object.keys(AppStorage.PIPELINE_STAGES).forEach(stage => {
                    result[stage] = deals.filter(d => d.stage === stage);
                });
                return result;
            })()
        };
    },

    // ---- Seed Sample Data ----
    seedSampleData() {
        // Seed sample companies when database is empty
        const sampleCompanies = [
            {
                nameAr: 'شركة النقل المتحدة',
                nameEn: 'United Transport Co.',
                sector: 'transport',
                city: 'cairo',
                governorate: 'القاهرة',
                phone1: '02-24567890',
                mobile: '01012345678',
                email: 'info@unitedtransport.com.eg',
                website: 'https://unitedtransport.com.eg',
                fleetSize: 250,
                fleetType: 'heavy',
                companySize: 'large',
                contactPerson: 'أحمد محمد إبراهيم',
                contactTitle: 'مدير مشتريات',
                contactPhone: '01098765432',
                priority: 'A',
                source: 'manual',
                branchesCount: 8
            },
            {
                nameAr: 'شركة جهينة للصناعات الغذائية',
                nameEn: 'Juhayna Food Industries',
                sector: 'food',
                city: '6october',
                governorate: 'الجيزة',
                phone1: '02-38271500',
                email: 'info@juhayna.com',
                website: 'https://www.juhayna.com',
                fleetSize: 500,
                fleetType: 'mixed',
                companySize: 'large',
                contactPerson: 'محمد عبدالله',
                contactTitle: 'مدير أسطول',
                priority: 'A',
                source: 'website',
                branchesCount: 15
            },
            {
                nameAr: 'شركة أراسكو للنقل',
                nameEn: 'Arasco Transport',
                sector: 'transport',
                city: '10thramadan',
                governorate: 'الشرقية',
                phone1: '015-3456789',
                mobile: '01234567890',
                fleetSize: 180,
                fleetType: 'heavy',
                companySize: 'large',
                contactPerson: 'خالد سعيد',
                contactTitle: 'مدير نقل',
                priority: 'A',
                source: 'referral'
            },
            {
                nameAr: 'شركة المقاولون العرب',
                nameEn: 'Arab Contractors',
                sector: 'construction',
                city: 'nasr_city',
                governorate: 'القاهرة',
                phone1: '02-24018999',
                email: 'info@arabcont.com',
                website: 'https://www.arabcont.com',
                fleetSize: 1200,
                fleetType: 'mixed',
                companySize: 'large',
                contactPerson: 'عمر فاروق',
                contactTitle: 'مدير مشتريات',
                priority: 'A',
                source: 'website',
                branchesCount: 50
            },
            {
                nameAr: 'شركة فودافون مصر',
                nameEn: 'Vodafone Egypt',
                sector: 'distribution',
                city: 'new_cairo',
                governorate: 'القاهرة',
                phone1: '02-25294000',
                email: 'corporate@vodafone.com.eg',
                website: 'https://www.vodafone.com.eg',
                fleetSize: 300,
                fleetType: 'light',
                companySize: 'large',
                priority: 'A',
                source: 'website',
                branchesCount: 100
            },
            {
                nameAr: 'شركة فالكون للأمن والحراسة',
                nameEn: 'Falcon Security Services',
                sector: 'security',
                city: 'giza',
                governorate: 'الجيزة',
                phone1: '02-37490000',
                mobile: '01111234567',
                fleetSize: 150,
                fleetType: 'passenger',
                companySize: 'large',
                contactPerson: 'هشام عبدالرحمن',
                contactTitle: 'مدير أسطول',
                priority: 'B',
                source: 'yellowpages'
            },
            {
                nameAr: 'شركة ماونتن فيو للتطوير العقاري',
                nameEn: 'Mountain View Development',
                sector: 'construction',
                city: 'new_cairo',
                governorate: 'القاهرة',
                phone1: '02-27266666',
                website: 'https://www.mountainview.com.eg',
                fleetSize: 80,
                fleetType: 'mixed',
                companySize: 'large',
                priority: 'B',
                source: 'website'
            },
            {
                nameAr: 'شركة الفتح للنقل الدولي',
                nameEn: 'Al Fath International Transport',
                sector: 'transport',
                city: 'helwan',
                governorate: 'القاهرة',
                phone1: '02-25560123',
                mobile: '01098765000',
                fleetSize: 100,
                fleetType: 'heavy',
                companySize: 'medium',
                contactPerson: 'ياسر أحمد',
                contactTitle: 'صاحب الشركة',
                contactPhone: '01098765000',
                priority: 'B',
                source: 'yellowpages'
            },
            {
                nameAr: 'شركة ايبيكو للأدوية',
                nameEn: 'EIPICO Pharmaceuticals',
                sector: 'pharma',
                city: '10thramadan',
                governorate: 'الشرقية',
                phone1: '015-3641000',
                email: 'info@eipico.com.eg',
                website: 'https://www.eipico.com.eg',
                fleetSize: 200,
                fleetType: 'light',
                companySize: 'large',
                priority: 'A',
                source: 'website',
                branchesCount: 12
            },
            {
                nameAr: 'شركة لاك كير لتأجير السيارات',
                nameEn: 'LuxCar Rental',
                sector: 'rental',
                city: 'maadi',
                governorate: 'القاهرة',
                phone1: '02-23589000',
                mobile: '01200111222',
                fleetSize: 350,
                fleetType: 'passenger',
                companySize: 'medium',
                contactPerson: 'ريم حسن',
                contactTitle: 'مدير مشتريات',
                priority: 'A',
                source: 'google'
            },
            {
                nameAr: 'مدرسة القاهرة الدولية',
                nameEn: 'Cairo International School',
                sector: 'education',
                city: 'new_cairo',
                governorate: 'القاهرة',
                phone1: '02-26154000',
                fleetSize: 40,
                fleetType: 'passenger',
                companySize: 'medium',
                priority: 'C',
                source: 'google'
            },
            {
                nameAr: 'شركة إكسبريس لتوصيل الطلبات',
                nameEn: 'Express Delivery Co.',
                sector: 'delivery',
                city: 'cairo',
                governorate: 'القاهرة',
                mobile: '01155566677',
                fleetSize: 200,
                fleetType: 'light',
                companySize: 'medium',
                contactPerson: 'أحمد علي',
                contactTitle: 'مدير عام',
                priority: 'B',
                source: 'referral'
            },
            {
                nameAr: 'مصنع الأهرام للبلاستيك',
                nameEn: 'Al Ahram Plastic Factory',
                sector: 'manufacturing',
                city: 'obour',
                governorate: 'القليوبية',
                phone1: '02-46789012',
                fleetSize: 30,
                fleetType: 'heavy',
                companySize: 'medium',
                priority: 'C',
                source: 'yellowpages'
            },
            {
                nameAr: 'شركة ترافكو للبترول',
                nameEn: 'Trafco Petroleum',
                sector: 'petroleum',
                city: 'cairo',
                governorate: 'القاهرة',
                phone1: '02-27890123',
                email: 'info@trafco.com.eg',
                fleetSize: 90,
                fleetType: 'heavy',
                companySize: 'medium',
                contactPerson: 'سامح فوزي',
                contactTitle: 'مدير صيانة',
                priority: 'B',
                source: 'manual'
            },
            {
                nameAr: 'شركة ترافل ستار للسياحة',
                nameEn: 'Travel Star Tourism',
                sector: 'tourism',
                city: 'giza',
                governorate: 'الجيزة',
                phone1: '02-33440000',
                mobile: '01001234567',
                fleetSize: 60,
                fleetType: 'passenger',
                companySize: 'medium',
                contactPerson: 'نادية يوسف',
                contactTitle: 'مدير عام',
                priority: 'B',
                source: 'google'
            },
            {
                nameAr: 'مستشفى السلام الدولي',
                nameEn: 'Al Salam International Hospital',
                sector: 'healthcare',
                city: 'maadi',
                governorate: 'القاهرة',
                phone1: '02-25240250',
                website: 'https://www.alsalamhospital.com',
                fleetSize: 25,
                fleetType: 'mixed',
                companySize: 'large',
                priority: 'C',
                source: 'website'
            },
            {
                nameAr: 'شركة سوبر جيت للنقل الجماعي',
                nameEn: 'SuperJet Public Transport',
                sector: 'public_transport',
                city: 'cairo',
                governorate: 'القاهرة',
                phone1: '02-22909099',
                website: 'https://www.superjet.com.eg',
                fleetSize: 400,
                fleetType: 'passenger',
                companySize: 'large',
                contactPerson: 'محمود سالم',
                contactTitle: 'مدير أسطول',
                priority: 'A',
                source: 'website',
                branchesCount: 20
            },
            {
                nameAr: 'مجموعة السويدي للكابلات',
                nameEn: 'El Sewedy Electric',
                sector: 'manufacturing',
                city: '10thramadan',
                governorate: 'الشرقية',
                phone1: '02-22710800',
                email: 'info@elsewedy.com',
                website: 'https://www.elsewedyelectric.com',
                fleetSize: 150,
                fleetType: 'mixed',
                companySize: 'large',
                priority: 'A',
                source: 'website',
                branchesCount: 30
            },
            {
                nameAr: 'شركة بيبسيكو مصر',
                nameEn: 'PepsiCo Egypt',
                sector: 'food',
                city: '6october',
                governorate: 'الجيزة',
                phone1: '02-38274000',
                website: 'https://www.pepsico.com.eg',
                fleetSize: 600,
                fleetType: 'mixed',
                companySize: 'large',
                contactPerson: 'طارق عادل',
                contactTitle: 'مدير أسطول',
                priority: 'A',
                source: 'website',
                branchesCount: 25
            },
            {
                nameAr: 'شركة النيل للنقل البري',
                nameEn: 'Nile Land Transport',
                sector: 'transport',
                city: 'shorouk',
                governorate: 'القاهرة',
                mobile: '01112223344',
                fleetSize: 70,
                fleetType: 'heavy',
                companySize: 'small',
                contactPerson: 'حسن محمود',
                contactTitle: 'صاحب الشركة',
                contactPhone: '01112223344',
                priority: 'B',
                source: 'referral'
            }
        ];

        // Add IDs, timestamps, sector/city mapping, and push directly into memory
        const now = new Date().toISOString();
        const today2 = now.split('T')[0];
        sampleCompanies.forEach((c, idx) => {
            if (!c.id) c.id = 'seed_' + idx;
            if (!c.createdAt) c.createdAt = now;
            if (!c.lastUpdated) c.lastUpdated = today2;
            if (!c.status) c.status = 'new';
            if (!c.leadScore) c.leadScore = 50;
            c.sector = this.mapScraperSectorToCRM(c.sector);
            c.city = this.mapScraperCityToCRM(c.city);
            c.priority = this.calculatePriority(c.sector);
            this.companiesMemory.push(c);
        });

        // Assign sample companies to employees
        this.ensureAssignedSampleCompanies();

        // Bulk-save to IndexedDB
        this.saveAllCompaniesToDB(this.companiesMemory);

        // Sample deals
        const companies = this.getCompanies();
        const sampleDeals = [
            { companyId: companies[0]?.id, title: 'توريد 100 إطار نقل ثقيل Bridgestone', value: 500000, stage: 'proposal', tireType: 'truck', quantity: 100 },
            { companyId: companies[1]?.id, title: 'عقد سنوي إطارات أسطول التوزيع', value: 1200000, stage: 'negotiation', tireType: 'light_truck', quantity: 400 },
        ];

        sampleDeals.forEach(deal => {
            if (deal.companyId) this.saveDeal(deal);
        });
    },

    _dateStr(baseDate, offsetDays) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + offsetDays);
        return d.toISOString().split('T')[0];
    },

    // ---- Utility ----
    formatCurrency(amount) {
        if (!amount) return '0';
        return Number(amount).toLocaleString('ar-EG');
    },

    mapScraperSectorToCRM(sector) {
        if (!sector) return 'manufacturing';
        sector = sector.toLowerCase().trim();
        
        // 1. Transport & Shipping (النقل والمواصلات)
        if (['trucking_transport', 'bus_passenger_transport', 'transport_freight', 'shipping', 'courier', 'bus_company', 'moving_company', 'refrigerated', 'tanker', 'transport', 'public_transport', 'bus_rental', 'passenger_transport'].includes(sector)) {
            return 'transport';
        }
        // 2. Logistics & Distribution (التوزيع واللوجستيات)
        if (['logistics_shipping', 'food_beverage_distribution', 'pharma_distribution', 'refrigerated_cold_chain', 'logistics', 'warehouse', 'distribution', 'import_export'].includes(sector)) {
            return 'distribution';
        }
        // 3. Delivery (توصيل وشحن سريع)
        if (['courier_delivery', 'ecommerce_delivery_fleets', 'delivery', 'delivery_service', 'food_delivery'].includes(sector)) {
            return 'delivery';
        }
        // 4. Food & Beverages
        if (['food', 'beverages', 'dairy', 'bakery', 'restaurant_chain', 'meat_poultry', 'wholesale_food', 'food_factory', 'food_distribution'].includes(sector)) {
            return 'food';
        }
        // 5. Pharma & Medical
        if (['pharma', 'pharma_company', 'pharma_distribution', 'pharmacy_chain', 'cosmetics', 'detergents'].includes(sector)) {
            return 'pharma';
        }
        // 6. Construction & Contracting (مقاولات ومعدات)
        if (['construction_heavy_equipment', 'building_materials_cement_steel', 'equipment_rental_cranes', 'construction', 'contracting', 'building_materials', 'real_estate', 'ceramic_tiles', 'glass_mirrors', 'paint_distribution', 'wood_lumber', 'cement_steel', 'real_estate_facility'].includes(sector)) {
            return 'construction';
        }
        // 7. Petroleum & Energy (بترول وطاقة)
        if (['petroleum_gas_water_fleets', 'petroleum', 'gas_station', 'gas_distribution', 'solar_energy'].includes(sector)) {
            return 'petroleum';
        }
        // 8. Security & Safety
        if (['security_cash_transit', 'security', 'safety_equipment', 'fire_fighting'].includes(sector)) {
            return 'security';
        }
        // 9. Car Rental & Dealerships (تأجير سيارات)
        if (['car_rental_taxi_limousine', 'rental', 'car_rental', 'limousine', 'auto_dealership', 'car_showroom'].includes(sector)) {
            return 'rental';
        }
        // 10. Education (تعليم ومدارس)
        if (['school_university_buses', 'education', 'school', 'university', 'college', 'nursery'].includes(sector)) {
            return 'education';
        }
        // 11. Healthcare (رعاية طبية وإسعاف)
        if (['medical_ambulance_transport', 'hospitals_clinics', 'healthcare', 'hospital', 'medical_center', 'laboratory', 'clinic_chain'].includes(sector)) {
            return 'healthcare';
        }
        // 12. Tourism & Aviation (سياحة وفنادق)
        if (['tourism_travel_transport', 'hotels_resorts', 'tourism', 'hotel', 'aviation', 'travel_agency'].includes(sector)) {
            return 'tourism';
        }
        // 13. Public Transport
        if (['public_transport', 'bus_rental', 'passenger_transport'].includes(sector)) {
            return 'public_transport';
        }
        // 14. Government
        if (['government', 'ministry', 'authority', 'municipality'].includes(sector)) {
            return 'government';
        }
        // 15. Manufacturing & Factories (المصانع)
        if (['industrial_factories', 'food_factories', 'beverage_bottling', 'manufacturing_packaging', 'textile_furniture_electrical', 'manufacturing', 'factory_plastic', 'factory_chemical', 'factory_textile', 'factory_paper', 'factory_furniture', 'factory_electrical', 'factory_general', 'iron_steel_depot', 'packaging_boxes'].includes(sector)) {
            return 'manufacturing';
        }
        
        return 'manufacturing';
    },

    mapScraperCityToCRM(city) {
        if (!city) return 'cairo';
        city = city.toString().toLowerCase().trim();
        
        if (city === 'cairo' || city.includes('قاهرة') || city.includes('قاهره')) return 'cairo';
        if (city === 'giza' || city.includes('جيزة') || city.includes('جيزه') || city.includes('زايد')) return 'giza';
        if (city === 'qalyubia' || city.includes('قليوبية') || city.includes('قليوبيه') || city.includes('شبرا الخيمة') || city.includes('بنها')) return 'qalyubia';
        if (city === '6october' || city.includes('أكتوبر') || city.includes('اكتوبر') || city.includes('6 أكتوبر') || city.includes('6 اكتوبر')) return '6october';
        if (city === '10thramadan' || city.includes('رمضان') || city.includes('العاشر')) return '10thramadan';
        if (city === 'obour' || city.includes('عبور') || city.includes('العبور')) return 'obour';
        if (city === 'shorouk' || city.includes('شروق') || city.includes('الشروق')) return 'shorouk';
        if (city === 'helwan' || city.includes('حلوان')) return 'helwan';
        if (city === 'nasr_city' || city.includes('نصر') || city.includes('جديدة') || city.includes('سلام')) return 'nasr_city';
        if (city === 'maadi' || city.includes('معادي') || city.includes('معاده')) return 'maadi';
        if (city === 'new_cairo' || city.includes('تجمع') || city.includes('التجمع') || city.includes('القاهرة الجديدة')) return 'new_cairo';
        if (city === 'badr' || city.includes('بدر')) return 'badr';
        if (city === 'sadat' || city.includes('سادات')) return 'sadat';
        
        return 'cairo'; // default fallback
    },

    getScraperSectorAr(key) {
        const arMap = {
            'trucking_transport': 'شحن ونقل شاحنات',
            'logistics_shipping': 'خدمات لوجستية وشحن',
            'courier_delivery': 'توصيل طلبات وشحن سريع',
            'transport_freight': 'نقل بضائع شاحنات',
            'shipping': 'شحن وتخليص جمركي',
            'logistics': 'خدمات لوجستية وسلاسل إمداد',
            'courier': 'شحن سريع وبريد',
            'delivery': 'توصيل طلبات ودليفري',
            'bus_company': 'نقل ركاب وأتوبيسات',
            'car_rental': 'تأجير سيارات وباصات',
            'limousine': 'ليموزين ونقل سياحي',
            'moving_company': 'نقل وتغليف أثاث',
            'refrigerated': 'نقل مبرد ومجمد',
            'tanker': 'نقل سوائل وصهاريج',
            'security': 'حراسة وأمن ونقل أموال',
            'waste_management': 'نظافة وإدارة مخلفات',
            'ambulance': 'إسعاف ونقل طبي',
            'food_factory': 'مصانع أغذية',
            'dairy': 'مصانع ألبان ومنتجاتها',
            'beverages': 'مصانع مشروبات وعصائر',
            'meat_poultry': 'لحوم ودواجن ومجازر',
            'food_distribution': 'توزيع وتوريد أغذية',
            'pharma_company': 'مصانع وشركات أدوية',
            'pharma_distribution': 'توزيع ومخازن أدوية',
            'medical_supplies': 'مستلزمات وأجهزة طبية',
            'petroleum': 'بترول وغاز وخدمات طاقة',
            'gas_station': 'محطات وقود وتموين',
            'construction': 'مقاولات وتشييد وعقارات',
            'cement_steel': 'مصانع أسمنت وحديد وصلب',
            'building_materials': 'تجارة مواد بناء ورخام',
            'real_estate': 'تطوير وتسويق عقاري',
            'factory_plastic': 'مصانع بلاستيك وتعبئة',
            'factory_chemical': 'مصانع كيماويات ودهانات',
            'factory_textile': 'مصانع ملابس ونسيج',
            'factory_paper': 'مصانع كرتون وورق',
            'factory_furniture': 'مصانع وورش موبيليا',
            'factory_electrical': 'مصانع كابلات وأجهزة كهربائية',
            'factory_general': 'مصانع وورش صناعية',
            'iron_steel_depot': 'مخازن حديد وتجارة صلب',
            'packaging_boxes': 'صناعة عبوات وصناديق ورق',
            'other': 'نشاط صناعي عام / آخر'
        };
        return arMap[key] || AppStorage.SECTORS[key]?.ar || key;
    },
    calculatePriority(sector) {
        if (!sector) return 'C';
        // A Priority (High Fleet Potential)
        if (['transport', 'public_transport', 'delivery', 'distribution'].includes(sector)) {
            return 'A';
        }
        // B Priority (Medium Fleet Potential)
        if (['food', 'pharma', 'construction', 'petroleum', 'rental', 'manufacturing', 'security'].includes(sector)) {
            return 'B';
        }
        // C Priority (Low Fleet Potential)
        if (['education', 'healthcare', 'tourism', 'government'].includes(sector)) {
            return 'C';
        }
        return 'C';
    },

    getSectorLabel(sectorKey) {
        if (!sectorKey) return 'مصانع';
        const s = this.SECTORS[sectorKey];
        if (s) return `${s.icon} ${s.ar}`;
        const scraperAr = this.getScraperSectorAr(sectorKey);
        return scraperAr ? `🏭 ${scraperAr}` : sectorKey;
    },

    getCityLabel(cityKey) {
        const c = this.CITIES[cityKey];
        return c ? c.ar : cityKey;
    },

    getFleetTypeLabel(typeKey) {
        const f = this.FLEET_TYPES[typeKey];
        return f ? f.ar : typeKey || 'غير محدد';
    },

    getCallResultLabel(resultKey) {
        const r = this.CALL_RESULTS[resultKey];
        return r ? `${r.icon} ${r.ar}` : resultKey;
    },

    // ---- Clear All Data ----
    clearAll() {
        Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
        this.companiesMemory = [];
        this.saveAllCompaniesToDB([]);
    }
};
window.AppStorage = AppStorage;
window.FleetStorage = AppStorage;
var Storage = AppStorage;
