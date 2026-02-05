/**
 * NewsHub - Single Post Page Module
 * Handles rendering of individual article pages
 */

const PostPage = {
    post: null,
    
    async init() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const slug = urlParams.get('slug');
            
            console.log('Loading post with slug:', slug);
            
            if (!slug) {
                this.showError('Article not found - no slug provided');
                return;
            }
            
            // Use YOUR fetch.js method: loadPosts()
            const posts = await DataService.loadPosts();
            console.log('Posts loaded:', posts.length);
            
            // Find post manually
            this.post = posts.find(post => post.slug === slug);
            console.log('Found post:', this.post);
            
            if (!this.post) {
                this.showError('Article not found: ' + slug);
                return;
            }
            
            this.renderArticle();
            this.renderRelatedPosts();
            this.updatePageTitle();
            
        } catch (error) {
            console.error('Error in init:', error);
            this.showError('Failed to load article: ' + error.message);
        }
    },
    
    renderArticle() {
        const post = this.post;
        if (!post) {
            console.error('No post to render');
            return;
        }
        
        console.log('Rendering article:', post.title);
        
        // Article meta
        const articleMeta = document.getElementById('articleMeta');
        if (articleMeta) {
            articleMeta.innerHTML = `
                <span class="article-category">${this.capitalize(post.category || 'uncategorized')}</span>
                <span class="article-date">${this.formatDate(post.date)}</span>
                
                <!-- 👁️ View Counter -->
                <span class="article-views">
                    <span class="views-icon">👁️</span>
                    <span id="postViewsDisplay" 
                          data-slug="${post.slug}" 
                          data-manual-views="${post.views || 0}">0</span>
                    <span class="views-label">views</span>
                </span>
            `;
            
            // Initialize view counter
            if (typeof ViewCounter !== 'undefined') {
                ViewCounter.init(post.slug, post.views || 0);
            }
        }
        
        // Article title
        const articleTitle = document.getElementById('articleTitle');
        if (articleTitle) {
            articleTitle.textContent = post.title || 'Untitled';
        }
        
        // Article author
        const articleAuthor = document.getElementById('articleAuthor');
        if (articleAuthor) {
            articleAuthor.innerHTML = `
                <img src="${post.authorImage || 'https://i.pravatar.cc/150'}" 
                     alt="${post.author || 'Unknown'}" 
                     class="article-author-image">
                <div class="article-author-info">
                    <span class="article-author-name">${post.author || 'Unknown'}</span>
                    <span class="article-read-time">${this.estimateReadTime(post.content)} min read</span>
                </div>
            `;
        }
        
        // Featured image
        const articleFeaturedImage = document.getElementById('articleFeaturedImage');
        if (articleFeaturedImage) {
            articleFeaturedImage.innerHTML = `
                <img src="${post.image || 'https://via.placeholder.com/800x400'}" 
                     alt="${post.title}">
            `;
        }
        
        // Article body
        const articleBody = document.getElementById('articleBody');
        if (articleBody) {
            articleBody.innerHTML = this.formatContent(post.content);
        }
    },
    
    async renderRelatedPosts() {
        if (!this.post) return;
        
        const relatedPostsContainer = document.getElementById('relatedPosts');
        if (!relatedPostsContainer) return;
        
        try {
            // Use YOUR fetch.js method
            const posts = await DataService.loadPosts();
            const relatedPosts = posts
                .filter(post => post.category === this.post.category && post.slug !== this.post.slug)
                .slice(0, 4);
            
            if (relatedPosts.length === 0) {
                relatedPostsContainer.innerHTML = '<h3>Related Articles</h3><p>No related articles found.</p>';
                return;
            }
            
            const postsHtml = relatedPosts.map(post => `
                <article class="related-post-card">
                    <a href="post.html?slug=${post.slug}">
                        <img src="${post.image}" alt="${post.title}" class="related-post-image">
                        <h4 class="related-post-title">${post.title}</h4>
                    </a>
                </article>
            `).join('');
            
            relatedPostsContainer.innerHTML = `
                <h3>Related Articles</h3>
                ${postsHtml}
            `;
        } catch (error) {
            console.error('Error loading related posts:', error);
            relatedPostsContainer.innerHTML = '<h3>Related Articles</h3><p>Could not load related articles.</p>';
        }
    },
    
    updatePageTitle() {
        if (this.post) {
            document.title = `${this.post.title} - NewsHub`;
        }
    },
    
    formatContent(content) {
        if (!content) return '<p>No content available.</p>';
        
        const paragraphs = content.split('\n\n').filter(p => p.trim());
        
        return paragraphs.map(para => {
            if (para.startsWith('# ')) {
                return `<h2>${para.substring(2)}</h2>`;
            }
            if (para.startsWith('## ')) {
                return `<h3>${para.substring(3)}</h3>`;
            }
            if (para.startsWith('> ')) {
                return `<blockquote>${para.substring(2)}</blockquote>`;
            }
            return `<p>${para}</p>`;
        }).join('');
    },
    
    estimateReadTime(content) {
        if (!content) return 1;
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    },
    
    showError(message) {
        console.error('PostPage Error:', message);
        
        const articleTitle = document.getElementById('articleTitle');
        const articleBody = document.getElementById('articleBody');
        
        if (articleTitle) {
            articleTitle.textContent = 'Error';
        }
        
        if (articleBody) {
            articleBody.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 40px 20px;">
                    <h2>⚠️ ${message}</h2>
                    <p>The article you're looking for doesn't exist or has been removed.</p>
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

// ========================================
// Social Share Functions
// ========================================

function shareArticle(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    
    let shareUrl = '';
    
    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const btn = document.querySelector('.share-btn.copy');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span>✓</span> Copied!';
            
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 2000);
        }
    });
}

// ========================================
// Initialize
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('PostPage starting...');
    PostPage.init();
});
