// js_notification.js - Notification functionality

// Show popup notifications
function showPopUpNotifications() {
    // Check if user has seen notifications before
    const hasSeenNotifications = localStorage.getItem('hasSeenNotifications');
    
    if (hasSeenNotifications) {
        return; // Don't show notifications again
    }

    // Show notification 1
    setTimeout(() => {
        showNotification('notification-popup-1');
    }, 2000);

    // Show notification 2
    setTimeout(() => {
        showNotification('notification-popup-2');
    }, 5000);

    // Show notification 3
    setTimeout(() => {
        showNotification('notification-popup-3');
    }, 8000);
}

// Show individual notification
function showNotification(notificationId) {
    const notification = document.getElementById(notificationId);
    if (notification) {
        notification.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 5000);
    }
}

// Initialize notification event listeners
function initializeNotificationEventListeners() {
    // Close popup buttons
    document.querySelectorAll('.close-popup-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const popup = e.target.closest('.popup-notification');
            if (popup) {
                popup.classList.add('hidden');
            }
        });
    });

    // Don't show again checkbox
    const dontShowAgainCheckbox = document.getElementById('dont-show-again');
    if (dontShowAgainCheckbox) {
        dontShowAgainCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                localStorage.setItem('hasSeenNotifications', 'true');
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeNotificationEventListeners();
});

// Make functions globally available
window.showPopUpNotifications = showPopUpNotifications;