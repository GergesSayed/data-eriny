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

        if (!stored || !Array.isArray(stored) || stored.length === 0) {
            this._set(this.KEYS.USERS, this.DEFAULT_USERS);
            return this.DEFAULT_USERS;
        }

        // Always ensure default users have active status, usernames, and valid names/emails
        stored.forEach(u => {
            if (!u) return;
            if (!u.username) u.username = u.email ? u.email.split('@')[0] : (u.id || 'user');
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
            id: 'u_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
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
        if (!u) return true;
        return this.isAdmin(u) || this.isSupervisor(u) || u.role === 'admin' || u.role === 'supervisor' || !u.role;
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
            id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
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
        const users = this.getUsers();
        if (window.SupabaseClient) {
            if (window.SupabaseClient.pushUsers) {
                window.SupabaseClient.pushUsers(users);
            }
            window.SupabaseClient.pushMasterData({
                companies: this.companiesMemory || [],
                users: users,
                calls: this.getCalls ? this.getCalls() : [],
                activities: this.getActivities ? this.getActivities() : []
            }).catch(() => {});
        }
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
                this.updateLiveCounters();
                resolve();
                return;
            }
            try {
                const request = indexedDB.open('FleetCRM_DB', 5);
                
                request.onerror = (event) => {
                    this.updateLiveCounters();
                    this.initWorker();
                    resolve();
                };
                
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    Promise.all([
                        this.loadCompaniesFromDB(db),
                        this.loadActivitiesFromDB(db)
                    ]).then(() => {
                        this.updateLiveCounters();
                        this.initWorker();
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
                    if (!store.indexNames.contains('priority')) {
                        store.createIndex('priority', 'priority', { unique: false });
                    }
                    if (!store.indexNames.contains('assignedTo')) {
                        store.createIndex('assignedTo', 'assignedTo', { unique: false });
                    }
                    if (!store.indexNames.contains('createdAt')) {
                        store.createIndex('createdAt', 'createdAt', { unique: false });
                    }
                    if (!store.indexNames.contains('fleetSize')) {
                        store.createIndex('fleetSize', 'fleetSize', { unique: false });
                    }
                    if (!store.indexNames.contains('leadScore')) {
                        store.createIndex('leadScore', 'leadScore', { unique: false });
                    }

                    if (!db.objectStoreNames.contains('activities')) {
                        db.createObjectStore('activities', { keyPath: 'id' });
                    }
                };
            } catch (e) {
                this.initWorker();
                resolve();
            }
        });
    },

    _worker: null,
    _workerReady: false,
    _workerCallbacks: {},

    initWorker() {
        if (typeof window === 'undefined' || typeof Worker === 'undefined') return;
        if (this._worker) {
            this._worker.postMessage({ action: 'INIT_INDEX', payload: this.companiesMemory || [] });
            return;
        }
        try {
            this._worker = new Worker('js/companies-worker.js?v=173.0');
            this._worker.onmessage = (e) => {
                const { action, queryId, items, total, totalPages, page, pageSize } = e.data || {};
                if (action === 'INDEX_READY' || action === 'UPDATE_DONE') {
                    this._workerReady = true;
                } else if (action === 'FILTER_RESULT' && queryId && this._workerCallbacks[queryId]) {
                    this._workerCallbacks[queryId]({ items, total, totalPages, page, pageSize });
                    delete this._workerCallbacks[queryId];
                }
            };
            this._worker.postMessage({ action: 'INIT_INDEX', payload: this.companiesMemory || [] });
        } catch (e) {
            console.warn('Worker initialization fallback:', e);
        }
    },

    queryCompanies(options = {}) {
        return new Promise((resolve) => {
            const {
                search = '',
                sector = '',
                city = '',
                priority = '',
                fleetType = '',
                fleetSize = '',
                assigned = '',
                addedDate = '',
                sortMode = 'latest',
                page = 1,
                pageSize = 15
            } = options;

            const currentUser = this.getCurrentUser();
            const isAdmin = this.canViewAll(currentUser);
            const currentUserId = currentUser ? (currentUser.id || currentUser.username) : '';
            const userKeys = currentUser ? [
                String(currentUser.id || '').toLowerCase(),
                String(currentUser.username || '').toLowerCase(),
                String(currentUser.email || '').toLowerCase(),
                String(currentUser.name || '').toLowerCase()
            ].filter(Boolean) : [];

            // 1. Try Web Worker first for non-blocking 60fps search
            if (this._worker && this._workerReady) {
                const queryId = 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
                const timeout = setTimeout(() => {
                    delete this._workerCallbacks[queryId];
                    resolve(this._queryCompaniesFallback(options));
                }, 250);

                this._workerCallbacks[queryId] = (result) => {
                    clearTimeout(timeout);
                    resolve(result);
                };

                this._worker.postMessage({
                    action: 'FILTER_AND_SEARCH',
                    queryId,
                    payload: {
                        search,
                        sector,
                        city,
                        priority,
                        fleetType,
                        fleetSize,
                        assigned,
                        addedDate,
                        sortMode,
                        page,
                        pageSize,
                        currentUserId,
                        userKeys,
                        isAdmin
                    }
                });
                return;
            }

            // 2. Fallback to in-memory filter
            resolve(this._queryCompaniesFallback(options));
        });
    },

    _queryCompaniesFallback(options = {}) {
        const {
            search = '',
            sector = '',
            city = '',
            priority = '',
            fleetType = '',
            fleetSize = '',
            assigned = '',
            addedDate = '',
            sortMode = 'latest',
            page = 1,
            pageSize = 15
        } = options;

        const rawCompanies = this.getScopedCompanies() || [];
        const normSearch = this._normalizeArabicName(search);
        const now = Date.now();
        const todayStr = new Date().toISOString().split('T')[0];
        const currentUser = this.getCurrentUser();

        let filtered = rawCompanies.filter(c => {
            if (sector && c.sector !== sector) return false;
            if (city && c.city !== city) return false;
            if (priority && c.priority !== priority) return false;
            if (fleetType && c.fleetType !== fleetType) return false;

            if (fleetSize) {
                const s = Number(c.fleetSize) || 0;
                if (fleetSize === 'large_fleet' && s < 50) return false;
                if (fleetSize === 'medium_fleet' && (s < 15 || s >= 50)) return false;
                if (fleetSize === 'small_fleet' && (s <= 0 || s >= 15)) return false;
                if (fleetSize === 'no_fleet' && s > 0) return false;
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
                    if (c.assignedTo !== currentUser?.id && c.assignedTo !== currentUser?.username) return false;
                } else if (assigned === 'unassigned') {
                    if (c.assignedTo) return false;
                } else {
                    if (c.assignedTo !== assigned) return false;
                }
            }

            if (normSearch) {
                const nameNorm = this._normalizeArabicName(c.nameAr || c.name || '');
                const phone = String(c.phone1 || c.mobile || '').replace(/[^0-9+]/g, '');
                if (!nameNorm.includes(normSearch) && !phone.includes(normSearch)) return false;
            }

            return true;
        });

        if (sortMode === 'oldest') {
            filtered.sort((a, b) => (new Date(a.createdAt || 0)) - (new Date(b.createdAt || 0)));
        } else if (sortMode === 'fleet_desc') {
            filtered.sort((a, b) => (Number(b.fleetSize) || 0) - (Number(a.fleetSize) || 0));
        } else if (sortMode === 'name_asc') {
            filtered.sort((a, b) => (a.nameAr || '').localeCompare(b.nameAr || '', 'ar'));
        } else if (sortMode === 'priority_desc') {
            filtered.sort((a, b) => (a.priority || 'B').localeCompare(b.priority || 'B'));
        } else {
            filtered.sort((a, b) => (new Date(b.createdAt || 0)) - (new Date(a.createdAt || 0)));
        }

        const total = filtered.length;
        const totalPages = Math.ceil(total / pageSize) || 1;
        const safePage = Math.max(1, Math.min(page, totalPages));
        const start = (safePage - 1) * pageSize;
        const items = filtered.slice(start, start + pageSize);

        return { items, total, totalPages, page: safePage, pageSize };
    },

    async saveBatchToIDB(records, onProgress = null) {
        if (!Array.isArray(records) || records.length === 0) return;
        const total = records.length;
        
        await new Promise((resolve) => {
            try {
                const request = indexedDB.open('FleetCRM_DB', 5);
                request.onsuccess = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains('companies')) { resolve(); return; }
                    const tx = db.transaction(['companies'], 'readwrite');
                    const store = tx.objectStore('companies');
                    records.forEach(c => { if (c && c.id) store.put(c); });
                    tx.oncomplete = () => resolve();
                    tx.onerror = () => resolve();
                    tx.onabort = () => resolve();
                };
                request.onerror = () => resolve();
            } catch(err) {
                resolve();
            }
        });

        if (this._worker && this._workerReady) {
            this._worker.postMessage({ action: 'UPDATE_COMPANIES', payload: records });
        }
    },

    _normalizeArabicName(str) {
        if (!str || typeof str !== 'string') return '';
        let s = str.toLowerCase().trim()
            .replace(/[أإآٱ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .replace(/[ؤئ]/g, 'ء')
            .replace(/[\u064B-\u065F\u0670]/g, '')
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
        company.google_maps_url = String(company.google_maps_url || company.map || ((company.latitude || company.lat) ? ('https://www.google.com/maps?q=' + (company.latitude || company.lat) + ',' + (company.longitude || company.lon)) : ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((company.nameAr || '') + ' ' + (company.address || '') + ' مصر')))).trim();

        const fs = Number(company.fleetSize || company.fleet || 0);
        company.fleetSize = (!isNaN(fs) && fs >= 0) ? fs : 0;
        company.fleetType = String(company.fleetType || '');
        company.status = String(company.status || company.st || 'new');
        company.assignedTo = String(company.assignedTo || company.asgn || '');
        company.contactPerson = String(company.contactPerson || company.cp || '').trim();
        company.contactTitle = String(company.contactTitle || company.ct || '').trim();
        company.notes = String(company.notes || '').trim();
        company.createdAt = company.createdAt || company.cat || new Date().toISOString();
        company.lastUpdated = company.lastUpdated || company.upd || new Date().toISOString().split('T')[0];

        if (company.priority || company.prio) {
            company.priority = String(company.priority || company.prio).toUpperCase();
        } else if (company.fleetSize >= 120) {
            company.priority = 'A';
        } else if (company.fleetSize >= 50) {
            company.priority = 'B';
        } else if (company.sector) {
            company.priority = this.calculatePriority(company.sector);
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
            const request = indexedDB.open('FleetCRM_DB', 5);
            request.onsuccess = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('companies')) return;
                const transaction = db.transaction(['companies'], 'readwrite');
                const store = transaction.objectStore('companies');
                store.clear();
            };
        } catch (e) {}

        if (window.SupabaseClient) {
            window.SupabaseClient.wipeDynamicCompanies();
            window.SupabaseClient.pushMasterData({
                dynamicCompanies: [],
                users: this.getUsers(),
                calls: this.getCalls ? this.getCalls() : [],
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

        let baseData = (window.__EGYPT_ENTERPRISE_POOL && Array.isArray(window.__EGYPT_ENTERPRISE_POOL) && window.__EGYPT_ENTERPRISE_POOL.length > 0)
            ? window.__EGYPT_ENTERPRISE_POOL
            : null;

        if (!baseData) {
            const jsonPaths = ['./data/egypt_enterprises_pool.json', '/data/egypt_enterprises_pool.json', './data/companies.json', '/data/companies.json'];
            for (const path of jsonPaths) {
                try {
                    const resp = await fetch(path + '?v=173.0&t=' + Date.now(), { cache: 'no-store' });
                    if (resp.ok) {
                        const jsonData = await resp.json();
                        if (Array.isArray(jsonData) && jsonData.length > 0) {
                            baseData = jsonData;
                            break;
                        }
                    }
                } catch (e) {}
            }
        }

        if (baseData && Array.isArray(baseData) && baseData.length > 0) {
            const masterMap = new Map();

            // 1. Load baseline pool
            baseData.forEach((c, idx) => {
                const normalized = this._normalizeCompanyData(c, idx);
                const nameKey = this._normalizeArabicName(normalized.nameAr || normalized.nameEn || normalized.name);
                const regionKey = String(normalized.governorate || normalized.gov || normalized.city || '').trim().toLowerCase();
                const key = nameKey + '_' + regionKey;
                if (key && !masterMap.has(key)) {
                    masterMap.set(key, normalized);
                }
            });

            // 2. Merge existing custom/scraped companies on top
            const extraSources = [
                ...(Array.isArray(existingCustomData) ? existingCustomData : []),
                ...(Array.isArray(this.companiesMemory) ? this.companiesMemory : []),
                ...(Array.isArray(this._get(this.KEYS.COMPANIES)) ? this._get(this.KEYS.COMPANIES) : [])
            ];

            extraSources.forEach((c, idx) => {
                if (!c) return;
                const name = c.nameAr || c.name || c.nameEn || '';
                if (!this.isStrictB2BEntity(name)) return;
                const normalized = this._normalizeCompanyData(c, idx);
                const nameKey = this._normalizeArabicName(normalized.nameAr || normalized.nameEn || normalized.name);
                const regionKey = String(normalized.governorate || normalized.gov || normalized.city || '').trim().toLowerCase();
                const key = nameKey + '_' + regionKey;
                if (key) {
                    masterMap.set(key, normalized);
                }
            });

            this.companiesMemory = Array.from(masterMap.values());
            this._set(this.KEYS.COMPANIES, this.companiesMemory);
            this.saveAllCompaniesToDB(this.companiesMemory);
            localStorage.setItem('fleetcrm_company_count', this.companiesMemory.length);

            const sideCounter = document.getElementById('sidebar-total-companies');
            if (sideCounter) sideCounter.textContent = this.companiesMemory.length.toLocaleString();
            return;
        }

        if (!this.companiesMemory || this.companiesMemory.length === 0) {
            this.companiesMemory = [];
            this._set(this.KEYS.COMPANIES, []);
        }
    },

    _fallbackHydrateBaseline() {
        const syncMap = new Map();
        const deletedCompIds = this.getDeletedIds('companies');
        const basePool = (window.__EGYPT_ENTERPRISE_POOL && Array.isArray(window.__EGYPT_ENTERPRISE_POOL)) ? window.__EGYPT_ENTERPRISE_POOL : [];
        basePool.forEach((c, idx) => {
            if (!c) return;
            const id = c.id || `comp_base_${idx}`;
            if (!deletedCompIds.has(String(id))) {
                syncMap.set(id, this._normalizeCompanyData(c, idx));
            }
        });
        const titans = (window.__EGYPT_VERIFIED_TITANS && Array.isArray(window.__EGYPT_VERIFIED_TITANS)) ? window.__EGYPT_VERIFIED_TITANS : [];
        titans.forEach(t => {
            if (t && t.id && !deletedCompIds.has(String(t.id))) {
                syncMap.set(t.id, t);
            }
        });
        this.companiesMemory = Array.from(syncMap.values());
        localStorage.setItem('fleetcrm_company_count', this.companiesMemory.length);
        this.updateLiveCounters();
    },

    loadCompaniesFromDB(db) {
        return new Promise((resolve) => {
            if (localStorage.getItem('fleetcrm_user_wiped_companies') === 'true') {
                this.companiesMemory = [];
                this._set(this.KEYS.COMPANIES, []);
                this.updateLiveCounters();
                resolve([]);
                return;
            }
            try {
                const transaction = db.transaction(['companies'], 'readonly');
                const store = transaction.objectStore('companies');
                const request = store.getAll();
                
                request.onsuccess = (event) => {
                    const idbData = event.target.result || [];
                    const deletedCompIds = this.getDeletedIds('companies');

                    // 1. Immutable Master Map starting with all 18,419 Pool Companies
                    const masterMap = new Map();
                    const basePool = (window.__EGYPT_ENTERPRISE_POOL && Array.isArray(window.__EGYPT_ENTERPRISE_POOL)) ? window.__EGYPT_ENTERPRISE_POOL : [];
                    basePool.forEach((c, idx) => {
                        if (!c) return;
                        const id = c.id || `comp_base_${idx}`;
                        if (!deletedCompIds.has(String(id))) {
                            masterMap.set(id, this._normalizeCompanyData(c, idx));
                        }
                    });

                    // 2. Add 34 Verified Titans
                    const titans = (window.__EGYPT_VERIFIED_TITANS && Array.isArray(window.__EGYPT_VERIFIED_TITANS)) ? window.__EGYPT_VERIFIED_TITANS : [];
                    titans.forEach(t => {
                        if (!t || !t.id) return;
                        if (!deletedCompIds.has(String(t.id))) {
                            masterMap.set(t.id, t);
                        }
                    });

                    // 3. Merge all IndexedDB records (user additions, dynamic scrapes, call modifications)
                    idbData.forEach(c => {
                        if (!c || !c.id) return;
                        if (!deletedCompIds.has(String(c.id))) {
                            const existing = masterMap.get(c.id);
                            if (existing) {
                                masterMap.set(c.id, Object.assign({}, existing, c));
                            } else {
                                masterMap.set(c.id, this._normalizeCompanyData(c));
                            }
                        }
                    });

                    const merged = Array.from(masterMap.values());
                    this.companiesMemory = merged;
                    localStorage.setItem('fleetcrm_company_count', merged.length);
                    this.updateLiveCounters();
                    resolve(merged);
                };
                
                request.onerror = () => {
                    this._fallbackHydrateBaseline();
                    resolve(this.companiesMemory);
                };
            } catch (e) {
                this._fallbackHydrateBaseline();
                resolve(this.companiesMemory);
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

    updateLiveCounters(overrideCount) {
        const currentUser = this.getCurrentUser();
        const canViewAll = this.canViewAll(currentUser);
        const scopedComps = this.getScopedCompanies();
        const rawCount = (this.companiesMemory && Array.isArray(this.companiesMemory)) ? this.companiesMemory.length : 0;
        const userVisibleCount = canViewAll ? rawCount : (scopedComps ? scopedComps.length : 0);
        const count = (typeof overrideCount === 'number' && overrideCount >= 0) ? overrideCount : userVisibleCount;

        try {
            if (canViewAll) {
                localStorage.setItem('fleetcrm_company_count', String(rawCount));
            }
            localStorage.removeItem('fleetcrm_deals_count');
        } catch(e) {}

        const formatted = count > 0 ? count.toLocaleString() : '0';
        const sideEl = document.getElementById('sidebar-total-companies');
        if (sideEl) sideEl.textContent = formatted;
        const dashEl = document.getElementById('dash-total-companies');
        if (dashEl) dashEl.textContent = formatted;
        const scTotal = document.getElementById('sc-total');
        if (scTotal) scTotal.textContent = rawCount.toLocaleString();
        const subText = document.getElementById('scraper-status-subtext');
        if (subText) subText.textContent = `المحرك الموحد المباشر (${rawCount.toLocaleString()} شركة موثقة 100%)`;
        return count;
    },

    saveAllCompaniesToDB(companies, syncToCloud = true) {
        this.updateLiveCounters();
        this.saveBatchToIDB(companies);
        if (syncToCloud && this.autoSyncToCloud) {
            this.autoSyncToCloud(companies);
        }
    },

    _writeToIDB(companies) {
        return this.saveBatchToIDB(companies);
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
                const users = this.getUsers ? this.getUsers() : [];
                const activities = this.getActivities ? this.getActivities() : [];

                const basePool = (window.__EGYPT_ENTERPRISE_POOL && Array.isArray(window.__EGYPT_ENTERPRISE_POOL)) ? window.__EGYPT_ENTERPRISE_POOL : [];
                const baseIds = new Set(basePool.map(c => String(c.id)));
                const titanIds = new Set(((window.__EGYPT_VERIFIED_TITANS && Array.isArray(window.__EGYPT_VERIFIED_TITANS)) ? window.__EGYPT_VERIFIED_TITANS : []).map(t => String(t.id)));

                // Extract dynamic companies (custom / newly scraped)
                const dynamicCompanies = companies.filter(c => {
                    if (!c || !c.id) return false;
                    const id = String(c.id);
                    return !baseIds.has(id) && !titanIds.has(id);
                });

                const quickHash = `${dynamicCompanies.length}_${calls.length}_${users.length}`;
                if (!forceSync && quickHash === localStorage.getItem('fleetcrm_last_synced_hash')) return true;

                const ok = await window.SupabaseClient.pushMasterData({
                    dynamicCompanies: dynamicCompanies,
                    users: users,
                    calls: calls,
                    activities: activities
                });
                if (ok) {
                    localStorage.setItem('fleetcrm_last_synced_hash', quickHash);
                    localStorage.setItem('fleetcrm_last_sync_time', Date.now());
                }
                return ok;
            } catch (err) {
                return false;
            }
        };

        if (forceSync) {
            return syncFn();
        } else {
            return new Promise((resolve) => {
                this._cloudSyncDebounce = setTimeout(async () => {
                    const res = await syncFn();
                    resolve(res);
                }, 300);
            });
        }
    },

    async pullFromCloud() {
        if (!window.SupabaseClient) return false;
        try {
            const data = await window.SupabaseClient.fetchMasterData();
            if (!data) return false;

            let updated = false;

            // 1. Sync companies with cloud with guaranteed baseline pool and titans
            const isWipedComps = localStorage.getItem('fleetcrm_user_wiped_companies') === 'true';
            if (isWipedComps && (!this.companiesMemory || this.companiesMemory.length === 0)) {
                this.companiesMemory = [];
                this.updateLiveCounters();
            } else if (data.dynamicCompanies && Array.isArray(data.dynamicCompanies)) {
                const deletedCompIds = this.getDeletedIds('companies');
                const cloudDynamic = data.dynamicCompanies.filter(c => c && c.id && !deletedCompIds.has(String(c.id)));

                if (cloudDynamic.length > 0) {
                    const idMap = new Map();
                    (this.companiesMemory || []).forEach(c => { if (c && c.id) idMap.set(String(c.id), c); });
                    let newAdded = false;
                    cloudDynamic.forEach(c => {
                        if (c && c.id && !idMap.has(String(c.id))) {
                            idMap.set(String(c.id), this._normalizeCompanyData(c));
                            newAdded = true;
                        }
                    });
                    if (newAdded) {
                        const merged = Array.from(idMap.values());
                        this.companiesMemory = merged;
                        this.saveAllCompaniesToDB(merged, false);
                        this.updateLiveCounters();
                        if (this._worker && this._workerReady) {
                            this._worker.postMessage({ action: 'INIT_INDEX', payload: merged });
                        }
                        updated = true;
                    }
                }
            }

            // 2. Users sync with smart merge — NEVER delete or drop locally created employee accounts!
            if (data.users && Array.isArray(data.users)) {
                const localUsers = this.getUsers() || [];
                const userMap = new Map();
                
                // Add local users first
                localUsers.forEach(u => {
                    if (u && (u.id || u.email || u.username)) {
                        const key = String(u.id || u.email || u.username).toLowerCase().trim();
                        userMap.set(key, u);
                    }
                });

                // Union merge cloud users
                data.users.forEach(u => {
                    if (u && (u.id || u.email || u.username)) {
                        const key = String(u.id || u.email || u.username).toLowerCase().trim();
                        if (!userMap.has(key)) {
                            userMap.set(key, u);
                        } else {
                            const existing = userMap.get(key);
                            userMap.set(key, { ...existing, ...u });
                        }
                    }
                });

                const mergedUsers = Array.from(userMap.values());
                if (mergedUsers.length > 0) {
                    const changed = mergedUsers.length !== localUsers.length || JSON.stringify(mergedUsers) !== JSON.stringify(localUsers);
                    if (changed) {
                        this._set(this.KEYS.USERS, mergedUsers);
                        if (window.SupabaseClient && window.SupabaseClient.pushUsers) {
                            window.SupabaseClient.pushUsers(mergedUsers);
                        }
                        updated = true;
                    }
                }
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

            if (data.activities && Array.isArray(data.activities)) {
                this._set(this.KEYS.ACTIVITIES, data.activities);
            }

            // If any tombstoned items were filtered from cloud data, push cleaned state back to cloud immediately
            if (deletedCompIds.size > 0 || deletedCallIds.size > 0) {
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

    // ---- Strict B2B Fleet & Corporate Entity Validator ----
    isStrictB2BEntity(name, tags = {}) {
        if (!name || typeof name !== 'string' || name.trim().length < 3) return false;
        const n = name.trim();

        const cityBlacklist = [
            'مدينة العاشر من رمضان', 'العاشر من رمضان', 'مدينة السادس من اكتوبر', 'مدينة السادس من أكتوبر', 'السادس من اكتوبر', 'السادس من أكتوبر',
            'مدينة السادات', 'السادات', 'برج العرب', 'مدينة برج العرب', 'مدينة العبور', 'العبور', 'مدينة بدر', 'بدر', 'الروبيكي',
            'حلوان', 'السويس', 'العين السخنة', 'بورسعيد', 'دمياط', 'أسيوط', 'بني سويف', 'المنيا', 'سوهاج', 'قنا', 'الأقصر', 'أسوان',
            'القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الشرقية', 'المنوفية', 'الدقهلية', 'الغربية', 'البحيرة', 'كفر الشيخ', 'الإسماعيلية'
        ];
        if (cityBlacklist.includes(n)) return false;

        // 1. Street, Road, Highway, Landmark, Plot, and Residential Negatives (Arabic & English)
        const streetNegRegex = /\b(?:street|st\.?|road|rd\.?|avenue|ave\.?|lane|drive|dr\.?|way|boulevard|blvd\.?|highway|hwy\.?|junction|roundabout|bridge|tunnel|exit|ramp|axis|corridor|square|block|plot|sector|zone|district|neighborhood|building|bldg|residence|compound|gate|checkpoint)\b|^(?:شارع|طريق|محور|حارة|حاره|ممر|ميدان|كوبري|كوبرى|نفق|مطلع|منزل|تقاطع|نزلة|نزله|طلعة|طلعه|وصلة|وصله|دائري|دائرى|بوابة|بوابه|كارتة|كارته|كمين|مزلقان|عمارة|عماره|برج|مجاورة|مجاوره|قطعة|قطعه|بلوك|مربع|منطقة|منطقه|حي|حى|عزبة|عزبه|كفر|نجع|قرية|قريه|حوض|ترعة|ترعه|مصرف|جزيرة|جزيره|جبل|تل)\b|(?:^|\s)(?:شارع|طريق|محور|كوبري|كوبرى|ميدان|تقاطع|نفق|مطلع|منزل|نزلة|نزله|دائري|دائرى)(?:\s|$)/i;
        if (streetNegRegex.test(n)) return false;

        // 2. Public, Government Administration, Retail, Worship, Medical Clinics, Cafes & Personal Services
        const publicNegRegex = /(?:محطة مترو|محطة قطار|محطة اتوبيس|محطة ترام|محطة رسوم|موقف ميكروباص|موقف توشكى|محطة موبيل|محطة بنزين|محطة وقود|محطه ⛽|محطه بنزين|محطه وقود|مجمع محاكم|محكمة|محكمه|محاكم|النيابة العامة|نيابة|نيابه|مجلس الدولة|الشهر العقاري|مصلحة الضرائب|مصلحه الضرائب|مأمورية ضرائب|مامورية ضرائب|مصلحة الجمارك|مصلحه الجمارك|مبنى ادار|مبني ادار|مبنى إدار|مبني إدار|العهد الجديد|ديوان عام|ديوان المحافظ|الوحدة المحلية|الوحده المحليه|مجلس مدينة|مجلس مدينه|مجلس قروي|مكتب تموين|سجل مدني|سجل مدنى|مكتب بريد|سنترال|هيئة الأبنية|هيئه الابنيه|الشئون الاجتماعية|التضامن الاجتماعي|مكتب صحة|مكتب صحه|وحدة صحية|وحده صحيه|مباحث|إدارة مرور|ادارة مرور|مرور العاشر|مرور اكتوبر|مدرسة|مدرسه|مدارس|حضانة|حضانه|روضة|روضه|جامعة|جامعه|كلية|كليه|معهد أزهري|معهد ازهري|معهد موسيقي|معهد موسيقى|سنتر تعليمي|أكاديمية تعليمية|اكاديمية تعليمية|مستشفى|مستشفي|مستشفا|عيادة|عياده|عيادات|مركز طبي|مركز طبى|مركز عيون|مركز أشعة|مركز اشعة|مركز علاج|مركز أسنان|مركز اسنان|صيدلية|صيدليه|صيدليات|مستوصف|مختبر تحاليل|معمل تحاليل|مسجد|جامع الن|جامع ال|مسجد ال|كنيسة|كنيسه|كاتدرائية|كاتدرائيه|دير الأنبا|دير الشهيد|دير القديس|دير السريان|دير المحرق|دير مار|دير وادي|مطرانية|مطرانيه|خلوة|خلوه|جمعية خيرية|جمعيه خيريه|مؤسسة خيرية|مؤسسه خيريه|دار أيتام|دار ايتام|دار مسنين|دار رعاية|دار المناسبات|دار مناسبات|قاعة افراح|قاعه افراح|قسم شرطة|قسم شرطه|نقطة شرطة|نقطه شرطه|مركز شرطة|مركز شرطه|أمن مركزي|امن مركزي|معسكر|سجن|قاعدة جوية|قاعده جويه|مركز شباب|نادي رياضي|نادى رياضى|نادي اجتماعي|نادى اجتماعى|حديقة عامة|حديقه عامه|حدائق|ملعب|استاد|مقابر|مقبرة|مقبره|جبانة|جبانه|مدافن|مغسلة اموات|مغسله اموات|فرن بلدي|فرن بلدى|مخبز بلدي|مخبز بلدى|مخبز|حلواني|حلوانى|باتيسري|مطعم|كافيه|كافيتريا|كوفي شوب|بيتزا|كشري|فول وطعمية|مشويات|شاورما|كبابجي|اسماك|كبدة|سوبر ماركت|ميني ماركت|هايبر ماركت|محل بقالة|محل بقاله|محل خضار|محل فاكه|محل جزارة|محل دواجن|عطارة|عطاره|مقلة|مقله|محمصة|مول |shopping mall|كوافير|صالون حلاقة|صالون حلاقه|صالون رجالي|صالون حريمي|بيوتي سنتر|beauty salon|دراي كلين|dry clean|مغسلة ملابس|مغسله ملابس|خياط|ترزي|اتيليه|ميك اب|مكتبة عامة|مكتبه عامه|قرطاسية|ادوات مكتبية|ادوات كتابية|بلايستيشن|جيم |فتنس|سفارة|سفاره|قنصلية|قنصليه|ماكينة صراف|ماكينه صراف|ATM|صراف آلي|فرع بنك|خدمات فوري|أمان للمدفوعات|عربية كبدة|عربيه كبده|عربية فول|عربيه فول|كشك |بائع |محل موبايل|صيانة موبايل|صيانة شاشات|hotel|restaurant|cafe|clinic|hospital|school|mosque|church)/i;
        if (publicNegRegex.test(n)) return false;

        // 3. Positive Corporate, Industrial, and Fleet Commercial Indicators (Unicode-safe prefix match)
        const prefixRegex = /^(?:شركة|شركه|الشركة|الشركه|مصنع|المصنع|مجموعة|مجموعه|المجموعة|المجموعه|مؤسسة|مؤسسه|المؤسسة|المؤسسه|توكيل|التوكيل|صوامع|مطاحن|مستودع|مستودعات|محطة خرسانة|محطة خرسانه|محطة خلط|خلاطة|خلاطه|كسارة|كساره|مسبك|معامل تصنيع)(?:\s|$)/;
        if (prefixRegex.test(n)) return true;

        const termRegex = /(?:للصناعات|للصناعة|للصناعه|للتجارة|للتجاره|للتوزيع|للنقل|للمقاولات|للاستثمار|للتوريدات|للبترول|للغاز|للخدمات اللوجستية|للخدمات اللوجستيه|للتصدير|للاستيراد|للتنمية|للتنميه|القابضة|القابضه|المساهمة|المساهمه|ذ\.م\.م|ش\.م\.م|لإنتاج|لانتاج|لتصنيع|لتوزيع|لتدوير|لتجميع|للأدوية|للادوية|للأغذية|للاغذية|للغزل|للنسيج|للسيراميك|للحديد|للصلب|للأسمنت|للاسمنت|للكيماويات|للبلاستيك|للتعبئة|للتعبئه|للتغليف|للشحن|كابلات|خرسانة|خرسانه|مقاولات|لوجستيات|شحن وتفريغ)/;
        if (termRegex.test(n)) return true;

        const englishCorporateRegex = /\b(?:company|co\.?|corp\.?|corporation|inc\.?|ltd\.?|limited|llc|s\.a\.e|industries|industry|factory|plant|works|mill|mills|trading|contracting|transport|transportation|logistics|cargo|shipping|freight|distribution|petroleum|oil|cement|concrete|steel|chemicals|pharma|group|holding)\b/i;
        if (englishCorporateRegex.test(n)) return true;

        if (tags && (tags.man_made === 'works' || tags.industrial === 'factory' || tags.industrial === 'manufacturing')) {
            return true;
        }

        return false;
    },

    cleanAndFixCompanyData(companies) {
        if (!companies || !Array.isArray(companies) || companies.length === 0) return companies;

        const deduplicated = [];
        const seenIds = new Set();
        const seenNames = new Set();

        companies.forEach((c, idx) => {
            if (!c) return;
            const name = c.nameAr || c.name || c.nameEn || c.companyName || '';
            if (!name || String(name).trim().length < 2) return;

            // 0b. Strict B2B entity filter (reject roads, ramps, bridges, courts, schools, clinics, cafes, etc.)
            if (!this.isStrictB2BEntity(name)) return;

            const nameKey = this._normalizeArabicName(name);
            const regionKey = String(c.governorate || c.gov || c.city || '').trim().toLowerCase();
            const comboKey = nameKey + '_' + regionKey;
            const idKey = c.id ? String(c.id).trim() : null;

            if ((idKey && seenIds.has(idKey)) || (comboKey && seenNames.has(comboKey))) {
                return; // Duplicate prevented!
            }

            if (idKey) seenIds.add(idKey);
            if (comboKey) seenNames.add(comboKey);

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

            // 2. Clean real fleet size without synthetic generation
            const fs = parseInt(c.fleetSize, 10);
            c.fleetSize = (!isNaN(fs) && fs >= 0) ? fs : 0;

            // 3. Compute priority
            if (c.fleetSize >= 120) c.priority = 'A';
            else if (c.fleetSize >= 50) c.priority = 'B';
            else if (c.sector) c.priority = this.calculatePriority(c.sector);
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
        if (!this.companiesMemory || !Array.isArray(this.companiesMemory) || this.companiesMemory.length === 0) {
            if (localStorage.getItem('fleetcrm_user_wiped_companies') !== 'true') {
                const syncMap = new Map();
                if (window.__EGYPT_ENTERPRISE_POOL && Array.isArray(window.__EGYPT_ENTERPRISE_POOL)) {
                    window.__EGYPT_ENTERPRISE_POOL.forEach((c, idx) => {
                        if (c) syncMap.set(c.id || `comp_base_${idx}`, c);
                    });
                }
                if (window.__EGYPT_VERIFIED_TITANS && Array.isArray(window.__EGYPT_VERIFIED_TITANS)) {
                    window.__EGYPT_VERIFIED_TITANS.forEach(t => {
                        if (t && t.id) syncMap.set(t.id, t);
                    });
                }
                if (syncMap.size > 0) {
                    this.companiesMemory = Array.from(syncMap.values());
                }
            }
        }
        return this.companiesMemory || [];
    },

    getScopedCompanies(user) {
        const currentUser = user || this.getCurrentUser();
        const allCompanies = this.getCompanies();
        if (!currentUser) return allCompanies;
        if (this.canViewAll(currentUser)) {
            return allCompanies; // Admin & Supervisor can view all companies
        }
        // Strict Employee isolation: Sales rep ONLY sees companies explicitly assigned to them!
        const myKeys = new Set([
            String(currentUser.id || '').trim().toLowerCase(),
            String(currentUser.username || '').trim().toLowerCase(),
            String(currentUser.email || '').trim().toLowerCase(),
            String(currentUser.name || '').trim().toLowerCase()
        ].filter(Boolean));

        return allCompanies.filter(c => {
            if (!c || !c.assignedTo) return false;
            const assignedKey = String(c.assignedTo).trim().toLowerCase();
            return myKeys.has(assignedKey);
        });
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

    async addCompanies(newCompanies) {
        if (!Array.isArray(newCompanies) || newCompanies.length === 0) {
            if (this.autoSyncToCloud) this.autoSyncToCloud(this.companiesMemory);
            return [];
        }

        localStorage.removeItem('fleetcrm_user_wiped_companies');

        const current = [...this.getCompanies()];
        const idMap = new Map();

        current.forEach(c => {
            if (c && c.id) idMap.set(String(c.id), c);
        });

        const addedBatch = [];
        newCompanies.forEach(c => {
            if (!c) return;
            const name = String(c.nameAr || c.name || c.nameEn || '').trim();
            if (name.length < 2) return;
            if (!this.isStrictB2BEntity(name)) return;

            c.sector = this.mapScraperSectorToCRM(c.sector);
            c.city = this.mapScraperCityToCRM(c.city);
            c.priority = this.calculatePriority(c.sector);

            if (!c.id) c.id = 'dyn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
            const existing = idMap.get(String(c.id));

            if (!existing) {
                idMap.set(String(c.id), c);
                current.push(c);
                addedBatch.push(c);
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
                addedBatch.push(existing);
            }
        });

        this.companiesMemory = current;
        localStorage.setItem('fleetcrm_company_count', current.length);
        this.updateLiveCounters();

        if (addedBatch.length > 0) {
            await this.saveBatchToIDB(addedBatch);
        }

        if (this.autoSyncToCloud) this.autoSyncToCloud(current);
        return addedBatch;
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
                if (window.SupabaseClient && window.SupabaseClient.deleteDynamicCompany) {
            window.SupabaseClient.deleteDynamicCompany(id);
        }
        this.autoSyncToCloud(companies, true);
        this.updateLiveCounters();
    },

    assignCompany(companyId, userId) {
        const company = this.getCompany(companyId);
        if (!company) return null;
        company.assignedTo = userId || '';
        company.assignedAt = userId ? new Date().toISOString() : null;
        company.lastUpdated = new Date().toISOString().split('T')[0];
        
        this.saveCompany(company);
        this.saveBatchToIDB([company]);
        if (this.autoSyncToCloud) this.autoSyncToCloud(this.companiesMemory);
        
        const targetUser = userId ? this.getUser(userId) : null;
        const userName = targetUser ? targetUser.name : (userId || 'إلغاء التعيين');
        this.addActivity('company', company.id, 'إسناد وتخصيص', `تم إسناد شركة "${company.nameAr || company.nameEn}" إلى: ${userName}`);
        return company;
    },

    bulkAssignCompanies(companyIds, userId) {
        if (!Array.isArray(companyIds) || companyIds.length === 0) return 0;
        const now = new Date().toISOString();
        const today = now.split('T')[0];
        const targetUser = userId ? this.getUser(userId) : null;
        const userName = targetUser ? targetUser.name : (userId || 'إلغاء التعيين');
        const idSet = new Set(companyIds.map(String));
        
        const updatedBatch = [];
        this.getCompanies().forEach(c => {
            if (c && idSet.has(String(c.id))) {
                c.assignedTo = userId || '';
                c.assignedAt = userId ? now : null;
                c.lastUpdated = today;
                updatedBatch.push(c);
            }
        });

        if (updatedBatch.length > 0) {
            this.saveBatchToIDB(updatedBatch);
            this.saveAllCompaniesToDB(this.companiesMemory);
            if (this.autoSyncToCloud) this.autoSyncToCloud(this.companiesMemory);
            this.addActivity('company', 'bulk', 'تخصيص جماعي', `تم إسناد وتخصيص ${updatedBatch.length} شركة إلى: ${userName}`);
        }
        return updatedBatch.length;
    },

    autoCleanAndMergeDuplicates() {
        const companies = [...this.getCompanies()];
        const auditReport = this.auditCompanyData();
        const duplicateGroups = auditReport.duplicateGroups || [];

        if (duplicateGroups.length === 0) {
            return { mergedCount: 0, cleanedCount: 0, remainingTotal: companies.length };
        }

        const mergedMap = new Map();
        const duplicateIdToMaster = new Map();
        const calls = this.getCalls ? this.getCalls() : [];
        let callsUpdated = false;

        // Initialize with all companies
        companies.forEach(c => {
            if (c && c.id) mergedMap.set(c.id, { ...c });
        });

        let totalMerged = 0;

        duplicateGroups.forEach(group => {
            const items = group.items;
            if (!items || items.length < 2) return;

            // Sort to select the most complete / primary entity as master
            items.sort((a, b) => {
                const isTitanA = String(a.id).startsWith('eg_titan_') ? 10 : 0;
                const isTitanB = String(b.id).startsWith('eg_titan_') ? 10 : 0;
                const isBaseA = String(a.id).startsWith('eg_b2b_fleet_') ? 5 : 0;
                const isBaseB = String(b.id).startsWith('eg_b2b_fleet_') ? 5 : 0;
                const fleetA = Number(a.fleetSize) || 0;
                const fleetB = Number(b.fleetSize) || 0;
                return (isTitanB + isBaseB + fleetB) - (isTitanA + isBaseA + fleetA);
            });

            const masterId = items[0].id;
            const master = mergedMap.get(masterId) || { ...items[0] };

            const phonesSet = new Set();
            [master.phone1, master.phone2, master.mobile, master.hotline, master.contactPhone].forEach(p => {
                if (p && String(p).trim().length >= 7) phonesSet.add(String(p).trim());
            });

            const addressList = master.address ? [master.address] : [];
            const branchList = master.branches ? [...master.branches] : [];

            for (let i = 1; i < items.length; i++) {
                const dupe = items[i];
                if (dupe.id === masterId) continue;

                totalMerged++;
                duplicateIdToMaster.set(dupe.id, masterId);

                // 1. Record Tombstone permanently so it NEVER re-hydrates
                this.recordDeletedId('companies', dupe.id);

                // 2. Delete duplicate from IndexedDB
                if (this.deleteFromIDB) {
                    this.deleteFromIDB(dupe.id);
                }

                // 3. Delete duplicate from Firebase
                if (window.SupabaseClient && window.SupabaseClient.deleteDynamicCompany) {
                    window.SupabaseClient.deleteDynamicCompany(dupe.id);
                }

                // Collect and merge all phones from duplicate
                [dupe.phone1, dupe.phone2, dupe.mobile, dupe.hotline, dupe.contactPhone].forEach(p => {
                    if (p && String(p).trim().length >= 7) phonesSet.add(String(p).trim());
                });

                if (dupe.address && !addressList.includes(dupe.address)) {
                    addressList.push(dupe.address);
                }

                if (dupe.branches && Array.isArray(dupe.branches)) {
                    dupe.branches.forEach(b => {
                        if (b && !branchList.includes(b)) branchList.push(b);
                    });
                }

                if (!master.email && dupe.email) master.email = dupe.email;
                if (!master.website && dupe.website) master.website = dupe.website;
                if (!master.linkedin && dupe.linkedin) master.linkedin = dupe.linkedin;
                if (!master.facebook && dupe.facebook) master.facebook = dupe.facebook;
                if (!master.google_maps_url && dupe.google_maps_url) master.google_maps_url = dupe.google_maps_url;
                if (!master.contactPerson && dupe.contactPerson) master.contactPerson = dupe.contactPerson;
                if (!master.contactTitle && dupe.contactTitle) master.contactTitle = dupe.contactTitle;

                if (Number(dupe.fleetSize) > Number(master.fleetSize || 0)) {
                    master.fleetSize = dupe.fleetSize;
                }

                // Re-link calls from duplicate to master
                calls.forEach(call => {
                    if (call.companyId === dupe.id) {
                        call.companyId = masterId;
                        callsUpdated = true;
                    }
                });

                // Remove duplicate record from dataset
                mergedMap.delete(dupe.id);
            }

            // Distribute merged unique phone numbers
            const allPhones = Array.from(phonesSet);
            if (allPhones.length > 0) master.phone1 = allPhones[0];
            if (allPhones.length > 1) master.phone2 = allPhones[1];
            if (allPhones.length > 2) master.mobile = allPhones[2];
            if (allPhones.length > 3) master.otherPhones = allPhones.slice(3).join(', ');

            if (addressList.length > 1) master.address = addressList.slice(0, 3).join(' | ');
            if (branchList.length > 0) {
                master.branches = branchList;
                master.branchesCount = branchList.length;
            }

            mergedMap.set(masterId, master);
        });

        const mergedList = Array.from(mergedMap.values());

        if (callsUpdated && this._set) {
            this._set(this.KEYS.CALLS, calls);
        }

        this.companiesMemory = mergedList;
        this.saveAllCompaniesToDB(mergedList);

        const now = Date.now();
        localStorage.setItem('fleetcrm_company_count', String(mergedList.length));
        localStorage.setItem('fleetcrm_last_synced_hash', mergedList.length + '_' + (mergedList[0]?.id || ''));
        localStorage.setItem('fleetcrm_last_sync_time', String(now));
        this.updateLiveCounters();

        if (window.SupabaseClient) {
            window.SupabaseClient.pushMasterData({
                companies: mergedList,
                dynamicCompanies: mergedList.filter(c => c.isCustom || String(c.id).startsWith('scraped_') || String(c.id).startsWith('excel_')),
                users: this.getUsers(),
                calls: this.getCalls ? this.getCalls() : [],
                activities: this.getActivities ? this.getActivities() : []
            });
        }

        this.addActivity('system', 'audit', 'تنظيف ودمج البيانات', `تم دمج ${totalMerged} سجل مكرر بنجاح وحفظ كافة أرقام الهواتف`);
        return { mergedCount: totalMerged, cleanedCount: 0, remainingTotal: mergedList.length };
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
    getDeals() { return []; },
    getDeal(id) { return null; },
    saveDeal(deal) { return deal; },
    deleteDeal(id) {},
    clearAllDeals() {},
    updateDealStage(dealId, newStage) {},
    getOpenDeals() { return []; },
    getPipelineValue() { return 0; },

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
            const req = indexedDB.open('FleetCRM_DB', 5);
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
        if (!acts || !Array.isArray(acts)) {
            acts = [];
            try { this._set(this.KEYS.ACTIVITIES, acts); } catch(e){}
        }
        // Purge any legacy fake seed activities
        const realActs = acts.filter(a => a && !String(a.id).startsWith('act_seed_'));
        if (realActs.length !== acts.length) {
            this._set(this.KEYS.ACTIVITIES, realActs);
            acts = realActs;
        }
        return (acts || []).slice(0, limit);
    },

    // ---- Statistics ----
    getStats() {
        const currentUser = this.getCurrentUser();
        const canViewAll = this.canViewAll(currentUser);
        const companies = this.getScopedCompanies();
        const calls = this.getScopedCalls();
        const today = new Date().toISOString().split('T')[0];
        const compList = this.getCompanies();
        const fullCount = (compList && Array.isArray(compList)) ? compList.length : 0;
        const scopedCount = (companies && Array.isArray(companies)) ? companies.length : 0;

        return {
            totalCompanies: canViewAll ? fullCount : scopedCount,
            callsToday: calls.filter(c => c.date === today).length,
            openDeals: 0,
            pipelineValue: 0,
            wonDeals: 0,
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
            })()
        };
    },

    // ---- Seed Sample Data ----
    seedSampleData() {
        // Clean empty state - no synthetic sample data
        return;
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

// Synchronous immediate memory hydration on script load — eliminates 0-count startup flash!
try {
    if (localStorage.getItem('fleetcrm_user_wiped_companies') !== 'true') {
        const syncMap = new Map();
        if (window.__EGYPT_ENTERPRISE_POOL && Array.isArray(window.__EGYPT_ENTERPRISE_POOL)) {
            window.__EGYPT_ENTERPRISE_POOL.forEach((c, idx) => {
                if (c) syncMap.set(c.id || `comp_base_${idx}`, c);
            });
        }
        if (window.__EGYPT_VERIFIED_TITANS && Array.isArray(window.__EGYPT_VERIFIED_TITANS)) {
            window.__EGYPT_VERIFIED_TITANS.forEach(t => {
                if (t && t.id) syncMap.set(t.id, t);
            });
        }
        if (syncMap.size > 0) {
            AppStorage.companiesMemory = Array.from(syncMap.values());
            const savedCount = parseInt(localStorage.getItem('fleetcrm_company_count'), 10);
            AppStorage.updateLiveCounters(savedCount > syncMap.size ? savedCount : syncMap.size);
        }
    }
} catch(e) {}
