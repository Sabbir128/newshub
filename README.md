NewsHub - Static News Website with Admin Panel

A modern, fast, and fully-featured news website that runs on GitHub Pages with a custom admin panel for content management. No server required, no database needed - everything is powered by JSON files and the GitHub API.

![NewsHub](https://img.shields.io/badge/NewsHub-Static%20News%20Site-blue)
![GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

✨ Features

Website Features
- 📱 Responsive Design - Works perfectly on desktop, tablet, and mobile
- 🌓 Dark/Light Mode - Automatic theme switching with user preference
- 🔍 Search - JavaScript-based search functionality
- 📂 Categories - Organized news by topics
- ⭐ Featured Posts - Highlight important stories
- 📈 Trending Section - Most popular articles
- 🔗 Social Sharing - Share articles on social media
- ⚡ Fast Loading - Static site = lightning fast performance

Admin Panel Features
- 🔐 Secure Login - Token-based authentication
- 📝 Create Posts - Rich text editor with Markdown support
- ✏️ Edit Posts - Update existing content
- 🗑️ Delete Posts - Remove unwanted articles
- 🖼️ Image Upload - Upload images directly to GitHub
- 🏷️ Categories - Assign posts to categories
- 📊 Dashboard - View site statistics
- 🚀 One-Click Publish - Changes go live instantly

---

🚀 Quick Start

1. Fork/Clone This Repository

```bash
git clone https://github.com/yourusername/news-site.git
cd news-site
```

2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click Settings → Pages
3. Under "Source", select Deploy from a branch
4. Select the main branch and /(root) folder
5. Click Save

Your site will be live at: `https://yourusername.github.io/news-site`

3. Set Up Admin Access

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click Generate new token (classic)
3. Give it a name like "NewsHub Admin"
4. Select the `repo` scope (full control of private repositories)
5. Click Generate token
6. Copy the token (you won't see it again!)

4. Access the Admin Panel

1. Go to `https://yourusername.github.io/news-site/admin/`
2. Enter your:
   - GitHub Token (from step 3)
   - Repository Owner (your GitHub username)
   - Repository Name (e.g., `news-site`)
3. Click Sign In

---

📁 Project Structure

```
/
├── index.html              # Homepage
├── post.html               # Single article page
├── category.html           # Category filter page
├── README.md               # This file
│
├── /admin/
│   ├── index.html          # Admin login page
│   ├── dashboard.html      # Admin dashboard
│   ├── post-editor.html    # Create/Edit posts
│   ├── admin.css           # Admin styles
│   └── admin.js            # Admin functionality
│
├── /data/
│   ├── posts.json          # All news articles
│   ├── categories.json     # Category definitions
│   └── site.json           # Site settings
│
├── /assets/
│   ├── /css/
│   │   └── style.css       # Main stylesheet
│   ├── /js/
│   │   ├── main.js         # Frontend functionality
│   │   ├── fetch.js        # Data loading
│   │   ├── post.js         # Article page logic
│   │   └── category.js     # Category page logic
│   └── /images/            # Uploaded images
│
└── /automation/
    └── github.js           # GitHub API automation
```

---

📝 Creating Content

Via Admin Panel (Recommended)

1. Log in to the admin panel
2. Click "New Post" or go to Dashboard → "Create New Post"
3. Fill in the details:
   - Title - Article headline
   - Excerpt - Short summary (appears in previews)
   - Content - Full article text (supports Markdown)
   - Featured Image - URL to the main image
   - Category - Select from dropdown
   - Author - Your name
   - Publish Date - When to publish
4. Click "Publish Post"
5. Wait 1-2 minutes for GitHub Pages to rebuild
6. Your article is live! 🎉

Manual Editing (Advanced)

You can also edit `data/posts.json` directly:

```json
{
  "posts": [
    {
      "id": 1,
      "title": "Your Article Title",
      "slug": "your-article-slug",
      "excerpt": "Brief summary...",
      "content": "Full article content...",
      "category": "technology",
      "author": "Your Name",
      "authorImage": "https://i.pravatar.cc/150?u=you",
      "date": "2025-01-15",
      "image": "https://example.com/image.jpg",
      "featured": true,
      "views": 0,
      "tags": ["tech", "news"]
    }
  ],
  "lastUpdated": "2025-01-15T10:30:00Z"
}
```

---

🎨 Customization

Site Settings

Edit `data/site.json` to customize:

```json
{
  "name": "Your Site Name",
  "tagline": "Your tagline",
  "description": "Site description for SEO",
  "logo": "🚀",
  "social": {
    "twitter": "https://twitter.com/yourhandle",
    "facebook": "https://facebook.com/yourpage"
  },
  "features": {
    "darkMode": true,
    "search": true,
    "socialShare": true
  }
}
```

Categories

Edit `data/categories.json` to add/modify categories:

```json
{
  "categories": [
    {
      "id": 1,
      "name": "Technology",
      "slug": "technology",
      "description": "Tech news and updates",
      "color": "#2563eb",
      "icon": "💻"
    }
  ]
}
```

Styling

Edit `assets/css/style.css` to change the look and feel.

---

🔧 Advanced Configuration

Custom Domain

1. Add a `CNAME` file to your repository root with your domain
2. Configure DNS settings with your provider
3. Enable HTTPS in GitHub Pages settings

Analytics

Add Google Analytics or other tracking by editing `data/site.json`:

```json
{
  "analytics": {
    "enabled": true,
    "provider": "google",
    "trackingId": "UA-XXXXXXXX-X"
  }
}
```

Then add the tracking code to your HTML files.

---

🛠️ Development

Local Testing

Since this is a static site, you can run it locally with any static server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (npx serve)
npx serve .

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000`

Making Changes

1. Edit files locally
2. Test your changes
3. Commit and push to GitHub
4. GitHub Pages will automatically rebuild

---

🔐 Security Notes

- Never commit your GitHub token to the repository
- The admin panel stores tokens in browser storage (localStorage/sessionStorage)
- Use a token with minimal required permissions (`repo` scope)
- Consider using GitHub's fine-grained personal access tokens for better security
- Regularly rotate your tokens

---

🐛 Troubleshooting

Site Not Loading
- Check that GitHub Pages is enabled in repository settings
- Ensure the source branch is correct (usually `main`)
- Wait 2-3 minutes after pushing changes

Admin Login Fails
- Verify your token has the `repo` scope
- Check that repository owner and name are correct
- Ensure the repository exists and is accessible

Changes Not Appearing
- GitHub Pages takes 1-2 minutes to rebuild
- Clear your browser cache
- Check browser console for errors

Images Not Loading
- Use direct image URLs (not relative paths)
- Ensure images are uploaded to the repository
- Check that image URLs are accessible

---

📚 API Reference

GitHub Automation Module

```javascript
// Initialize
const automation = new GitHubAutomation({
    token: 'your-github-token',
    owner: 'yourusername',
    repo: 'news-site'
});

// Add a post
await automation.addPost({
    title: 'New Article',
    excerpt: 'Summary...',
    content: 'Full content...',
    category: 'technology',
    author: 'Your Name',
    image: 'https://example.com/image.jpg'
});

// Update a post
await automation.updatePost('article-slug', {
    title: 'Updated Title'
});

// Delete a post
await automation.deletePost('article-slug');

// Upload image
const result = await automation.uploadImage(file);
console.log(result.url); // Image URL
```

---

🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

🙏 Acknowledgments

- [GitHub Pages](https://pages.github.com/) for free hosting
- [GitHub API](https://docs.github.com/en/rest) for powering the admin panel
- [Inter Font](https://rsms.me/inter/) for beautiful typography
- [Unsplash](https://unsplash.com/) for sample images

---

📞 Support

If you have any questions or need help:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Open an [Issue](https://github.com/yourusername/news-site/issues)
3. Contact: your-email@example.com

---

Happy Publishing! 🚀
