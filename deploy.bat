@echo off
chcp 65001 >nul
echo 🚀 Starting AWTAD Website Deployment...

REM Check if .env.production exists
if not exist .env.production (
    echo ❌ .env.production file not found!
    echo Please create .env.production with your Supabase credentials:
    echo NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
    echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
    echo NODE_ENV=production
    echo NEXT_TELEMETRY_DISABLED=1
    pause
    exit /b 1
)

echo 📋 Pre-deployment checks...

REM Clean previous builds
echo 🧹 Cleaning previous builds...
call npm run clean

REM Type checking
echo 🔍 Running TypeScript checks...
call npm run type-check
if %errorlevel% neq 0 (
    echo ❌ TypeScript check failed!
    pause
    exit /b 1
)

REM Production build
echo 🏗️ Building for production...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo ✅ Build successful!

REM Deployment options
echo 🌐 Choose deployment platform:
echo 1) Vercel (Recommended)
echo 2) Netlify
echo 3) AWS Amplify
echo 4) Manual deployment
echo 5) Exit

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo 🚀 Deploying to Vercel...
    call npm install -g vercel
    call vercel --prod
) else if "%choice%"=="2" (
    echo 🚀 Deploying to Netlify...
    echo 📋 Manual steps for Netlify:
    echo 1. Go to netlify.com and create a new site
    echo 2. Drag and drop the .next folder
    echo 3. Set build command: npm run build
    echo 4. Set publish directory: .next
) else if "%choice%"=="3" (
    echo 🚀 Deploying to AWS Amplify...
    echo 📋 Manual steps for AWS Amplify:
    echo 1. Connect your GitHub repository
    echo 2. Set build command: npm run build
    echo 3. Set start command: npm run start
    echo 4. Deploy
) else if "%choice%"=="4" (
    echo 📋 Manual deployment instructions:
    echo 1. Upload your project to your hosting platform
    echo 2. Set environment variables:
    echo    - NEXT_PUBLIC_SUPABASE_URL
    echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY
    echo    - NODE_ENV=production
    echo 3. Run: npm run build
    echo 4. Start with: npm run start
) else if "%choice%"=="5" (
    echo 👋 Deployment cancelled
    exit /b 0
) else (
    echo ❌ Invalid choice
    pause
    exit /b 1
)

echo 🎉 Deployment process completed!
echo 📋 Post-deployment checklist:
echo ✅ Test all public pages
echo ✅ Verify admin functionality
echo ✅ Check mobile responsiveness
echo ✅ Monitor performance metrics
echo ✅ Set up error tracking

echo 🚀 Your AWTAD website is now live!
pause





