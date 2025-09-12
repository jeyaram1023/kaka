// js_profiles.js - Profile functionality

// Display user profile
function displayUserProfile() {
    if (!window.userProfile) {
        console.error('User profile not available');
        return;
    }

    // Update profile display fields
    const profileFields = {
        'profile-display-name': window.userProfile.full_name || 'Not provided',
        'profile-display-mobile': window.userProfile.mobile_number || 'Not provided',
        'profile-display-street': window.userProfile.street_name || 'Not provided',
        'profile-display-landmark': window.userProfile.nearby_landmark || 'Not provided',
        'profile-display-district': window.userProfile.district || 'Not provided',
        'profile-display-state': window.userProfile.state || 'Not provided',
        'profile-display-pincode': window.userProfile.pincode || 'Not provided'
    };

    Object.entries(profileFields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });

    // Set up edit form values
    const editFields = {
        'edit-customer-name': window.userProfile.full_name || '',
        'edit-mobile-number': window.userProfile.mobile_number || '',
        'edit-street-name': window.userProfile.street_name || '',
        'edit-nearby-landmark': window.userProfile.nearby_landmark || '',
        'edit-district': window.userProfile.district || '',
        'edit-state': window.userProfile.state || '',
        'edit-pincode': window.userProfile.pincode || ''
    };

    Object.entries(editFields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    });
}

// Initialize profile event listeners
function initializeProfileEventListeners() {
    // Profile toggle edit button
    const toggleEditBtn = document.getElementById('profile-toggle-edit-button');
    const profileDetailsView = document.getElementById('profile-details-view');
    const profileEditForm = document.getElementById('profile-edit-form');

    if (toggleEditBtn) {
        toggleEditBtn.addEventListener('click', () => {
            if (profileDetailsView && profileEditForm) {
                profileDetailsView.classList.toggle('hidden');
                profileEditForm.classList.toggle('hidden');
            }
        });
    }

    // Save profile changes button
    const saveChangesBtn = document.getElementById('save-profile-changes-button');
    if (saveChangesBtn) {
        saveChangesBtn.addEventListener('click', saveProfileChanges);
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Help button
    const helpBtn = document.getElementById('help-button');
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            alert('For help, please contact our support team at support@streetr.com');
        });
    }
}

// Save profile changes
async function saveProfileChanges() {
    const formData = {
        full_name: document.getElementById('edit-customer-name')?.value || '',
        mobile_number: document.getElementById('edit-mobile-number')?.value || '',
        street_name: document.getElementById('edit-street-name')?.value || '',
        nearby_landmark: document.getElementById('edit-nearby-landmark')?.value || '',
        district: document.getElementById('edit-district')?.value || '',
        state: document.getElementById('edit-state')?.value || '',
        pincode: document.getElementById('edit-pincode')?.value || ''
    };

    // Basic validation
    if (!formData.full_name || !formData.mobile_number || !formData.pincode) {
        alert('Please fill in all required fields.');
        return;
    }

    if (formData.mobile_number.length !== 10) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
    }

    if (formData.pincode.length !== 6) {
        alert('Please enter a valid 6-digit pincode.');
        return;
    }

    showLoader();
    try {
        const { error } = await supabase
            .from('profiles')
            .update(formData)
            .eq('id', window.currentUser.id);

        if (error) throw error;

        // Update local profile
        window.userProfile = { ...window.userProfile, ...formData };
        
        // Refresh profile display
        displayUserProfile();
        
        // Hide edit form
        const profileDetailsView = document.getElementById('profile-details-view');
        const profileEditForm = document.getElementById('profile-edit-form');
        if (profileDetailsView && profileEditForm) {
            profileDetailsView.classList.remove('hidden');
            profileEditForm.classList.add('hidden');
        }

        alert('Profile updated successfully!');
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
    } finally {
        hideLoader();
    }
}

// Handle logout
async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        showLoader();
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error logging out: ' + error.message);
        } finally {
            hideLoader();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeProfileEventListeners();
});

// Make functions globally available
window.displayUserProfile = displayUserProfile;