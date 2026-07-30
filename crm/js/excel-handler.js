/* AppStorage Global Safe Declaration */
var AppStorage = window.AppStorage = window.AppStorage || {};
var Storage = window.AppStorage;
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
            const arPart = header.split(' / ')[0];
            this.REVERSE_MAP[arPart] = key;
            const enPart = header.split(' / ')[1];
            if (enPart) this.REVERSE_MAP[enPart] = key;
            this.REVERSE_MAP[key] = key;
        });
        const extras = {
            'الشركة': 'nameAr', 'Company': 'nameAr', 'company_name': 'nameAr', 'اسم الشركة': 'nameAr', 'الاسم': 'nameAr', 'Name': 'nameAr',
            'الهاتف': 'phone1', 'Phone': 'phone1', 'phone': 'phone1', 'تليفون': 'phone1', 'رقم الهاتف': 'phone1', 'موبايل': 'mobile', 'Mobile': 'mobile',
            'الإيميل': 'email', 'Email': 'email', 'البريد': 'email',
            'المدينة': 'city', 'City': 'city', 'المنطقة': 'city', 'Area': 'city', 'المحافظة': 'governorate',
            'Fleet': 'fleetSize', 'أسطول': 'fleetSize', 'حجم الأسطول': 'fleetSize', 'عدد السيارات': 'fleetSize',
            'أولوية البيع': 'priority', 'Priority': 'priority', 'الأولوية': 'priority',
            'الموقع': 'website', 'Website': 'website', 'موقع الشركة': 'website',
            'العنوان': 'address', 'Address': 'address',
            'جهة الاتصال': 'contactPerson', 'المسؤول': 'contactPerson', 'Contact': 'contactPerson', 'اسم المسؤول': 'contactPerson',
            'ملاحظات': 'notes', 'Notes': 'notes'
        };
        Object.assign(this.REVERSE_MAP, extras);
    },

    _mapHeaderToKey(header) {
        if (!header) return null;
        this._buildReverseMap();
        const trimmed = String(header).trim();
        if (this.REVERSE_MAP[trimmed]) return this.REVERSE_MAP[trimmed];

        const norm = trimmed.toLowerCase()
            .replace(/[أإآ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .replace(/[^a-z0-9\u0600-\u06FF]/gi, '');

        if (norm.includes('شركة') || norm.includes('company') || norm.includes('اسم') || norm.includes('name')) return 'nameAr';
        if (norm.includes('هاتف') || norm.includes('تليفون') || norm.includes('موبايل') || norm.includes('phone') || norm.includes('mobile') || norm.includes('tel')) return 'phone1';
        if (norm.includes('قطاع') || norm.includes('نشاط') || norm.includes('sector')) return 'sector';
        if (norm.includes('مدينة') || norm.includes('منطقة') || norm.includes('محافظة') || norm.includes('city') || norm.includes('area') || norm.includes('location')) return 'city';
        if (norm.includes('اسطول') || norm.includes('سيارات') || norm.includes('fleet')) return 'fleetSize';
        if (norm.includes('عنوان') || norm.includes('address')) return 'address';
        if (norm.includes('إيميل') || norm.includes('اميل') || norm.includes('بريد') || norm.includes('email')) return 'email';
        if (norm.includes('موقع') || norm.includes('site') || norm.includes('web')) return 'website';
        if (norm.includes('مسؤول') || norm.includes('جهة') || norm.includes('اتصال') || norm.includes('contact')) return 'contactPerson';
        if (norm.includes('ملاحظ') || norm.includes('note')) return 'notes';
        if (norm.includes('اولوية') || norm.includes('priority')) return 'priority';

        return null;
    },

    // ---- Export Companies to Excel / CSV ----
    triggerImport() {
        let input = document.getElementById('excel-file-input');
        if (!input) {
            input = document.createElement('input');
            input.type = 'file';
            input.id = 'excel-file-input';
            input.accept = '.xlsx, .xls, .csv';
            input.style.display = 'none';
            document.body.appendChild(input);
        }
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.importCompanies(file, (count) => {
                    if (count > 0 && typeof Companies !== 'undefined') {
                        Companies.render();
                        if (typeof Dashboard !== 'undefined') Dashboard.render();
                    }
                });
                e.target.value = '';
            }
        };
        input.click();
    },

    exportCompanies(companies, filename = 'fleet_crm_companies') {
        if (!Array.isArray(companies)) {
            filename = typeof filename === 'string' ? filename : 'fleet_crm_companies';
            companies = (typeof Companies !== 'undefined' && Companies.getFilteredCompanies) ? Companies.getFilteredCompanies() : AppStorage.getCompanies();
        }
        if (!Array.isArray(companies) || companies.length === 0) {
            companies = AppStorage.getCompanies();
        }
        if (!companies || !Array.isArray(companies) || companies.length === 0) {
            App.showToast('⚠️ لا توجد شركات للتصدير', 'warning');
            return;
        }

        // Native CSV Fallback if SheetJS library isn't loaded
        if (!window.XLSX) {
            this._exportCSVFallback(companies, filename);
            return;
        }

        const headers = Object.values(this.COLUMN_MAP);
        const keys = Object.keys(this.COLUMN_MAP);

        const data = companies.map(comp => {
            const row = {};
            keys.forEach((key, i) => {
                let value = comp[key] || '';
                if (key === 'sector' && value) {
                    const s = AppStorage.SECTORS[value];
                    value = s ? s.ar : value;
                }
                if (key === 'city' && value) {
                    const c = AppStorage.CITIES[value];
                    value = c ? c.ar : value;
                }
                if (key === 'fleetType' && value) {
                    const f = AppStorage.FLEET_TYPES[value];
                    value = f ? f.ar : value;
                }
                row[headers[i]] = value;
            });
            return row;
        });

        const ws = XLSX.utils.json_to_sheet(data);
        ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length, 15) }));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'الشركات');

        // Add Sectors sheet
        const sectorsData = Object.entries(AppStorage.SECTORS).map(([key, val]) => ({
            'الرمز / Code': key,
            'القطاع (عربي) / Sector (AR)': val.ar,
            'القطاع (إنجليزي) / Sector (EN)': val.en,
            'الرمز التعبيري / Icon': val.icon
        }));
        const ws2 = XLSX.utils.json_to_sheet(sectorsData);
        XLSX.utils.book_append_sheet(wb, ws2, 'القطاعات');

        // Add Cities sheet
        const citiesData = Object.entries(AppStorage.CITIES).map(([key, val]) => ({
            'الرمز / Code': key,
            'المنطقة (عربي) / Area (AR)': val.ar,
            'المنطقة (إنجليزي) / Area (EN)': val.en
        }));
        const ws3 = XLSX.utils.json_to_sheet(citiesData);
        XLSX.utils.book_append_sheet(wb, ws3, 'المناطق');

        // Add Call Log sheet if calls exist
        const calls = AppStorage.getCalls();
        if (calls.length > 0) {
            const callsData = calls.map(call => {
                const company = AppStorage.getCompany(call.companyId);
                return {
                    'التاريخ / Date': call.date,
                    'الوقت / Time': call.time || '',
                    'الشركة / Company': company ? company.nameAr : '',
                    'جهة الاتصال / Contact': call.contactPerson || '',
                    'النتيجة / Result': AppStorage.getCallResultLabel(call.result),
                    'تاريخ المتابعة / Follow-up': call.followUpDate || '',
                    'ملاحظات / Notes': call.notes || ''
                };
            });
            const ws4 = XLSX.utils.json_to_sheet(callsData);
            XLSX.utils.book_append_sheet(wb, ws4, 'سجل المكالمات');
        }

        const dateStr = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `${filename}_${dateStr}.xlsx`);
        App.showToast(`تم تصدير ${companies.length} شركة إلى Excel بنجاح`, 'success');
    },

    _exportCSVFallback(companies, filename) {
        const headers = Object.values(this.COLUMN_MAP);
        const keys = Object.keys(this.COLUMN_MAP);

        let csvContent = '\uFEFF' + headers.map(h => `"${h}"`).join(',') + '\n';

        companies.forEach(comp => {
            const row = keys.map(key => {
                let val = comp[key] || '';
                if (key === 'sector' && val && AppStorage.SECTORS[val]) val = AppStorage.SECTORS[val].ar;
                if (key === 'city' && val && AppStorage.CITIES[val]) val = AppStorage.CITIES[val].ar;
                if (key === 'fleetType' && val && AppStorage.FLEET_TYPES[val]) val = AppStorage.FLEET_TYPES[val].ar;
                const str = String(val).replace(/"/g, '""');
                return `"${str}"`;
            });
            csvContent += row.join(',') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        App.showToast(`تم تصدير ${companies.length} شركة إلى ملف CSV بنجاح`, 'success');
    },

    // ---- Import Companies from Excel / CSV ----
    importCompanies(file, callback) {
        this._buildReverseMap();

        const isCsv = file.name.endsWith('.csv');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (!window.XLSX || isCsv) {
                    const text = new TextDecoder('utf-8').decode(e.target.result);
                    this._importTextRows(text, callback);
                    return;
                }

                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json(sheet);

                if (rows.length === 0) {
                    App.showToast('الملف فارغ', 'warning');
                    if (callback) callback(0);
                    return;
                }

                const companies = rows.map(row => {
                    const company = {};
                    Object.entries(row).forEach(([header, value]) => {
                        const key = this._mapHeaderToKey(header);
                        if (key && value !== undefined && value !== null) {
                            company[key] = String(value).trim();
                        }
                    });

                    if (company.sector && AppStorage.SECTORS) {
                        const sectorEntry = Object.entries(AppStorage.SECTORS).find(
                            ([k, v]) => v.ar === company.sector || v.en === company.sector || k === company.sector
                        );
                        if (sectorEntry) company.sector = sectorEntry[0];
                    }

                    if (company.city && AppStorage.CITIES) {
                        const cityEntry = Object.entries(AppStorage.CITIES).find(
                            ([k, v]) => v.ar === company.city || v.en === company.city || k === company.city
                        );
                        if (cityEntry) company.city = cityEntry[0];
                    }

                    if (company.fleetType && AppStorage.FLEET_TYPES) {
                        const ftEntry = Object.entries(AppStorage.FLEET_TYPES).find(
                            ([k, v]) => v.ar === company.fleetType || v.en === company.fleetType || k === company.fleetType
                        );
                        if (ftEntry) company.fleetType = ftEntry[0];
                    }

                    if (company.fleetSize) company.fleetSize = parseInt(company.fleetSize) || 0;
                    if (company.branchesCount) company.branchesCount = parseInt(company.branchesCount) || 0;

                    if (!company.priority || !['A', 'B', 'C'].includes(company.priority)) {
                        company.priority = AppStorage.calculatePriority(AppStorage.mapScraperSectorToCRM(company.sector));
                    }

                    return company;
                }).filter(c => (c.nameAr && c.nameAr.length > 0) || (c.nameEn && c.nameEn.length > 0) || (c.phone1 && c.phone1.length > 0));

                const addedCount = AppStorage.importCompanies(companies);
                App.showToast(`تم استيراد ${addedCount} شركة جديدة بنجاح!`, 'success');
                if (callback) callback(addedCount);
            } catch (err) {
                console.error('Import error:', err);
                // Fallback to text parsing if XLSX.read failed
                try {
                    const text = new TextDecoder('utf-8').decode(e.target.result);
                    this._importTextRows(text, callback);
                } catch (e2) {
                    App.showToast('خطأ في قراءة الملف: ' + err.message, 'error');
                    if (callback) callback(0);
                }
            }
        };
        reader.readAsArrayBuffer(file);
    },

    _importTextRows(text, callback) {
        const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
        if (lines.length <= 1) {
            App.showToast('الملف فارغ أو غير مالي ببيانات', 'warning');
            if (callback) callback(0);
            return;
        }

        const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim());
        const companies = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.replace(/^["']|["']$/g, '').trim());
            const company = {};
            headers.forEach((header, idx) => {
                const key = this._mapHeaderToKey(header);
                if (key && values[idx] !== undefined && values[idx] !== '') {
                    company[key] = values[idx];
                }
            });
            if (company.nameAr || company.nameEn || company.phone1) {
                companies.push(company);
            }
        }

        const addedCount = AppStorage.importCompanies(companies);
        App.showToast(`تم استيراد ${addedCount} شركة بنجاح!`, 'success');
        if (callback) callback(addedCount);
    },

    // ---- Export Calls to Excel ----
    exportCalls(calls, filename = 'fleet_crm_calls') {
        if (!window.XLSX) {
            App.showToast('مكتبة Excel غير متاحة', 'error');
            return;
        }

        const data = calls.map(call => {
            const company = AppStorage.getCompany(call.companyId);
            return {
                'التاريخ / Date': call.date,
                'الوقت / Time': call.time || '',
                'الشركة / Company': company ? company.nameAr : '',
                'جهة الاتصال / Contact': call.contactPerson || '',
                'النتيجة / Result': AppStorage.getCallResultLabel(call.result),
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
        const sectorsData = Object.entries(AppStorage.SECTORS).map(([key, val]) => [val.icon + ' ' + val.ar, val.en, key]);
        const ws2 = XLSX.utils.aoa_to_sheet([['القطاع (عربي)', 'Sector (EN)', 'الرمز'], ...sectorsData]);
        XLSX.utils.book_append_sheet(wb, ws2, 'مرجع القطاعات');

        const citiesData = Object.entries(AppStorage.CITIES).map(([key, val]) => [val.ar, val.en, key]);
        const ws3 = XLSX.utils.aoa_to_sheet([['المنطقة (عربي)', 'Area (EN)', 'الرمز'], ...citiesData]);
        XLSX.utils.book_append_sheet(wb, ws3, 'مرجع المناطق');

        XLSX.writeFile(wb, 'fleet_crm_template.xlsx');
        App.showToast('تم تحميل قالب الـ Excel', 'success');
    }
};
