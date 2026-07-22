/* ============================================
   Pipeline Module — Fleet CRM (Kanban Board)
   ============================================ */

const Pipeline = {
    draggedDeal: null,

    init() {
        this.render();
        this.initDragAndDrop();
    },

    render() {
        const stats = Storage.getStats();
        const dealsByStage = stats.dealsByStage;
        this.renderColumns(dealsByStage);
    },

    clearAllDeals() {
        if (confirm('هل أنت متأكد من مسح جميع الصفقات التجريبية من خط المبيعات؟')) {
            Storage.clearAllDeals();
            this.render();
            if (typeof Dashboard !== 'undefined') Dashboard.render();
            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast('🗑️ تم مسح خط المبيعات بنجاح');
            }
        }
    },

    renderColumns(dealsByStage) {
        // Update total pipeline value
        document.getElementById('pipeline-total-value').textContent =
            Storage.formatCurrency(Storage.getPipelineValue()) + ' ج.م';

        // Render each column
        Object.keys(Storage.PIPELINE_STAGES).forEach(stage => {
            const cards = dealsByStage[stage] || [];
            const container = document.querySelector(`.kanban-column__cards[data-stage="${stage}"]`);
            const count = document.getElementById(`stage-count-${stage}`);

            if (count) count.textContent = cards.length;

            if (container) {
                if (cards.length === 0) {
                    container.innerHTML = '<div class="empty-state small" style="padding:1rem;"><p style="font-size:0.7rem; color:var(--text-muted);">اسحب صفقة هنا</p></div>';
                } else {
                    container.innerHTML = cards.map(deal => this.renderCard(deal)).join('');
                }
            }
        });
    },

    renderCard(deal) {
        const company = Storage.getCompany(deal.companyId);
        const companyName = company ? company.nameAr : 'شركة غير معروفة';
        const tireTypes = {
            all: 'جميع الأنواع', truck: 'نقل ثقيل', light_truck: 'نقل خفيف',
            passenger: 'ملاكي', bus: 'باصات', suv: 'SUV', forklift: 'رافعات'
        };
        const tireLabel = tireTypes[deal.tireType] || '';
        const linkedinLink = company ? (company.linkedinUrl || company.linkedin) : null;
        const linkedinIcon = linkedinLink ? ` <a href="${linkedinLink}" target="_blank" style="color: #0077b5; margin-right: 6px;" title="LinkedIn الشركة" onclick="event.stopPropagation();"><i class="fab fa-linkedin"></i></a>` : '';

        return `
            <div class="kanban-card" draggable="true" data-deal-id="${deal.id}"
                 ondragstart="Pipeline.onDragStart(event)" ondragend="Pipeline.onDragEnd(event)">
                <div class="kanban-card__title">${deal.title}</div>
                <div class="kanban-card__company" style="display:flex; align-items:center;">
                    <i class="fas fa-building" style="margin-left:4px;"></i> <span>${companyName}</span> ${linkedinIcon}
                </div>
                ${tireLabel ? `<div style="font-size:0.7rem; color:var(--text-muted); margin-bottom:0.3rem;"><i class="fas fa-circle-dot" style="font-size:0.5rem;"></i> ${tireLabel}</div>` : ''}
                <div class="kanban-card__value">${Storage.formatCurrency(deal.value)} ج.م</div>
                ${deal.quantity ? `<div style="font-size:0.7rem; color:var(--text-muted); margin-top:0.2rem;">الكمية: ${deal.quantity} إطار</div>` : ''}
                <div class="kanban-card__footer">
                    <span>${deal.expectedCloseDate || ''}</span>
                    <div class="table-actions">
                        <button class="btn-icon btn-edit" onclick="Pipeline.edit('${deal.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="Pipeline.confirmDelete('${deal.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>`;
    },

    // ---- Drag & Drop ----
    initDragAndDrop() {
        document.querySelectorAll('.kanban-column__cards').forEach(col => {
            col.addEventListener('dragover', (e) => {
                e.preventDefault();
                col.classList.add('drag-over');
            });

            col.addEventListener('dragleave', () => {
                col.classList.remove('drag-over');
            });

            col.addEventListener('drop', (e) => {
                e.preventDefault();
                col.classList.remove('drag-over');

                const dealId = e.dataTransfer.getData('text/plain');
                const newStage = col.dataset.stage;

                if (dealId && newStage) {
                    Storage.updateDealStage(dealId, newStage);
                    this.render();
                    Dashboard.render();
                    App.showToast(`تم نقل الصفقة إلى: ${Storage.PIPELINE_STAGES[newStage]?.ar}`, 'info');
                }
            });
        });
    },

    onDragStart(e) {
        const dealId = e.target.dataset.dealId;
        e.dataTransfer.setData('text/plain', dealId);
        e.target.classList.add('dragging');
    },

    onDragEnd(e) {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.kanban-column__cards').forEach(col => {
            col.classList.remove('drag-over');
        });
    },

    // ---- CRUD ----
    openAddModal() {
        document.getElementById('form-deal').reset();
        document.getElementById('deal-id').value = '';
        document.getElementById('modal-deal-title').innerHTML = '<i class="fas fa-handshake"></i> إضافة صفقة جديدة';

        Calls.populateCompanyDropdown('deal-companyId');
        App.openModal('modal-deal');
    },

    edit(id) {
        const deal = Storage.getDeal(id);
        if (!deal) return;

        document.getElementById('modal-deal-title').innerHTML = '<i class="fas fa-edit"></i> تعديل الصفقة';
        document.getElementById('deal-id').value = deal.id;

        Calls.populateCompanyDropdown('deal-companyId', deal.companyId);

        document.getElementById('deal-title').value = deal.title || '';
        document.getElementById('deal-value').value = deal.value || '';
        document.getElementById('deal-stage').value = deal.stage || 'initial_contact';
        document.getElementById('deal-tireType').value = deal.tireType || 'all';
        document.getElementById('deal-quantity').value = deal.quantity || '';
        document.getElementById('deal-expectedCloseDate').value = deal.expectedCloseDate || '';
        document.getElementById('deal-notes').value = deal.notes || '';

        App.openModal('modal-deal');
    },

    save() {
        const form = document.getElementById('form-deal');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const deal = {
            companyId: document.getElementById('deal-companyId').value,
            title: document.getElementById('deal-title').value,
            value: document.getElementById('deal-value').value,
            stage: document.getElementById('deal-stage').value,
            tireType: document.getElementById('deal-tireType').value,
            quantity: document.getElementById('deal-quantity').value,
            expectedCloseDate: document.getElementById('deal-expectedCloseDate').value,
            notes: document.getElementById('deal-notes').value
        };

        const id = document.getElementById('deal-id').value;
        if (id) deal.id = id;

        Storage.saveDeal(deal);
        App.closeModal('modal-deal');
        App.showToast(id ? 'تم تحديث الصفقة' : 'تم إضافة الصفقة بنجاح', 'success');
        this.render();
        Dashboard.render();
    },

    confirmDelete(id) {
        const deal = Storage.getDeal(id);
        if (!deal) return;

        document.getElementById('confirm-message').textContent =
            `هل أنت متأكد من حذف صفقة "${deal.title}"؟`;

        const confirmBtn = document.getElementById('btn-confirm-action');
        confirmBtn.onclick = () => {
            Storage.deleteDeal(id);
            App.closeModal('modal-confirm');
            App.showToast('تم حذف الصفقة', 'success');
            this.render();
            Dashboard.render();
        };
        App.openModal('modal-confirm');
    }
};
