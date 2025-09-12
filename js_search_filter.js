// js_search_filter.js - Search functionality

const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const searchResultsContainer = document.getElementById('search-results-container');
const searchResultsFood = document.getElementById('search-results-food');
const searchResultsShops = document.getElementById('search-results-shops');
const searchEmptyState = document.getElementById('search-empty-state');
const searchQueryDisplay = document.getElementById('search-query-display');
const searchTabs = document.querySelectorAll('.search-tab');
const suggestionTags = document.querySelectorAll('.suggestion-tag');

let currentSearchQuery = '';
let currentTab = 'food';

// Initialize search page
function initializeSearchPage() {
    // Clear previous results
    if (searchResultsFood) searchResultsFood.innerHTML = '';
    if (searchResultsShops) searchResultsShops.innerHTML = '';
    if (searchEmptyState) searchEmptyState.classList.add('hidden');
    
    // Focus on search input
    if (searchInput) {
        searchInput.focus();
    }
}

// Handle search input
function handleSearchInput() {
    const query = searchInput.value.trim();
    currentSearchQuery = query;
    
    if (query.length === 0) {
        clearSearchResults();
        return;
    }
    
    if (query.length >= 2) {
        performSearch(query);
    }
}

// Perform search
async function performSearch(query) {
    showLoader();
    try {
        if (currentTab === 'food') {
            await searchFoodItems(query);
        } else {
            await searchShops(query);
        }
    } catch (error) {
        console.error('Search error:', error);
        showSearchError();
    } finally {
        hideLoader();
    }
}

// Search food items
async function searchFoodItems(query) {
    if (!window.userProfile?.pincode) {
        showSearchError('Please complete your profile to search items.');
        return;
    }

    try {
        // Get sellers in the same pincode
        const { data: sellers, error: sellersError } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_type', 'Seller')
            .eq('pincode', window.userProfile.pincode);
            
        if (sellersError) throw sellersError;

        const sellerIds = sellers.map(s => s.id);
        if (sellerIds.length === 0) {
            showNoResults();
            return;
        }

        // Search menu items
        const { data: items, error: itemsError } = await supabase
            .from('menu_items')
            .select(`
                *,
                profiles!menu_items_seller_id_fkey (shop_name)
            `)
            .in('seller_id', sellerIds)
            .ilike('name', `%${query}%`);

        if (itemsError) throw itemsError;

        if (items && items.length > 0) {
            renderSearchResults(items, searchResultsFood, 'food');
        } else {
            showNoResults();
        }
    } catch (error) {
        console.error('Error searching food items:', error);
        showSearchError();
    }
}

// Search shops
async function searchShops(query) {
    try {
        const { data: shops, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_type', 'Seller')
            .ilike('shop_name', `%${query}%`);

        if (error) throw error;

        if (shops && shops.length > 0) {
            renderSearchResults(shops, searchResultsShops, 'shop');
        } else {
            showNoResults();
        }
    } catch (error) {
        console.error('Error searching shops:', error);
        showSearchError();
    }
}

// Render search results
function renderSearchResults(items, container, type) {
    if (!container) return;
    
    container.innerHTML = '';
    
    items.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = type === 'food' ? 'item-card' : 'shop-card';
        
        if (type === 'food') {
            itemCard.innerHTML = `
                <img src="${item.image_url || 'assets/placeholder-food.png'}" alt="${item.name}" onerror="this.src='assets/placeholder-food.png'">
                <div class="item-card-content">
                    <h4>${item.name}</h4>
                    <p>₹${item.price.toFixed(2)}</p>
                    <p class="shop-name">${item.profiles?.shop_name || 'Unknown Shop'}</p>
                    <div class="item-card-footer">
                        <button class="add-to-cart-btn" data-item-id="${item.id}">
                            <i class="fa-solid fa-bag-shopping"></i>
                        </button>
                    </div>
                </div>
            `;
        } else {
            itemCard.innerHTML = `
                <img src="${item.image_url || 'assets/placeholder-shop.png'}" alt="${item.shop_name}" onerror="this.src='assets/placeholder-shop.png'">
                <div class="shop-card-content">
                    <h4>${item.shop_name}</h4>
                    <p>${item.address || 'Address not available'}</p>
                </div>
            `;
        }
        
        container.appendChild(itemCard);
    });

    // Add event listeners for food items
    if (type === 'food') {
        container.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemId = e.currentTarget.dataset.itemId;
                const item = items.find(i => i.id === itemId);
                if (item) {
                    addToCart(item);
                    launchConfetti();
                }
            });
        });
    }
}

// Show no results
function showNoResults() {
    if (searchEmptyState && searchQueryDisplay) {
        searchQueryDisplay.textContent = currentSearchQuery;
        searchEmptyState.classList.remove('hidden');
    }
}

// Show search error
function showSearchError(message = 'Search failed. Please try again.') {
    if (searchEmptyState && searchQueryDisplay) {
        searchQueryDisplay.textContent = message;
        searchEmptyState.classList.remove('hidden');
    }
}

// Clear search results
function clearSearchResults() {
    if (searchResultsFood) searchResultsFood.innerHTML = '';
    if (searchResultsShops) searchResultsShops.innerHTML = '';
    if (searchEmptyState) searchEmptyState.classList.add('hidden');
}

// Handle tab changes
function handleTabChange(tabName) {
    currentTab = tabName;
    
    // Update tab UI
    searchTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });
    
    // Update results container
    if (searchResultsFood && searchResultsShops) {
        searchResultsFood.classList.toggle('active', tabName === 'food');
        searchResultsShops.classList.toggle('active', tabName === 'shops');
    }
    
    // Re-search if there's a query
    if (currentSearchQuery) {
        performSearch(currentSearchQuery);
    }
}

// Initialize search event listeners
function initializeSearchEventListeners() {
    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
    }
    
    // Clear search button
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                clearSearchResults();
            }
        });
    }
    
    // Search tabs
    searchTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            handleTabChange(tab.dataset.tab);
        });
    });
    
    // Suggestion tags
    suggestionTags.forEach(tag => {
        tag.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = tag.textContent;
                handleSearchInput();
            }
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeSearchEventListeners();
});

// Make functions globally available
window.initializeSearchPage = initializeSearchPage;