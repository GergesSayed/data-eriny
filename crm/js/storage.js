/* ============================================
   Storage Manager — Fleet CRM
   LocalStorage-based data persistence
   ============================================ */

const Storage = {
    KEYS: {
        COMPANIES: 'fleetcrm_companies',
        CALLS: 'fleetcrm_calls',
        DEALS: 'fleetcrm_deals',
        ACTIVITIES: 'fleetcrm_activities',
        SETTINGS: 'fleetcrm_settings',
        USERS: 'fleetcrm_users',
        CURRENT_USER: 'fleetcrm_current_user'
    },

    DEFAULT_USERS: [
        { id: 'admin', username: 'admin', email: 'admin@fleet.com', password: 'admin123', name: 'المدير العام (عرض الكل)', role: 'admin', status: 'active', avatar: '👑', color: '#7c3aed' }
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

        // Always ensure default users have active status if not specified
        stored.forEach(u => {
            if (!u.status) u.status = 'active';
        });

        // Always ensure admin user exists with admin role
        let adminUser = stored.find(u => u.id === 'admin' || u.username === 'admin');
        if (!adminUser) {
            stored.unshift(this.DEFAULT_USERS[0]);
            this._set(this.KEYS.USERS, stored);
        } else if (adminUser.role !== 'admin') {
            adminUser.role = 'admin';
            adminUser.status = 'active';
            this._set(this.KEYS.USERS, stored);
        }

        return stored;
    },

    getPendingUsers() {
        return (this.getUsers() || []).filter(u => u.status === 'pending_approval');
    },

    registerGoogleUser({ email, name }) {
        let users = this.getUsers();
        let existing = users.find(u => (u.email && u.email.toLowerCase() === email.toLowerCase().trim()) || (u.username && u.username.toLowerCase() === email.split('@')[0].toLowerCase()));

        if (existing) {
            return existing;
        }

        const newUser = {
            id: 'u_' + Date.now(),
            email: email.trim(),
            username: email.split('@')[0],
            name: name || email.split('@')[0],
            password: '123',
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
        }
        return user;
    },

    rejectUser(userId) {
        let users = this.getUsers();
        const updated = users.filter(u => u.id !== userId);
        this._set(this.KEYS.USERS, updated);
        this.addActivity('auth', 'admin', 'رفض مستخدم', `تم رفض طلب التسجيل لـ: ${userId}`);
    },

    toggleUserFreeze(userId) {
        let users = this.getUsers();
        const user = users.find(u => u.id === userId);
        if (user && user.id !== 'admin') {
            user.status = user.status === 'frozen' ? 'active' : 'frozen';
            this._set(this.KEYS.USERS, users);
        }
        return user;
    },

    getUser(id) {
        if (!id) return null;
        return this.getUsers().find(u => u.id === id) || null;
    },

    getUserByUsername(username) {
        if (!username) return null;
        return this.getUsers().find(u => u.username && u.username.toLowerCase() === username.toLowerCase().trim()) || null;
    },

    isAdmin(user) {
        const u = user || this.getCurrentUser();
        if (!u) return false;
        return u.id === 'admin' || u.username === 'admin' || u.role === 'admin';
    },

    isSupervisor(user) {
        const u = user || this.getCurrentUser();
        if (!u) return false;
        return u.role === 'supervisor';
    },

    canViewAll(user) {
        const u = user || this.getCurrentUser();
        if (!u) return false;
        return u.id === 'admin' || u.username === 'admin' || u.role === 'admin' || u.role === 'supervisor';
    },

    canModify(user) {
        const u = user || this.getCurrentUser();
        if (!u) return false;
        return u.id === 'admin' || u.username === 'admin' || u.role === 'admin';
    },

    isLoggedIn() {
        const userId = sessionStorage.getItem(this.KEYS.CURRENT_USER) || localStorage.getItem(this.KEYS.CURRENT_USER);
        return !!userId && !!this.getUser(userId);
    },

    getCurrentUser() {
        const userId = sessionStorage.getItem(this.KEYS.CURRENT_USER) || localStorage.getItem(this.KEYS.CURRENT_USER);
        if (!userId) return null;
        let user = this.getUser(userId);
        if (!user) return null;
        if (user.id === 'admin' || user.username === 'admin') {
            user.role = 'admin';
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

    login(username, password, remember = false) {
        const user = this.getUserByUsername(username);
        if (!user) return { success: false, message: 'اسم المستخدم غير موجود' };
        if (user.password !== password) return { success: false, message: 'كلمة المرور غير صحيحة' };
        
        this.setCurrentUser(user.id, remember);
        this.addActivity('auth', user.id, 'تسجيل دخول', `دخول المستخدم: ${user.name}`);
        return { success: true, user };
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

    addUser(userData) {
        const users = this.getUsers();
        if (users.some(u => u.username && u.username.toLowerCase() === userData.username.toLowerCase().trim())) {
            return { success: false, message: 'اسم المستخدم مستخدم بالفعل' };
        }
        const newUser = {
            id: 'usr_' + Date.now(),
            username: userData.username.trim(),
            password: userData.password.trim(),
            name: userData.name.trim(),
            role: userData.role || 'agent',
            erpCode: userData.erpCode ? userData.erpCode.trim() : '',
            region: userData.region || 'cairo',
            avatar: userData.role === 'admin' ? '👑' : '👨‍💼',
            color: userData.color || '#3b82f6',
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        this._set(this.KEYS.USERS, users);
        this.addActivity('user', newUser.id, 'إضافة موظف جديد', `تم إضافة: ${newUser.name}`);
        return { success: true, user: newUser };
    },

    updateUser(id, userData) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return { success: false, message: 'المستخدم غير موجود' };

        // Check username collision
        if (userData.username) {
            const existing = users.find(u => u.id !== id && u.username && u.username.toLowerCase() === userData.username.toLowerCase().trim());
            if (existing) return { success: false, message: 'اسم المستخدم مستخدم لحساب آخر' };
        }

        users[index] = { ...users[index], ...userData };
        this._set(this.KEYS.USERS, users);
        this.addActivity('user', id, 'تعديل بيانات موظف', `تعديل حساب: ${users[index].name}`);
        return { success: true, user: users[index] };
    },

    deleteUser(id) {
        if (id === 'admin') return { success: false, message: 'لا يمكن حذف حساب المدير الرئيسي' };
        let users = this.getUsers();
        users = users.filter(u => u.id !== id);
        this._set(this.KEYS.USERS, users);
        this.addActivity('user', id, 'حذف موظف', `حذف معرّف الحساب: ${id}`);
        return { success: true };
    },

    setCurrentUser(userId) {
        localStorage.setItem(this.KEYS.CURRENT_USER, userId);
        this.addActivity('user', userId, 'تغيير المستخدم النشط', this.getUser(userId)?.name || userId);
    },

    // ---- Data Scoping for Role-Based Access ----
    getScopedCompanies() {
        const currentUser = this.getCurrentUser();
        const all = this.getCompanies();
        if (!currentUser) return all;
        if (this.canViewAll(currentUser)) {
            return all; // Admin & Supervisor see everything
        }
        // Sales Agent sees ONLY companies assigned to them
        return all.filter(c => c && (c.assignedTo === currentUser.id || c.assignedTo === currentUser.username));
    },

    assignCompany(companyId, userId) {
        const company = this.getCompany(companyId);
        if (!company) return null;
        company.assignedTo = userId || '';
        company.assignedAt = userId ? new Date().toISOString() : '';
        this.saveCompany(company);
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
            this.saveAllCompaniesToDB(companies);
            localStorage.removeItem(this.KEYS.COMPANIES);
            this.addActivity('company', 'bulk', `تخصيص ${updatedCount} شركة`, `تم التعيين لـ: ${userName}`);
        }
        return updatedCount;
    },

    // ---- Sector Definitions ----
    SECTORS: {
        transport: { ar: 'نقل وشحن', en: 'Transport & Shipping', icon: '🚛' },
        food: { ar: 'أغذية ومشروبات', en: 'Food & Beverages', icon: '🍔' },
        pharma: { ar: 'أدوية', en: 'Pharmaceuticals', icon: '💊' },
        construction: { ar: 'مقاولات', en: 'Construction', icon: '🏗️' },
        petroleum: { ar: 'بترول وطاقة', en: 'Oil & Energy', icon: '🛢️' },
        distribution: { ar: 'توزيع ولوجستيات', en: 'Distribution & Logistics', icon: '📦' },
        security: { ar: 'أمن وحراسة', en: 'Security', icon: '🛡️' },
        rental: { ar: 'تأجير سيارات', en: 'Car Rental', icon: '🚗' },
        manufacturing: { ar: 'مصانع', en: 'Manufacturing', icon: '🏭' },
        education: { ar: 'مدارس وجامعات', en: 'Education', icon: '🎓' },
        healthcare: { ar: 'مستشفيات', en: 'Healthcare', icon: '🏥' },
        tourism: { ar: 'سياحة', en: 'Tourism', icon: '✈️' },
        public_transport: { ar: 'نقل جماعي', en: 'Public Transport', icon: '🚌' },
        delivery: { ar: 'توصيل ودليفري', en: 'Delivery', icon: '🛵' },
        government: { ar: 'جهات حكومية', en: 'Government', icon: '🏛️' }
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
            console.error(`Error writing ${key}:`, e);
        }
    },

    _generateId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    },

    // ---- IndexedDB helper functions ----
    initDB() {
        // Pre-load from localStorage synchronously so companies memory is ready immediately
        const local = this._get(this.KEYS.COMPANIES);
        if (local && Array.isArray(local) && local.length > 0) {
            this.companiesMemory = local.map(c => {
                c.sector = this.mapScraperSectorToCRM(c.sector);
                c.city = this.mapScraperCityToCRM(c.city);
                c.priority = this.calculatePriority(c.sector);
                return c;
            });
        }

        return new Promise((resolve) => {
            try {
                const request = indexedDB.open('FleetCRM_DB', 2);
                
                request.onerror = (event) => {
                    console.warn('IndexedDB failed to open, relying on localStorage:', event);
                    resolve();
                };
                
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    this.loadCompaniesFromDB(db).then(() => resolve());
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
                };
            } catch (e) {
                console.warn('IndexedDB exception:', e);
                resolve();
            }
        });
    },

    loadCompaniesFromDB(db) {
        return new Promise((resolve) => {
            try {
                const transaction = db.transaction(['companies'], 'readonly');
                const store = transaction.objectStore('companies');
                const request = store.getAll();
                
                request.onsuccess = (event) => {
                    const data = event.target.result || [];
                    if (data.length > 0) {
                        const idbMapped = data.map(c => {
                            c.sector = this.mapScraperSectorToCRM(c.sector);
                            c.city = this.mapScraperCityToCRM(c.city);
                            c.priority = this.calculatePriority(c.sector);
                            return c;
                        });
                        
                        // Merge IndexedDB with current memory (favoring whichever has more or union)
                        if (idbMapped.length >= this.companiesMemory.length) {
                            this.companiesMemory = idbMapped;
                        }
                        this.ensureAssignedSampleCompanies();
                        resolve();
                    } else {
                        if (this.companiesMemory.length === 0) {
                            this.seedSampleData();
                        }
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
        // Clean up orphan assignments pointing to deleted users (e.g. agent_1, agent_2)
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

    saveAllCompaniesToDB(companies) {
        // Immediate fallback save to localStorage
        try {
            this._set(this.KEYS.COMPANIES, companies);
        } catch (e) {
            console.warn('localStorage save fail:', e);
        }

        return new Promise((resolve) => {
            try {
                const request = indexedDB.open('FleetCRM_DB', 2);
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction(['companies'], 'readwrite');
                    const store = transaction.objectStore('companies');
                    store.clear();
                    companies.forEach(c => store.put(c));
                    transaction.oncomplete = () => resolve();
                };
                request.onerror = () => resolve();
            } catch (e) {
                resolve();
            }
        });
    },

    // ---- Companies ----
    getCompanies() {
        return this.companiesMemory;
    },

    getCompany(id) {
        return this.getCompanies().find(c => c.id === id);
    },

    setCompanies(companies) {
        this.companiesMemory = companies;
        this.saveAllCompaniesToDB(companies);
        localStorage.removeItem(this.KEYS.COMPANIES);
    },

    addCompanies(newCompanies) {
        return new Promise((resolve) => {
            const request = indexedDB.open('FleetCRM_DB', 2);
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['companies'], 'readwrite');
                const store = transaction.objectStore('companies');
                newCompanies.forEach(c => {
                    // Ensure canonical mappings and priorities are computed
                    c.sector = this.mapScraperSectorToCRM(c.sector);
                    c.city = this.mapScraperCityToCRM(c.city);
                    c.priority = this.calculatePriority(c.sector);

                    const existingIndex = this.companiesMemory.findIndex(e => e.id === c.id || (e.nameAr && e.nameAr === c.nameAr));
                    if (existingIndex === -1) {
                        this.companiesMemory.push(c);
                        store.put(c);
                    } else {
                        // Merge new scraper/enrichment fields into existing company
                        const existing = this.companiesMemory[existingIndex];
                        let updated = false;
                        for (const k in c) {
                            if (c[k] !== undefined && c[k] !== null && c[k] !== '' && existing[k] !== c[k]) {
                                existing[k] = c[k];
                                updated = true;
                            }
                        }
                        
                        // Force normalization on the merged existing record
                        existing.sector = this.mapScraperSectorToCRM(existing.sector);
                        existing.city = this.mapScraperCityToCRM(existing.city);
                        existing.priority = this.calculatePriority(existing.sector);

                        if (updated) {
                            existing.lastUpdated = new Date().toISOString().split('T')[0];
                            store.put(existing);
                        }
                    }
                });
                transaction.oncomplete = () => {
                    localStorage.removeItem(this.KEYS.COMPANIES);
                    resolve();
                };
            };
            request.onerror = () => resolve();
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
        localStorage.removeItem(this.KEYS.COMPANIES);
        
        this.addActivity('company', company.id, company.id ? 'تعديل شركة' : 'إضافة شركة', company.nameAr);
        return company;
    },

    deleteCompany(id) {
        const companies = this.getCompanies().filter(c => c.id !== id);
        this.companiesMemory = companies;
        this.saveAllCompaniesToDB(companies);
        localStorage.removeItem(this.KEYS.COMPANIES);

        // Also delete related calls and deals
        const calls = this.getCalls().filter(c => c.companyId !== id);
        this._set(this.KEYS.CALLS, calls);
        const deals = this.getDeals().filter(d => d.companyId !== id);
        this._set(this.KEYS.DEALS, deals);
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
        this.companiesMemory = existing;
        this.saveAllCompaniesToDB(existing);
        localStorage.removeItem(this.KEYS.COMPANIES);
        return addedCount;
    },

    // ---- Calls ----
    getCalls() {
        return this._get(this.KEYS.CALLS);
    },

    getCall(id) {
        return this.getCalls().find(c => c.id === id);
    },

    getCallsForCompany(companyId) {
        return this.getCalls().filter(c => c.companyId === companyId).sort((a, b) => {
            const dateA = new Date(a.date + 'T' + (a.time || '00:00'));
            const dateB = new Date(b.date + 'T' + (b.time || '00:00'));
            return dateB - dateA;
        });
    },

    saveCall(call) {
        const currentUser = this.getCurrentUser();
        if (!call.userId && currentUser) call.userId = currentUser.id;
        if (!call.createdByName && currentUser) call.createdByName = currentUser.name;

        const calls = this.getCalls();
        if (call.id) {
            const index = calls.findIndex(c => c.id === call.id);
            if (index >= 0) calls[index] = { ...calls[index], ...call };
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
        return call;
    },

    deleteCall(id) {
        const calls = this.getCalls().filter(c => c.id !== id);
        this._set(this.KEYS.CALLS, calls);
    },

    clearAllCalls() {
        this._set(this.KEYS.CALLS, []);
        this._set(this.KEYS.ACTIVITIES, []);
    },

    getTodaysCalls() {
        const today = new Date().toISOString().split('T')[0];
        return this.getCalls().filter(c => c.date === today);
    },

    getTodaysFollowUps() {
        const today = new Date().toISOString().split('T')[0];
        return this.getCalls().filter(c => c.followUpDate === today);
    },

    // ---- Deals ----
    getDeals() {
        return this._get(this.KEYS.DEALS);
    },

    getDeal(id) {
        return this.getDeals().find(d => d.id === id);
    },

    saveDeal(deal) {
        const deals = this.getDeals();
        if (deal.id) {
            const index = deals.findIndex(d => d.id === deal.id);
            if (index >= 0) deals[index] = { ...deals[index], ...deal };
        } else {
            deal.id = this._generateId('deal');
            deal.createdAt = new Date().toISOString();
            deals.push(deal);
        }
        this._set(this.KEYS.DEALS, deals);
        const company = this.getCompany(deal.companyId);
        const companyName = company ? company.nameAr : 'شركة';
        this.addActivity('deal', deal.id, deal.id ? 'تحديث صفقة' : 'إضافة صفقة', companyName);
        return deal;
    },

    deleteDeal(id) {
        const deals = this.getDeals().filter(d => d.id !== id);
        this._set(this.KEYS.DEALS, deals);
    },

    clearAllDeals() {
        this._set(this.KEYS.DEALS, []);
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

    // ---- Activities ----
    addActivity(type, refId, action, detail) {
        const activities = this._get(this.KEYS.ACTIVITIES);
        activities.unshift({
            id: this._generateId('act'),
            type,
            refId,
            action,
            detail,
            timestamp: new Date().toISOString()
        });
        // Keep only last 100 activities
        if (activities.length > 100) activities.length = 100;
        this._set(this.KEYS.ACTIVITIES, activities);
    },

    getActivities(limit = 20) {
        return this._get(this.KEYS.ACTIVITIES).slice(0, limit);
    },

    // ---- Statistics ----
    getStats() {
        const companies = this.getCompanies();
        const calls = this.getCalls();
        const deals = this.getDeals();
        const today = new Date().toISOString().split('T')[0];

        return {
            totalCompanies: companies.length,
            callsToday: calls.filter(c => c.date === today).length,
            openDeals: deals.filter(d => !['won', 'lost'].includes(d.stage)).length,
            pipelineValue: deals.filter(d => !['won', 'lost'].includes(d.stage))
                .reduce((sum, d) => sum + (Number(d.value) || 0), 0),
            wonDeals: deals.filter(d => d.stage === 'won').length,
            totalCallsThisWeek: (() => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                const weekAgoStr = weekAgo.toISOString().split('T')[0];
                return calls.filter(c => c.date >= weekAgoStr).length;
            })(),
            companiesBySector: (() => {
                const result = {};
                companies.forEach(c => {
                    const sector = c.sector || 'unknown';
                    result[sector] = (result[sector] || 0) + 1;
                });
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
                Object.keys(Storage.PIPELINE_STAGES).forEach(stage => {
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
            if (!c.id) c.id = 'seed_' + Date.now() + '_' + idx;
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
        return arMap[key] || Storage.SECTORS[key]?.ar || key;
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
