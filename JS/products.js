// Product Logic - Dynamic Rendering, Filtering, and Sorting
document.addEventListener('DOMContentLoaded', function () {
    const productGrid = document.getElementById('productGrid');
    const filterBtns = document.querySelectorAll('.filter-btn-luxe');
    const sortSelect = document.getElementById('sortSelect');

    // Create Toast Container
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);

    let currentProducts = [...productsData];
    let currentFilter = 'all';

    // Function to show toast
    function showToast(message) {
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

    // Function to render products
    function renderProducts(products) {
        if (!productGrid) return;

        productGrid.innerHTML = '';

        products.forEach((product, index) => {
            const productCard = document.createElement('div');
            productCard.className = `product-card glass-card-v2 fade-in`;
            productCard.style.animationDelay = `${index * 0.1}s`;

            // Add data attributes for universal initializer
            productCard.dataset.productId = product.id;
            productCard.dataset.productName = product.name;
            productCard.dataset.productPrice = product.price;
            productCard.dataset.productImage = product.image;
            productCard.dataset.productCategory = product.category;
            productCard.dataset.productMeta = product.meta;
            if (product.tag) productCard.dataset.productTag = product.tag;

            const tagHTML = product.tag ? `<span class="luxe-tag ${product.tagClass || ''}">${product.tag}</span>` : '';

            productCard.innerHTML = `
                <div class="product-image-wrapper">
                    <img src="${product.image}" alt="${product.name}" class="product-img">
                    <div class="hover-overlay">
                        <div class="action-group">
                            <button class="luxe-action-btn wishlist-btn" aria-label="Add to Wishlist"><i class="far fa-heart"></i></button>
                            <button class="luxe-action-btn quick-view-btn" aria-label="Quick View"><i class="far fa-eye"></i></button>
                        </div>
                        <button class="luxe-add-btn add-to-cart">Add to Collection</button>
                    </div>
                    ${tagHTML}
                </div>
                <div class="product-details">
                    <span class="product-meta">${product.meta}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price-luxe">$${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
            `;

            productGrid.appendChild(productCard);
        });

        // Initialize universal card functionality
        if (typeof window.initializeProductCards === 'function') {
            window.initializeProductCards();
        }
    }

    // Function to sort products
    function sortProducts(products, criteria) {
        const sorted = [...products];
        switch (criteria) {
            case 'price-low':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'name-az':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
            default:
                // For this demo, newest is just the original order
                break;
        }
        return sorted;
    }

    // Filter Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentFilter = btn.getAttribute('data-filter');
            applyFiltersAndSort();
        });
    });

    // Sort Logic
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            applyFiltersAndSort();
        });
    }

    function applyFiltersAndSort() {
        let filtered = currentFilter === 'all'
            ? productsData
            : productsData.filter(p => p.category === currentFilter);

        let sorted = sortProducts(filtered, sortSelect ? sortSelect.value : 'newest');
        renderProducts(sorted);
    }

    // Initial Render
    renderProducts(productsData);
});
