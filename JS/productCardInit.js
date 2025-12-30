// Universal Product Card Initializer
// Enables cart, wishlist, and quick view functionality on any product card across all pages

(function () {
    'use strict';

    // Toast Container (shared across all pages)
    let toastContainer = null;
    let quickViewModal = null;

    /**
     * Initialize toast container if it doesn't exist
     */
    function initToastContainer() {
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
    }

    /**
     * Show toast notification
     * @param {string} message - Message to display
     */
    function showToast(message) {
        initToastContainer();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fas fa-sparkles"></i> <span>${message}</span>`;
        toastContainer.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    /**
     * Create Quick View Modal
     */
    function createQuickViewModal() {
        if (quickViewModal) return;

        quickViewModal = document.createElement('div');
        quickViewModal.className = 'quick-view-modal';
        quickViewModal.id = 'quickViewModal';
        quickViewModal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close" aria-label="Close">&times;</button>
                <div class="modal-body">
                    <!-- Dynamically populated -->
                </div>
            </div>
        `;
        document.body.appendChild(quickViewModal);

        // Close handlers
        const overlay = quickViewModal.querySelector('.modal-overlay');
        const closeBtn = quickViewModal.querySelector('.modal-close');

        overlay.addEventListener('click', () => closeQuickView());
        closeBtn.addEventListener('click', () => closeQuickView());

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && quickViewModal.classList.contains('active')) {
                closeQuickView();
            }
        });
    }

    /**
     * Show Quick View modal
     */
    /**
     * Download Product Info as Word (.doc)
     */
    function downloadProductInfo(product) {
        if (!product) return;

        // Use the static file provided by the user
        const filePath = 'Download File/Thanks For Downloading.docx';

        const link = document.createElement('a');
        link.href = filePath;
        link.download = 'Thanks_For_Downloading.docx'; // Suggest a filename

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
    }

    /**
     * Show Quick View modal
     */
    function showQuickView(product) {
        createQuickViewModal();

        const modalBody = quickViewModal.querySelector('.modal-body');
        modalBody.innerHTML = `
            <div class="quick-view-grid">
                <div class="quick-view-image">
                    <img src="${product.image}" alt="${product.name}">
                    ${product.tag ? `<span class="luxe-tag ${product.tagClass || ''}">${product.tag}</span>` : ''}
                </div>
                <div class="quick-view-info">
                    <span class="product-meta">${product.meta || product.category}</span>
                    <h2>${product.name}</h2>
                    <p class="product-price-luxe">$${product.price.toFixed(2)}</p>
                    <div class="quick-view-actions">
                        <button class="luxe-add-btn modal-add-to-cart" data-product-id="${product.id}">
                            <i class="fas fa-shopping-bag"></i> Add to Collection
                        </button>
                        <button class="luxe-action-btn modal-add-to-wishlist" data-product-id="${product.id}" aria-label="Add to Wishlist">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="luxe-action-btn modal-compare-btn" data-product-id="${product.id}" aria-label="Compare">
                             <i class="fas fa-balance-scale"></i>
                        </button>
                    </div>
                    <button class="modal-download-btn" aria-label="Download Info">
                        <i class="fas fa-file-word"></i> Download Details (.doc)
                    </button>
                </div>
            </div>
        `;

        // Check if already in wishlist
        if (typeof WishlistManager !== 'undefined' && WishlistManager.isInWishlist(product.id)) {
            const heartIcon = modalBody.querySelector('.modal-add-to-wishlist i');
            if (heartIcon) {
                heartIcon.classList.remove('far');
                heartIcon.classList.add('fas');
            }
        }

        // Add to cart button
        const addToCartBtn = modalBody.querySelector('.modal-add-to-cart');
        addToCartBtn.addEventListener('click', () => {
            if (typeof CartManager !== 'undefined') {
                CartManager.addItem(product);
                showToast(`${product.name} added to collection.`);
            }
        });

        // Add to wishlist button
        const addToWishlistBtn = modalBody.querySelector('.modal-add-to-wishlist');
        addToWishlistBtn.addEventListener('click', function () {
            if (typeof WishlistManager !== 'undefined') {
                const icon = this.querySelector('i');
                const isInWishlist = icon.classList.contains('fas');

                if (isInWishlist) {
                    WishlistManager.removeItem(product.id);
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    showToast(`${product.name} removed from wishlist.`);
                } else {
                    WishlistManager.addItem(product);
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    showToast(`${product.name} added to wishlist.`);
                }
            }
        });

        // Download button
        const downloadBtn = modalBody.querySelector('.modal-download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                downloadProductInfo(product);
                showToast(`Downloading info for ${product.name}...`);
            });
        }

        // Compare button in modal
        const compareBtn = modalBody.querySelector('.modal-compare-btn');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => {
                if (typeof CompareManager !== 'undefined') {
                    const result = CompareManager.addItem(product);
                    showToast(result.message);
                }
            });
        }

        quickViewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close Quick View modal
     */
    function closeQuickView() {
        if (quickViewModal) {
            quickViewModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * Extract product data from card element
     * @param {HTMLElement} card - Product card element
     * @returns {Object} Product object compatible with CartManager
     */
    function extractProductFromCard(card) {
        // Try to get from data attributes first
        const dataId = card.dataset.productId;
        const dataName = card.dataset.productName;
        const dataPrice = card.dataset.productPrice;
        const dataImage = card.dataset.productImage;
        const dataCategory = card.dataset.productCategory;
        const dataMeta = card.dataset.productMeta;

        // Fallback to reading from DOM if data attributes not present
        const id = dataId || parseInt(card.querySelector('.product-name')?.textContent.length || 0);
        const name = dataName || card.querySelector('.product-name')?.textContent || 'Unknown Product';
        const priceText = dataPrice || card.querySelector('.product-price-luxe')?.textContent.replace('$', '').replace(',', '') || '0';
        const price = parseFloat(priceText);
        const image = dataImage || card.querySelector('.product-img')?.src || '';
        const category = dataCategory || 'crystal';
        const meta = dataMeta || card.querySelector('.product-meta')?.textContent || '';
        const tag = card.querySelector('.luxe-tag')?.textContent || '';
        const tagClass = card.querySelector('.luxe-tag')?.classList.contains('highlight-tag') ? 'highlight-tag' : '';

        return {
            id: parseInt(id),
            name: name.trim(),
            price: price,
            image: image,
            category: category,
            meta: meta,
            tag: tag,
            tagClass: tagClass
        };
    }

    /**
     * Initialize all product cards on the page
     */
    function initializeProductCards() {
        // Find all product cards
        const productCards = document.querySelectorAll('.product-card');

        if (productCards.length === 0) {
            console.log('No product cards found on this page');
            return;
        }

        console.log(`Initializing ${productCards.length} product cards`);

        productCards.forEach(card => {
            const product = extractProductFromCard(card);

            // Initialize "Add to Cart" button
            const addBtn = card.querySelector('.luxe-add-btn');
            if (addBtn && !addBtn.dataset.initialized) {
                addBtn.dataset.initialized = 'true';

                addBtn.addEventListener('click', function (e) {
                    e.preventDefault();

                    // Add to cart via CartManager
                    if (typeof CartManager !== 'undefined') {
                        CartManager.addItem(product);
                        showToast(`${product.name} added to collection.`);
                    } else {
                        console.error('CartManager not found. Make sure cart.js is loaded.');
                        showToast('Cart system not available');
                    }
                });
            }

            // Initialize Wishlist button
            const wishlistBtn = card.querySelector('.luxe-action-btn[aria-label="Add to Wishlist"]');
            if (wishlistBtn && !wishlistBtn.dataset.initialized) {
                wishlistBtn.dataset.initialized = 'true';

                // Check if already in wishlist
                if (typeof WishlistManager !== 'undefined' && WishlistManager.isInWishlist(product.id)) {
                    const icon = wishlistBtn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                    }
                }

                wishlistBtn.addEventListener('click', function (e) {
                    e.preventDefault();

                    const icon = this.querySelector('i');
                    if (icon && typeof WishlistManager !== 'undefined') {
                        const isInWishlist = icon.classList.contains('fas');

                        if (isInWishlist) {
                            WishlistManager.removeItem(product.id);
                            icon.classList.remove('fas');
                            icon.classList.add('far');
                            showToast(`${product.name} removed from wishlist.`);
                        } else {
                            WishlistManager.addItem(product);
                            icon.classList.remove('far');
                            icon.classList.add('fas');
                            showToast(`${product.name} added to wishlist.`);
                        }
                    }
                });
            }

            // Initialize Quick View button
            const quickViewBtn = card.querySelector('.luxe-action-btn[aria-label="Quick View"]');
            if (quickViewBtn && !quickViewBtn.dataset.initialized) {
                quickViewBtn.dataset.initialized = 'true';

                quickViewBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    showQuickView(product);
                });
            }

            // Initialize Compare button (if present or injected)
            let compareBtn = card.querySelector('.luxe-action-btn[aria-label="Compare"]');

            // If it doesn't exist, we might need to inject it (e.g., dynamically rendered)
            // OR we just rely on existing HTML. For now, let's assume we might need to add it 
            // if the structure allows, but better to check if it exists first.
            // Actually, we should probably add the button to the HTML structure of the card if it's not there.
            // But since we can't easily rewrite the HTML of all cards without re-rendering, 
            // let's look for the action group and append it if missing.

            const actionGroup = card.querySelector('.action-group');
            if (actionGroup && !compareBtn) {
                compareBtn = document.createElement('button');
                compareBtn.className = 'luxe-action-btn compare-btn';
                compareBtn.setAttribute('aria-label', 'Compare');
                compareBtn.innerHTML = '<i class="fas fa-balance-scale"></i>';
                // Insert before Quick View or append
                if (quickViewBtn) {
                    actionGroup.insertBefore(compareBtn, quickViewBtn);
                } else {
                    actionGroup.appendChild(compareBtn);
                }
            }

            if (compareBtn && !compareBtn.dataset.initialized) {
                compareBtn.dataset.initialized = 'true';
                compareBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    if (typeof CompareManager !== 'undefined') {
                        const result = CompareManager.addItem(product);
                        showToast(result.message);
                    }
                });
            }
        });

        console.log('Product cards initialized successfully');
    }

    // Auto-initialize on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProductCards);
    } else {
        // DOM already loaded
        initializeProductCards();
    }

    // Expose globally for manual initialization if needed
    window.initializeProductCards = initializeProductCards;
    window.showToast = showToast;
    window.showQuickView = showQuickView;

})();
