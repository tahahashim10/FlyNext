# Setup Instructions for FlyNext Project

This document provides detailed instructions for setting up your FlyNext project both locally using Docker and deployed using Vercel/Supabase.

## File Placement

Place the following files in the **root directory** of your project (`PP2`):

- `Dockerfile.app`
- `Dockerfile.afs`
- `docker-compose.yaml`
- `start.sh`
- `import-data.sh`
- `stop.sh`
- `deploy-database.sh`
- `vercel.json`
- `.env.production` (rename to `.env` locally)
- `url.txt`
- `DEPLOYMENT.md`
- `FAQ.md`

## Local Setup with Docker

### Step 1: Ensure you have Docker and Docker Compose installed
Make sure Docker and Docker Compose are installed and running on your system.

### Step 2: Make the scripts executable
```bash
chmod +x start.sh import-data.sh stop.sh deploy-database.sh
```

### Step 3: Start the application
```bash
./start.sh
```
This will build and start all containers (FlyNext, AFS, and PostgreSQL databases).

### Step 4: Import data
```bash
./import-data.sh
```
This will import data for both the FlyNext application and the AFS service.

### Step 5: Access the application
- Main application: http://localhost:3000
- AFS service: http://localhost:3001

### Step 6: Stop the application when done
```bash
./stop.sh
```

## Deployment with Vercel and Supabase

### Step 1: Set up Supabase

1. Create an account at [Supabase](https://supabase.com)
2. Create a new project
3. Get your database connection string from Project Settings > Database

For the AFS service, you can either:
- Create a second Supabase project, or
- Create a second database in the same project

### Step 2: Update environment variables

1. Update `.env.production` with your Supabase connection string and other environment variables
2. For local testing, copy this file to `.env` and update as needed

### Step 3: Deploy with Vercel

1. Create an account at [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Configure the deployment settings:
   - Framework: Next.js
   - Root Directory: PP2 (if your repository has multiple projects)
4. Configure environment variables in Vercel's interface using the values from your `.env.production`
5. Deploy the main application

### Step 4: Deploy the AFS service

Create a separate Vercel project for the AFS service:
1. In Vercel, create a new project
2. Connect to the same repository
3. Set the root directory to `PP2/afs`
4. Configure environment variables for the AFS service
5. Deploy the AFS service

### Step 5: Update the main app's AFS_BASE_URL

After deploying the AFS service, update the main app's `AFS_BASE_URL` environment variable in Vercel to point to your deployed AFS service URL.

### Step 6: Prepare the Supabase database

Run migrations and seed the database:
```bash
export DATABASE_URL="your-supabase-connection-string"
./deploy-database.sh
```

### Step 7: Test the deployed application

Visit your Vercel deployment URL and test all functionality.

### Step 8: Update url.txt

Update `url.txt` with your Vercel deployment URL.

## Troubleshooting

If you encounter issues, refer to the `FAQ.md` file for common problems and solutions.

For Docker issues:
```bash
docker-compose logs flynext  # Check FlyNext app logs
docker-compose logs afs      # Check AFS service logs
docker-compose logs flynext-db  # Check FlyNext database logs
docker-compose logs afs-db   # Check AFS database logs
```

For Vercel deployment issues, check the Vercel deployment logs in the Vercel dashboard.