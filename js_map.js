// js_map.js - Map functionality

let map = null;

// Initialize map
function initializeMap() {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    // Clear previous map
    mapContainer.innerHTML = '';

    try {
        // Initialize Leaflet map
        map = L.map('map-container').setView([12.9716, 77.5946], 13); // Default to Bangalore

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add user location if available
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;
                    
                    map.setView([userLat, userLng], 15);
                    
                    // Add user marker
                    L.marker([userLat, userLng])
                        .addTo(map)
                        .bindPopup('Your Location')
                        .openPopup();
                },
                (error) => {
                    console.error('Error getting location:', error);
                    // Keep default location
                }
            );
        }

        // Load nearby sellers
        loadNearbySellers();
    } catch (error) {
        console.error('Error initializing map:', error);
        mapContainer.innerHTML = '<p>Map could not be loaded. Please try again later.</p>';
    }
}

// Load nearby sellers
async function loadNearbySellers() {
    if (!window.userProfile?.pincode) {
        console.log('No pincode available for seller search');
        return;
    }

    try {
        const { data: sellers, error } = await supabase
            .from('profiles')
            .select('id, shop_name, latitude, longitude, address')
            .eq('user_type', 'Seller')
            .eq('pincode', window.userProfile.pincode);

        if (error) throw error;

        if (sellers && sellers.length > 0) {
            sellers.forEach(seller => {
                if (seller.latitude && seller.longitude) {
                    L.marker([seller.latitude, seller.longitude])
                        .addTo(map)
                        .bindPopup(`
                            <strong>${seller.shop_name}</strong><br>
                            ${seller.address || 'Address not available'}
                        `);
                }
            });
        } else {
            // Show message if no sellers found
            const mapContainer = document.getElementById('map-container');
            if (mapContainer) {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'map-message';
                messageDiv.innerHTML = '<p>No sellers found in your area yet.</p>';
                messageDiv.style.cssText = `
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    background: white;
                    padding: 10px;
                    border-radius: 5px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    z-index: 1000;
                `;
                mapContainer.appendChild(messageDiv);
            }
        }
    } catch (error) {
        console.error('Error loading nearby sellers:', error);
    }
}

// Make functions globally available
window.initializeMap = initializeMap;