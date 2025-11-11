# Use Node.js LTS version
FROM node:20-alpine

# Install kubectl, docker-cli, and docker-compose for deployment management
RUN apk add --no-cache curl docker-cli docker-cli-compose && \
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    chmod +x kubectl && \
    mv kubectl /usr/local/bin/

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
ENV BAMOE_HOST=host.docker.internal
# Note: DEPLOYMENT_ID is set dynamically when user selects a deployment

# Start the application
CMD ["npm", "start"]
