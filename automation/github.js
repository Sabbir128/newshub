/**
 * NewsHub - GitHub Automation Module
 * Handles automated GitHub operations for content management
 * 
 * This module provides helper functions for:
 * - Automated JSON updates
 * - Image uploads
 * - Content synchronization
 * - Webhook handling (for future extensions)
 */

// ========================================
// GitHub Automation Class
// ========================================

class GitHubAutomation {
    constructor(config) {
        this.token = config.token;
        this.owner = config.owner;
        this.repo = config.repo;
        this.branch = config.branch || 'main';
        this.baseURL = 'https://api.github.com';
        this.headers = {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
    }
    
    /**
     * Initialize and validate configuration
     */
    async initialize() {
        try {
            // Test connection
            const response = await fetch(
                `${this.baseURL}/repos/${this.owner}/${this.repo}`,
                { headers: this.headers }
            );
            
            if (!response.ok) {
                throw new Error(`Failed to connect: ${response.status} ${response.statusText}`);
            }
            
            const repoInfo = await response.json();
            
            console.log('✅ GitHub Automation initialized');
            console.log(`📁 Repository: ${repoInfo.full_name}`);
            console.log(`🌿 Default branch: ${repoInfo.default_branch}`);
            
            return {
                success: true,
                repo: repoInfo
            };
        } catch (error) {
            console.error('❌ Initialization failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Update posts.json with new content
     */
    async updatePosts(posts, commitMessage = 'Update posts') {
        const path = 'data/posts.json';
        const content = {
            posts: posts,
            lastUpdated: new Date().toISOString()
        };
        
        return this.updateFile(path, content, commitMessage);
    }
    
    /**
     * Add a single post
     */
    async addPost(post, commitMessage = null) {
        // Get current posts
        const currentData = await this.getFile('data/posts.json');
        const posts = currentData.posts || [];
        
        // Generate ID and metadata if not provided
        const newPost = {
            id: post.id || Date.now(),
            slug: post.slug || this.generateSlug(post.title),
            date: post.date || new Date().toISOString().split('T')[0],
            views: 0,
            ...post
        };
        
        // Add to beginning of array
        posts.unshift(newPost);
        
        // Save
        const message = commitMessage || `Add post: ${newPost.title}`;
        await this.updatePosts(posts, message);
        
        return newPost;
    }
    
    /**
     * Update a single post
     */
    async updatePost(slug, updates, commitMessage = null) {
        // Get current posts
        const currentData = await this.getFile('data/posts.json');
        const posts = currentData.posts || [];
        
        // Find post
        const index = posts.findIndex(p => p.slug === slug);
        if (index === -1) {
            throw new Error(`Post with slug "${slug}" not found`);
        }
        
        // Update post
        posts[index] = {
            ...posts[index],
            ...updates,
            slug: updates.title ? this.generateSlug(updates.title) : posts[index].slug
        };
        
        // Save
        const message = commitMessage || `Update post: ${posts[index].title}`;
        await this.updatePosts(posts, message);
        
        return posts[index];
    }
    
    /**
     * Delete a post
     */
    async deletePost(slug, commitMessage = null) {
        // Get current posts
        const currentData = await this.getFile('data/posts.json');
        const posts = currentData.posts || [];
        
        // Find post
        const post = posts.find(p => p.slug === slug);
        if (!post) {
            throw new Error(`Post with slug "${slug}" not found`);
        }
        
        // Remove post
        const filteredPosts = posts.filter(p => p.slug !== slug);
        
        // Save
        const message = commitMessage || `Delete post: ${post.title}`;
        await this.updatePosts(filteredPosts, message);
        
        return true;
    }
    
    /**
     * Update categories
     */
    async updateCategories(categories, commitMessage = 'Update categories') {
        const path = 'data/categories.json';
        const content = {
            categories: categories,
            lastUpdated: new Date().toISOString()
        };
        
        return this.updateFile(path, content, commitMessage);
    }
    
    /**
     * Update site settings
     */
    async updateSiteSettings(settings, commitMessage = 'Update site settings') {
        const path = 'data/site.json';
        const content = {
            ...settings,
            lastUpdated: new Date().toISOString()
        };
        
        return this.updateFile(path, content, commitMessage);
    }
    
    /**
     * Upload image file
     */
    async uploadImage(file, folder = 'assets/images') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    // Get base64 content
                    const base64Content = e.target.result.split(',')[1];
                    
                    // Generate filename
                    const timestamp = Date.now();
                    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '-').toLowerCase();
                    const filename = `${timestamp}-${safeName}`;
                    const path = `${folder}/${filename}`;
                    
                    // Upload
                    await this.createOrUpdateFile(
                        path,
                        base64Content,
                        `Upload image: ${filename}`,
                        true // isBase64 = true
                    );
                    
                    // Return raw URL
                    const rawUrl = `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}/${path}`;
                    
                    resolve({
                        success: true,
                        url: rawUrl,
                        path: path,
                        filename: filename
                    });
                    
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }
    
    /**
     * Upload multiple images
     */
    async uploadImages(files, folder = 'assets/images', onProgress = null) {
        const results = [];
        
        for (let i = 0; i < files.length; i++) {
            try {
                const result = await this.uploadImage(files[i], folder);
                results.push(result);
                
                if (onProgress) {
                    onProgress(i + 1, files.length, result);
                }
            } catch (error) {
                console.error(`Failed to upload ${files[i].name}:`, error);
                results.push({
                    success: false,
                    error: error.message,
                    filename: files[i].name
                });
            }
        }
        
        return results;
    }
    
    /**
     * Sync local data with GitHub
     */
    async syncData() {
        try {
            const [posts, categories, site] = await Promise.all([
                this.getFile('data/posts.json'),
                this.getFile('data/categories.json'),
                this.getFile('data/site.json')
            ]);
            
            return {
                success: true,
                data: {
                    posts: posts.posts || [],
                    categories: categories.categories || [],
                    site: site
                },
                lastSynced: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get file contents
     */
    async getFile(path) {
        try {
            const response = await fetch(
                `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`,
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
     * Get file SHA
     */
    async getFileSHA(path) {
        try {
            const response = await fetch(
                `${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`,
                { headers: this.headers }
            );
            
            if (!response.ok) {
                if (response.status === 404) return null;
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
     * Create or update file
     */
    async createOrUpdateFile(path, content, message, isBase64 = false) {
        const sha = await this.getFileSHA(path);
        
        const body = {
            message: message,
            content: isBase64 ? content : btoa(JSON.stringify(content, null, 2)),
            branch: this.branch
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
    }
    
    /**
     * Update file (alias for createOrUpdateFile)
     */
    async updateFile(path, content, message) {
        return this.createOrUpdateFile(path, content, message, false);
    }
    
    /**
     * Generate slug from string
     */
    generateSlug(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 100);
    }
    
    /**
     * Trigger GitHub Pages rebuild
     * Note: GitHub Pages automatically rebuilds on push
     */
    async triggerRebuild() {
        // GitHub Pages rebuilds automatically when content is pushed
        // This method is for documentation purposes
        console.log('ℹ️ GitHub Pages will rebuild automatically within 1-2 minutes');
        return {
            success: true,
            message: 'GitHub Pages will rebuild automatically'
        };
    }
}

// ========================================
// Batch Operations
// ========================================

const BatchOperations = {
    /**
     * Import multiple posts from JSON
     */
    async importPosts(automation, postsData) {
        const results = {
            success: [],
            failed: []
        };
        
        for (const postData of postsData) {
            try {
                const post = await automation.addPost(postData);
                results.success.push(post);
            } catch (error) {
                results.failed.push({
                    data: postData,
                    error: error.message
                });
            }
        }
        
        return results;
    },
    
    /**
     * Bulk update posts
     */
    async bulkUpdate(automation, updates) {
        const currentData = await automation.getFile('data/posts.json');
        const posts = currentData.posts || [];
        
        let updatedCount = 0;
        
        for (const update of updates) {
            const index = posts.findIndex(p => p.slug === update.slug);
            if (index !== -1) {
                posts[index] = { ...posts[index], ...update.data };
                updatedCount++;
            }
        }
        
        await automation.updatePosts(posts, `Bulk update ${updatedCount} posts`);
        
        return {
            updated: updatedCount,
            total: updates.length
        };
    },
    
    /**
     * Bulk delete posts
     */
    async bulkDelete(automation, slugs) {
        const currentData = await automation.getFile('data/posts.json');
        const posts = currentData.posts || [];
        
        const initialCount = posts.length;
        const filteredPosts = posts.filter(p => !slugs.includes(p.slug));
        const deletedCount = initialCount - filteredPosts.length;
        
        await automation.updatePosts(filteredPosts, `Delete ${deletedCount} posts`);
        
        return {
            deleted: deletedCount,
            requested: slugs.length
        };
    }
};

// ========================================
// Utility Functions
// ========================================

const GitHubUtils = {
    /**
     * Validate GitHub token
     */
    async validateToken(token) {
        try {
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!response.ok) {
                return { valid: false, error: 'Invalid token' };
            }
            
            const user = await response.json();
            return { valid: true, user };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    },
    
    /**
     * Check if repository exists
     */
    async checkRepo(owner, repo, token) {
        try {
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!response.ok) {
                return { exists: false, error: response.statusText };
            }
            
            const data = await response.json();
            return { exists: true, repo: data };
        } catch (error) {
            return { exists: false, error: error.message };
        }
    },
    
    /**
     * Create repository (if needed)
     */
    async createRepo(name, token, description = '', isPrivate = false) {
        try {
            const response = await fetch('https://api.github.com/user/repos', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    description,
                    private: isPrivate,
                    auto_init: true
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating repository:', error);
            throw error;
        }
    }
};

// ========================================
// Export
// ========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GitHubAutomation,
        BatchOperations,
        GitHubUtils
    };
}
