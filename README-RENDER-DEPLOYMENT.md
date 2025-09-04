# Render Deployment Guide for Event Center

This guide will help you deploy your Event Center application to Render.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. Convex deployment set up and running

## Deployment Steps

### 1. Prepare Environment Variables

Before deploying, you'll need to set up the following environment variables in Render:

- `CONVEX_DEPLOYMENT`: Your Convex deployment URL
- `VITE_CONVEX_URL`: Your Convex API URL (usually https://your-deployment.convex.cloud)
- `NODE_ENV`: Set to "production"

### 2. Deploy to Render

#### Option A: Using render.yaml (Recommended)
1. Push your code to your Git repository
2. In Render dashboard, click "New" → "Blueprint"
3. Connect your repository
4. Render will automatically detect the `render.yaml` file and configure your service

#### Option B: Manual Setup
1. In Render dashboard, click "New" → "Web Service"
2. Connect your repository
3. Configure the following settings:
   - **Name**: event-center (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: 18 (or latest LTS)

### 3. Configure Environment Variables

In your Render service settings:
1. Go to "Environment" tab
2. Add the required environment variables listed above
3. Save changes

### 4. Deploy

1. Click "Deploy Latest Commit" or push new changes to trigger automatic deployment
2. Monitor the build logs for any issues
3. Once deployed, your app will be available at your Render URL

## Important Notes

- The `_redirects` file in the `public` folder handles client-side routing for your React SPA
- The build process includes TypeScript compilation and Vite bundling
- Make sure your Convex backend is properly configured and accessible
- The app will run on the port specified by Render's `$PORT` environment variable

## Troubleshooting

### Build Failures
- Check that all dependencies are listed in `package.json`
- Ensure TypeScript compilation passes locally
- Verify environment variables are set correctly

### Runtime Issues
- Check the service logs in Render dashboard
- Verify Convex connection is working
- Ensure all required environment variables are set

### Performance
- The app includes optimized build settings for production
- Static assets are served efficiently through Vite's build process
- Consider enabling Render's CDN for better global performance

## Support

If you encounter issues:
1. Check Render's documentation: https://render.com/docs
2. Review build and runtime logs in Render dashboard
3. Verify your Convex setup is working correctly
