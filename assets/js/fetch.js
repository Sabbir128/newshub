/**
 * NewsHub - Data Fetching Module
 * Handles loading JSON data from the data folder
 */

const DataService = {
    // Base path for data files
    basePath: './data/',
    
    // Cache for loaded data
    cache: {
        posts: null,
        categories: null,
        site: null
    },
    
    /**
     * Load posts data
     * @returns {Promise<Array>} Array of posts
     */
    async loadPosts() {
        if (this.cache.posts) {
            return this.cache.posts;
        }
        
        try {
            const response = await fetch(`${this.basePath}posts.json`);
            if (!response.ok) throw new Error('Failed to load posts');
            const data = await response.json();
            this.cache.posts = data.posts || [];
            return this.cache.posts;
        } catch (error) {
            console.error('Error loading posts:', error);
            return this.getSamplePosts();
        }
    },
    
    /**
     * Load categories data
     * @returns {Promise<Array>} Array of categories
     */
    async loadCategories() {
        if (this.cache.categories) {
            return this.cache.categories;
        }
        
        try {
            const response = await fetch(`${this.basePath}categories.json`);
            if (!response.ok) throw new Error('Failed to load categories');
            const data = await response.json();
            this.cache.categories = data.categories || [];
            return this.cache.categories;
        } catch (error) {
            console.error('Error loading categories:', error);
            return this.getSampleCategories();
        }
    },
    
    /**
     * Load site settings
     * @returns {Promise<Object>} Site settings
     */
    async loadSiteSettings() {
        if (this.cache.site) {
            return this.cache.site;
        }
        
        try {
            const response = await fetch(`${this.basePath}site.json`);
            if (!response.ok) throw new Error('Failed to load site settings');
            const data = await response.json();
            this.cache.site = data;
            return this.cache.site;
        } catch (error) {
            console.error('Error loading site settings:', error);
            return this.getSampleSiteSettings();
        }
    },
    
    /**
     * Get a single post by slug
     * @param {string} slug - Post slug
     * @returns {Promise<Object|null>} Post object or null
     */
    async getPostBySlug(slug) {
        const posts = await this.loadPosts();
        return posts.find(post => post.slug === slug) || null;
    },
    
    /**
     * Get posts by category
     * @param {string} category - Category slug
     * @returns {Promise<Array>} Array of posts
     */
    async getPostsByCategory(category) {
        const posts = await this.loadPosts();
        return posts.filter(post => post.category === category);
    },
    
    /**
     * Search posts
     * @param {string} query - Search query
     * @returns {Promise<Array>} Array of matching posts
     */
    async searchPosts(query) {
        const posts = await this.loadPosts();
        const lowerQuery = query.toLowerCase();
        return posts.filter(post => 
            post.title.toLowerCase().includes(lowerQuery) ||
            post.excerpt.toLowerCase().includes(lowerQuery) ||
            post.content.toLowerCase().includes(lowerQuery)
        );
    },
    
    /**
     * Get featured posts
     * @param {number} count - Number of posts to return
     * @returns {Promise<Array>} Array of featured posts
     */
    async getFeaturedPosts(count = 5) {
        const posts = await this.loadPosts();
        return posts
            .filter(post => post.featured)
            .slice(0, count);
    },
    
    /**
     * Get latest posts
     * @param {number} count - Number of posts to return
     * @returns {Promise<Array>} Array of latest posts
     */
    async getLatestPosts(count = 12) {
        const posts = await this.loadPosts();
        return posts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, count);
    },
    
    /**
     * Get trending posts
     * @param {number} count - Number of posts to return
     * @returns {Promise<Array>} Array of trending posts
     */
    async getTrendingPosts(count = 4) {
        const posts = await this.loadPosts();
        return posts
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, count);
    },
    
    /**
     * Get related posts
     * @param {string} currentSlug - Current post slug
     * @param {string} category - Category slug
     * @param {number} count - Number of posts to return
     * @returns {Promise<Array>} Array of related posts
     */
    async getRelatedPosts(currentSlug, category, count = 4) {
        const posts = await this.loadPosts();
        return posts
            .filter(post => post.slug !== currentSlug && post.category === category)
            .slice(0, count);
    },
    
    /**
     * Clear cache
     */
    clearCache() {
        this.cache = {
            posts: null,
            categories: null,
            site: null
        };
    },
    
    /**
     * Sample posts for fallback
     */
    getSamplePosts() {
        return [
            {
                id: 1,
                title: "The Future of AI: What to Expect in 2025",
                slug: "future-of-ai-2025",
                excerpt: "Artificial intelligence continues to evolve at a rapid pace. Here's what experts predict for the coming year.",
                content: "Artificial intelligence has become an integral part of our daily lives...",
                category: "technology",
                author: "Sarah Johnson",
                authorImage: "https://i.pravatar.cc/150?u=sarah",
                date: "2025-01-15",
                image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
                featured: true,
                views: 12500
            },
            {
                id: 2,
                title: "Global Markets Rally on Economic Data",
                slug: "global-markets-rally",
                excerpt: "Stock markets around the world surge as new economic indicators show positive growth trends.",
                content: "Investors welcomed the latest economic data with open arms...",
                category: "business",
                author: "Michael Chen",
                authorImage: "https://i.pravatar.cc/150?u=michael",
                date: "2025-01-14",
                image: "https://images.unsplash.com/photo-1611974765270-ca1258634369?w=800",
                featured: true,
                views: 8900
            },
            {
                id: 3,
                title: "Championship Finals: A Historic Showdown",
                slug: "championship-finals",
                excerpt: "The final match delivers unforgettable moments as both teams battle for the title.",
                content: "In what will be remembered as one of the greatest finals...",
                category: "sports",
                author: "Emma Davis",
                authorImage: "https://i.pravatar.cc/150?u=emma",
                date: "2025-01-13",
                image: "https://images.unsplash.com/photo-1461896836934- voices-5e77b8c5c7b5?w=800",
                featured: true,
                views: 15200
            },
            {
                id: 4,
                title: "New Blockbuster Breaks Box Office Records",
                slug: "blockbuster-records",
                excerpt: "The latest superhero film shatters expectations and sets new industry standards.",
                content: "Hollywood is celebrating as the newest addition to the franchise...",
                category: "entertainment",
                author: "Alex Rivera",
                authorImage: "https://i.pravatar.cc/150?u=alex",
                date: "2025-01-12",
                image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
                featured: false,
                views: 6700
            },
            {
                id: 5,
                title: "Revolutionary Battery Technology Unveiled",
                slug: "battery-technology",
                excerpt: "Scientists announce breakthrough in battery efficiency that could transform electric vehicles.",
                content: "A team of researchers has developed a new battery technology...",
                category: "technology",
                author: "Dr. Lisa Park",
                authorImage: "https://i.pravatar.cc/150?u=lisa",
                date: "2025-01-11",
                image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800",
                featured: false,
                views: 9800
            },
            {
                id: 6,
                title: "Startup Raises $100M in Series B Funding",
                slug: "startup-funding",
                excerpt: "The fintech company plans to expand operations globally with fresh capital.",
                content: "In a sign of continued investor confidence...",
                category: "business",
                author: "James Wilson",
                authorImage: "https://i.pravatar.cc/150?u=james",
                date: "2025-01-10",
                image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800",
                featured: false,
                views: 5400
            }
        ];
    },
    
    /**
     * Sample categories for fallback
     */
    getSampleCategories() {
        return [
            { id: 1, name: "Technology", slug: "technology", description: "Latest tech news and innovations", color: "#2563eb" },
            { id: 2, name: "Business", slug: "business", description: "Market updates and business insights", color: "#10b981" },
            { id: 3, name: "Sports", slug: "sports", description: "Sports coverage and analysis", color: "#f59e0b" },
            { id: 4, name: "Entertainment", slug: "entertainment", description: "Movies, music, and celebrity news", color: "#ef4444" },
            { id: 5, name: "Health", slug: "health", description: "Health and wellness tips", color: "#8b5cf6" },
            { id: 6, name: "Science", slug: "science", description: "Scientific discoveries and research", color: "#06b6d4" }
        ];
    },
    
    /**
     * Sample site settings for fallback
     */
    getSampleSiteSettings() {
        return {
            name: "NewsHub",
            tagline: "Your trusted source for the latest news",
            description: "Stay informed with breaking news and in-depth coverage from around the world.",
            logo: "📰",
            social: {
                facebook: "https://facebook.com/newshub",
                twitter: "https://twitter.com/newshub",
                instagram: "https://instagram.com/newshub",
                linkedin: "https://linkedin.com/company/newshub"
            },
            features: {
                darkMode: true,
                search: true,
                socialShare: true
            }
        };
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataService;
}
