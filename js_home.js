// js_home.js - Home page functionality

const popularItemsContainer = document.getElementById('popular-items-container');
const allItemsContainer = document.getElementById('all-items-container');
const itemDetailPage = document.getElementById('item-detail-page');

// Load home page content
async function loadHomePageContent() {
    if (!window.userProfile?.pincode) {
        if (allItemsContainer) {
            allItemsContainer.innerHTML = '<p>Please complete your profile to see items in your area.</p>';
        }
        return;
    }
    
    showLoader();
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
            if (allItemsContainer) {
                allItemsContainer.innerHTML = '<p>No sellers found in your area yet.</p>';
            }
            return;
        }

        // Get menu items with likes
        const { data: items, error: itemsError } = await supabase
            .from('menu_items')
            .select(`
                *,
                profiles!menu_items_seller_id_fkey (shop_name),
                likes!left (user_id)
            `)
            .in('seller_id', sellerIds);
            
        if (itemsError) throw itemsError;
        
        // Process items to add like information
        const processedItems = items.map(item => ({
            ...item,
            is_liked_by_user: item.likes.some(like => like.user_id === window.currentUser?.id),
            like_count: item.likes.length
        }));
        
        // Sort by popularity and get top 4
        const popularItems = [...processedItems].sort((a, b) => (b.like_count || 0) - (a.like_count || 0)).slice(0, 4);

        renderItems(popularItems, popularItemsContainer, 'popular');
        renderItems(processedItems, allItemsContainer, 'all');
    } catch (error) {
        console.error('Error loading home page:', error);
        if (allItemsContainer) {
            allItemsContainer.innerHTML = '<p>Could not load items. Please try again.</p>';
        }
    } finally {
        hideLoader();
    }
}

// Render items in containers
function renderItems(items, container, context) {
    if (!container) return;
    
    container.innerHTML = '';
    if (!items || items.length === 0) {
        if (context === 'all') {
            container.innerHTML = '<p>No items to display in your area.</p>';
        }
        return;
    }
    
    items.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.dataset.itemId = item.id;
        itemCard.innerHTML = `
            <img src="${item.image_url || 'assets/placeholder-food.png'}" alt="${item.name}" onerror="this.src='assets/placeholder-food.png'">
            <div class="item-card-content">
                <h4>${item.name}</h4>
                <p>₹${item.price.toFixed(2)}</p>
                <div class="item-card-footer">
                    <div>
                        <button class="like-button ${item.is_liked_by_user ? 'liked' : ''}" data-item-id="${item.id}" data-liked="${item.is_liked_by_user}">
                            <i class="fa-${item.is_liked_by_user ? 'solid' : 'regular'} fa-heart"></i>
                            <span class="like-count">${item.like_count || 0}</span>
                        </button>
                    </div>
                    <div>
                        <button class="share-button" data-name="${item.name}" data-item-id="${item.id}">
                            <i class="fa-solid fa-share-alt"></i>
                        </button>
                        <button class="add-to-cart-btn" data-item-id="${item.id}">
                            <i class="fa-solid fa-bag-shopping"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(itemCard);
    });

    // Add event listeners
    addItemEventListeners(container, items);
}

// Add event listeners to item cards
function addItemEventListeners(container, items) {
    // Like buttons
    container.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', handleLikeClick);
    });
    
    // Add to cart buttons
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
    
    // Share buttons
    container.querySelectorAll('.share-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const name = e.currentTarget.dataset.name;
            const itemId = e.currentTarget.dataset.itemId;
            shareItem(name, itemId);
        });
    });
    
    // Item card clicks
    container.querySelectorAll('.item-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            const itemId = card.dataset.itemId;
            showItemDetailPage(itemId);
        });
    });
}

// Handle like button clicks
async function handleLikeClick(event) {
    event.stopPropagation();
    if (!window.currentUser) {
        alert("Please log in to like items.");
        return;
    }

    const button = event.currentTarget;
    const itemId = button.dataset.itemId;
    const isLiked = button.dataset.liked === 'true';
    const icon = button.querySelector('i');
    const likeCount = button.querySelector('.like-count');
    
    // Optimistic UI update
    button.classList.toggle('liked', !isLiked);
    button.dataset.liked = !isLiked;
    icon.className = `fa-${!isLiked ? 'solid' : 'regular'} fa-heart`;
    
    // Update like count
    let currentCount = parseInt(likeCount.textContent) || 0;
    likeCount.textContent = isLiked ? currentCount - 1 : currentCount + 1;

    try {
        if (isLiked) {
            await supabase.from('likes').delete().match({ 
                user_id: window.currentUser.id, 
                menu_item_id: itemId 
            });
        } else {
            await supabase.from('likes').insert({ 
                user_id: window.currentUser.id, 
                menu_item_id: itemId 
            });
        }
    } catch (error) {
        console.error("Error updating like:", error);
        // Revert optimistic update
        button.classList.toggle('liked', isLiked);
        button.dataset.liked = isLiked;
        icon.className = `fa-${isLiked ? 'solid' : 'regular'} fa-heart`;
        likeCount.textContent = currentCount;
    }
}

// Share item functionality
function shareItem(itemName, itemId) {
    if (navigator.share) {
        const baseUrl = window.location.href.split('?')[0];
        const shareUrl = `${baseUrl}?itemId=${itemId}`;
        navigator.share({
            title: 'Check out this item on StreetR!',
            text: `I found this delicious ${itemName} on the StreetR app!`,
            url: shareUrl,
        }).catch(console.error);
    } else {
        // Fallback for browsers that don't support Web Share API
        const baseUrl = window.location.href.split('?')[0];
        const shareUrl = `${baseUrl}?itemId=${itemId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Link copied to clipboard!');
        }).catch(() => {
            alert(`Share this link: ${shareUrl}`);
        });
    }
}

// Show item detail page
async function showItemDetailPage(itemId) {
    showLoader();
    try {
        const { data: item, error } = await supabase
            .from('menu_items')
            .select(`*, seller:profiles(shop_name)`)
            .eq('id', itemId)
            .single();
            
        if (error) throw error;

        const { data: otherItems, error: otherItemsError } = await supabase
            .from('menu_items')
            .select(`*`)
            .eq('seller_id', item.seller_id)
            .neq('id', item.id)
            .limit(5);
            
        if (otherItemsError) throw otherItemsError;

        if (itemDetailPage) {
            itemDetailPage.innerHTML = `
                <button id="back-to-home-btn" class="floating-back-btn">
                    <i class="fa-solid fa-arrow-left"></i>
                </button>
                <img src="${item.image_url || 'assets/placeholder-food.png'}" alt="${item.name}" class="item-detail-image" onerror="this.src='assets/placeholder-food.png'">
                <div class="item-detail-content">
                    <h2>${item.name}</h2>
                    <p class="shop-name">From: ${item.seller?.shop_name || 'Unknown Shop'}</p>
                    <p class="item-price">₹${item.price.toFixed(2)}</p>
                    <p class="item-description">${item.description || 'No description available.'}</p>
                    <p>❤️ ${item.like_count || 0}</p>
                    <div class="item-detail-actions">
                        <button id="detail-like-btn" class="like-button-large">
                            <i class="fa-regular fa-heart"></i> Likes 
                            <span class="like-count">${item.like_count || 0}</span>
                        </button>
                        <button id="detail-share-btn" class="like-button-large">
                            <i class="fa-solid fa-share-alt"></i> Share
                        </button>
                        <button id="detail-add-to-cart-btn" class="add-to-cart-large">
                            <i class="fa-solid fa-cart-plus"></i> Add to Cart
                        </button>
                    </div>
                    <div class="more-from-shop">
                        <h3>More from ${item.seller?.shop_name || 'this shop'}</h3>
                        <div id="more-items-container" class="item-grid"></div>
                    </div>
                </div>
            `;

            // Render other items from the same shop
            renderItems(otherItems, itemDetailPage.querySelector('#more-items-container'), 'more');
            
            // Add event listeners for detail page
            const backBtn = itemDetailPage.querySelector('#back-to-home-btn');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    navigateToPage('main-app-view', 'home-page-content');
                });
            }
            
            const addToCartBtn = itemDetailPage.querySelector('#detail-add-to-cart-btn');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', () => {
                    addToCart(item);
                    launchConfetti();
                });
            }
            
            const shareBtn = itemDetailPage.querySelector('#detail-share-btn');
            if (shareBtn) {
                shareBtn.addEventListener('click', () => {
                    shareItem(item.name, item.id);
                });
            }

            navigateToPage('item-detail-page');
        }
    } catch (error) {
        console.error('Error fetching item details:', error);
        alert('Could not load item details.');
    } finally {
        hideLoader();
    }
}

// Make functions globally available
window.loadHomePageContent = loadHomePageContent;
window.handleLikeClick = handleLikeClick;
window.shareItem = shareItem;
window.showItemDetailPage = showItemDetailPage;