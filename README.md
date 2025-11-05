# BAMOE MCP Web Server

A web server application to access and interact with BAMOE MCP (Model Context Protocol) using a React-based UI with AI agent capabilities.

## Features

- Web-based UI for interacting with BAMOE MCP server
- Integration with Ollama LLM models
- BAMOE MCP server for decision and workflow models
- ReAct agent framework using BeeAI
- WebSocket-based real-time communication
- Containerized deployment with Docker Compose

## Prerequisites

- Docker and Docker Compose
- (Optional) Node.js 20+ and npm (for local development)
- (Optional) Ollama running locally or accessible at a network endpoint
- Valid BAMOE deployment with accessible OpenAPI endpoint

## Quick Start with Docker Compose

### 1. Configure Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit the `.env` file and set your BAMOE deployment ID:

```env
# Replace with your actual BAMOE deployment ID
DEPLOYMENT_ID=your_deployment_id_here

# Example: DEPLOYMENT_ID=qx33gh3495
```

### 2. Start the Application

Run the entire stack with a single command:

```bash
docker-compose up -d
```

Or with a custom deployment ID:

```bash
DEPLOYMENT_ID=qx33gh3495 docker-compose up -d
```

### 3. Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

### 4. Stop the Application

```bash
docker-compose down
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEPLOYMENT_ID` | BAMOE deployment identifier | `y95ykp145` |
| `PORT` | Web application port | `3000` |
| `OLLAMA_MODEL` | Ollama model to use | `granite3.2:8b` |
| `OLLAMA_HOST` | Ollama API endpoint | `http://host.docker.internal:11434/api` |
| `BAMOE_HOST` | BAMOE server host | `host.docker.internal` |

### Passing Environment Variables

You can pass environment variables in several ways:

**Option 1: Using .env file**
```bash
# Edit .env file with your values
docker-compose up -d
```

**Option 2: Command-line**
```bash
DEPLOYMENT_ID=abc123 PORT=3001 docker-compose up -d
```

**Option 3: Export to shell**
```bash
export DEPLOYMENT_ID=abc123
export PORT=3001
docker-compose up -d
```

## Architecture

The application consists of two main services:

1. **BAMOE MCP Server**: Runs the BAMOE Model Context Protocol server
   - Exposed on port 18080
   - Configured with your deployment's OpenAPI URL

2. **Web Application**: Node.js/Express server with React UI
   - Exposed on port 3000 (configurable)
   - Connects to BAMOE MCP server
   - Integrates with Ollama for LLM capabilities
   - Provides WebSocket API for real-time interactions

## Local Development

If you want to run without Docker:

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start BAMOE MCP Server

```bash
docker run -it --rm \
  --platform linux/amd64 \
  -p 18080:8080 \
  --name mcp-server \
  -e MCP_SERVER_OPENAPI_URLS=http://host.docker.internal/dev-deployment-y95ykp145/docs/openapi.json \
  quay.io/yamer/mcp-server:latest
```

### 4. Start the Web Application

```bash
npm start
```

### 5. Access the Application

```
http://localhost:3000
```

## Docker Commands

### Build the web application image

```bash
docker-compose build
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web-app
docker-compose logs -f bamoe-mcp-server
```

### Restart services

```bash
docker-compose restart
```

### Remove containers and volumes

```bash
docker-compose down -v
```

## Deployment Options

There are two ways to deploy this application:

### Option 1: Deploy from Source (Recommended)

This is the **current and recommended approach** as it allows for customization and easy updates.

**Requirements:**
- Full repository clone
- Docker and Docker Compose installed

**Steps:**

1. Clone the repository:
```bash
git clone <repository-url>
cd bamoe-mcp
```

2. Create environment configuration:
```bash
cp .env.example .env
# Edit .env and set your DEPLOYMENT_ID
```

3. Start the application:
```bash
docker-compose up -d
```

The `docker-compose up` command will automatically build the image from source and start all services.

**Advantages:**
- Easy to customize code and configuration
- Can modify UI, server logic, or add new features
- Simple updates by pulling latest code
- No need to manage Docker registries

### Option 2: Deploy Using Pre-built Docker Image

If you want to distribute the application without the source code, you can build and push a Docker image to a registry.

**Steps to Create and Push Image:**

1. Build the Docker image with a tag:
```bash
docker build -t your-dockerhub-username/bamoe-mcp-web-app:latest .
```

2. Push to Docker Hub or any container registry:
```bash
docker push your-dockerhub-username/bamoe-mcp-web-app:latest
```

**Deployment Package for Users:**

Users would need only these files:
- `docker-compose.yml` (modified to use image instead of build)
- `.env.example` (as a template)

**Modified docker-compose.yml:**

Replace the `web-app` service's `build` section with `image`:

```yaml
web-app:
  image: your-dockerhub-username/bamoe-mcp-web-app:latest  # Use image instead of build
  container_name: bamoe-web-app
  ports:
    - "${PORT:-3000}:3000"
  environment:
    - PORT=${PORT:-3000}
    - DEPLOYMENT_ID=${DEPLOYMENT_ID:-y95ykp145}
    - BAMOE_HOST=host.docker.internal
    - OLLAMA_MODEL=${OLLAMA_MODEL:-granite3.2:8b}
    - OLLAMA_BASE_URL=${OLLAMA_HOST:-http://host.docker.internal:11434}
  # ... rest of configuration
```

**User Deployment Steps:**

1. Create `.env` file:
```bash
cp .env.example .env
# Edit .env and set DEPLOYMENT_ID
```

2. Pull and start services:
```bash
docker-compose pull
docker-compose up -d
```

**Advantages:**
- Smaller deployment package (just docker-compose.yml and .env)
- No build time on deployment
- Easier to distribute to non-technical users
- Version control through image tags

**Disadvantages:**
- Requires access to a container registry (Docker Hub, etc.)
- Cannot easily customize without rebuilding and pushing image
- Users cannot see or modify source code

### Which Option to Choose?

- **Use Option 1** if you're developing, need customization, or want easy code updates
- **Use Option 2** if you're distributing to end-users who just need to run the application

## Troubleshooting

### Viewing Logs

View logs for all services:
```bash
docker-compose logs -f
```

View logs for a specific service:
```bash
# Web application logs
docker-compose logs -f web-app

# BAMOE MCP server logs
docker-compose logs -f bamoe-mcp-server

# Get last 100 lines
docker-compose logs --tail 100 web-app
```

### Port Conflicts

If port 3000 or 18080 is already in use, change them in your `.env` file:

```env
PORT=3001
```

### Container Issues

Check container status:
```bash
docker-compose ps
```

If a container keeps restarting, check the logs for errors:
```bash
docker-compose logs web-app --tail 50
```

Rebuild containers from scratch:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Ollama Connection Issues

**Symptom:** Errors like `APICallError`, `Connection refused`, or `404 not found` when processing queries

**Solution:**

1. Verify Ollama is running on your host:
```bash
# Test Ollama API endpoint
curl http://localhost:11434/api/tags
```

2. Test connectivity from the Docker container:
```bash
docker exec bamoe-web-app wget -qO- http://host.docker.internal:11434/api/tags
```

3. Verify environment variables in the container:
```bash
docker exec bamoe-web-app sh -c 'env | grep OLLAMA'
```

Expected output:
```
OLLAMA_BASE_URL=http://host.docker.internal:11434/api
OLLAMA_MODEL=granite3.2:8b
```

**Important:** The `OLLAMA_BASE_URL` must include `/api` at the end. The application automatically appends this if missing.

4. Check the application logs for Ollama initialization:
```bash
docker-compose logs web-app | grep "Initializing Ollama"
```

Expected output:
```
Initializing Ollama with model: granite3.2:8b, baseURL: http://host.docker.internal:11434/api
```

### BAMOE Connection Issues

**Symptom:** Errors like `fetch failed` or `[BAMOE] Error: fetch failed` when executing DMN models

**Solution:**

1. Verify BAMOE deployment is accessible from your host:
```bash
# Replace {DEPLOYMENT_ID} with your actual deployment ID
curl http://localhost/dev-deployment-{DEPLOYMENT_ID}/docs/openapi.json
```

2. Check BAMOE configuration in logs:
```bash
docker-compose logs web-app | grep "\[BAMOE\] Configuration"
```

Expected output:
```
[BAMOE] Configuration: DEPLOYMENT_ID=y95ykp145, BAMOE_HOST=host.docker.internal, BAMOE_BASE_URL=http://host.docker.internal/dev-deployment-y95ykp145
```

**Important:** The `BAMOE_HOST` must be `host.docker.internal` when running in Docker, not `localhost`.

3. Verify the deployment ID in your `.env` file matches your actual BAMOE deployment:
```bash
cat .env | grep DEPLOYMENT_ID
```

4. Test BAMOE endpoint from the container:
```bash
docker exec bamoe-web-app wget -qO- http://host.docker.internal/dev-deployment-y95ykp145/docs/openapi.json
```

### Environment Variable Issues

**Verify all environment variables are correctly set:**

```bash
# Check in the container
docker exec bamoe-web-app sh -c 'env | grep -E "OLLAMA|BAMOE|DEPLOYMENT"'
```

Expected output:
```
OLLAMA_BASE_URL=http://host.docker.internal:11434/api
OLLAMA_MODEL=granite3.2:8b
BAMOE_HOST=host.docker.internal
DEPLOYMENT_ID=y95ykp145
```

**If environment variables are missing or incorrect:**

1. Update your `.env` file
2. Rebuild and restart:
```bash
docker-compose down
docker-compose up -d
```

### Debugging Agent Errors

If the AI agent fails to process queries, check for detailed error information:

```bash
docker-compose logs web-app --tail 200 | grep -A 20 "Error\|error"
```

Common agent errors:

1. **ChatModelError: Unhandled error**
   - Usually indicates Ollama connection issues
   - Check Ollama configuration and connectivity

2. **AgentError: The Agent has encountered an error**
   - Check if tools are loaded correctly
   - Verify BAMOE MCP server is connected

3. **fetch failed**
   - BAMOE endpoint is not accessible
   - Check BAMOE_HOST configuration

### Testing Individual Components

**Test Ollama directly:**
```bash
curl -X POST http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "granite3.2:8b",
    "messages": [{"role": "user", "content": "test"}],
    "stream": false
  }'
```

**Test BAMOE MCP server:**
```bash
docker-compose logs bamoe-mcp-server | grep "MCP Server bootstrap completed"
```

**Test web application startup:**
```bash
docker-compose logs web-app | grep "Server running"
```

Expected output:
```
Server running at http://localhost:3000
Available MCP servers: bamoe
Total tools loaded: 4
```

### Force Clean Rebuild

If you're experiencing persistent issues:

```bash
# Stop and remove everything
docker-compose down -v

# Remove the built image
docker rmi bamoe-mcp-web-app

# Rebuild from scratch
docker-compose build --no-cache

# Start fresh
docker-compose up -d

# Watch logs
docker-compose logs -f
```

### Performance Issues

If Ollama responses are slow:

1. Check Ollama is using GPU acceleration (if available)
2. Try a smaller model in `.env`:
```env
OLLAMA_MODEL=granite3.3:2b
```

3. Monitor resource usage:
```bash
docker stats
```

## MCP Server Configuration

The application uses the BAMOE MCP server configured in `mcp-servers.json`:

- **BAMOE**: Custom MCP server for BAMOE decision and workflow models

## Available BAMOE Tools

The BAMOE MCP server provides these tools:

- `execute_dev_deployment_qx_gh_DMN_model`: Execute fraud detection DMN model
- `fetching_dev_deployment_qx_gh_BPMN_process_workflow_instance`: Fetch BPMN workflow instance
- `update_dev_deployment_qx_gh_BPMN_process_workflow_model`: Update BPMN workflow model
- `delete_dev_deployment_qx_gh_BPMN_process_workflow_model`: Delete BPMN workflow model

## License

ISC

## Author

Dilipan Somasundaram
