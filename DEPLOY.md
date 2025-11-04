# Netlify Deployment Guide for PHIX-IT

## Quick Deploy

### Option 1: Git Integration (Recommended)
1. Go to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub account
4. Select the `phix-it` repository
5. Netlify will auto-detect settings from `netlify.toml`
6. Add environment variable: `GEMINI_API_KEY` = your actual API key
7. Click "Deploy site"

### Option 2: Manual Deploy
1. Run `npm run build` locally
2. Drag the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop)

## Environment Variables
In your Netlify dashboard:
- Go to Site settings > Environment variables
- Add: `GEMINI_API_KEY` with your Gemini API key value

## Custom Domain (Optional)
- Go to Site settings > Domain management
- Add custom domain if you have one

## Build Settings
The `netlify.toml` file configures:
- ✅ Build command: `npm run build`
- ✅ Publish directory: `dist`
- ✅ SPA redirects for React Router
- ✅ Security headers
- ✅ Asset caching

## Troubleshooting
- **CSS 404 Error**: Fixed by importing CSS in `index.tsx`
- **API Key Issues**: Make sure to set `GEMINI_API_KEY` in Netlify environment variables
- **Build Failures**: Check Node.js version is 16+ in build logs