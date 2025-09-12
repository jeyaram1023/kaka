// js_main.js - Main application controller

// Ensure Supabase is available
if (typeof supabase === 'undefined') {
    console.error('Supabase not loaded. Please check your internet connection and try again.');
    // You can add a fallback UI here if needed
}

// Global state variables
window.currentUser = null;
window.userProfile = null;

// DOM Element selectors
const pages = document.querySelectorAll('.page');
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('#main-app-view .tab-content');
const appHeader = document.getElementById('app-header');
const bottomNav = document.getElementById('bottom-nav');
const pageFooter = document.getElementById('page-footer');
const searchPageButton = document.getElementById('search-page-button');
const likesPageButton = document.getElementById('likes-page-button');

// --- LOADER FUNCTIONS ---
function showLoader() {
    const loader = document.getElementById('loading-modal');
    if (loader) {
        loader.classList.remove('hidden');
    }
}

function hideLoader() {
    const loader = document.getElementById('loading-modal');
    if (loader) {
        loader.classList.add('hidden');
    }
}

// --- NAVIGATION FUNCTIONS ---
function navigateToPage(pageId, tabContentId = null) {
    // Hide all pages
    pages.forEach(page => page.classList.remove('active'));
    
    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    const isMainView = pageId === 'main-app-view';
    const isLoggedIn = window.currentUser !== null;
    
    // Show header and footer only when logged in and on main app view
    if (isLoggedIn && isMainView) {
        if (appHeader) appHeader.style.display = 'flex';
        if (bottomNav) bottomNav.style.display = 'flex';
    } else {
        if (appHeader) appHeader.style.display = 'none';
        if (bottomNav) bottomNav.style.display = 'none';
    }
    
    // Manage footer visibility
    if (pageFooter) {
        pageFooter.style.display = 'none';
        const cartFooter = pageFooter.querySelector('#cart-footer');
        if (cartFooter) cartFooter.classList.add('hidden');
    }
    
    if (isMainView) {
        let activeTabId = tabContentId || 'home-page-content';
        
        // Update navigation
        navItems.forEach(nav => nav.classList.remove('active'));
        tabContents.forEach(tab => tab.classList.remove('active'));
        
        const activeTab = document.getElementById(activeTabId);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        const activeNavButton = bottomNav?.querySelector(`[data-page="${activeTabId}"]`);
        if (activeNavButton) {
            activeNavButton.classList.add('active');
        }
        
        handleTabChange(activeTabId);
    }
    
    // Handle special page initializations
    if (pageId === 'payment-page') {
        if (typeof initializePaymentPage === 'function') {
            initializePaymentPage();
        }
    } else if (pageId === 'search-page') {
        if (typeof initializeSearchPage === 'function') {
            initializeSearchPage();
        }
    } else if (pageId === 'likes-page') {
        if (typeof loadLikedItems === 'function') {
            loadLikedItems();
        }
    }
}

function handleTabChange(activeTabId) {
    // Show footer for cart page
    if (activeTabId === 'cart-page-content' && pageFooter) {
        pageFooter.style.display = 'block';
        const cartFooter = pageFooter.querySelector('#cart-footer');
        if (cartFooter) cartFooter.classList.remove('hidden');
    }
    
    // Call appropriate function based on tab
    switch (activeTabId) {
        case 'home-page-content':
            if (typeof loadHomePageContent === 'function') {
                loadHomePageContent();
            }
            break;
        case 'orders-page-content':
            if (typeof loadOrders === 'function') {
                loadOrders();
            }
            break;
        case 'map-page-content':
            if (typeof initializeMap === 'function') {
                initializeMap();
            }
            break;
        case 'profile-page-content':
            if (typeof displayUserProfile === 'function') {
                displayUserProfile();
            }
            break;
        case 'cart-page-content':
            if (typeof displayCartItems === 'function') {
                displayCartItems();
            }
            break;
    }
}

// --- AUTHENTICATION FUNCTIONS ---
async function fetchProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            console.error("Error fetching profile:", error);
            return null;
        }
        return data;
    } catch (error) {
        console.error("Error in fetchProfile:", error);
        return null;
    }
}

async function handleUserSession(session) {
    try {
        window.currentUser = session.user;
        const profile = await fetchProfile(session.user.id);

        if (profile && profile.full_name && profile.pincode) {
            // Profile is complete
            window.userProfile = profile;
            navigateToPage('main-app-view');
            if (typeof showPopUpNotifications === 'function') {
                showPopUpNotifications();
            }
        } else if (profile) {
            // Profile exists but is incomplete
            window.userProfile = profile;
            navigateToPage('profile-setup-page');
        } else {
            // Profile does not exist
            navigateToPage('profile-setup-page');
        }
    } catch (error) {
        console.error("Error in handleUserSession:", error);
        navigateToPage('login-page');
    }
}

async function checkAuthState() {
    showLoader();
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await handleUserSession(session);
        } else {
            navigateToPage('login-page');
        }
    } catch (error) {
        console.error("Error in checkAuthState:", error);
        navigateToPage('login-page');
    } finally {
        hideLoader();
    }
}

// --- UI FUNCTIONS ---
function launchConfetti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.animation = `confetti-fall ${1 + Math.random() * 2}s linear forwards`;
        confetti.style.animationDelay = `${Math.random() * 0.5}s`;
        container.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
    }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const moreNavButton = document.getElementById('more-nav-button');
    const moreMenuPopup = document.getElementById('more-menu-popup');
    const closeMoreMenuBtn = document.getElementById('close-more-menu-btn');
    const moreMenuOverlay = document.querySelector('.more-menu-overlay');
    
    // Navigation item clicks
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTabId = item.getAttribute('data-page');
            if (targetTabId) {
                navigateToPage('main-app-view', targetTabId);
            }
        });
    });
    
    // Header button clicks
    if (searchPageButton) {
        searchPageButton.addEventListener('click', () => navigateToPage('search-page'));
    }
    
    if (likesPageButton) {
        likesPageButton.addEventListener('click', () => {
            navigateToPage('likes-page');
        });
    }
    
    // Back to home button clicks
    document.querySelectorAll('.back-to-home-btn').forEach(button => {
        button.addEventListener('click', () => {
            navigateToPage('main-app-view', 'home-page-content');
        });
    });
    
    // More menu functionality
    if (moreNavButton) {
        moreNavButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (moreMenuPopup) {
                moreMenuPopup.classList.remove('hidden');
            }
        });
    }
    
    const closeMoreMenu = () => {
        if (moreMenuPopup) {
            moreMenuPopup.classList.add('hidden');
        }
    };
    
    if (closeMoreMenuBtn) {
        closeMoreMenuBtn.addEventListener('click', closeMoreMenu);
    }
    
    if (moreMenuOverlay) {
        moreMenuOverlay.addEventListener('click', closeMoreMenu);
    }
    
    // Initialize authentication
    checkAuthState();
});

// Set up auth state change listener
if (typeof supabase !== 'undefined') {
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            handleUserSession(session);
        } else if (event === 'SIGNED_OUT') {
            window.currentUser = null;
            window.userProfile = null;
            localStorage.clear();
            
            // Hide header and footer on logout
            if (appHeader) appHeader.style.display = 'none';
            if (bottomNav) bottomNav.style.display = 'none';
            if (pageFooter) pageFooter.style.display = 'none';
            
            navigateToPage('login-page');
        }
    });
}