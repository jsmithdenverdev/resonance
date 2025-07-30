# Resonance 🎵

A beautiful web application that visualizes your Spotify listening statistics and top artists. Built with React, TypeScript, and Vite.

## ✨ Features

- 🎨 Modern, Spotify-inspired dark theme
- 📊 View your top 50 artists across different time periods
- 🔒 Secure OAuth2 PKCE authentication
- 📱 Fully responsive design
- ⚡ Fast performance with Vite
- 🛡️ Security-first approach with CSP headers

## 🚀 Quick Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=YOUR_GITHUB_REPO_URL)

### Prerequisites

1. **Spotify Developer Account**: Create an app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. **Git Repository**: Push this code to GitHub, GitLab, or Bitbucket

### Deployment Steps

1. **Fork/Clone** this repository to your Git provider
2. **Connect to Netlify**:
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Select your repository
3. **Configure Build Settings** (auto-detected from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Set Environment Variables** in Netlify dashboard:
   ```
   VITE_SPOTIFY_CLIENT_ID=your_client_id_here
   VITE_SPOTIFY_REDIRECT_URI=https://your-site-name.netlify.app/callback
   ```
5. **Update Spotify App Settings**:
   - Add your Netlify URL to "Redirect URIs": `https://your-site-name.netlify.app/callback`
6. **Deploy**: Netlify will automatically build and deploy your site

## 🛠️ Local Development

### Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd resonance
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Spotify app credentials:
   ```env
   VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
   VITE_SPOTIFY_REDIRECT_URI=https://localhost:5173/callback
   ```

4. **Configure Spotify App**:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Add `https://localhost:5173/callback` to your app's Redirect URIs

5. **Start development server**:
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run netlify-build` - Lint and build (used by Netlify)

## 🔧 Configuration

### Spotify App Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app or use existing one
3. Set the following **Redirect URIs**:
   - Production: `https://your-site-name.netlify.app/callback`
   - Development: `https://localhost:5173/callback`
4. Copy your **Client ID** for environment variables

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------||
| `VITE_SPOTIFY_CLIENT_ID` | Your Spotify app's Client ID | `abc123def456` |
| `VITE_SPOTIFY_REDIRECT_URI` | OAuth callback URL | `https://your-site.netlify.app/callback` |

## 🛡️ Security Features

- **OAuth2 PKCE Flow**: Secure authentication without client secrets
- **Content Security Policy**: Protection against XSS attacks
- **Input Validation**: All user inputs are sanitized
- **Token Expiration**: Automatic token refresh handling
- **Secure Headers**: HSTS, CSP, and other security headers via Netlify

## 📁 Project Structure

```
resonance/
├── src/
│   ├── components/          # React components
│   ├── services/           # API and auth services
│   ├── App.tsx            # Main app component
│   └── main.tsx           # App entry point
├── public/                # Static assets
├── netlify.toml          # Netlify configuration
├── .env.example          # Environment variables template
└── README.md            # This file
```

## 🚀 Performance

- ⚡ Vite for lightning-fast builds
- 🗜️ Optimized bundle size
- 📦 Code splitting
- 🖼️ Lazy image loading
- 💾 Efficient caching headers

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**: Make sure your Netlify URL is added to Spotify app settings
2. **Build fails**: Check that all environment variables are set in Netlify
3. **Blank page**: Check browser console for CSP errors

### Support

- Check [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api/)
- Review [Netlify Deployment Docs](https://docs.netlify.com/site-deploys/create-deploys/)

## 📝 License

MIT License - feel free to use this project for your own purposes!

---

Built with ❤️ using React, TypeScript, and the Spotify Web API
