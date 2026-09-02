/**
 * Companies Search & Filter Web Worker
 * Handles off-main-thread text searching, indexing, and multi-criteria filtering
 * for 100,000+ company records with zero UI frame drops.
 */

let _companiesIndex = [];
let _idMap = new Map();
let _idToIndexMap = new Map();

function normalizeArabic(str) {
    if (!str || typeof str !== 'string') return '';
    return str.toLowerCase().trim()
        .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
        .replace(/\u0629/g, '\u0647')
        .replace(/\u0649/g, '\u064A')
        .replace(/[\u0624\u0626]/g, '\u0621')
        .replace(/[\u064B-\u065F\u0670]/g, '')
        .replace(/[\s\-_/\\]+/g, ' ');
}

self.onmessage = function(e) {
    const { action, payload, queryId } = e.data || {};

    if (action === 'INIT_INDEX') {
        const companies = payload || [];
        _idMap.clear();
        _idToIndexMap.clear();
        _companiesIndex = new Array(companies.length);
        
        for (let idx = 0; idx < companies.length; idx++) {
            const c = companies[idx];
            if (!c) continue;
            const normNameAr = normalizeArabic(c.nameAr || c.name || '');
            const normNameEn = (c.nameEn || '').toLowerCase().trim();
            const normPhone = (c.phone1 || c.mobile || c.phone2 || '').replace(/[^0-9+]/g, '');
            const normContact = normalizeArabic(c.contactPerson || '');
            const id = c.id || ('comp_' + idx);
            
            const indexed = {
                id,
                nameAr: c.nameAr || c.name || '',
                nameEn: c.nameEn || '',
                normNameAr,
                normNameEn,
                normPhone,
                normContact,
                sector: c.sector || 'other',
                city: c.city || 'other',
                priority: c.priority || 'B',
                fleetSize: Number(c.fleetSize) || 0,
                fleetType: c.fleetType || '',
                assignedTo: c.assignedTo || '',
                createdAt: c.createdAt || '',
                raw: c
            };
            _companiesIndex[idx] = indexed;
            _idMap.set(id, indexed);
            _idToIndexMap.set(id, idx);
        }

        self.postMessage({ action: 'INDEX_READY', queryId, totalCount: _companiesIndex.length });
        return;
    }

    if (action === 'UPDATE_COMPANIES') {
        const batch = payload || [];
        for (let i = 0; i < batch.length; i++) {
            const c = batch[i];
            if (!c || !c.id) continue;
            const normNameAr = normalizeArabic(c.nameAr || c.name || '');
            const normNameEn = (c.nameEn || '').toLowerCase().trim();
            const normPhone = (c.phone1 || c.mobile || c.phone2 || '').replace(/[^0-9+]/g, '');
            const normContact = normalizeArabic(c.contactPerson || '');

            const indexed = {
                id: c.id,
                nameAr: c.nameAr || c.name || '',
                nameEn: c.nameEn || '',
                normNameAr,
                normNameEn,
                normPhone,
                normContact,
                sector: c.sector || 'other',
                city: c.city || 'other',
                priority: c.priority || 'B',
                fleetSize: Number(c.fleetSize) || 0,
                fleetType: c.fleetType || '',
                assignedTo: c.assignedTo || '',
                createdAt: c.createdAt || '',
                raw: c
            };

            const existingIdx = _idToIndexMap.get(c.id);
            if (existingIdx !== undefined && existingIdx >= 0 && existingIdx < _companiesIndex.length) {
                _companiesIndex[existingIdx] = indexed;
            } else {
                const newIdx = _companiesIndex.length;
                _companiesIndex.push(indexed);
                _idToIndexMap.set(c.id, newIdx);
            }
            _idMap.set(c.id, indexed);
        }

        self.postMessage({ action: 'UPDATE_DONE', queryId, totalCount: _companiesIndex.length });
        return;
    }

    if (action === 'FILTER_AND_SEARCH') {
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
            pageSize = 15,
            currentUserId = '',
            userKeys = [],
            isAdmin = true
        } = payload || {};

        const normSearch = normalizeArabic(search);
        const now = Date.now();
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Fast Filter Pass
        let filtered = _companiesIndex.filter(c => {
            // Strict Employee Isolation: Non-admin can ONLY view companies assigned to them!
            if (!isAdmin) {
                if (!c.assignedTo) return false;
                const assignedLower = String(c.assignedTo).trim().toLowerCase();
                if (userKeys && Array.isArray(userKeys) && userKeys.length > 0) {
                    if (!userKeys.includes(assignedLower)) return false;
                } else if (currentUserId && assignedLower !== String(currentUserId).trim().toLowerCase()) {
                    return false;
                }
            }

            if (sector && c.sector !== sector) return false;
            if (city && c.city !== city) return false;
            if (priority && c.priority !== priority) return false;
            if (fleetType && c.fleetType !== fleetType) return false;

            if (fleetSize) {
                const s = c.fleetSize;
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
                    if (c.assignedTo !== currentUserId) return false;
                } else if (assigned === 'unassigned') {
                    if (c.assignedTo) return false;
                } else {
                    if (c.assignedTo !== assigned) return false;
                }
            }

            if (normSearch) {
                const matchAr = c.normNameAr.includes(normSearch);
                const matchEn = c.normNameEn.includes(normSearch);
                const matchPhone = c.normPhone.includes(normSearch);
                const matchContact = c.normContact.includes(normSearch);
                if (!matchAr && !matchEn && !matchPhone && !matchContact) return false;
            }

            return true;
        });

        // 2. Fast Sort
        if (sortMode === 'oldest') {
            filtered.sort((a, b) => (new Date(a.createdAt || 0)) - (new Date(b.createdAt || 0)));
        } else if (sortMode === 'fleet_desc') {
            filtered.sort((a, b) => b.fleetSize - a.fleetSize);
        } else if (sortMode === 'name_asc') {
            filtered.sort((a, b) => a.normNameAr.localeCompare(b.normNameAr, 'ar'));
        } else if (sortMode === 'priority_desc') {
            filtered.sort((a, b) => (a.priority || 'B').localeCompare(b.priority || 'B'));
        } else {
            // Default latest
            filtered.sort((a, b) => (new Date(b.createdAt || 0)) - (new Date(a.createdAt || 0)));
        }

        // 3. Slice Page Items
        const total = filtered.length;
        const totalPages = Math.ceil(total / pageSize) || 1;
        const safePage = Math.max(1, Math.min(page, totalPages));
        const start = (safePage - 1) * pageSize;
        const pageItems = filtered.slice(start, start + pageSize).map(item => item.raw);

        self.postMessage({
            action: 'FILTER_RESULT',
            queryId,
            items: pageItems,
            total,
            totalPages,
            page: safePage,
            pageSize
        });
    }
};
