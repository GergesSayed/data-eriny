/* ============================================
   Excel Handler — Fleet CRM
   Import/Export Excel using SheetJS (XLSX)
   ============================================ */

const ExcelHandler = {
    // Column mapping: internal key → Excel header (Arabic + English)
    COLUMN_MAP: {
        nameAr: 'اسم الشركة (عربي) / Company Name (AR)',
        nameEn: 'اسم الشركة (إنجليزي) / Company Name (EN)',
        sector: 'القطاع / Sector',
        subSector: 'القطاع الفرعي / Sub-Sector',
        city: 'المنطقة / Area',
        governorate: 'المحافظة / Governorate',
        address: 'العنوان / Address',
        google_maps_url: 'رابط الخريطة / Google Maps Link',
        rating: 'التقييم / Rating',
        phone1: 'هاتف 1 / Phone 1',
        phone2: 'هاتف 2 / Phone 2',
        mobile: 'موبايل / Mobile',
        email: 'البريد الإلكتروني / Email',
        website: 'الموقع / Website',
        linkedin: 'LinkedIn الشركة / Company LinkedIn',
        facebook: 'Facebook',
        linkedinContactUrl: 'LinkedIn المسؤول / Contact LinkedIn',
        branchesCount: 'عدد الفروع / Branches',
        fleetSize: 'حجم الأسطول / Fleet Size',
        fleetType: 'نوع الأسطول / Fleet Type',
        contactPerson: 'جهة الاتصال / Contact Person',
        contactTitle: 'المسمى الوظيفي / Title',
        contactPhone: 'تليفون المسؤول / Contact Phone',
        contactEmail: 'إيميل المسؤول / Contact Email',
        companySize: 'حجم الشركة / Company Size',
        priority: 'الأولوية / Priority',
        source: 'المصدر / Source',
        notes: 'ملاحظات / Notes'
    },

    // Reverse mapping for import
    REVERSE_MAP: null,

    _buildReverseMap() {
        if (this.REVERSE_MAP) return;
        this.REVERSE_MAP = {};
        Object.entries(this.COLUMN_MAP).forEach(([key, header]) => {
            this.REVERSE_MAP[header] = key;
            // Also map by Arabic-only part
            const arPart = header.split(' / ')[0];
            this.REVERSE_MAP[arPart] = key;
            // And English-only part
            const enPart = header.split(' / ')[1];
            if (enPart) this.REVERSE_MAP[enPart] = key;
            // Common variations
            this.REVERSE_MAP[key] = key;
        });
        // Additional common column name mappings
        const extras = {
            'الشركة': 'nameAr', 'Company': 'nameAr', 'company_name': 'nameAr',
            'الهاتف': 'phone1', 'Phone': 'phone1', 'phone': 'phone1',
            'الإيميل': 'email', 'Email': 'email',
            'المدينة': 'city', 'City': 'city',
            'Fleet': 'fleetSize', 'أسطول': 'fleetSize',
            'أولوية البيع': 'priority', 'Priority': 'priority',
            'الموقع': 'website', 'Website': 'website'
        };
        Object.assign(this.REVERSE_MAP, extras);
    },

    // ---- Export Companies to Excel ----
    exportCompanies(companies, filename = 'fleet_crm_companies') {
        if (!window.XLSX) {
            App.showToast('مكتبة Excel غير متاحة', 'error');
            return;
        }

        const headers = Object.values(this.COLUMN_MAP);
        const keys = Object.keys(this.COLUMN_MAP);

        const data = companies.map(comp => {
            const row = {};
            keys.forEach((key, i) => {
                let value = comp[key] || '';
                // Translate coded values
                if (key === 'sector' && value) {
                    const s = Storage.SECTORS[value];
                    value = s ? s.ar : value;
                }
                if (key === 'city' && value) {
                    const c = Storage.CITIES[value];
                    value = c ? c.ar : value;
                }
                if (key === 'fleetType' && value) {
                    const f = Storage.FLEET_TYPES[value];
                    value = f ? f.ar : value;
                }
                row[headers[i]] = value;
            });
            return row;
        });

        const ws = XLSX.utils.json_to_sheet(data);

        // Set column widths
        ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length, 15) }));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'الشركات');

        // Add Sectors sheet
        const sectorsData = Object.entries(Storage.SECTORS).map(([key, val]) => ({
            'الرمز / Code': key,
            'القطاع (عربي) / Sector (AR)': val.ar,
            'القطاع (إنجليزي) / Sector (EN)': val.en,
            'الرمز التعبيري / Icon': val.icon
        }));
        const ws2 = XLSX.utils.json_to_sheet(sectorsData);
        XLSX.utils.book_append_sheet(wb, ws2, 'القطاعات');

        // Add Cities sheet
        const citiesData = Object.entries(Storage.CITIES).map(([key, val]) => ({
            'الرمز / Code': key,
            'المنطقة (عربي) / Area (AR)': val.ar,
            'المنطقة (إنجليزي) / Area (EN)': val.en
        }));
        const ws3 = XLSX.utils.json_to_sheet(citiesData);
        XLSX.utils.book_append_sheet(wb, ws3, 'المناطق');

        // Add Call Log sheet if calls exist
        const calls = Storage.getCalls();
        if (calls.length > 0) {
            const callsData = calls.map(call => {
                const company = Storage.getCompany(call.companyId);
                return {
                    'التاريخ / Date': call.date,
                    'الوقت / Time': call.time || '',
                    'الشركة / Company': company ? company.nameAr : '',
                    'جهة الاتصال / Contact': call.contactPerson || '',
                    'النتيجة / Result': Storage.getCallResultLabel(call.result),
                    'تاريخ المتابعة / Follow-up': call.followUpDate || '',
                    'ملاحظات / Notes': call.notes || ''
                };
            });
            const ws4 = XLSX.utils.json_to_sheet(callsData);
            XLSX.utils.book_append_sheet(wb, ws4, 'سجل المكالمات');
        }

        // Download
        const dateStr = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `${filename}_${dateStr}.xlsx`);
        App.showToast(`تم تصدير ${companies.length} شركة إلى Excel`, 'success');
    },

    // ---- Import Companies from Excel ----
    importCompanies(file, callback) {
        if (!window.XLSX) {
            App.showToast('مكتبة Excel غير متاحة', 'error');
            return;
        }

        this._buildReverseMap();

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Read first sheet
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json(sheet);

                if (rows.length === 0) {
                    App.showToast('الملف فارغ', 'warning');
                    if (callback) callback(0);
                    return;
                }

                // Map columns
                const companies = rows.map(row => {
                    const company = {};
                    Object.entries(row).forEach(([header, value]) => {
                        const key = this.REVERSE_MAP[header.trim()];
                        if (key) {
                            company[key] = value;
                        }
                    });

                    // Reverse-translate sector
                    if (company.sector) {
                        const sectorEntry = Object.entries(Storage.SECTORS).find(
                            ([k, v]) => v.ar === company.sector || v.en === company.sector || k === company.sector
                        );
                        if (sectorEntry) company.sector = sectorEntry[0];
                    }

                    // Reverse-translate city
                    if (company.city) {
                        const cityEntry = Object.entries(Storage.CITIES).find(
                            ([k, v]) => v.ar === company.city || v.en === company.city || k === company.city
                        );
                        if (cityEntry) company.city = cityEntry[0];
                    }

                    // Reverse-translate fleet type
                    if (company.fleetType) {
                        const ftEntry = Object.entries(Storage.FLEET_TYPES).find(
                            ([k, v]) => v.ar === company.fleetType || v.en === company.fleetType || k === company.fleetType
                        );
                        if (ftEntry) company.fleetType = ftEntry[0];
                    }

                    // Convert numbers
                    if (company.fleetSize) company.fleetSize = parseInt(company.fleetSize) || 0;
                    if (company.branchesCount) company.branchesCount = parseInt(company.branchesCount) || 0;

                    // Calculate priority based on sector if not explicitly provided
                    if (!company.priority || !['A', 'B', 'C'].includes(company.priority)) {
                        company.priority = Storage.calculatePriority(Storage.mapScraperSectorToCRM(company.sector));
                    }

                    return company;
                }).filter(c => c.nameAr || c.nameEn); // Must have at least a name

                const addedCount = Storage.importCompanies(companies);
                App.showToast(`تم استيراد ${addedCount} شركة جديدة (تم تجاهل ${companies.length - addedCount} مكرر)`, 'success');
                if (callback) callback(addedCount);
            } catch (err) {
                console.error('Import error:', err);
                App.showToast('خطأ في قراءة الملف: ' + err.message, 'error');
                if (callback) callback(0);
            }
        };
        reader.readAsArrayBuffer(file);
    },

    // ---- Export Calls to Excel ----
    exportCalls(calls, filename = 'fleet_crm_calls') {
        if (!window.XLSX) {
            App.showToast('مكتبة Excel غير متاحة', 'error');
            return;
        }

        const data = calls.map(call => {
            const company = Storage.getCompany(call.companyId);
            return {
                'التاريخ / Date': call.date,
                'الوقت / Time': call.time || '',
                'الشركة / Company': company ? company.nameAr : '',
                'جهة الاتصال / Contact': call.contactPerson || '',
                'النتيجة / Result': Storage.getCallResultLabel(call.result),
                'تاريخ المتابعة / Follow-up': call.followUpDate || '',
                'ملاحظات / Notes': call.notes || ''
            };
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'سجل المكالمات');

        const dateStr = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `${filename}_${dateStr}.xlsx`);
        App.showToast(`تم تصدير ${calls.length} مكالمة إلى Excel`, 'success');
    },

    // ---- Generate Template Excel ----
    generateTemplate() {
        if (!window.XLSX) {
            App.showToast('مكتبة Excel غير متاحة', 'error');
            return;
        }

        const headers = Object.values(this.COLUMN_MAP);
        const ws = XLSX.utils.aoa_to_sheet([headers]);
        ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 2, 18) }));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'الشركات');

        // Add reference sheets
        const sectorsData = Object.entries(Storage.SECTORS).map(([key, val]) => [val.icon + ' ' + val.ar, val.en, key]);
        const ws2 = XLSX.utils.aoa_to_sheet([['القطاع (عربي)', 'Sector (EN)', 'الرمز'], ...sectorsData]);
        XLSX.utils.book_append_sheet(wb, ws2, 'مرجع القطاعات');

        const citiesData = Object.entries(Storage.CITIES).map(([key, val]) => [val.ar, val.en, key]);
        const ws3 = XLSX.utils.aoa_to_sheet([['المنطقة (عربي)', 'Area (EN)', 'الرمز'], ...citiesData]);
        XLSX.utils.book_append_sheet(wb, ws3, 'مرجع المناطق');

        XLSX.writeFile(wb, 'fleet_crm_template.xlsx');
        App.showToast('تم تحميل قالب الـ Excel', 'success');
    }
};
