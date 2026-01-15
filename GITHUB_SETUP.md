# How to Create GitHub Repository

## Step 1: Create Repository on GitHub

1. Go to https://github.com and sign in (or create an account)
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in:
   - **Repository name**: `DiscordTTW` (or any name you want)
   - **Description**: "Discord bot built with TypeScript"
   - **Visibility**: Choose Public or Private
   - **DO NOT** check "Initialize with README" (we already have one)
   - **DO NOT** add .gitignore or license (we already have them)
5. Click **"Create repository"**

## Step 2: Copy the Repository URL

After creating, GitHub will show you commands. You'll see a URL like:
- `https://github.com/yourusername/DiscordTTW.git` (HTTPS)
- OR `git@github.com:yourusername/DiscordTTW.git` (SSH)

Copy the HTTPS URL - you'll need it in the next step.

## Step 3: Push Your Code

Run these commands in your terminal (I'll help you with this):

```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/DiscordTTW.git
git push -u origin main
```

Replace `yourusername/DiscordTTW` with your actual repository URL.
