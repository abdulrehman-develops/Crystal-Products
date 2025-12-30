// Advanced Cart Management System
const CartManager = {
    items: [],
    taxRate: 0.05,
    deliveryFee: 25,

    init() {
        const savedCart = localStorage.getItem('crystal_cart');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                // Sanitize data: remove invalid items, ensure quantity and price are numbers
                this.items = Array.isArray(parsed) ? parsed.filter(item => item && item.id).map(item => ({
                    ...item,
                    quantity: (typeof item.quantity === 'number' && item.quantity > 0) ? item.quantity : 1,
                    price: Number(item.price) || 0
                })) : [];
                this.save(); // Save cleaned data
            } catch (e) {
                console.error("Cart data corrupted, resetting.", e);
                this.items = [];
                localStorage.removeItem('crystal_cart');
            }
        }
        this.updateUI();
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Mobile toggle
        const cartBtn = document.querySelector('.cart-btn-luxe');
        if (cartBtn) {
            cartBtn.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    document.querySelector('.cart-wrapper').classList.toggle('active');
                }
            });
        }
    },

    addItem(product) {
        const productId = Number(product.id);
        const existingItem = this.items.find(item => Number(item.id) === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ ...product, id: productId, quantity: 1, price: Number(product.price) });
        }
        this.save();
        this.updateUI(true);
    },

    updateQuantity(id, delta) {
        const targetId = Number(id);
        const item = this.items.find(item => Number(item.id) === targetId);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                this.removeItem(targetId);
            } else {
                this.save();
                this.updateUI();
            }
        }
    },

    removeItem(id) {
        const targetId = Number(id);
        this.items = this.items.filter(item => Number(item.id) !== targetId);
        this.save();
        this.updateUI();
    },

    save() {
        localStorage.setItem('crystal_cart', JSON.stringify(this.items));
    },

    calculateTotals() {
        const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * this.taxRate;
        const total = subtotal + tax + (subtotal > 0 ? this.deliveryFee : 0);
        return { subtotal, tax, total };
    },

    updateUI(pulse = false) {
        // Update Badge
        const badges = document.querySelectorAll('.cart-badge-luxe');
        const totalQty = this.items.reduce((sum, item) => sum + item.quantity, 0);

        badges.forEach(badge => {
            if (totalQty > 0) {
                badge.textContent = totalQty;
                badge.classList.add('active');
                if (pulse) {
                    badge.classList.remove('pulse');
                    void badge.offsetWidth;
                    badge.classList.add('pulse');
                }
            } else {
                badge.classList.remove('active');
            }
        });

        // Update Dropdown Content
        this.renderDropdown();
    },

    renderDropdown() {
        const dropdown = document.getElementById('cartDropdown');
        if (!dropdown) return;

        if (this.items.length === 0) {
            dropdown.innerHTML = `
                <div class="empty-cart-msg">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Your sanctuary collection is empty</p>
                </div>
                <button class="checkout-btn-luxe" onclick="window.location.href='products.html'">Explore Collection</button>
            `;
            return;
        }

        const { subtotal, tax, total } = this.calculateTotals();

        let itemsHtml = this.items.map(item => `
            <div class="cart-item-luxe">
                <div class="cart-item-img">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span class="cart-item-price">$${item.price}</span>
                    <div class="cart-item-controls">
                        <div class="qty-btns">
                            <button class="qty-btn" onclick="CartManager.updateQuantity(${item.id}, -1)">-</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn" onclick="CartManager.updateQuantity(${item.id}, 1)">+</button>
                        </div>
                        <button class="remove-item" onclick="CartManager.removeItem(${item.id})">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');

        dropdown.innerHTML = `
            <div class="cart-dropdown-header">
                <h3>My Collection</h3>
                <span>${this.items.length} items</span>
            </div>
            <div class="cart-items-list">
                ${itemsHtml}
            </div>
            <div class="cart-summary-luxe">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Taxes (5%)</span>
                    <span>$${tax.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Delivery</span>
                    <span>$${this.deliveryFee.toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                    <span>Total Bill</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
            </div>
            <button class="checkout-btn-luxe">Secure Checkout</button>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => CartManager.init());
