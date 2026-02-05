/**
 * NewsHub - Single Post Page Module
 */

const PostPage = {
    post: null,
    
    async init() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const slug = urlParams.get('slug');
            
            console.log('Loading post with slug:', slug);
            
            if (!slug) {
                this.showError('No article specified');
                return;
            }
            
            // Load posts using YOUR fetch.js method
            const posts = await DataService.loadPosts();
            console.log('Total posts loaded:', posts.length);
            
            // Find the post
            this.post = posts.find(p => p.slug === slug);
            console.log('Found post:', this.post);
            
            if (!this.post) {
                this.showError('Article not found: ' + slug);
                return;
            }
            
            // Render the post
            this.renderArticle();
            this.renderRelatedPosts();
            this.updatePageTitle();
            
        } catch (error) {
            console.error('Error loading post:', error);
            this.showError('Failed to load article');
        }
    },
    
    renderArticle() {
        const post = this.post;
        if (!post) return;
        
        // Update title
        const titleEl = document.getElementById('articleTitle');
        if (titleEl) titleEl.textContent = post.title || 'Untitled';
        
        // Update meta (category, date, views)
        const metaEl = document.getElementById('articleMeta');
        if (metaEl) {
            metaEl.innerHTML = `
                <span class="article-category">${this.capitalize(post.category || 'uncategorized')}</span>
                <span class="article-date">${this.formatDate(post.date)}</span>
                <span class="article-views">
                    <span class="views-icon">👁️</span>
                    <span id="postViewsDisplay" 
                          data-slug="${post.slug}" 
                          data-manual-views="${post.views || 0}">0</span>
                    <span class="views-label">views</span>
                </span>
            `;
            
            // Initialize view counter if available
            if (typeof ViewCounter !== 'undefined') {
                ViewCounter.init(post.slug, post.views || 0);
            }
        }
        
        // Update author
        const authorEl = document.getElementById('articleAuthor');
        if (authorEl) {
            authorEl.innerHTML = `
                <img src="${post.authorImage || 'https://i.pravatar.cc/150'}" 
                     alt="${post.author || 'Unknown'}" 
                     class="article-author-image">
                <div class="article-author-info">
                    <span class="article-author-name">${post.author || 'Unknown'}</span>
                    <span class="article-read-time">${this.estimateReadTime(post.content)} min read</span>
                </div>
            `;
        }
        
        // Update featured image
        const imageEl = document.getElementById('articleFeaturedImage');
        if (imageEl) {
            imageEl.innerHTML = `
                <img src="${post.image || 'https://via.placeholder.com/800x400'}" 
                     alt="${post.title}">
            `;
        }
        
        // Update content
        const bodyEl = document.getElementById('articleBody');
        if (bodyEl) {
            bodyEl.innerHTML = this.formatContent(post.content);
        }
    },
    
    async renderRelatedPosts() {
        if (!this.post) return;
        
        const container = document.getElementById('relatedPosts');
        if (!container) return;
        
        try {
            const posts = await DataService.loadPosts();
            const related = posts
                .filter(p => p.category === this.post.category && p.slug !== this.post.slug)
                .slice(0, 4);
            
            if (related.length === 0) {
                container.innerHTML = '<h3>Related Articles</h3><p>No related articles found.</p>';
                return;
            }
            
            container.innerHTML = `
                <h3>Related Articles</h3>
                ${related.map(post => `
                    <article class="related-post-card">
                        <a href="post.html?slug=${post.slug}">
                            <img src="${post.image}" alt="${post.title}" class="related-post-image">
                            <h4 class="related-post-title">${post.title}</h4>
                        </a>
                    </article>
                `).join('')}
            `;
        } catch (error) {
            console.error('Error loading related posts:', error);
        }
    },
    
    updatePageTitle() {
        if (this.post) {
            document.title = `${this.post.title} - NewsHub`;
        }
    },
    
    formatContent(content) {
        if (!content) return '<p>No content available.</p>';
        
        return content
            .split('\n\n')
            .filter(p => p.trim())
            .map(para => {
                if (para.startsWith('# ')) return `<h2>${para.substring(2)}</h2>`;
                if (para.startsWith('## ')) return `<h3>${para.substring(3)}</h3>`;
                if (para.startsWith('> ')) return `<blockquote>${para.substring(2)}</blockquote>`;
                return `<p>${para}</p>`;
            })
            .join('');
    },
    
    estimateReadTime(content) {
        if (!content) return 1;
        const words = content.split(/\s+/).length;
        return Math.max(1, Math.ceil(words / 200));
    },
    
    showError(message) {
        const titleEl = document.getElementById('articleTitle');
        const bodyEl = document.getElementById('articleBody');
        
        if (titleEl) titleEl.textContent = 'Error';
        if (bodyEl) {
            bodyEl.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 40px;">
                    <h2>⚠️ ${message}</h2>
                    <p>The article could not be loaded.</p>
                    <a href="index.html" class="btn btn-primary" style="margin-top: 20px;">Go Home</a>
                </div>
            `;
        }
    },
    
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    formatDate(dateString) {
        if (!dateString) return 'Unknown date';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    }
};

// Social Share Functions
function shareArticle(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    
    const urls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
    };
    
    if (urls[platform]) {
        window.open(urls[platform], '_blank', 'width=600,height=400');
    }
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const btn = document.querySelector('.share-btn.copy');
        if (btn) {
            const original = btn.innerHTML;
            btn.innerHTML = '<span>✓</span> Copied!';
            setTimeout(() => btn.innerHTML = original, 2000);
        }
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    PostPage.init();
});
