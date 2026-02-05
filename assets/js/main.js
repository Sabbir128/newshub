/**
 * NewsHub - Main JavaScript Module
 * Handles UI interactions, theme, search, and page rendering
 */

// ========================================
// Theme Management
// ========================================

const ThemeManager = {
    init() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
};

// ========================================
// Mobile Menu
// ========================================

const MobileMenu = {
    init() {
        const toggle = document.getElementById('mobileMenuToggle');
        const menu = document.getElementById('mobileMenu');
        
        if (!toggle || !menu) return;
        
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            menu.classList.toggle('active');
            document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when clicking a link
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                menu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
};

// ========================================
// Search
// ========================================

const SearchManager = {
    init() {
        const searchToggle = document.getElementById('searchToggle');
        const searchBar = document.getElementById('searchBar');
        const searchClose = document.getElementById('searchClose');
        const searchInput = document.getElementById('searchInput');
        
        if (!searchToggle || !searchBar) return;
        
        searchToggle.addEventListener('click', () => {
            searchBar.classList.toggle('active');
            if (searchBar.classList.contains('active')) {
                searchInput?.focus();
            }
        });
        
        searchClose?.addEventListener('click', () => {
            searchBar.classList.remove('active');
            if (searchInput) searchInput.value = '';
        });
        
        // Search functionality
        let searchTimeout;
        searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) return;
            
            searchTimeout = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        });
        
        // Close search on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchBar.classList.contains('active')) {
                searchBar.classList.remove('active');
            }
        });
    },
    
    async performSearch(query) {
        const results = await DataService.searchPosts(query);
        this.displaySearchResults(results);
    },
    
    displaySearchResults(results) {
        // This can be extended to show a dropdown with search results
        console.log('Search results:', results);
    }
};

// ========================================
// Homepage Renderer
// ========================================

const HomepageRenderer = {
    async init() {
        if (!document.getElementById('heroGrid')) return;
        
        await this.renderHero();
        await this.renderLatestNews();
        await this.renderTrending();
        await this.renderFooterCategories();
        this.setupLoadMore();
    },
    
    async renderHero() {
        const heroGrid = document.getElementById('heroGrid');
        if (!heroGrid) return;
        
        const featuredPosts = await DataService.getFeaturedPosts(5);
        
        if (featuredPosts.length === 0) {
            heroGrid.innerHTML = '<p class="no-content">No featured posts available.</p>';
            return;
        }
        
        heroGrid.innerHTML = featuredPosts.map((post, index) => `
            <article class="hero-card ${index === 0 ? 'featured' : ''}">
                <a href="post.html?slug=${post.slug}">
                    <div class="hero-card-image">
                        <img src="${post.image}" alt="${post.title}" loading="lazy">
                        <span class="hero-card-category">${this.capitalize(post.category)}</span>
                    </div>
                    <div class="hero-card-content">
                        <h3 class="hero-card-title">${post.title}</h3>
                        <div class="hero-card-meta">
                            <span>${post.author}</span>
                            <span>•</span>
                            <span>${this.formatDate(post.date)}</span>
                        </div>
                    </div>
                </a>
            </article>
        `).join('');
    },
    
    async renderLatestNews() {
        const newsGrid = document.getElementById('newsGrid');
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (!newsGrid) return;
        
        const [posts, categories] = await Promise.all([
            DataService.getLatestPosts(12),
            DataService.loadCategories()
        ]);
        
        // Render category filters
        if (categoryFilter) {
            const categoryButtons = categories.map(cat => `
                <button class="filter-btn" data-filter="${cat.slug}">${cat.name}</button>
            `).join('');
            categoryFilter.insertAdjacentHTML('beforeend', categoryButtons);
            
            // Add filter functionality
            categoryFilter.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    categoryFilter.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.filterPosts(btn.dataset.filter, posts);
                });
            });
        }
        
        this.renderPostGrid(posts.slice(0, 8), newsGrid);
    },
    
    renderPostGrid(posts, container) {
        if (posts.length === 0) {
            container.innerHTML = '<p class="no-content">No posts available.</p>';
            return;
        }
        
        container.innerHTML = posts.map(post => `
            <article class="news-card">
                <a href="post.html?slug=${post.slug}">
                    <div class="news-card-image">
                        <img src="${post.image}" alt="${post.title}" loading="lazy">
                        <span class="news-card-category">${this.capitalize(post.category)}</span>
                    </div>
                    <div class="news-card-content">
                        <h3 class="news-card-title">${post.title}</h3>
                        <p class="news-card-excerpt">${post.excerpt}</p>
                        <div class="news-card-meta">
                            <div class="news-card-author">
                                <img src="${post.authorImage}" alt="${post.author}">
                                <span>${post.author}</span>
                            </div>
                            <span>${this.formatDate(post.date)}</span>
                        </div>
                    </div>
                </a>
            </article>
        `).join('');
    },
    
    filterPosts(filter, allPosts) {
        const newsGrid = document.getElementById('newsGrid');
        if (!newsGrid) return;
        
        const filtered = filter === 'all' 
            ? allPosts.slice(0, 8)
            : allPosts.filter(post => post.category === filter).slice(0, 8);
        
        this.renderPostGrid(filtered, newsGrid);
    },
    
    async renderTrending() {
        const trendingGrid = document.getElementById('trendingGrid');
        if (!trendingGrid) return;
        
        const trendingPosts = await DataService.getTrendingPosts(4);
        
        if (trendingPosts.length === 0) {
            trendingGrid.innerHTML = '<p class="no-content">No trending posts available.</p>';
            return;
        }
        
        trendingGrid.innerHTML = trendingPosts.map((post, index) => `
            <article class="trending-card">
                <a href="post.html?slug=${post.slug}">
                    <span class="trending-number">${index + 1}</span>
                    <div class="trending-content">
                        <h4 class="trending-title">${post.title}</h4>
                        <div class="trending-meta">
                            <span>${this.capitalize(post.category)}</span>
                            <span>•</span>
                            <span>${this.formatDate(post.date)}</span>
                        </div>
                    </div>
                </a>
            </article>
        `).join('');
    },
    
    async renderFooterCategories() {
        const footerCategories = document.getElementById('footerCategories');
        if (!footerCategories) return;
        
        const categories = await DataService.loadCategories();
        
        footerCategories.innerHTML = categories.map(cat => `
            <li><a href="category.html?cat=${cat.slug}">${cat.name}</a></li>
        `).join('');
    },
    
    setupLoadMore() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) return;
        
        let currentPage = 1;
        const postsPerPage = 8;
        
        loadMoreBtn.addEventListener('click', async () => {
            const allPosts = await DataService.loadPosts();
            const start = currentPage * postsPerPage;
            const end = start + postsPerPage;
            const morePosts = allPosts.slice(start, end);
            
            if (morePosts.length === 0) {
                loadMoreBtn.style.display = 'none';
                return;
            }
            
            const newsGrid = document.getElementById('newsGrid');
            const html = morePosts.map(post => `
                <article class="news-card">
                    <a href="post.html?slug=${post.slug}">
                        <div class="news-card-image">
                            <img src="${post.image}" alt="${post.title}" loading="lazy">
                            <span class="news-card-category">${this.capitalize(post.category)}</span>
                        </div>
                        <div class="news-card-content">
                            <h3 class="news-card-title">${post.title}</h3>
                            <p class="news-card-excerpt">${post.excerpt}</p>
                            <div class="news-card-meta">
                                <div class="news-card-author">
                                    <img src="${post.authorImage}" alt="${post.author}">
                                    <span>${post.author}</span>
                                </div>
                                <span>${this.formatDate(post.date)}</span>
                            </div>
                        </div>
                    </a>
                </article>
            `).join('');
            
            newsGrid.insertAdjacentHTML('beforeend', html);
            currentPage++;
            
            if (end >= allPosts.length) {
                loadMoreBtn.style.display = 'none';
            }
        });
    },
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays} days ago`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
        });
    }
};

// ========================================
// Initialize
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }
    
    // Initialize modules
    ThemeManager.init();
    MobileMenu.init();
    SearchManager.init();
    HomepageRenderer.init();
});
