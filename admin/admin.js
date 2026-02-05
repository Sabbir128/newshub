/**
 * NewsHub Admin - Core JavaScript Module
 * Handles GitHub API integration and UI utilities
 */

// ========================================
// GitHub API Class
// ========================================

class GitHubAPI {
    constructor(token, owner, repo) {
        this.token = token;
        this.owner = owner;
        this.repo = repo;
        this.baseURL = 'https://api.github.com';
        this.headers = {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
    }
    
    /**
     * Test API connection
     */
    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL}/repos/${this.owner}/${this.repo}`, {
                headers: this.headers
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid token');
                } else if (response.status === 404) {
                    throw new Error('Repository not found');
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            }
            
            return true;
        } catch (error) {
            console.error('Connection test failed:', error);
            throw error;
        }
    }
    
    /**
     * Get file contents
     */
    async getFile(path) {
        try {
            const response = await fetch(
                `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${path}`,
                { headers: this.headers }
            );
            
            if (!response.ok) {
                if (response.status === 404) {
                    // Return default structure for new files
                    if (path === 'data/posts.json') return { posts: [] };
                    if (path === 'data/categories.json') return { categories: [] };
                    if (path === 'data/site.json') return {};
                }
                throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Decode base64 content
            if (data.content) {
                const decoded = atob(data.content.replace(/\n/g, ''));
                return JSON.parse(decoded);
            }
            
            return data;
        } catch (error) {
            console.error(`Error fetching ${path}:`, error);
            throw error;
        }
    }
    
    /**
     * Get file SHA (needed for updates)
     */
    async getFileSHA(path) {
        try {
            const response = await fetch(
                `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${path}`,
                { headers: this.headers }
            );
            
            if (!response.ok) {
                if (response.status === 404) {
                    return null; // File doesn't exist yet
                }
                throw new Error(`Failed to get SHA: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.sha;
        } catch (error) {
            console.error(`Error getting SHA for ${path}:`, error);
            throw error;
        }
    }
    
    /**
     * Create or update a file
     */
    async updateFile(path, content, message) {
        try {
            const sha = await this.getFileSHA(path);
            
            const body = {
                message: message || `Update ${path}`,
                content: btoa(JSON.stringify(content, null, 2))
            };
            
            if (sha) {
                body.sha = sha;
            }
            
            const response = await fetch(
                `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${path}`,
                {
                    method: 'PUT',
                    headers: this.headers,
                    body: JSON.stringify(body)
                }
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to update ${path}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error updating ${path}:`, error);
            throw error;
        }
    }
    
    /**
     * Delete a file
     */
    async deleteFile(path, message) {
        try {
            const sha = await this.getFileSHA(path);
            
            if (!sha) {
                throw new Error('File does not exist');
            }
            
            const response = await fetch(
                `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${path}`,
                {
                    method: 'DELETE',
                    headers: this.headers,
                    body: JSON.stringify({
                        message: message || `Delete ${path}`,
                        sha: sha
                    })
                }
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to delete ${path}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error deleting ${path}:`, error);
            throw error;
        }
    }
    
    /**
     * Upload an image file
     */
    async uploadImage(filePath, base64Content, message) {
        try {
            const sha = await this.getFileSHA(filePath);
            
            const body = {
                message: message || `Upload image ${filePath}`,
                content: base64Content
            };
            
            if (sha) {
                body.sha = sha;
            }
            
            const response = await fetch(
                `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${filePath}`,
                {
                    method: 'PUT',
                    headers: this.headers,
                    body: JSON.stringify(body)
                }
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to upload ${filePath}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error uploading ${filePath}:`, error);
            throw error;
        }
    }
    
    /**
     * Get repository information
     */
    async getRepoInfo() {
        try {
            const response = await fetch(
                `${this.baseURL}/repos/${this.owner}/${this.repo}`,
                { headers: this.headers }
            );
            
            if (!response.ok) {
                throw new Error(`Failed to fetch repo info: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching repo info:', error);
            throw error;
        }
    }
}

// ========================================
// UI Utilities
// ========================================

const AdminUI = {
    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
        toast.innerHTML = `<span>${icon}</span> ${message}`;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    
    /**
     * Confirm dialog
     */
    confirm(message) {
        return new Promise(resolve => {
            const confirmed = window.confirm(message);
            resolve(confirmed);
        });
    },
    
    /**
     * Format date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },
    
    /**
     * Format number
     */
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    },
    
    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    /**
     * Generate slug from title
     */
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 100);
    },
    
    /**
     * Show loading state
     */
    showLoading(element, message = 'Loading...') {
        element.dataset.originalContent = element.innerHTML;
        element.innerHTML = `<span class="spinner"></span> ${message}`;
        element.disabled = true;
    },
    
    /**
     * Hide loading state
     */
    hideLoading(element) {
        if (element.dataset.originalContent) {
            element.innerHTML = element.dataset.originalContent;
            element.disabled = false;
        }
    }
};

// ========================================
// Authentication
// ========================================

function checkAuth() {
    const saved = localStorage.getItem('newshub_auth') || sessionStorage.getItem('newshub_auth');
    
    if (!saved) {
        return null;
    }
    
    try {
        return JSON.parse(saved);
    } catch (e) {
        console.error('Invalid auth data');
        return null;
    }
}

function logout() {
    localStorage.removeItem('newshub_auth');
    sessionStorage.removeItem('newshub_auth');
    window.location.href = 'index.html';
}

// ========================================
// Image Upload Helper
// ========================================

async function uploadImageToGitHub(file, github, folder = 'assets/images') {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                // Get base64 content (remove data URL prefix)
                const base64Content = e.target.result.split(',')[1];
                
                // Generate filename
                const timestamp = Date.now();
                const filename = `${timestamp}-${file.name.replace(/\s+/g, '-')}`;
                const filePath = `${folder}/${filename}`;
                
                // Upload to GitHub
                const result = await github.uploadImage(
                    filePath,
                    base64Content,
                    `Upload image: ${filename}`
                );
                
                // Return the raw URL
                const rawUrl = `https://raw.githubusercontent.com/${github.owner}/${github.repo}/main/${filePath}`;
                resolve(rawUrl);
                
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

// ========================================
// Post Management
// ========================================

const PostManager = {
    /**
     * Create a new post
     */
    async create(postData, github) {
        // Load existing posts
        const data = await github.getFile('data/posts.json');
        const posts = data.posts || [];
        
        // Generate ID and slug
        const id = Date.now();
        const slug = AdminUI.generateSlug(postData.title);
        
        // Create post object
        const newPost = {
            id,
            slug,
            ...postData,
            views: 0,
            date: postData.date || new Date().toISOString().split('T')[0]
        };
        
        // Add to posts array
        posts.unshift(newPost);
        
        // Save to GitHub
        await github.updateFile(
            'data/posts.json',
            {
                posts,
                lastUpdated: new Date().toISOString()
            },
            `Add new post: ${newPost.title}`
        );
        
        return newPost;
    },
    
    /**
     * Update an existing post
     */
    async update(slug, postData, github) {
        // Load existing posts
        const data = await github.getFile('data/posts.json');
        const posts = data.posts || [];
        
        // Find post index
        const index = posts.findIndex(p => p.slug === slug);
        if (index === -1) {
            throw new Error('Post not found');
        }
        
        // Update post
        posts[index] = {
            ...posts[index],
            ...postData,
            slug: AdminUI.generateSlug(postData.title)
        };
        
        // Save to GitHub
        await github.updateFile(
            'data/posts.json',
            {
                posts,
                lastUpdated: new Date().toISOString()
            },
            `Update post: ${postData.title}`
        );
        
        return posts[index];
    },
    
    /**
     * Delete a post
     */
    async delete(slug, github) {
        // Load existing posts
        const data = await github.getFile('data/posts.json');
        const posts = data.posts || [];
        
        // Find post
        const post = posts.find(p => p.slug === slug);
        if (!post) {
            throw new Error('Post not found');
        }
        
        // Remove from array
        const filteredPosts = posts.filter(p => p.slug !== slug);
        
        // Save to GitHub
        await github.updateFile(
            'data/posts.json',
            {
                posts: filteredPosts,
                lastUpdated: new Date().toISOString()
            },
            `Delete post: ${post.title}`
        );
        
        return true;
    },
    
    /**
     * Get all posts
     */
    async getAll(github) {
        const data = await github.getFile('data/posts.json');
        return data.posts || [];
    },
    
    /**
     * Get single post
     */
    async getBySlug(slug, github) {
        const posts = await this.getAll(github);
        return posts.find(p => p.slug === slug);
    }
};

// ========================================
// Category Management
// ========================================

const CategoryManager = {
    /**
     * Get all categories
     */
    async getAll(github) {
        const data = await github.getFile('data/categories.json');
        return data.categories || [];
    },
    
    /**
     * Add a new category
     */
    async create(categoryData, github) {
        const data = await github.getFile('data/categories.json');
        const categories = data.categories || [];
        
        const newCategory = {
            id: Date.now(),
            slug: AdminUI.generateSlug(categoryData.name),
            ...categoryData
        };
        
        categories.push(newCategory);
        
        await github.updateFile(
            'data/categories.json',
            {
                categories,
                lastUpdated: new Date().toISOString()
            },
            `Add category: ${newCategory.name}`
        );
        
        return newCategory;
    }
};

// ========================================
// Export for module usage
// ========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GitHubAPI,
        AdminUI,
        PostManager,
        CategoryManager,
        checkAuth,
        logout,
        uploadImageToGitHub
    };
}
