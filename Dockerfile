# Use Node.js LTS version
FROM node:20-bookworm-slim

# Install lightweight tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install static Docker CLI (no containerd CVEs)
ENV DOCKER_VERSION=25.0.3
RUN curl -fSL "https://download.docker.com/linux/static/stable/x86_64/docker-${DOCKER_VERSION}.tgz" -o docker.tgz \
    && tar -xzf docker.tgz \
    && mv docker/docker /usr/local/bin/docker \
    && rm -rf docker docker.tgz

# Install kubectl
RUN curl -fSL "https://dl.k8s.io/release/$(curl -sL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    -o /usr/local/bin/kubectl \
    && chmod +x /usr/local/bin/kubectl

# Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN chown -R appuser:appgroup /app

#  Remove npm from final image
RUN rm -rf /usr/local/lib/node_modules/npm \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx

# Switch to non-root user
USER appuser

EXPOSE 3000

ENV PORT=3000
ENV OLLAMA_MODEL=granite3.3:8b
ENV OLLAMA_BASE_URL=http://host.docker.internal:11434
ENV BAMOE_HOST=host.docker.internal

# Start the app with node directly (no npm)
CMD ["node", "server/index.js"]

