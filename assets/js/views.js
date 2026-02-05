/**
 * NewsHub View Counter - Similar to Jannah Theme
 * Uses CountAPI for real-time view counting + Manual views from JSON
 */

const ViewCounter = {
    // CountAPI namespace (আপনার GitHub username দিয়ে তৈরি হবে)
    namespace: 'sabbir128-newshub',
    
    /**
     * Track a view for a post
     */
    async trackView(postSlug) {
        try {
            // Check if already viewed in this session
            const sessionKey = `viewed_${postSlug}`;
            if (sessionStorage.getItem(sessionKey)) {
                return; // Already counted this session
            }
            
            // Mark as viewed for this session
            sessionStorage.setItem(sessionKey, 'true');
            
            // Increment count on CountAPI
            const response = await fetch(
                `https://api.countapi.xyz/hit/${this.namespace}/${postSlug}`
            );
            const data = await response.json();
            
            // Update display
            this.updateDisplay(postSlug, data.value);
            
            return data.value;
            
        } catch (error) {
            console.log('View tracking failed:', error);
        }
    },
    
    /**
     * Get current view count
     */
    async getViews(postSlug, manualViews = 0) {
        try {
            const response = await fetch(
                `https://api.countapi.xyz/get/${this.namespace}/${postSlug}`
            );
            const data = await response.json();
            
            // Real views + Manual views
            const totalViews = (data.value || 0) + manualViews;
            return totalViews;
            
        } catch (error) {
            // If API fails, return manual views only
            return manualViews;
        }
    },
    
    /**
     * Update view display on page
     */
    async updateDisplay(postSlug, realViews = null, manualViews = 0) {
        const viewElements = document.querySelectorAll(`[data-views="${postSlug}"]`);
        
        if (viewElements.length === 0) return;
        
        let totalViews;
        
        if (realViews !== null) {
            totalViews = realViews + manualViews;
        } else {
            totalViews = await this.getViews(postSlug, manualViews);
        }
        
        const formattedViews = this.formatViews(totalViews);
        
        viewElements.forEach(el => {
            el.textContent = formattedViews;
            el.classList.add('views-loaded');
        });
        
        return totalViews;
    },
    
    /**
     * Format view number (1.2K, 3.5M, etc.)
     */
    formatViews(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },
    
    /**
     * Initialize view counter on page
     */
    init(postSlug, manualViews = 0) {
        // Display initial views
        this.updateDisplay(postSlug, null, manualViews);
        
        // Track this view
        this.trackView(postSlug).then(realViews => {
            if (realViews) {
                this.updateDisplay(postSlug, realViews, manualViews);
            }
        });
    }
};

// Initialize on post page
document.addEventListener('DOMContentLoaded', () => {
    const viewContainer = document.getElementById('postViewsDisplay');
    if (viewContainer) {
        const slug = viewContainer.dataset.slug;
        const manualViews = parseInt(viewContainer.dataset.manualViews) || 0;
        
        if (slug) {
            ViewCounter.init(slug, manualViews);
        }
    }
});
