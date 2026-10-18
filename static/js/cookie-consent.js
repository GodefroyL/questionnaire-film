// Cookie Consent Manager - CMP compatible with Google AdSense
// This implements a simple consent banner for GDPR compliance

document.addEventListener('DOMContentLoaded', function() {
    // Check if consent has already been given
    const consentGiven = localStorage.getItem('cookie_consent');
    const consentBanner = document.getElementById('cookie-consent-banner');
    
    if (!consentBanner) return;
    
    // If consent has been given, hide the banner
    if (consentGiven) {
        consentBanner.classList.add('cookie-consent-hidden');
        // Load AdSense if consent was given for ads
        if (consentGiven.includes('ads') && window.adsbygoogle) {
            initializeAds();
        }
        return;
    }
    
    // Show the banner
    consentBanner.classList.remove('cookie-consent-hidden');
    
    // Handle button clicks
    const acceptAllBtn = consentBanner.querySelector('.cookie-consent-accept-all');
    const rejectAllBtn = consentBanner.querySelector('.cookie-consent-reject-all');
    const manageBtn = consentBanner.querySelector('.cookie-consent-manage');
    const closeBtn = consentBanner.querySelector('.cookie-consent-close');
    
    function hideBanner() {
        consentBanner.classList.add('cookie-consent-hidden');
    }
    
    function saveConsent(consentType) {
        localStorage.setItem('cookie_consent', consentType);
        // Set cookie for Google's CMP requirements
        document.cookie = `cookie_consent=${consentType}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    }
    
    function initializeAds() {
        // Re-initialize AdSense slots
        if (window.adsbygoogle && window.adsbygoogle.push) {
            document.querySelectorAll('ins.adsbygoogle').forEach(function(ins) {
                if (ins.offsetWidth > 0) {
                    try {
                        (window.adsbygoogle = window.adsbygoogle || []).push({});
                    } catch (e) {}
                }
            });
        }
    }
    
    if (acceptAllBtn) {
        acceptAllBtn.addEventListener('click', function() {
            saveConsent('all');
            hideBanner();
            initializeAds();
        });
    }
    
    if (rejectAllBtn) {
        rejectAllBtn.addEventListener('click', function() {
            saveConsent('none');
            hideBanner();
            // Remove AdSense scripts if they exist
            const adsbygoogle = document.querySelectorAll('script[src*="adsbygoogle"]');
            adsbygoogle.forEach(script => script.remove());
        });
    }
    
    if (manageBtn) {
        manageBtn.addEventListener('click', function() {
            // For now, manage button works like accept all
            // In a full implementation, this would open a modal with granular options
            saveConsent('all');
            hideBanner();
            initializeAds();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            // Close without consent - treat as rejection
            saveConsent('none');
            hideBanner();
        });
    }
    
    // Also handle the Google AdSense consent API if available
    if (window.gtag) {
        window.gtag('consent', 'default', {
            'ad_storage': consentGiven ? 'granted' : 'denied',
            'analytics_storage': 'denied',
            'functionality_storage': 'denied',
            'personalization_storage': consentGiven ? 'granted' : 'denied',
            'security_storage': 'granted'
        });
    }
});

// Function to check consent for ads
function hasAdConsent() {
    const consent = localStorage.getItem('cookie_consent');
    return consent && consent.includes('ads');
}
