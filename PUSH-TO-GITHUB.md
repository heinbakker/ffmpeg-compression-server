# Push to GitHub - Quick Instructions

After creating your private GitHub repository, run these commands:

1. **Add your GitHub repository as remote** (replace YOUR_USERNAME with your actual GitHub username):
   ```
   git remote add origin https://github.com/YOUR_USERNAME/ffmpeg-compression-server.git
   ```

2. **Push your code**:
   ```
   git push -u origin main
   ```

3. **If GitHub asks for authentication**, you may need to:
   - Use a Personal Access Token instead of password
   - Or use GitHub CLI (`gh auth login`)
   - Or set up SSH keys

## Example (replace YOUR_USERNAME):
```
git remote add origin https://github.com/YOUR_USERNAME/ffmpeg-compression-server.git
git push -u origin main
```

## After pushing:
- Your code will be in a private GitHub repository
- You can then connect it to Coolify using "Private Repository (with GitHub App)" option

