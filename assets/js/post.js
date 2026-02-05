/**
 * NewsHub - Single Post Page Module
 * Handles rendering of individual article pages
 */

const PostPage = {
    post: null,
    
    async init() {
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');
        
        if (!slug) {
            this.showError('Article not found');
            return;
        }
        
        this.post = await DataService.getPostBySlug(slug);
        
        if (!this.post) {
            this.showError('Article not found');
            return;
        }
        
        this.renderArticle();
        this.renderRelatedPosts();
        this.updatePageTitle();
    },
    
    renderArticle() {
        const { post } = this;
        
        // Article meta
        const articleMeta = document.getElementById('articleMeta');
        if (articleMeta) {
            articleMeta.innerHTML = `
                <span class="article-category">${this.capitalize(post.category)}</span>
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
            articleTitle.textContent = post.title;
        }
        
        // Article author
        const articleAuthor = document.getElementById('articleAuthor');
        if (articleAuthor) {
            articleAuthor.innerHTML = `
                <img src="${post.authorImage}" alt="${post.author}" class="article-author-image">
                <div class="article-author-info">
                    <span class="article-author-name">${post.author}</span>
                    <span class="article-read-time">${this.estimateReadTime(post.content)} min read</span>
                </div>
            `;
        }
        
        // Featured image
        const articleFeaturedImage = document.getElementById('articleFeaturedImage');
        if (articleFeaturedImage) {
            articleFeaturedImage.innerHTML = `
                <img src="${post.image}" alt="${post.title}">
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
        
        const relatedPosts = await DataService.getRelatedPosts(
            this.post.slug, 
            this.post.category, 
            4
        );
        
        if (relatedPosts.length === 0) {
            relatedPostsContainer.style.display = 'none';
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
    },
    
    updatePageTitle() {
        if (this.post) {
            document.title = `${this.post.title} - NewsHub`;
        }
    },
    
    formatContent(content) {
        // Convert newlines to paragraphs
        const paragraphs = content.split('\n\n').filter(p => p.trim());
        
        return paragraphs.map(para => {
            // Check if it's a heading (starts with #)
            if (para.startsWith('# ')) {
                return `<h2>${para.substring(2)}</h2>`;
            }
            if (para.startsWith('## ')) {
                return `<h3>${para.substring(3)}</h3>`;
            }
            
            // Check if it's a blockquote (starts with >)
            if (para.startsWith('> ')) {
                return `<blockquote>${para.substring(2)}</blockquote>`;
            }
            
            // Regular paragraph
            return `<p>${para}</p>`;
        }).join('');
    },
    
    estimateReadTime(content) {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    },
    
    showError(message) {
        const articleBody = document.getElementById('articleBody');
        if (articleBody) {
            articleBody.innerHTML = `
                <div class="error-message">
                    <h2>${message}</h2>
                    <p>The article you're looking for doesn't exist or has been removed.</p>
                    <a href="index.html" class="btn btn-primary">Go Home</a>
                </div>
            `;
        }
    },
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
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
        // Show feedback
        const btn = document.querySelector('.share-btn.copy');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span>✓</span> Copied!';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    });
}

// ========================================
// Initialize
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    PostPage.init();
});
