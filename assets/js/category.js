/**
 * NewsHub - Category Page Module
 * Handles rendering of category-specific content
 */

const CategoryPage = {
    category: null,
    posts: [],
    currentPage: 1,
    postsPerPage: 9,
    
    async init() {
        const urlParams = new URLSearchParams(window.location.search);
        const categorySlug = urlParams.get('cat');
        
        if (!categorySlug) {
            this.showError('Category not specified');
            return;
        }
        
        // Load categories to get category info
        const categories = await DataService.loadCategories();
        this.category = categories.find(cat => cat.slug === categorySlug);
        
        if (!this.category) {
            this.showError('Category not found');
            return;
        }
        
        // Load posts for this category
        this.posts = await DataService.getPostsByCategory(categorySlug);
        
        this.renderCategoryHeader();
        this.renderPosts();
        this.setupSortFilter();
        this.setupLoadMore();
        this.updatePageTitle();
    },
    
    renderCategoryHeader() {
        const categoryName = document.getElementById('categoryName');
        const categoryTitle = document.getElementById('categoryTitle');
        const categoryDescription = document.getElementById('categoryDescription');
        
        if (categoryName) {
            categoryName.textContent = this.category.name;
        }
        
        if (categoryTitle) {
            categoryTitle.textContent = this.category.name;
        }
        
        if (categoryDescription) {
            categoryDescription.textContent = this.category.description || `Latest ${this.category.name} news and updates`;
        }
    },
    
    renderPosts() {
        const newsGrid = document.getElementById('categoryNewsGrid');
        const noResults = document.getElementById('noResults');
        
        if (!newsGrid) return;
        
        if (this.posts.length === 0) {
            newsGrid.style.display = 'none';
            if (noResults) noResults.style.display = 'block';
            return;
        }
        
        newsGrid.style.display = 'grid';
        if (noResults) noResults.style.display = 'none';
        
        const postsToShow = this.posts.slice(0, this.postsPerPage);
        this.renderPostGrid(postsToShow, newsGrid);
    },
    
    renderPostGrid(posts, container) {
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
    
    setupSortFilter() {
        const sortFilter = document.getElementById('sortFilter');
        if (!sortFilter) return;
        
        sortFilter.addEventListener('change', (e) => {
            const sortType = e.target.value;
            this.sortPosts(sortType);
        });
    },
    
    sortPosts(sortType) {
        switch (sortType) {
            case 'newest':
                this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'oldest':
                this.posts.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'popular':
                this.posts.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
        }
        
        this.currentPage = 1;
        const newsGrid = document.getElementById('categoryNewsGrid');
        const postsToShow = this.posts.slice(0, this.postsPerPage);
        this.renderPostGrid(postsToShow, newsGrid);
        
        // Reset load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = this.posts.length > this.postsPerPage ? 'inline-flex' : 'none';
        }
    },
    
    setupLoadMore() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) return;
        
        if (this.posts.length <= this.postsPerPage) {
            loadMoreBtn.style.display = 'none';
            return;
        }
        
        loadMoreBtn.addEventListener('click', () => {
            const start = this.currentPage * this.postsPerPage;
            const end = start + this.postsPerPage;
            const morePosts = this.posts.slice(start, end);
            
            if (morePosts.length === 0) {
                loadMoreBtn.style.display = 'none';
                return;
            }
            
            const newsGrid = document.getElementById('categoryNewsGrid');
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
            this.currentPage++;
            
            if (end >= this.posts.length) {
                loadMoreBtn.style.display = 'none';
            }
        });
    },
    
    updatePageTitle() {
        if (this.category) {
            document.title = `${this.category.name} News - NewsHub`;
        }
    },
    
    showError(message) {
        const categoryNewsGrid = document.getElementById('categoryNewsGrid');
        const noResults = document.getElementById('noResults');
        
        if (categoryNewsGrid) {
            categoryNewsGrid.style.display = 'none';
        }
        
        if (noResults) {
            noResults.innerHTML = `
                <h2>${message}</h2>
                <p>Please check the URL or browse our categories.</p>
                <a href="index.html" class="btn btn-primary">Go Home</a>
            `;
            noResults.style.display = 'block';
        }
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
    CategoryPage.init();
});
