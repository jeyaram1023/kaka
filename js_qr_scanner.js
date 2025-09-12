// js_qr_scanner.js - QR Scanner functionality

let html5QrcodeScanner = null;

// Initialize QR scanner
function initializeQRScanner() {
    const qrReader = document.getElementById('qr-reader');
    if (!qrReader) return;

    try {
        html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-reader",
            { 
                fps: 10, 
                qrbox: { width: 250, height: 250 } 
            },
            false
        );

        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    } catch (error) {
        console.error('Error initializing QR scanner:', error);
        qrReader.innerHTML = '<p>QR Scanner not supported on this device.</p>';
    }
}

// Handle successful QR scan
function onScanSuccess(decodedText, decodedResult) {
    console.log('QR Code detected:', decodedText);
    
    // Process the scanned QR code
    // You can add logic here to handle different types of QR codes
    alert(`QR Code detected: ${decodedText}`);
    
    // Stop scanning
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear();
    }
    
    // Navigate back to home
    navigateToPage('main-app-view', 'home-page-content');
}

// Handle QR scan failure
function onScanFailure(error) {
    // This is expected for most of the time
    // Only log errors that are not expected
    if (error && !error.includes("No MultiFormat Readers")) {
        console.log('QR scan error:', error);
    }
}

// Close QR scanner
function closeQRScanner() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear();
    }
    navigateToPage('main-app-view', 'home-page-content');
}

// Initialize event listeners
function initializeQREventListeners() {
    const closeScannerBtn = document.getElementById('close-scanner-button');
    if (closeScannerBtn) {
        closeScannerBtn.addEventListener('click', closeQRScanner);
    }

    const qrScannerBtn = document.getElementById('qr-scanner-button');
    if (qrScannerBtn) {
        qrScannerBtn.addEventListener('click', () => {
            navigateToPage('qr-scanner-page');
            // Initialize scanner when page loads
            setTimeout(initializeQRScanner, 100);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeQREventListeners();
});

// Make functions globally available
window.initializeQRScanner = initializeQRScanner;