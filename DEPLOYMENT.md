# Cloud-Only Deployment Guide

This project is designed to work entirely in the cloud - no local development environment needed!

## 🚀 Quick Setup (5 minutes)

### Step 1: Create GitHub Repository
1. Go to [GitHub.com](https://github.com) and create a new repository
2. Name it `own-recovery` (or whatever you prefer)
3. Make it **public** (required for free Vercel deployment)
4. **Don't** initialize with README (we already have files)

### Step 2: Push Your Code
```bash
# In your project folder (C:\CursorApps\OwnRecovery)
git init
git add .
git commit -m "Initial commit - Own Recovery app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/own-recovery.git
git push -u origin main
```

### Step 3: Connect to Vercel
1. Go to [Vercel.com](https://vercel.com) and sign up with GitHub
2. Click "New Project"
3. Import your `own-recovery` repository
4. Vercel will auto-detect it's a Next.js project

### Step 4: Add Environment Variables in Vercel
In your Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXTAUTH_SECRET=your_random_secret_string
NEXTAUTH_URL=https://your-project.vercel.app
CRISIS_HOTLINE_NUMBER=988
CRISIS_TEXT_LINE=741741
```

### Step 5: Deploy!
- Vercel will automatically deploy your app
- Your app will be live at `https://your-project.vercel.app`

## 🔄 Development Workflow

### Making Changes:
1. **Edit files in Cursor** (like you're doing now)
2. **Commit and push to GitHub**:
   ```bash
   git add .
   git commit -m "Your change description"
   git push
   ```
3. **Vercel automatically deploys** the changes
4. **View your live app** at the Vercel URL

### Working from Multiple PCs:
- Just clone the repository on any PC
- Make changes and push to GitHub
- Vercel handles the deployment automatically

## 🛠️ No Local Development Needed

- ✅ **No Node.js installation required**
- ✅ **No npm install needed**
- ✅ **No local server running**
- ✅ **Work from any PC with internet**
- ✅ **Automatic deployments on every push**

## 📱 Your App Will Be Live At:
`https://your-project-name.vercel.app`

## 🔧 Getting Your Supabase Keys

1. Go to your Supabase project dashboard
2. Settings → API
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## 🎯 Next Steps After Deployment

Once your app is live, we'll build:
1. Authentication system
2. User dashboards
3. Mood tracking
4. AI features

**Ready to deploy? Let's get your app live!** 🚀
