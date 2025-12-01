# Use Node.js LTS
FROM node:20-alpine

# Install tools you actually need (Docker CLI + kubectl as static binaries)
RUN apk add --no-cache curl bash \
    && curl -sSL "https://download.docker.com/linux/static/stable/x86_64/docker-26.1.3.tgz" -o docker.tgz \
    && tar -xzf docker.tgz \
    && mv docker/docker /usr/local/bin/docker \
    && curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    && chmod +x kubectl \
    && mv kubectl /usr/local/bin \
    && rm -rf docker docker.tgz

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only, uses your overrides)
RUN npm install --production

# Copy application files
COPY . .

# ⚠️ Remove global npm to get rid of cross-spawn/glob from /usr/local/lib
RUN rm -rf /usr/local/lib/node_modules/npm \
    /usr/local/bin/npm \
    /usr/local/bin/npx

# Expose the application port
EXPOSE 3000

# Set default environment variables
ENV PORT=3000
ENV OLLAMA_MODEL=granite3.3:8b
ENV OLLAMA_BASE_URL=http://host.docker.internal:11434
ENV BAMOE_HOST=host.docker.internal
# DEPLOYMENT_ID is still dynamic

# Start the application
CMD ["node", "server/index.js"]

