# Base image
FROM node:21-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME "127.0.0.1"

# Start the application
CMD ["pnpm", "start"]
