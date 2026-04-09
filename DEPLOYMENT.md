# Deployment Guide for Render.com

This guide will help you deploy your LinkedIn Scraper to Render.com.

## Prerequisites

1. A Render.com account (free or paid) - https://render.com
2. Your GitHub repository linked (already done: https://github.com/AtharvaChothe/Linkedin_scraper)
3. Environment variables from your `.env` file

## Step 1: Update App Configuration

Before deploying, your `app.py` needs to be updated to work with environment variables and listen on the correct port. Here are the key changes needed:

### Update Database Connection

Replace the hardcoded MySQL connection in `app.py` (lines 18-23) with:

```python
import os

# Database Configuration
db_config = {
    "host": os.getenv('DATABASE_HOST', 'localhost'),
    "user": os.getenv('DATABASE_USER', 'root'),
    "password": os.getenv('DATABASE_PASSWORD', ''),
    "database": os.getenv('DATABASE_NAME', 'sphurtin_org_chart_db')
}

# Create connection pool for better performance
try:
    db = mysql.connector.connect(**db_config)
    cursor = db.cursor()
except Exception as e:
    print(f"Warning: Could not connect to MySQL: {e}")
    print("App will run but database features may not work")
    db = None
    cursor = None
```

### Update App Startup

At the end of `app.py`, replace the `if __name__ == '__main__':` section with:

```python
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
```

## Step 2: Commit Changes

Commit these changes to GitHub:

```bash
git add .
git commit -m "Deploy configuration for Render.com"
git push origin main
```

## Step 3: Deploy on Render.com

1. **Sign in to Render.com** - https://dashboard.render.com

2. **Create a New Web Service:**
   - Click **"New +"** button
   - Select **"Web Service"**
   - Connect your GitHub account if not already connected
   - Select the repository: `Linkedin_scraper`
   - Click **"Connect"**

3. **Configure the Deployment:**
   - **Name**: `linkedin-scraper` (or any name you prefer)
   - **Environment**: Python 3
   - **Region**: Oregon (or choose closest to you)
   - **Branch**: main
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: Free (or select appropriate plan)

4. **Add Environment Variables:**
   - Click **"Advanced"** if not expanded
   - Under **"Environment Variables"**, add:
     - `LINKEDIN_API_KEY`: Your LinkedIn API key
     - `DATABASE_HOST`: Your MySQL database host
     - `DATABASE_USER`: Your MySQL username
     - `DATABASE_PASSWORD`: Your MySQL password
     - `DATABASE_NAME`: Your database name (e.g., `sphurtin_org_chart_db`)
     - `PORT`: 10000

5. **Deploy:**
   - Click **"Create Web Service"**
   - Wait for the deployment to complete (usually 2-5 minutes)
   - Your service will be available at: `https://<service-name>.onrender.com`

## Step 4: Monitor Deployment

- Check the **Logs** tab in Render to see if there are any errors
- If the deployment fails, check the error messages and update your code accordingly
- After successful deployment, your API will be accessible at the Render URL

## Important Notes

### Database Connectivity

If your MySQL database is hosted locally or on a private server, it won't be accessible from Render. You have two options:

**Option A: Use Cloud MySQL Database**
- Use a service like AWS RDS, ClearDB, or PlanetScale
- Update `DATABASE_HOST` to the cloud database endpoint

**Option B: Keep Using Local MySQL**
- Expose your local MySQL to the internet using ngrok or similar tunneling service
- This is NOT recommended for production

### File Storage

The `/results` directory will be reset when your service restarts. For persistent storage, consider:
- Using AWS S3 for JSON file storage
- Storing results directly in your MySQL database
- Using Render's Disk service (paid feature)

### Rate Limiting

Render.com Free tier has:
- Auto-hibernates after 15 minutes of inactivity
- Must restart manually if hibernated
- Limited to 750 compute hours per month
- Consider upgrading to paid tier for production use

### API Keys

Keep sensitive information in environment variables on Render. Never commit `.env` file to GitHub.

## Troubleshooting

### Build Fails
- Check that all imports in `app.py` are in `requirements.txt`
- Ensure Python version compatibility

### Runtime Errors
- Check logs in Render dashboard
- Verify all environment variables are set correctly
- Test the app locally first: `python app.py`

### Database Connection Issues
- Verify database credentials are correct
- Check if database host is accessible from Render
- Add your Render IP to database firewall rules (if applicable)

## Testing Your Deployment

Once deployed, test your API endpoints:

```bash
# Health check
curl https://<service-name>.onrender.com/health

# Status
curl https://<service-name>.onrender.com/status

# API docs
curl https://<service-name>.onrender.com/api/docs
```

## Next Steps

After successful deployment:

1. Test all API endpoints with your production data
2. Set up monitoring and alerts in Render
3. Consider upgrading to a paid plan if you need:
   - Persistent storage
   - Higher resource limits
   - Always-on service
   - Better performance

For more information, visit: https://render.com/docs

---

**Need help?**
- Render Support: https://render.com/support
- Check the logs in your Render dashboard for detailed error messages
