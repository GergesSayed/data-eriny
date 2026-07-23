/* ============================================
   Team Module — Fleet CRM
   Employee User Management & Performance Audit
   ============================================ */

const Team = {
    init() {
        this.bindEvents();
        this.render();
    },

    bindEvents() {
        document.getElementById('btn-add-user')?.addEventListener('click', () => this.openUserModal());
        document.getElementById('form-user')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUser();
        });
    },

    render() {
        try {
            const currentUser = Storage.getCurrentUser();
            const teamPage = document.getElementById('page-team');
            if (!teamPage) return;

            // Only Admin can view team management & performance audit
            if (!Storage.isAdmin(currentUser)) {
                teamPage.innerHTML = `
                    <div class="empty-state" style="padding:60px 20px;">
                        <i class="fas fa-lock" style="font-size:48px; color:var(--text-muted); margin-bottom:16px;"></i>
                        <h2>شاشة غير مصرح بها</h2>
                        <p style="color:var(--text-muted);">هذه الشاشة مخصصة للمدير العام لمتابعة أداء الموظفين وتعيين الحسابات.</p>
                    </div>`;
                return;
            }

            const users = Storage.getUsers() || [];
            const allCompanies = Storage.getCompanies() || [];
            const allCalls = Storage.getCalls() || [];
            const allDeals = Storage.getDeals() || [];

            // Set of all active valid user identifiers
            const activeUserKeys = new Set(users.flatMap(u => [u.id, u.username, u.name].filter(Boolean)));

            // Compute detailed lead audit stats per user
            const usersStats = users.map(user => {
                const assignedCompanies = allCompanies.filter(c => c && (c.assignedTo === user.id || c.assignedTo === user.username || (user.name && c.assignedTo === user.name)));

                // Contacted vs Remaining companies
                const contactedCompanies = assignedCompanies.filter(c => c.lastCallResult || c.status === 'interested' || c.status === 'contacted' || c.status === 'unqualified');
                const remainingCompanies = assignedCompanies.filter(c => !c.lastCallResult && c.status !== 'interested' && c.status !== 'contacted' && c.status !== 'unqualified');

                // Breakdown by lead condition
                const interestedLeads = assignedCompanies.filter(c => c.status === 'interested' || c.lastCallResult === 'interested' || c.lastCallResult === 'meeting_scheduled' || c.lastCallResult === 'proposal_sent');
                const notInterestedLeads = assignedCompanies.filter(c => c.lastCallResult === 'not_interested' || c.lastCallResult === 'wrong_number');

                const userCalls = allCalls.filter(call => call && (call.userId === user.id || call.createdByName === user.name));
                const userDeals = allDeals.filter(deal => deal && (deal.assignedTo === user.id || deal.createdByName === user.name));
                const wonDeals = userDeals.filter(deal => deal && deal.stage === 'won');
                const totalRevenue = wonDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

                return {
                    ...user,
                    assignedCount: assignedCompanies.length,
                    contactedCount: contactedCompanies.length,
                    remainingCount: remainingCompanies.length,
                    interestedCount: interestedLeads.length,
                    notInterestedCount: notInterestedLeads.length,
                    callsCount: userCalls.length,
                    dealsCount: userDeals.length,
                    wonDealsCount: wonDeals.length,
                    totalRevenue
                };
            });

            // Overall Team Totals (only counting companies assigned to active users)
            const totalAssigned = allCompanies.filter(c => c && c.assignedTo && activeUserKeys.has(c.assignedTo)).length;
            const totalUnassigned = allCompanies.length - totalAssigned;

            const pendingUsers = Storage.getPendingUsers();
            const pendingHtml = pendingUsers.length === 0 ? '' : `
                <div class="card" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.08)); border: 1.5px solid #f59e0b; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
                        <h3 style="margin: 0; color: #f59e0b; font-size: 1.1rem; font-weight: 800;">
                            <i class="fas fa-bell" style="margin-left: 8px;"></i> طلبات التسجيل والانضمام المعلقة (${pendingUsers.length})
                        </h3>
                        <span class="badge" style="background: #f59e0b; color: #000; font-weight: 800;">بانتظار موافقة المدير العام</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${pendingUsers.map(u => `
                            <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px 18px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(245, 158, 11, 0.2); color: #f59e0b; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800;">👤</div>
                                    <div>
                                        <span style="font-weight: 800; color: var(--text-primary); font-size: 14px;">${u.name}</span>
                                        <span style="display: block; font-size: 12px; color: var(--text-muted); direction: ltr; text-align: right;">📧 ${u.email || u.username}</span>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                    <button class="btn btn-success btn-sm" style="font-size: 12px; font-weight: 800; padding: 6px 14px; background:#10b981; color:#fff;" onclick="Team.approveUser('${u.id}', 'agent')">
                                        <i class="fas fa-check"></i> موافقة وتفعيل (موظف مبيعات)
                                    </button>
                                    <button class="btn btn-primary btn-sm" style="font-size: 12px; font-weight: 800; padding: 6px 14px; background: #7c3aed; color:#fff;" onclick="Team.approveUser('${u.id}', 'admin')">
                                        <i class="fas fa-crown"></i> موافقة وتعيين كـ أدمن
                                    </button>
                                    <button class="btn btn-danger btn-sm" style="font-size: 12px; font-weight: 800; padding: 6px 12px; background: #ef4444; color:#fff;" onclick="Team.rejectUser('${u.id}')">
                                        <i class="fas fa-times"></i> رفض
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            teamPage.innerHTML = `
                ${pendingHtml}
                <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div>
                        <h1 class="page-title"><i class="fas fa-users-cog"></i> لوحة التحكم في الموظفين والصلاحيات المعتمَدة</h1>
                        <p class="page-subtitle">اعتماد الطلبات، وتعيين الأدوار والمناطق، ومتابعة إنجازات الفريق الحية</p>
                    </div>
                    ${Storage.canModify() ? `
                        <button class="btn btn-primary" id="btn-add-user" onclick="Team.openUserModal()">
                            <i class="fas fa-user-plus"></i> إضافة موظف جديد
                        </button>
                    ` : ''}
                </div>

                <!-- Roles & Permissions Matrix Guide Panel -->
                <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9)); border: 1px solid rgba(124, 58, 237, 0.25); border-radius: 16px; padding: 18px 22px; margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
                        <h4 style="margin: 0; font-size: 1rem; font-weight: 800; color: #f8fafc;">
                            <i class="fas fa-shield-halved" style="color: #7c3aed; margin-left: 8px;"></i> نظام إدارة الأدوار ومستويات الوصول (Roles & Permissions Matrix)
                        </h4>
                        <span style="font-size: 0.78rem; color: #94a3b8;">يمكنك تخصيص وتعديل صلاحية أي موظف فوراً من زر التعديل ✏️</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px;">
                        <div style="background: rgba(124, 58, 237, 0.1); border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 12px; padding: 12px 14px;">
                            <div style="font-weight: 800; color: #c4b5fd; font-size: 0.9rem; margin-bottom: 4px;">👑 مدير عام (Admin)</div>
                            <p style="font-size: 0.78rem; color: #cbd5e1; margin: 0; line-height: 1.4;">تحكم شامل بكافة الخصائص • إضافة وتعديل الشركات • إسناد الشركات للموظفين • إدارة وصلاحيات الفريق كاملاً.</p>
                        </div>
                        <div style="background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 12px 14px;">
                            <div style="font-weight: 800; color: #22d3ee; font-size: 0.9rem; margin-bottom: 4px;">👁️ مشرف (Supervisor)</div>
                            <p style="font-size: 0.78rem; color: #cbd5e1; margin: 0; line-height: 1.4;">استعراض ومتابعة شاملة لجميع الشاشات والشركات والمكالمات والتقارير <b style="color:#22d3ee;">(🔒 قراءة فقط دون صلاحية إضافة أو تعديل أو حذف)</b>.</p>
                        </div>
                        <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 12px 14px;">
                            <div style="font-weight: 800; color: #60a5fa; font-size: 0.9rem; margin-bottom: 4px;">👨‍💼 مسؤول مبيعات (Sales Agent)</div>
                            <p style="font-size: 0.78rem; color: #cbd5e1; margin: 0; line-height: 1.4;">رؤية واستعراض الشركات المسندة له فقط من قبل المدير العام • تسجيل وتوثيق مكالماته اليومية وإضافة الصفقات.</p>
                        </div>
                    </div>
                </div>

                <!-- Team Overview Summary Cards -->
                <div class="stats-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-bottom:24px;">
                    <div class="stat-card" style="background:var(--bg-secondary); border-radius:12px; padding:16px; border:1px solid var(--border-color);">
                        <div style="font-size:12px; color:var(--text-muted); font-weight:700;">👥 عدد أعضاء الفريق</div>
                        <div style="font-size:28px; font-weight:800; color:var(--text-primary); margin-top:4px;">${users.length} <small style="font-size:14px; font-weight:normal;">حسابات</small></div>
                    </div>
                    <div class="stat-card" style="background:var(--bg-secondary); border-radius:12px; padding:16px; border:1px solid var(--border-color);">
                        <div style="font-size:12px; color:var(--text-muted); font-weight:700;">📌 شركات مسندة للموظفين</div>
                        <div style="font-size:28px; font-weight:800; color:#7c3aed; margin-top:4px;">${totalAssigned} <small style="font-size:14px; font-weight:normal;">شركة</small></div>
                    </div>
                    <div class="stat-card" style="background:var(--bg-secondary); border-radius:12px; padding:16px; border:1px solid var(--border-color);">
                        <div style="font-size:12px; color:var(--text-muted); font-weight:700;">⚪ شركات غير مسندة لأحد</div>
                        <div style="font-size:28px; font-weight:800; color:#f59e0b; margin-top:4px;">${totalUnassigned} <small style="font-size:14px; font-weight:normal;">شركة</small></div>
                    </div>
                    <div class="stat-card" style="background:var(--bg-secondary); border-radius:12px; padding:16px; border:1px solid var(--border-color);">
                        <div style="font-size:12px; color:var(--text-muted); font-weight:700;">📞 إجمالي مكالمات الفريق</div>
                        <div style="font-size:28px; font-weight:800; color:#10b981; margin-top:4px;">${allCalls.length} <small style="font-size:14px; font-weight:normal;">مكالمة</small></div>
                    </div>
                </div>

                <!-- Employee Audit Table -->
                <div class="table-container" style="background:var(--bg-secondary); border-radius:16px; border:1px solid var(--border-color); padding:20px; box-shadow:var(--shadow-sm);">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
                        <div>
                            <h3 style="margin:0; font-size:17px; font-weight:800; color:var(--text-primary);">
                                <i class="fas fa-users-gear" style="color:#7c3aed; margin-left:8px;"></i> جدول الموظفين وتفاصيل الصلاحيات الفردية
                            </h3>
                            <p style="margin:4px 0 0 0; font-size:12px; color:var(--text-muted);">فصل دقيق لكافة مستويات الوصول (مدير عام 👑، مشرف قراءة فقط 👁️، مسؤول مبيعات 👨‍💼)</p>
                        </div>
                        ${Storage.canModify() ? `
                            <button class="btn btn-primary" onclick="Team.openUserModal()" style="background:var(--gradient-primary); padding:10px 20px; font-weight:800; border-radius:12px; box-shadow:0 4px 15px rgba(124, 58, 237, 0.4);">
                                <i class="fas fa-user-plus" style="margin-left:6px;"></i> إضافة موظف جديد تحديد الصلاحيات
                            </button>
                        ` : ''}
                    </div>

                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>الموظف <small>Employee</small></th>
                                <th>مستوى الصلاحية والتحكم <small>Role & Scope</small></th>
                                <th>المنطقة ورقم ERP</th>
                                <th>الشركات المسندة</th>
                                <th>تم التواصل <small>Contacted</small></th>
                                <th>متبقية لم يتصل <small>Remaining</small></th>
                                <th>عملاء مهتمين <small>Interested</small></th>
                                <th>غير مهتمين <small>Uninterested</small></th>
                                <th>صفقات ناجحة <small>Won Deals</small></th>
                                <th>إجراءات <small>Actions</small></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${usersStats.map(u => {
                                let roleBadge = '';
                                let permDetail = '';

                                if (u.role === 'admin' || u.id === 'admin') {
                                    roleBadge = `<span class="badge" style="background:rgba(124, 58, 237, 0.2); color:#c4b5fd; border:1px solid #7c3aed; font-weight:800; padding:5px 10px;">👑 مدير عام (Admin)</span>`;
                                    permDetail = `<div style="font-size:10px; color:#a78bfa; margin-top:4px; font-weight:700;"><i class="fas fa-check-double" style="color:#10b981; margin-left:3px;"></i> تحكم وتعديل وإسناد وإدارة كاملة</div>`;
                                } else if (u.role === 'supervisor') {
                                    roleBadge = `<span class="badge" style="background:rgba(6, 182, 212, 0.2); color:#22d3ee; border:1px solid #06b6d4; font-weight:800; padding:5px 10px;">👁️ مشرف (Supervisor)</span>`;
                                    permDetail = `<div style="font-size:10px; color:#22d3ee; margin-top:4px; font-weight:700;"><i class="fas fa-eye" style="color:#06b6d4; margin-left:3px;"></i> رؤية كل الشاشات • 🔒 قراءة فقط (بدون تعديل)</div>`;
                                } else {
                                    roleBadge = `<span class="badge" style="background:rgba(59, 130, 246, 0.2); color:#60a5fa; border:1px solid #3b82f6; font-weight:800; padding:5px 10px;">👨‍💼 مسؤول مبيعات (Sales Agent)</span>`;
                                    permDetail = `<div style="font-size:10px; color:#94a3b8; margin-top:4px; font-weight:700;"><i class="fas fa-briefcase" style="color:#3b82f6; margin-left:3px;"></i> شركاته المسندة فقط • 📞 تسجيل المكالمات</div>`;
                                }

                                return `
                                <tr>
                                    <td>
                                        <div style="display:flex; align-items:center; gap:10px;">
                                            <span style="background:${u.color || '#7c3aed'}; color:#fff; width:36px; height:36px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:bold; box-shadow:0 4px 10px rgba(0,0,0,0.2);">${u.avatar || (u.role === 'admin' ? '👑' : u.role === 'supervisor' ? '👁️' : '👨‍💼')}</span>
                                            <div>
                                                <div style="font-weight:800; color:var(--text-primary); font-size:14px;">${u.name}</div>
                                                <small style="color:var(--text-muted); font-size:11px; direction:ltr; text-align:right; display:block;">👤 @${u.username || 'user'}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        ${roleBadge}
                                        ${permDetail}
                                    </td>
                                    <td>
                                        <div style="font-size:11px;"><span class="badge" style="background:var(--bg-surface); border:1px solid var(--border-color);">${Storage.getRegionLabel(u.region)}</span></div>
                                        <code style="font-size:10px; color:var(--accent);">${u.erpCode || 'بدون ERP'}</code>
                                    </td>
                                    <td><b style="color:#7c3aed; font-size:16px;">${u.assignedCount}</b> شركة</td>
                                    <td>
                                        <span class="badge" style="background:#10b98122; color:#10b981; border:1px solid #10b981; font-weight:700;">
                                            ✅ ${u.contactedCount} شركة ${u.assignedCount > 0 ? `(${Math.round((u.contactedCount/u.assignedCount)*100)}%)` : ''}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="badge" style="background:#f59e0b22; color:#f59e0b; border:1px solid #f59e0b; font-weight:700;">
                                            ⏳ ${u.remainingCount} شركة
                                        </span>
                                    </td>
                                    <td><span class="badge" style="background:#7c3aed22; color:#7c3aed; border:1px solid #7c3aed; font-weight:700;">💚 ${u.interestedCount} مهتم</span></td>
                                    <td><span class="badge" style="background:#ef444422; color:#ef4444; border:1px solid #ef4444;">🔴 ${u.notInterestedCount} غير مهتم</span></td>
                                    <td><b>${u.wonDealsCount}</b> (${u.totalRevenue.toLocaleString()} ج.م)</td>
                                    <td>
                                        <div class="table-actions">
                                            <button class="btn btn-primary btn-sm" onclick="Team.openEmployeeProgressModal('${u.id}')" title="تقرير تواصل شركات هذا الموظف تفصيلياً" style="background:var(--gradient-primary); color:#fff; font-weight:700;">
                                                <i class="fas fa-list-check"></i> تقرير المتابعة
                                            </button>
                                            ${Storage.canModify() ? `
                                                <button class="btn btn-ghost btn-sm" onclick="Team.openAssignCompaniesModal('${u.id}')" title="تخصيص وإسناد الشركات لهذا الموظف">
                                                    <i class="fas fa-tasks"></i> تخصيص الشركات
                                                </button>
                                                ${u.id !== 'admin' ? `
                                                    <button class="btn-icon btn-edit" onclick="Team.openUserModal('${u.id}')" title="تعديل الحساب والصلاحية">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <button class="btn-icon btn-delete" onclick="Team.deleteUser('${u.id}')" title="حذف الحساب">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                ` : ''}
                                            ` : ''}
                                        </div>
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (err) {
            console.error('Error rendering Team module:', err);
        }
    },

    openEmployeeProgressModal(userId) {
        const user = Storage.getUser(userId);
        if (!user) return;

        const allCompanies = Storage.getCompanies() || [];
        const assignedCompanies = allCompanies.filter(c => c && c.assignedTo === user.id);
        const contactedCompanies = assignedCompanies.filter(c => c.lastCallResult || c.status === 'interested' || c.status === 'contacted' || c.status === 'unqualified');
        const remainingCompanies = assignedCompanies.filter(c => !c.lastCallResult && c.status !== 'interested' && c.status !== 'contacted' && c.status !== 'unqualified');
        const interestedLeads = assignedCompanies.filter(c => c.status === 'interested' || c.lastCallResult === 'interested' || c.lastCallResult === 'meeting_scheduled' || c.lastCallResult === 'proposal_sent');

        const modalHtml = `
            <div class="modal show" id="modal-employee-progress" style="z-index:99999; display:flex; align-items:center; justify-content:center; position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px);">
                <div class="modal-dialog" style="max-width:980px; width:95vw; height:85vh; display:flex; flex-direction:column; background:var(--bg-secondary); border-radius:16px; border:1px solid var(--border-color); overflow:hidden; box-shadow:var(--shadow-lg);">
                    <div class="modal-header" style="background:var(--bg-surface); padding:16px 24px; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h3 style="margin:0; font-size:18px; color:var(--text-primary);"><i class="fas fa-chart-line" style="color:#7c3aed;"></i> تقرير متابعة شركات الموظف: <span style="color:#7c3aed; font-weight:800;">${user.name}</span></h3>
                            <p style="margin:4px 0 0 0; font-size:12px; color:var(--text-muted);">عرض موقف كل شركة مسندة للموظف (هل تم التواصل معاها، هل هي مهتمة أم لا، والشركات المتبقية)</p>
                        </div>
                        <button class="modal-close" onclick="document.getElementById('modal-employee-progress').remove();" style="background:transparent; border:none; color:var(--text-muted); font-size:20px; cursor:pointer;"><i class="fas fa-times"></i></button>
                    </div>

                    <!-- Progress Cards Header inside Modal -->
                    <div style="padding:16px 24px; background:var(--bg-surface); border-bottom:1px solid var(--border-color); display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
                        <div style="background:var(--bg-primary); padding:12px 16px; border-radius:10px; border:1px solid var(--border-color);">
                            <div style="font-size:11px; color:var(--text-muted); font-weight:700;">📌 شركات مسندة للموظف</div>
                            <div style="font-size:22px; font-weight:800; color:var(--text-primary); margin-top:2px;">${assignedCompanies.length} شركة</div>
                        </div>
                        <div style="background:var(--bg-primary); padding:12px 16px; border-radius:10px; border:1px solid var(--border-color);">
                            <div style="font-size:11px; color:var(--text-muted); font-weight:700;">✅ تم التواصل معاها</div>
                            <div style="font-size:22px; font-weight:800; color:#10b981; margin-top:2px;">${contactedCompanies.length} شركة <small style="font-size:11px; font-weight:normal;">(${assignedCompanies.length > 0 ? Math.round((contactedCompanies.length / assignedCompanies.length) * 100) : 0}%)</small></div>
                        </div>
                        <div style="background:var(--bg-primary); padding:12px 16px; border-radius:10px; border:1px solid var(--border-color);">
                            <div style="font-size:11px; color:var(--text-muted); font-weight:700;">⏳ متبقية بدون اتصالات</div>
                            <div style="font-size:22px; font-weight:800; color:#f59e0b; margin-top:2px;">${remainingCompanies.length} شركة</div>
                        </div>
                        <div style="background:var(--bg-primary); padding:12px 16px; border-radius:10px; border:1px solid var(--border-color);">
                            <div style="font-size:11px; color:var(--text-muted); font-weight:700;">💚 عملاء مهتمين بالفعل</div>
                            <div style="font-size:22px; font-weight:800; color:#7c3aed; margin-top:4px;">${interestedLeads.length} عميل</div>
                        </div>
                    </div>

                    <!-- Filter Bar inside Modal -->
                    <div style="padding:10px 24px; background:var(--bg-secondary); border-bottom:1px solid var(--border-color); display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
                        <button class="btn btn-sm modal-tab-btn active" data-filter="all" onclick="Team.filterProgressModal('${user.id}', 'all', this)">الكل (${assignedCompanies.length})</button>
                        <button class="btn btn-sm modal-tab-btn" data-filter="contacted" onclick="Team.filterProgressModal('${user.id}', 'contacted', this)" style="border:1px solid #10b981; color:#10b981;">✅ تم التواصل (${contactedCompanies.length})</button>
                        <button class="btn btn-sm modal-tab-btn" data-filter="remaining" onclick="Team.filterProgressModal('${user.id}', 'remaining', this)" style="border:1px solid #f59e0b; color:#f59e0b;">⏳ متبقية بدون تواصل (${remainingCompanies.length})</button>
                        <button class="btn btn-sm modal-tab-btn" data-filter="interested" onclick="Team.filterProgressModal('${user.id}', 'interested', this)" style="border:1px solid #7c3aed; color:#7c3aed;">💚 مهتمة (${interestedLeads.length})</button>
                    </div>

                    <!-- Company Table Body -->
                    <div id="modal-employee-progress-list" style="flex:1; overflow-y:auto; padding:16px 24px;">
                    </div>

                    <div class="modal-footer" style="padding:14px 24px; background:var(--bg-surface); border-top:1px solid var(--border-color); display:flex; justify-flex:flex-end;">
                        <button class="btn btn-primary" onclick="document.getElementById('modal-employee-progress').remove();">
                            <i class="fas fa-check"></i> إغلاق التقرير
                        </button>
                    </div>
                </div>
            </div>
        `;

        const existing = document.getElementById('modal-employee-progress');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        this.renderEmployeeProgressList(userId, 'all');
    },

    renderEmployeeProgressList(userId, filterType = 'all') {
        const listEl = document.getElementById('modal-employee-progress-list');
        if (!listEl) return;

        const allCompanies = Storage.getCompanies() || [];
        let assignedCompanies = allCompanies.filter(c => c && c.assignedTo === userId);

        if (filterType === 'contacted') {
            assignedCompanies = assignedCompanies.filter(c => c.lastCallResult || c.status === 'interested' || c.status === 'contacted' || c.status === 'unqualified');
        } else if (filterType === 'remaining') {
            assignedCompanies = assignedCompanies.filter(c => !c.lastCallResult && c.status !== 'interested' && c.status !== 'contacted' && c.status !== 'unqualified');
        } else if (filterType === 'interested') {
            assignedCompanies = assignedCompanies.filter(c => c.status === 'interested' || c.lastCallResult === 'interested' || c.lastCallResult === 'meeting_scheduled' || c.lastCallResult === 'proposal_sent');
        }

        if (assignedCompanies.length === 0) {
            listEl.innerHTML = `
                <div class="empty-state" style="padding:40px 20px;">
                    <i class="fas fa-info-circle" style="font-size:36px; color:var(--text-muted); margin-bottom:12px;"></i>
                    <p style="color:var(--text-muted);">لا توجد شركات تحت هذا التصنيف حالياً.</p>
                </div>`;
            return;
        }

        listEl.innerHTML = `
            <table class="data-table" style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr style="background:var(--bg-surface); text-align:right;">
                        <th style="padding:10px;">اسم الشركة <small>Company</small></th>
                        <th style="padding:10px;">القطاع والمنطقة</th>
                        <th style="padding:10px;">حالة التواصل مع الموظف</th>
                        <th style="padding:10px;">تاريخ آخر مكالمة</th>
                        <th style="padding:10px;">ملاحظات الموظف</th>
                        <th style="padding:10px; text-align:center;">إجراء</th>
                    </tr>
                </thead>
                <tbody>
                    ${assignedCompanies.map(c => {
                        let statusBadge = '';
                        if (c.lastCallResult) {
                            statusBadge = `<span class="result-badge result-${c.lastCallResult}">${Storage.getCallResultLabel(c.lastCallResult)}</span>`;
                        } else if (c.status === 'interested') {
                            statusBadge = `<span class="badge" style="background:#10b98122; color:#10b981; border:1px solid #10b981;">💚 عميل مهتم</span>`;
                        } else {
                            statusBadge = `<span class="badge" style="background:#f59e0b22; color:#f59e0b; border:1px solid #f59e0b;">⏳ متبقية (لم يتم التواصل)</span>`;
                        }

                        return `
                            <tr style="border-bottom:1px solid var(--border-light);">
                                <td style="padding:10px;">
                                    <div style="font-weight:700; color:var(--text-primary);">${c.nameAr || c.nameEn}</div>
                                    <small style="color:var(--text-muted);">${c.phone1 || c.mobile || 'لا يوجد هاتف'}</small>
                                </td>
                                <td style="padding:10px; font-size:12px;">
                                    <span class="badge" style="background:var(--bg-surface); border:1px solid var(--border-color); padding:2px 8px;">
                                        ${Storage.getSectorLabel(c.sector)} | ${Storage.getCityLabel(c.city)}
                                    </span>
                                </td>
                                <td style="padding:10px;">${statusBadge}</td>
                                <td style="padding:10px; font-size:12px; font-family:Inter; color:var(--text-secondary);">${c.lastCallDate || '—'}</td>
                                <td style="padding:10px; font-size:12px; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--text-muted);">${c.lastCallNotes || 'لا توجد ملاحظات'}</td>
                                <td style="padding:10px; text-align:center;">
                                    <button class="btn btn-ghost btn-sm" onclick="Companies.showDetail('${c.id}')" title="تفاصيل الشركة">
                                        <i class="fas fa-eye"></i> التفاصيل
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    },

    filterProgressModal(userId, filterType, btnEl) {
        document.querySelectorAll('.modal-tab-btn').forEach(btn => btn.classList.remove('active'));
        if (btnEl) btnEl.classList.add('active');
        this.renderEmployeeProgressList(userId, filterType);
    },

    filterCompaniesForUser(userId) {
        App.navigateTo('companies');
        setTimeout(() => {
            const filterAssigned = document.getElementById('filter-assigned');
            if (filterAssigned) {
                filterAssigned.value = userId;
                Companies.render();
            }
        }, 100);
    },

    openUserModal(userId = null) {
        let user = null;
        if (userId) {
            user = Storage.getUser(userId);
        }

        const modalHtml = `
            <div class="modal show" id="modal-user-form" style="z-index:99999; display:flex; align-items:center; justify-content:center; position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px);">
                <div class="modal-dialog modal-sm" style="background:var(--bg-secondary); border-radius:16px; border:1px solid var(--border-color); overflow:hidden; width:92vw; max-width:480px; box-shadow:var(--shadow-lg); animation: modalSlideUp 0.3s ease;">
                    <div class="modal-header" style="background:var(--bg-surface); padding:16px 20px; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="font-size:16px; font-weight:700; color:var(--text-primary); margin:0;">
                            <i class="fas ${user ? 'fa-user-edit' : 'fa-user-plus'}" style="color:#7c3aed;"></i>
                            <span>${user ? 'تعديل بيانات حساب الموظف' : 'إضافة موظف جديد للفريق'}</span>
                        </h2>
                        <button class="modal-close" onclick="document.getElementById('modal-user-form').remove()" style="background:transparent; border:none; color:var(--text-muted); font-size:18px; cursor:pointer;"><i class="fas fa-times"></i></button>
                    </div>

                    <form id="form-user-submit" style="padding:20px; display:flex; flex-direction:column; gap:14px;">
                        <input type="hidden" id="user-edit-id" value="${user ? user.id : ''}">

                        <div class="form-group">
                            <label style="display:block; font-size:12px; font-weight:700; color:var(--text-secondary); margin-bottom:6px;">
                                <i class="fas fa-user" style="color:#7c3aed;"></i> اسم الموظف الكامل *
                            </label>
                            <input type="text" id="user-input-name" class="form-control" placeholder="مثال: أحمد محمود" value="${user ? user.name : ''}" required style="width:100%; padding:10px 14px; border-radius:10px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-primary); font-size:13px; outline:none;">
                        </div>

                        <div class="form-group">
                            <label style="display:block; font-size:12px; font-weight:700; color:var(--text-secondary); margin-bottom:6px;">
                                <i class="fas fa-barcode" style="color:var(--accent);"></i> رقم الموظف في ERP (ERP ID)
                            </label>
                            <input type="text" id="user-input-erp" class="form-control" placeholder="مثال: EMP-1042" value="${user ? user.erpCode || '' : ''}" style="width:100%; padding:10px 14px; border-radius:10px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-primary); font-size:13px; outline:none;">
                        </div>

                        <div class="form-group">
                            <label style="display:block; font-size:12px; font-weight:700; color:var(--text-secondary); margin-bottom:6px;">
                                <i class="fas fa-map-marked-alt" style="color:#ec4899;"></i> المنطقة والتصنيف الجغرافي
                            </label>
                            <select id="user-input-region" class="form-control" style="width:100%; padding:10px 14px; border-radius:10px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-primary); font-size:13px; outline:none;">
                                <option value="cairo" ${!user || user.region === 'cairo' ? 'selected' : ''}>🏙️ القاهرة الكبرى والمدن الجديدة</option>
                                <option value="alex" ${user && user.region === 'alex' ? 'selected' : ''}>🌊 الإسكندرية والساحل الشمالي</option>
                                <option value="upper_egypt" ${user && user.region === 'upper_egypt' ? 'selected' : ''}>🏜️ الصعيد والوجه القبلي</option>
                                <option value="delta" ${user && user.region === 'delta' ? 'selected' : ''}>🚢 الدلتا ومدن القناة</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label style="display:block; font-size:12px; font-weight:700; color:var(--text-secondary); margin-bottom:6px;">
                                <i class="fas fa-at" style="color:#3b82f6;"></i> اسم المستخدم لدخول النظام (Username) *
                            </label>
                            <input type="text" id="user-input-username" class="form-control" placeholder="مثال: ahmed" value="${user ? user.username || '' : ''}" required style="width:100%; padding:10px 14px; border-radius:10px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-primary); font-size:13px; outline:none;">
                        </div>

                        <div class="form-group">
                            <label style="display:block; font-size:12px; font-weight:700; color:var(--text-secondary); margin-bottom:6px;">
                                <i class="fas fa-key" style="color:#f59e0b;"></i> كلمة المرور (Password) *
                            </label>
                            <input type="text" id="user-input-password" class="form-control" placeholder="كلمة المرور للدخول" value="${user ? user.password || '' : '123'}" required style="width:100%; padding:10px 14px; border-radius:10px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-primary); font-size:13px; outline:none;">
                        </div>

                        <div class="form-group">
                            <label style="display:block; font-size:12px; font-weight:700; color:var(--text-secondary); margin-bottom:6px;">
                                <i class="fas fa-user-shield" style="color:#10b981;"></i> دور الموظف والصلاحية
                            </label>
                            <select id="user-input-role" class="form-control" style="width:100%; padding:10px 14px; border-radius:10px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-primary); font-size:13px; outline:none;">
                                <option value="agent" ${user && user.role === 'agent' ? 'selected' : ''}>👨‍💼 مسؤول مبيعات (يرى شركاته المخصصة فقط)</option>
                                <option value="supervisor" ${user && user.role === 'supervisor' ? 'selected' : ''}>👁️ مشرف (يرى كل شيء للقراءة فقط دون تعديل)</option>
                                <option value="admin" ${user && user.role === 'admin' ? 'selected' : ''}>👑 مدير عام (تحكم وإشراف شامل بكل الصلاحيات)</option>
                            </select>
                        </div>

                        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:8px; padding-top:14px; border-top:1px solid var(--border-light);">
                            <button type="button" class="btn btn-ghost" onclick="document.getElementById('modal-user-form').remove()" style="padding:8px 16px;">إلغاء</button>
                            <button type="submit" class="btn btn-primary" style="padding:8px 20px; background:var(--gradient-primary); font-weight:700;">
                                <i class="fas fa-save"></i> ${user ? 'حفظ التعديلات' : 'إنشاء الحساب'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const existingModal = document.getElementById('modal-user-form');
        if (existingModal) existingModal.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('form-user-submit').onsubmit = (e) => {
            e.preventDefault();
            this.saveUser();
        };
    },

    saveUser() {
        const id = document.getElementById('user-edit-id').value;
        const name = document.getElementById('user-input-name').value;
        const erpCode = document.getElementById('user-input-erp').value;
        const region = document.getElementById('user-input-region').value;
        const username = document.getElementById('user-input-username').value;
        const password = document.getElementById('user-input-password').value;
        const role = document.getElementById('user-input-role').value;

        if (id) {
            const res = Storage.updateUser(id, { name, erpCode, region, username, password, role });
            if (!res.success) {
                App.showToast(`❌ ${res.message}`, 'error');
                return;
            }
            App.showToast('✅ تم تعديل حساب الموظف بنجاح');
        } else {
            const res = Storage.addUser({ name, erpCode, region, username, password, role });
            if (!res.success) {
                App.showToast(`❌ ${res.message}`, 'error');
                return;
            }
            App.showToast('✅ تم إنشاء حساب الموظف بنجاح');
        }

        const modal = document.getElementById('modal-user-form');
        if (modal) modal.remove();
        this.render();
        if (typeof App !== 'undefined' && App.refreshUserSwitcher) App.refreshUserSwitcher();
        if (typeof Companies !== 'undefined' && Companies.refreshUserFilter) Companies.refreshUserFilter();
    },

    deleteUser(id) {
        if (!confirm('هل أنت تأكد من رغبتك في حذف حساب هذا الموظف؟')) return;
        const res = Storage.deleteUser(id);
        if (!res.success) {
            App.showToast(`❌ ${res.message}`, 'error');
            return;
        }
        App.showToast('✅ تم حذف الحساب');
        this.render();
        if (typeof App !== 'undefined' && App.refreshUserSwitcher) App.refreshUserSwitcher();
        if (typeof Companies !== 'undefined' && Companies.refreshUserFilter) Companies.refreshUserFilter();
    },

    openAssignCompaniesModal(userId) {
        const user = Storage.getUser(userId);
        if (!user) return;

        const companies = Storage.getCompanies() || [];

        const modalHtml = `
            <div class="modal show" id="modal-assign-companies" style="z-index:99999; display:flex; align-items:center; justify-content:center; position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px);">
                <div class="modal-dialog" style="max-width:950px; width:95vw; height:85vh; display:flex; flex-direction:column; background:var(--bg-secondary); border-radius:16px; border:1px solid var(--border-color); overflow:hidden; box-shadow:var(--shadow-lg);">
                    <div class="modal-header" style="background:var(--bg-surface); padding:16px 24px; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h3 style="margin:0; font-size:18px; color:var(--text-primary);"><i class="fas fa-tasks" style="color:#7c3aed;"></i> تخصيص وإسناد الشركات لـ: <span style="color:#7c3aed; font-weight:800;">${user.name}</span></h3>
                            <p style="margin:4px 0 0 0; font-size:12px; color:var(--text-muted);">اختر أي شركة وتخصصها لهذا الموظف أو اسحبها وأعد تعيينها فوراً</p>
                        </div>
                        <button class="modal-close" onclick="document.getElementById('modal-assign-companies').remove(); Team.render();" style="background:transparent; border:none; color:var(--text-muted); font-size:20px; cursor:pointer;"><i class="fas fa-times"></i></button>
                    </div>

                    <!-- Search & Filters Bar inside Modal -->
                    <div style="padding:12px 24px; background:var(--bg-surface); border-bottom:1px solid var(--border-color); display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
                        <div style="flex:1; min-width:200px; position:relative;">
                            <input type="text" id="modal-assign-search" class="form-control" placeholder="🔍 بحث باسم الشركة أو المنطقة أو النشاط..." style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-primary); font-size:13px;">
                        </div>
                        <select id="modal-assign-filter-status" style="padding:8px 12px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-primary); font-size:13px;">
                            <option value="all">الكل (جميع الشركات)</option>
                            <option value="assigned_to_user" selected>خاصة بـ ${user.name} فقط (${companies.filter(c => c.assignedTo === user.id).length})</option>
                            <option value="unassigned">شركات غير مسندة (${companies.filter(c => !c.assignedTo).length})</option>
                            <option value="assigned_others">مسندة لموظفين آخرين</option>
                        </select>
                    </div>

                    <!-- Companies List Body -->
                    <div id="modal-assign-companies-list" style="flex:1; overflow-y:auto; padding:16px 24px;">
                    </div>

                    <div class="modal-footer" style="padding:16px 24px; background:var(--bg-surface); border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
                        <span id="modal-assign-summary-count" style="font-size:13px; font-weight:700; color:#7c3aed;"></span>
                        <button class="btn btn-primary" onclick="document.getElementById('modal-assign-companies').remove(); Team.render();">
                            <i class="fas fa-check"></i> حفظ وإغلاق
                        </button>
                    </div>
                </div>
            </div>
        `;

        const existing = document.getElementById('modal-assign-companies');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        this.renderAssignList(userId);

        // Bind Search and Filter input listeners inside modal
        const searchInput = document.getElementById('modal-assign-search');
        const filterSelect = document.getElementById('modal-assign-filter-status');

        if (searchInput) searchInput.oninput = () => this.renderAssignList(userId);
        if (filterSelect) filterSelect.onchange = () => this.renderAssignList(userId);
    },

    renderAssignList(targetUserId) {
        const listEl = document.getElementById('modal-assign-companies-list');
        const countEl = document.getElementById('modal-assign-summary-count');
        if (!listEl) return;

        const users = Storage.getUsers() || [];
        const targetUser = Storage.getUser(targetUserId);
        let companies = Storage.getCompanies() || [];

        const searchVal = (document.getElementById('modal-assign-search')?.value || '').toLowerCase().trim();
        const statusVal = document.getElementById('modal-assign-filter-status')?.value || 'all';

        // Apply Search Filter
        if (searchVal) {
            companies = companies.filter(c => 
                (c.nameAr && c.nameAr.toLowerCase().includes(searchVal)) ||
                (c.nameEn && c.nameEn.toLowerCase().includes(searchVal)) ||
                (c.city && c.city.toLowerCase().includes(searchVal)) ||
                (c.sector && c.sector.toLowerCase().includes(searchVal))
            );
        }

        // Apply Status Filter
        if (statusVal === 'assigned_to_user') {
            companies = companies.filter(c => c.assignedTo === targetUserId);
        } else if (statusVal === 'unassigned') {
            companies = companies.filter(c => !c.assignedTo);
        } else if (statusVal === 'assigned_others') {
            companies = companies.filter(c => c.assignedTo && c.assignedTo !== targetUserId);
        }

        const totalAssignedToTarget = Storage.getCompanies().filter(c => c.assignedTo === targetUserId).length;
        if (countEl) {
            countEl.innerHTML = `📌 الموظف <b>${targetUser ? targetUser.name : ''}</b> لديه الآن: <b style="font-size:16px;">${totalAssignedToTarget}</b> شركة مسندة (معروض ${companies.length} شركة)`;
        }

        if (companies.length === 0) {
            listEl.innerHTML = `
                <div class="empty-state" style="padding:40px 20px;">
                    <i class="fas fa-search" style="font-size:36px; color:var(--text-muted); margin-bottom:12px;"></i>
                    <p style="color:var(--text-muted);">لا توجد شركات تطابق هذا البحث أو الفلتر المختار.</p>
                </div>`;
            return;
        }

        listEl.innerHTML = `
            <table class="data-table" style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr style="background:var(--bg-surface); text-align:right;">
                        <th style="padding:10px;">الشركة <small>Company</small></th>
                        <th style="padding:10px;">القطاع / المدينة</th>
                        <th style="padding:10px;">المسند إليه حالياً <small>Assigned To</small></th>
                        <th style="padding:10px; text-align:center;">الإجراء السريع</th>
                    </tr>
                </thead>
                <tbody>
                    ${companies.map(c => {
                        const isTargetUser = c.assignedTo === targetUserId;

                        return `
                            <tr style="border-bottom:1px solid var(--border-light); ${isTargetUser ? 'background:rgba(124, 58, 237, 0.12);' : ''}">
                                <td style="padding:10px;">
                                    <div style="font-weight:700; color:var(--text-primary);">${c.nameAr || c.nameEn || 'بدون اسم'}</div>
                                    <small style="color:var(--text-muted);">${c.phone1 || c.mobile || 'لا يوجد هاتف'}</small>
                                </td>
                                <td style="padding:10px; font-size:12px;">
                                    <span class="badge" style="background:var(--bg-surface); border:1px solid var(--border-color); padding:2px 8px;">
                                        ${Storage.getSectorLabel(c.sector)} | ${Storage.getCityLabel(c.city)}
                                    </span>
                                </td>
                                <td style="padding:10px;">
                                    <select onchange="Team.quickChangeAssign('${c.id}', this.value, '${targetUserId}')" style="padding:6px 10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-primary); font-size:12px;">
                                        <option value="" ${!c.assignedTo ? 'selected' : ''}>⚪ غير مسندة (غير مخصصة)</option>
                                        ${users.map(u => `
                                            <option value="${u.id}" ${c.assignedTo === u.id ? 'selected' : ''}>
                                                ${u.id === targetUserId ? '🎯 ' : ''}${u.name} (${u.role === 'admin' ? 'مدير' : 'موظف'})
                                            </option>
                                        `).join('')}
                                    </select>
                                </td>
                                <td style="padding:10px; text-align:center;">
                                    ${isTargetUser ? `
                                        <button class="btn btn-danger btn-sm" onclick="Team.quickChangeAssign('${c.id}', '', '${targetUserId}')" style="padding:4px 10px; font-size:11px;">
                                            <i class="fas fa-user-minus"></i> سحب وإلغاء الإسناد
                                        </button>
                                    ` : `
                                        <button class="btn btn-primary btn-sm" onclick="Team.quickChangeAssign('${c.id}', '${targetUserId}', '${targetUserId}')" style="padding:4px 10px; font-size:11px;">
                                            <i class="fas fa-user-plus"></i> إسناد لـ ${targetUser ? targetUser.name : ''}
                                        </button>
                                    `}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    },

    quickChangeAssign(companyId, newUserId, currentModalTargetUserId) {
        Storage.assignCompany(companyId, newUserId);
        const user = newUserId ? Storage.getUser(newUserId) : null;
        if (newUserId) {
            App.showToast(`✅ تم إسناد الشركة إلى: ${user ? user.name : newUserId}`);
        } else {
            App.showToast(`🗑️ تم إلغاء إسناد الشركة وتفريغها`);
        }
        this.renderAssignList(currentModalTargetUserId);
    },

    approveUser(userId, role = 'agent') {
        const user = Storage.approveUser(userId, role);
        if (user) {
            App.showToast(`✅ تم اعتماد وتفعيل حساب ${user.name} بنجاح كـ ${role === 'admin' ? 'مدير عام' : 'موظف مبيعات'}`, 'success');
            this.render();
        }
    },

    rejectUser(userId) {
        if (confirm('هل أنت متأكد من رفض وإلغاء طلب التسجيل هذا؟')) {
            Storage.rejectUser(userId);
            App.showToast('🗑️ تم رفض طلب التسجيل', 'info');
            this.render();
        }
    },

    toggleFreeze(userId) {
        const user = Storage.toggleUserFreeze(userId);
        if (user) {
            App.showToast(`تم ${user.status === 'frozen' ? 'تجميد' : 'إعادة تفعيل'} حساب ${user.name}`, 'info');
            this.render();
        }
    }
};
