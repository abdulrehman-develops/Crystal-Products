// Wishlist Manager
// Manages wishlist items with localStorage persistence and UI updates

const WishlistManager = {
    items: [],
    storageKey: 'crystalProducts_wishlist',

    /**
     * Initialize wishlist
     */
    init() {
        this.loadFromStorage();
        this.updateUI();
        this.attachEventListeners();
        console.log('Wishlist initialized with', this.items.length, 'items');
    },

    /**
     * Load wishlist from localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.items = JSON.parse(stored);

                // Data sanitization
                this.items = this.items.filter(item => {
                    return item &&
                        typeof item.id === 'number' &&
                        typeof item.name === 'string' &&
                        typeof item.price === 'number' &&
                        !isNaN(item.price);
                });
            }
        } catch (error) {
            console.error('Error loading wishlist:', error);
            this.items = [];
        }
    },

    /**
     * Save wishlist to localStorage
     */
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving wishlist:', error);
        }
    },

    /**
     * Add item to wishlist
     */
    addItem(product) {
        const id = Number(product.id);

        // Check if already in wishlist
        if (this.isInWishlist(id)) {
            console.log('Product already in wishlist');
            return false;
        }

        const wishlistItem = {
            id: id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            category: product.category,
            meta: product.meta || ''
        };

        this.items.push(wishlistItem);
        this.save();
        this.updateUI(true);
        return true;
    },

    /**
     * Remove item from wishlist
     */
    removeItem(id) {
        const numId = Number(id);
        this.items = this.items.filter(item => Number(item.id) !== numId);
        this.save();
        this.updateUI();
    },

    /**
     * Check if item is in wishlist
     */
    isInWishlist(id) {
        const numId = Number(id);
        return this.items.some(item => Number(item.id) === numId);
    },

    /**
     * Get all wishlist items
     */
    getItems() {
        return this.items;
    },

    /**
     * Clear entire wishlist
     */
    clear() {
        this.items = [];
        this.save();
        this.updateUI();
    },

    /**
     * Update UI (badge and dropdown)
     */
    updateUI(pulse = false) {
        this.updateBadge(pulse);
        this.renderDropdown();
    },

    /**
     * Update wishlist badge count
     */
    updateBadge(pulse = false) {
        const badge = document.querySelector('.wishlist-badge-luxe');
        if (badge) {
            badge.textContent = this.items.length;

            if (pulse) {
                badge.classList.add('pulse');
                setTimeout(() => badge.classList.remove('pulse'), 600);
            }
        }
    },

    /**
     * Render wishlist dropdown
     */
    renderDropdown() {
        const dropdown = document.getElementById('wishlistDropdown');
        if (!dropdown) return;

        if (this.items.length === 0) {
            dropdown.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-heart-broken"></i>
                    <p>Your wishlist is empty</p>
                    <span>Add items you love!</span>
                </div>
            `;
            return;
        }

        const itemsHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-actions">
                    <button class="wishlist-add-to-cart" data-id="${item.id}" aria-label="Add to Cart">
                        <i class="fas fa-shopping-bag"></i>
                    </button>
                    <button class="wishlist-remove-btn" data-id="${item.id}" aria-label="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        dropdown.innerHTML = `
            <div class="cart-header">
                <h3><i class="fas fa-heart"></i> Wishlist</h3>
                <span class="cart-count">${this.items.length} items</span>
            </div>
            <div class="cart-items">
                ${itemsHTML}
            </div>
            <div class="cart-footer">
                <button class="clear-wishlist-btn">Clear Wishlist</button>
            </div>
        `;

        // Attach event listeners to buttons
        this.attachDropdownListeners();
    },

    /**
     * Attach event listeners to dropdown buttons
     */
    attachDropdownListeners() {
        const dropdown = document.getElementById('wishlistDropdown');
        if (!dropdown) return;

        // Remove buttons
        dropdown.querySelectorAll('.wishlist-remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                this.removeItem(id);

                if (typeof showToast === 'function') {
                    showToast('Removed from wishlist');
                }
            });
        });

        // Add to cart buttons
        dropdown.querySelectorAll('.wishlist-add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = Number(btn.dataset.id);
                const item = this.items.find(i => Number(i.id) === id);

                if (item && typeof CartManager !== 'undefined') {
                    CartManager.addItem(item);
                    if (typeof showToast === 'function') {
                        showToast(`${item.name} added to cart`);
                    }
                }
            });
        });

        // Clear wishlist button
        const clearBtn = dropdown.querySelector('.clear-wishlist-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Clear entire wishlist?')) {
                    this.clear();
                    if (typeof showToast === 'function') {
                        showToast('Wishlist cleared');
                    }
                }
            });
        }
    },

    /**
     * Attach global event listeners
     */
    attachEventListeners() {
        const wishlistBtn = document.querySelector('.wishlist-btn-luxe');
        const dropdown = document.getElementById('wishlistDropdown');

        if (!wishlistBtn || !dropdown) return;

        // Desktop hover
        wishlistBtn.addEventListener('mouseenter', () => {
            dropdown.classList.add('active');
        });

        const wishlistWrapper = wishlistBtn.closest('.wishlist-wrapper');
        if (wishlistWrapper) {
            wishlistWrapper.addEventListener('mouseleave', () => {
                dropdown.classList.remove('active');
            });
        }

        // Mobile toggle
        wishlistBtn.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });

        // Close on outside click (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!e.target.closest('.wishlist-wrapper')) {
                    dropdown.classList.remove('active');
                }
            }
        });
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WishlistManager.init());
} else {
    WishlistManager.init();
}

// Expose globally
window.WishlistManager = WishlistManager;
