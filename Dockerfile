# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose the application port
EXPOSE 3000

# Set default environment variables
ENV PORT=3000
ENV OLLAMA_MODEL=granite3.2:8b
ENV OLLAMA_BASE_URL=http://host.docker.internal:11434
ENV DEPLOYMENT_ID=y95ykp145
ENV BAMOE_HOST=host.docker.internal

# Start the application
CMD ["npm", "start"]
