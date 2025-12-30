// Product Comparison Manager
// Manages comparison list (max 3 items) with localStorage persistence

const CompareManager = {
    items: [],
    maxItems: 3,
    storageKey: 'crystalProducts_compare',

    /**
     * Initialize comparison system
     */
    init() {
        this.loadFromStorage();
        this.updateUI();
        console.log('CompareManager initialized with', this.items.length, 'items');
    },

    /**
     * Load from localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.items = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading comparison list:', error);
            this.items = [];
        }
    },

    /**
     * Save to localStorage
     */
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving comparison list:', error);
        }
    },

    /**
     * Add item to comparison list
     */
    addItem(product) {
        if (this.isInCompare(product.id)) {
            return { success: false, message: 'Already added to compare' };
        }

        if (this.items.length >= this.maxItems) {
            return { success: false, message: `Comparison limit reached (Max ${this.maxItems})` };
        }

        const item = {
            id: Number(product.id),
            name: product.name,
            price: Number(product.price),
            image: product.image,
            category: product.category,
            meta: product.meta
        };

        this.items.push(item);
        this.save();
        this.updateUI(true); // Pulse effect
        return { success: true, message: 'Added to comparison' };
    },

    /**
     * Remove item from comparison list
     */
    removeItem(id) {
        const numId = Number(id);
        this.items = this.items.filter(item => Number(item.id) !== numId);
        this.save();
        this.updateUI();
    },

    /**
     * Check if item is in comparison list
     */
    isInCompare(id) {
        const numId = Number(id);
        return this.items.some(item => Number(item.id) === numId);
    },

    /**
     * Get current items
     */
    getItems() {
        return this.items;
    },

    /**
     * Clear list
     */
    clear() {
        this.items = [];
        this.save();
        this.updateUI();
    },

    /**
     * Update Floating UI Bar
     */
    updateUI(pulse = false) {
        // Create or update floating bubble
        let floatBar = document.getElementById('compareFloatBar');

        if (this.items.length === 0) {
            if (floatBar) floatBar.classList.remove('active');
            return;
        }

        if (!floatBar) {
            floatBar = document.createElement('div');
            floatBar.id = 'compareFloatBar';
            floatBar.className = 'compare-float-bar';
            floatBar.innerHTML = `
                <div class="compare-icon">
                    <i class="fas fa-balance-scale"></i>
                    <span class="compare-count">0</span>
                </div>
                <span class="compare-text">Compare</span>
            `;
            document.body.appendChild(floatBar);

            floatBar.addEventListener('click', () => this.showComparisonModal());
        }

        const countBadge = floatBar.querySelector('.compare-count');
        if (countBadge) {
            countBadge.textContent = this.items.length;
            if (pulse) {
                countBadge.classList.add('pulse');
                setTimeout(() => countBadge.classList.remove('pulse'), 600);
            }
        }

        floatBar.classList.add('active');
    },

    /**
     * Show Comparison Modal
     */
    showComparisonModal() {
        // Close other modals if open
        const existingModals = document.querySelectorAll('.quick-view-modal.active');
        existingModals.forEach(m => m.classList.remove('active'));

        let modal = document.getElementById('compareModal');

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'compareModal';
            modal.className = 'quick-view-modal compare-modal'; // Reuse modal base class
            modal.innerHTML = `
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <button class="modal-close" aria-label="Close">&times;</button>
                    <div class="compare-header">
                        <h2>Product Comparison</h2>
                        <button class="clear-compare-btn">Clear All</button>
                    </div>
                    <div class="modal-body">
                        <!-- Dynamic Content -->
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Listeners
            const closeBtn = modal.querySelector('.modal-close');
            const overlay = modal.querySelector('.modal-overlay');
            const clearBtn = modal.querySelector('.clear-compare-btn');

            const closeHandler = () => modal.classList.remove('active');
            closeBtn.addEventListener('click', closeHandler);
            overlay.addEventListener('click', closeHandler);

            clearBtn.addEventListener('click', () => {
                this.clear();
                closeHandler();
            });
        }

        this.renderComparisonGrid(modal.querySelector('.modal-body'));
        modal.classList.add('active');
    },

    /**
     * Render the grid
     */
    renderComparisonGrid(container) {
        if (this.items.length === 0) {
            container.innerHTML = '<p class="text-center">No items to compare.</p>';
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'compare-grid';

        // Columns for each product
        this.items.forEach(item => {
            const col = document.createElement('div');
            col.className = 'compare-col';
            col.innerHTML = `
                <button class="remove-compare-item" data-id="${item.id}">&times;</button>
                <div class="compare-img">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <h3>${item.name}</h3>
                <p class="compare-price">$${item.price.toFixed(2)}</p>
                
                <div class="compare-row bg-light">
                    <span>Category</span>
                    <strong>${item.category}</strong>
                </div>
                <div class="compare-row">
                    <span>Type</span>
                    <strong>${item.meta}</strong>
                </div>
                
                <div class="compare-actions">
                     <button class="luxe-add-btn small compare-add-cart" data-id="${item.id}">
                        <i class="fas fa-shopping-bag"></i> Add
                    </button>
                </div>
            `;
            grid.appendChild(col);
        });

        container.innerHTML = '';
        container.appendChild(grid);

        // Event listeners for this render
        container.querySelectorAll('.remove-compare-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.removeItem(btn.dataset.id);
                this.renderComparisonGrid(container); // Re-render
                if (this.items.length === 0) {
                    document.getElementById('compareModal').classList.remove('active');
                }
            });
        });

        container.querySelectorAll('.compare-add-cart').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = this.items.find(i => Number(i.id) === Number(btn.dataset.id));
                if (item && typeof CartManager !== 'undefined') {
                    CartManager.addItem(item);
                    if (typeof showToast === 'function') showToast('Added to collection');
                }
            });
        });
    }
};

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CompareManager.init());
} else {
    CompareManager.init();
}

window.CompareManager = CompareManager;
