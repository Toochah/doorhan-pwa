@echo off
chcp 65001 >nul
title Deploy PWA to GitHub Pages

echo ========================================
echo  Doorhan PWA - Deploy to GitHub Pages
echo ========================================
echo.

cd /d %~dp0

REM Check Git
echo [1/4] Check Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git not found!
    echo Install: https://git-scm.com/download/win
    pause
    exit /b 1
)
echo OK - Git found

REM Init Git
echo.
echo [2/4] Init Git...
if not exist ".git" (
    git init
    echo OK - Git initialized
) else (
    echo OK - Git already initialized
)

REM Add files
echo.
echo [3/4] Add files...
git add .
git commit -m "Deploy PWA update"

REM Get remote
echo.
echo [4/4] Push to GitHub...
git remote -v | findstr "origin" >nul
if errorlevel 1 (
    echo.
    echo Enter your repository URL:
    echo Example: https://github.com/username/doorhan-inspection.git
    set /p REPO_URL="Repository URL: "
    git remote add origin %REPO_URL%
    git branch -M main
)

git push -u origin main

if errorlevel 1 (
    echo.
    echo ========================================
    echo  ERROR: Push failed
    echo ========================================
    echo.
    echo Possible reasons:
    echo 1. Wrong repository URL
    echo 2. No access to repository
    echo.
    echo Retry:
    echo   git push -u origin main
) else (
    echo.
    echo ========================================
    echo  SUCCESS! Deploy complete!
    echo ========================================
    echo.
    echo Your site will be available at:
    echo https://YOUR_USERNAME.github.io/doorhan-inspection/
    echo.
    echo GitHub Pages will update in 1-2 minutes.
)

echo.
pause
