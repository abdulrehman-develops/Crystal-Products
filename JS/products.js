// Product Filtering Logic
document.addEventListener('DOMContentLoaded', function () {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    // Initial fade-in animation on page load
    productCards.forEach(card => {
        card.classList.add('fade-in');
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            productCards.forEach(card => {
                // Reset animation
                card.classList.remove('fade-in');

                if (filterValue === 'all') {
                    card.classList.remove('hidden');
                    // Add small delay for animation re-trigger
                    setTimeout(() => card.classList.add('fade-in'), 10);
                } else {
                    if (card.getAttribute('data-category') === filterValue) {
                        card.classList.remove('hidden');
                        setTimeout(() => card.classList.add('fade-in'), 10);
                    } else {
                        card.classList.add('hidden');
                    }
                }
            });
        });
    });
});
