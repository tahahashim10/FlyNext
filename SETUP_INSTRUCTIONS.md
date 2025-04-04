
# Setup Instructions for FlyNext Project

This document provides detailed instructions for setting up your FlyNext project both locally (using Docker) and for deployment (using Vercel/Supabase).

---

## File Placement

Place the following files in the **root directory** of your project (`PP2`):

- `Dockerfile` (this is your main app’s Dockerfile; previously named Dockerfile.app)
- `afs/Dockerfile` (this is your AFS service’s Dockerfile; note that it now resides in the `afs/` directory)
- `docker-compose.yaml`
- `start.sh`
- `import-data.sh`
- `stop.sh`
- `deploy-database.sh`
- `vercel.json`
- `.env.production` (rename to `.env` locally if needed)
- `url.txt`
- `DEPLOYMENT.md`
- `FAQ.md`
- (Also, include a `.dockerignore` file to prevent host-specific artifacts such as `node_modules` from being copied into your images.)

---

## Local Setup with Docker

### 1. Prerequisites

Ensure you have [Docker](https://docs.docker.com/get-docker/) and Docker Compose installed and running on your system.

### 2. Make the Scripts Executable

Run the following command in your project root:

```bash
chmod +x start.sh import-data.sh stop.sh deploy-database.sh
```

### 3. Start the Application

Run:

```bash
./start.sh
```

This script will:
- Check for (or create) your `.env.docker` file.
- Build and start all containers:
  - **FlyNext App** (listening on http://localhost:3000)
  - **AFS Service** (in `afs/`, listening on http://localhost:3001)
  - PostgreSQL databases for FlyNext and AFS

### 4. Import Data

After the containers are up, run:

```bash
./import-data.sh
```

This script will:
- Run Prisma migrations for AFS and FlyNext.
- Import airports, airlines, flights, cities, and other data.
- Seed hotels and rooms for the FlyNext app.

Successful output should end with “Data import completed successfully.”

### 5. Access the Application

- **Main Application:** [http://localhost:3000](http://localhost:3000)
- **AFS Service:** [http://localhost:3001](http://localhost:3001)

### 6. Stop the Application

When you’re finished, stop all services by running:

```bash
./stop.sh
```

---

## Deployment with Vercel and Supabase

### 1. Set Up Supabase

1. Create an account at [Supabase](https://supabase.com).
2. Create a new project and note your database connection string from **Project Settings > Database**.
3. For the AFS service, either create a second Supabase project or add a second database to your current project.

### 2. Update Environment Variables

1. Update `.env.production` with your Supabase connection string and any other required environment variables.
2. For local testing, copy `.env.production` to `.env` and adjust values as needed.

### 3. Deploy the Main Application with Vercel

1. Create an account at [Vercel](https://vercel.com).
2. Connect your GitHub repository.
3. Configure the deployment settings:
   - **Framework:** Next.js
   - **Root Directory:** `PP2` (if your repository contains multiple projects)
4. Configure environment variables in Vercel’s interface (use the values from your `.env.production`).
5. Deploy the main FlyNext application.

### 4. Deploy the AFS Service with Vercel

1. Create a separate Vercel project for the AFS service.
2. Connect to the same repository.
3. Set the **Root Directory** to `PP2/afs`.
4. Configure environment variables (make sure `NODE_ENV=production` and the database URL for AFS are set).
5. Deploy the AFS service.

### 5. Update the Main App’s AFS_BASE_URL

After deploying the AFS service, update the main app’s `AFS_BASE_URL` environment variable in Vercel (or in your `.env.production`) to point to your deployed AFS service URL.

### 6. Prepare the Supabase Database

Run migrations and seed your Supabase database using:

```bash
export DATABASE_URL="your-supabase-connection-string"
./deploy-database.sh
```

### 7. Test the Deployed Application

Visit your Vercel deployment URL and verify that all functionality works as expected.

### 8. Update url.txt

Update the `url.txt` file with your final Vercel deployment URL.

---

## Troubleshooting

If you encounter issues, refer to the `FAQ.md` file for common problems and solutions.

### For Docker Issues

Check container logs with:

```bash
docker-compose logs flynext      # FlyNext app logs
docker-compose logs afs          # AFS service logs
docker-compose logs flynext-db   # FlyNext database logs
docker-compose logs afs-db       # AFS database logs
```

### For Vercel Deployment Issues

- Check the deployment logs in the Vercel dashboard.
- Verify that all environment variables are correctly set.

### Additional Tips

- **.dockerignore:**  
  Ensure you have a `.dockerignore` file (in the root and in the `afs/` directory if necessary) to exclude `node_modules` and other unnecessary files. This ensures that dependencies are rebuilt for the container environment (preventing issues like native module errors).

- **Obsolete `version` Warning:**  
  The warning regarding the `version` attribute in your `docker-compose.yaml` can be safely ignored or removed if desired.
