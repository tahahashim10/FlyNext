FROM node:18-alpine

# Install necessary build tools
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files from the current directory (afs/)
COPY package.json package-lock.json ./

# Rebuild node modules for the container architecture
RUN npm rebuild bcrypt

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js app
RUN npm run build

# Expose the port the app runs on
EXPOSE 3001

# Command to run the app (ensure it binds to all interfaces)
CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3001"]
