document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-Analytics');

    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                
                window.location.href = `/home/searched-results?q=${encodeURIComponent(query)}`;
            }
        }
    });
});
