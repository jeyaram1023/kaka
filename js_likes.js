// js_likes.js - Likes functionality

const likedItemsContainer = document.getElementById('liked-items-container');

// Load liked items
async function loadLikedItems() {
    if (!window.currentUser) {
        if (likedItemsContainer) {
            likedItemsContainer.innerHTML = '<p>Please log in to see your liked items.</p>';
        }
        return;
    }

    showLoader();
    try {
        const { data: likedItems, error } = await supabase
            .from('likes')
            .select(`
                menu_item_id,
                menu_items (
                    id,
                    name,
                    price,
                    image_url,
                    description,
                    seller_id,
                    profiles!menu_items_seller_id_fkey (shop_name)
                )
            `)
            .eq('user_id', window.currentUser.id);

        if (error) throw error;

        if (!likedItems || likedItems.length === 0) {
            if (likedItemsContainer) {
                likedItemsContainer.innerHTML = `
                    <div class="empty-state">
                        <img src="https://uploads.onecompiler.io/42q5e2pr5/43nvveyp4/1000133808.png" alt="No liked items">
                        <p>You haven't liked any items yet.</p>
                    </div>
                `;
            }
            return;
        }

        // Render liked items
        renderLikedItems(likedItems.map(like => like.menu_items).filter(Boolean));
    } catch (error) {
        console.error('Error loading liked items:', error);
        if (likedItemsContainer) {
            likedItemsContainer.innerHTML = '<p>Could not load liked items. Please try again.</p>';
        }
    } finally {
        hideLoader();
    }
}

// Render liked items
function renderLikedItems(items) {
    if (!likedItemsContainer) return;
    
    likedItemsContainer.innerHTML = '';
    
    items.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.dataset.itemId = item.id;
        itemCard.innerHTML = `
            <img src="${item.image_url || 'assets/placeholder-food.png'}" alt="${item.name}" onerror="this.src='assets/placeholder-food.png'">
            <div class="item-card-content">
                <h4>${item.name}</h4>
                <p>₹${item.price.toFixed(2)}</p>
                <p class="shop-name">${item.profiles?.shop_name || 'Unknown Shop'}</p>
                <div class="item-card-footer">
                    <div>
                        <button class="like-button liked" data-item-id="${item.id}" data-liked="true">
                            <i class="fa-solid fa-heart"></i>
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
        likedItemsContainer.appendChild(itemCard);
    });

    // Add event listeners
    addLikedItemEventListeners(items);
}

// Add event listeners to liked items
function addLikedItemEventListeners(items) {
    // Like buttons
    likedItemsContainer.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', handleLikeClick);
    });
    
    // Add to cart buttons
    likedItemsContainer.querySelectorAll('.add-to-cart-btn').forEach(button => {
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
    likedItemsContainer.querySelectorAll('.share-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const name = e.currentTarget.dataset.name;
            const itemId = e.currentTarget.dataset.itemId;
            shareItem(name, itemId);
        });
    });
    
    // Item card clicks
    likedItemsContainer.querySelectorAll('.item-card').forEach(card => {
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

    try {
        if (isLiked) {
            await supabase.from('likes').delete().match({ 
                user_id: window.currentUser.id, 
                menu_item_id: itemId 
            });
            
            // Remove item from liked items page
            const itemCard = button.closest('.item-card');
            if (itemCard) {
                itemCard.remove();
            }
            
            // Check if no more liked items
            if (likedItemsContainer && likedItemsContainer.children.length === 0) {
                loadLikedItems(); // Reload to show empty state
            }
        } else {
            await supabase.from('likes').insert({ 
                user_id: window.currentUser.id, 
                menu_item_id: itemId 
            });
        }
    } catch (error) {
        console.error("Error updating like:", error);
        alert("Failed to update like. Please try again.");
    }
}

// Make functions globally available
window.loadLikedItems = loadLikedItems;