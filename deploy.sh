#!/bin/bash

# 🚀 AWTAD Website Deployment Script
# This script automates the deployment process

echo "🚀 Starting AWTAD Website Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ .env.production file not found!${NC}"
    echo -e "${YELLOW}Please create .env.production with your Supabase credentials:${NC}"
    echo "NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here"
    echo "NODE_ENV=production"
    echo "NEXT_TELEMETRY_DISABLED=1"
    exit 1
fi

echo -e "${BLUE}📋 Pre-deployment checks...${NC}"

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
npm run clean

# Type checking
echo -e "${YELLOW}🔍 Running TypeScript checks...${NC}"
npm run type-check
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ TypeScript check failed!${NC}"
    exit 1
fi

# Production build
echo -e "${YELLOW}🏗️ Building for production...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"

# Deployment options
echo -e "${BLUE}🌐 Choose deployment platform:${NC}"
echo "1) Vercel (Recommended)"
echo "2) Netlify"
echo "3) AWS Amplify"
echo "4) Manual deployment"
echo "5) Exit"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo -e "${YELLOW}🚀 Deploying to Vercel...${NC}"
        if ! command -v vercel &> /dev/null; then
            echo -e "${YELLOW}📦 Installing Vercel CLI...${NC}"
            npm install -g vercel
        fi
        vercel --prod
        ;;
    2)
        echo -e "${YELLOW}🚀 Deploying to Netlify...${NC}"
        echo -e "${BLUE}📋 Manual steps for Netlify:${NC}"
        echo "1. Go to netlify.com and create a new site"
        echo "2. Drag and drop the .next folder"
        echo "3. Set build command: npm run build"
        echo "4. Set publish directory: .next"
        ;;
    3)
        echo -e "${YELLOW}🚀 Deploying to AWS Amplify...${NC}"
        echo -e "${BLUE}📋 Manual steps for AWS Amplify:${NC}"
        echo "1. Connect your GitHub repository"
        echo "2. Set build command: npm run build"
        echo "3. Set start command: npm run start"
        echo "4. Deploy"
        ;;
    4)
        echo -e "${YELLOW}📋 Manual deployment instructions:${NC}"
        echo "1. Upload your project to your hosting platform"
        echo "2. Set environment variables:"
        echo "   - NEXT_PUBLIC_SUPABASE_URL"
        echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo "   - NODE_ENV=production"
        echo "3. Run: npm run build"
        echo "4. Start with: npm run start"
        ;;
    5)
        echo -e "${BLUE}👋 Deployment cancelled${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Deployment process completed!${NC}"
echo -e "${BLUE}📋 Post-deployment checklist:${NC}"
echo "✅ Test all public pages"
echo "✅ Verify admin functionality"
echo "✅ Check mobile responsiveness"
echo "✅ Monitor performance metrics"
echo "✅ Set up error tracking"

echo -e "${GREEN}🚀 Your AWTAD website is now live!${NC}"
