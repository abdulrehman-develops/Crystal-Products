// Universal Search System with Autocomplete
// Provides live search suggestions and results filtering

(function () {
    'use strict';

    const SearchManager = {
        allProducts: typeof productsData !== 'undefined' ? productsData : [],
        suggestionsContainer: null,
        searchInput: null,
        searchTimeout: null,

        /**
         * Initialize search functionality
         */
        init() {
            // Find search input
            this.searchInput = document.getElementById('searchInput');
            if (!this.searchInput) {
                console.log('Search input not found on this page');
                return;
            }

            // Create suggestions container
            this.createSuggestionsContainer();

            // Attach event listeners
            this.attachEventListeners();

            console.log('Search system initialized');
        },

        /**
         * Create suggestions dropdown container
         */
        createSuggestionsContainer() {
            const searchBox = this.searchInput.closest('.search-box');
            if (!searchBox) return;

            this.suggestionsContainer = document.createElement('div');
            this.suggestionsContainer.className = 'search-suggestions';
            this.suggestionsContainer.id = 'searchSuggestions';
            searchBox.parentElement.appendChild(this.suggestionsContainer);
        },

        /**
         * Attach event listeners
         */
        attachEventListeners() {
            // Input event with debounce
            this.searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                const query = e.target.value.trim();

                if (query.length === 0) {
                    this.hideSuggestions();
                    return;
                }

                // Debounce for 300ms
                this.searchTimeout = setTimeout(() => {
                    this.handleSearch(query);
                }, 300);
            });

            // Enter key - navigate to results
            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = this.searchInput.value.trim();
                    if (query) {
                        this.goToResults(query);
                    }
                }

                // ESC key - close suggestions
                if (e.key === 'Escape') {
                    this.hideSuggestions();
                }
            });

            // Click outside to close
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-container')) {
                    this.hideSuggestions();
                }
            });
        },

        /**
         * Handle search query
         */
        handleSearch(query) {
            const results = this.search(query);
            if (results.length > 0) {
                this.showSuggestions(results.slice(0, 5)); // Show top 5
            } else {
                this.showNoResults();
            }
        },

        /**
         * Search products with scoring
         */
        search(query) {
            const lowerQuery = query.toLowerCase();

            return this.allProducts
                .map(product => {
                    let score = 0;
                    const name = product.name.toLowerCase();
                    const category = product.category.toLowerCase();
                    const meta = (product.meta || '').toLowerCase();
                    const tag = (product.tag || '').toLowerCase();

                    // Scoring algorithm
                    if (name === lowerQuery) score += 100; // Exact match
                    else if (name.startsWith(lowerQuery)) score += 50; // Starts with
                    else if (name.includes(lowerQuery)) score += 25; // Contains

                    if (category.includes(lowerQuery)) score += 15;
                    if (meta.includes(lowerQuery)) score += 10;
                    if (tag.includes(lowerQuery)) score += 10;

                    return { product, score };
                })
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score)
                .map(item => item.product);
        },

        /**
         * Show suggestions dropdown
         */
        showSuggestions(results) {
            const query = this.searchInput.value.trim();

            this.suggestionsContainer.innerHTML = results.map(product => `
                <div class="suggestion-item" data-product-id="${product.id}">
                    <img src="${product.image}" alt="${product.name}" class="suggestion-img">
                    <div class="suggestion-info">
                        <div class="suggestion-name">${this.highlightMatch(product.name, query)}</div>
                        <div class="suggestion-meta">
                            <span class="suggestion-price">$${product.price.toFixed(2)}</span>
                            <span class="suggestion-category">${product.category}</span>
                        </div>
                    </div>
                </div>
            `).join('');

            // Add click listeners
            this.suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                    const productId = item.dataset.productId;
                    this.goToResults(this.searchInput.value.trim());
                });
            });

            this.suggestionsContainer.classList.add('active');
        },

        /**
         * Show no results message
         */
        showNoResults() {
            this.suggestionsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No products found</p>
                </div>
            `;
            this.suggestionsContainer.classList.add('active');
        },

        /**
         * Hide suggestions
         */
        hideSuggestions() {
            if (this.suggestionsContainer) {
                this.suggestionsContainer.classList.remove('active');
            }
        },

        /**
         * Navigate to search results
         */
        goToResults(query) {
            window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        },

        /**
         * Highlight matched text
         */
        highlightMatch(text, query) {
            if (!query) return text;

            const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        },

        /**
         * Escape special regex characters
         */
        escapeRegex(str) {
            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => SearchManager.init());
    } else {
        SearchManager.init();
    }

    // Expose globally
    window.SearchManager = SearchManager;

})();
