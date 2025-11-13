# BAMOE MCP Web Server

## For Distributors (Building and Pushing Images)

### Prerequisites
- Docker installed
- Access to quay.io container registry
- Credentials for the `pamoe` namespace on quay.io

### Build and Push the Image

Simply run the build script:

```bash
./build-and-push.sh
```

The script will:
1. Build the Docker image
2. Tag it as `quay.io/pamoe/bamoe-mcp-web-app:latest`
3. Prompt you to login to quay.io (use credentials: username `athirakm`)
4. Push the image to the registry

**Manual Steps (if preferred):**

```bash
# Build the image
docker build -t bamoe-mcp-web-app .

# Login to quay.io
docker login quay.io
# Username: athirakm
# Password: [your password]

# Tag the image
docker tag bamoe-mcp-web-app quay.io/pamoe/bamoe-mcp-web-app:latest

# Push to registry
docker push quay.io/pamoe/bamoe-mcp-web-app:latest
```

---

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

### 1. Prerequisites Setup

Before starting, you need to create a Docker-specific kubeconfig (this keeps your original config untouched):

```bash
# Create a Docker-specific kubeconfig
cp ~/.kube/config ~/.kube/config.docker

# Find your cluster's server address(es)
kubectl config view | grep server:

# Replace 127.0.0.1 with host.docker.internal for each cluster
# On macOS:
sed -i '' -e 's|https://127.0.0.1:PORT|https://host.docker.internal:PORT|g' ~/.kube/config.docker

# On Linux:
sed -i 's|https://127.0.0.1:PORT|https://host.docker.internal:PORT|g' ~/.kube/config.docker

# If you have multiple clusters, replace PORT with each actual port number
# Verify the change
grep "server:" ~/.kube/config.docker
```

See the [Kubernetes Configuration](#kubernetes-configuration-for-docker) section for detailed instructions.

### 2. Configure Environment Variables (Optional)

Create a `.env` file from the example:

```bash
cp .env.example .env
```

You can customize settings like:
- `PORT` (default: 3000)
- `OLLAMA_MODEL` (default: granite3.3:8b)
- `K8S_NAMESPACE` (default: local-kie-sandbox-dev-deployments)

**Note:** You no longer need to set `DEPLOYMENT_ID` - it's now selected dynamically in the UI!

### 3. Start the Application

Run the application with a single command:

```bash
docker-compose up -d
```

### 4. Access the Application and Select Deployment

Open your browser and navigate to:

```
http://localhost:3000
```

**In the UI:**
1. The deployment dropdown will show all available BAMOE deployments from your Kubernetes cluster
2. Select a deployment from the dropdown
3. The MCP server will automatically deploy for the selected deployment
4. Start chatting!

### 5. Stop the Application

```bash
docker-compose down
```

## Configuration

### Dynamic Deployment Selection

This application features **dynamic deployment selection** - you no longer need to hardcode a deployment ID. Instead:

1. The UI fetches all available BAMOE deployments from your Kubernetes cluster
2. Users select a deployment from a dropdown menu
3. The MCP server container is automatically deployed for the selected deployment
4. Switching deployments dynamically redeploys the MCP server

**Note:** Deployment ID is no longer set via environment variables. It's selected at runtime in the UI.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Web application port | `3000` |
| `OLLAMA_MODEL` | Ollama model to use | `granite3.3:8b` |
| `OLLAMA_HOST` | Ollama API endpoint | `http://host.docker.internal:11434/api` |
| `BAMOE_HOST` | BAMOE server host | `host.docker.internal` |
| `K8S_NAMESPACE` | Kubernetes namespace for BAMOE deployments | `local-kie-sandbox-dev-deployments` |

### Kubernetes Configuration for Docker

For the dynamic deployment feature to work from within Docker containers, you need to configure your kubeconfig to be accessible from Docker.

#### Prerequisites

- `kubectl` installed and configured on your host machine
- Access to a Kubernetes cluster with BAMOE deployments
- BAMOE deployments running in the configured namespace

#### Kubeconfig Setup for kind or Docker Desktop

If you're using **kind** (Kubernetes in Docker) or **Docker Desktop Kubernetes**, the cluster API server is typically bound to `127.0.0.1` (localhost). However, from within a Docker container, `127.0.0.1` refers to the container itself, not the host machine.

**Solution:** Create a Docker-specific kubeconfig that uses `host.docker.internal` instead of `127.0.0.1`. This approach keeps your original kubeconfig unchanged.

##### Step 1: Create Docker-specific kubeconfig

```bash
cp ~/.kube/config ~/.kube/config.docker
```

##### Step 2: Update the server address

Replace `127.0.0.1` with `host.docker.internal` in the Docker-specific config:

**Find your cluster port(s):**
```bash
kubectl config view | grep server:
```

**On macOS:**
```bash
# For kind cluster (example port: 49558)
sed -i '' 's|https://127.0.0.1:49558|https://host.docker.internal:49558|g' ~/.kube/config.docker

# For Docker Desktop cluster (example port: 64226)
sed -i '' 's|https://127.0.0.1:64226|https://host.docker.internal:64226|g' ~/.kube/config.docker

# If you have multiple clusters, you can update them all at once:
sed -i '' -e 's|https://127.0.0.1:49558|https://host.docker.internal:49558|g' -e 's|https://127.0.0.1:64226|https://host.docker.internal:64226|g' ~/.kube/config.docker
```

**On Linux:**
```bash
# For kind cluster (example port: 49558)
sed -i 's|https://127.0.0.1:49558|https://host.docker.internal:49558|g' ~/.kube/config.docker

# For Docker Desktop cluster (example port: 64226)
sed -i 's|https://127.0.0.1:64226|https://host.docker.internal:64226|g' ~/.kube/config.docker

# If you have multiple clusters, you can update them all at once:
sed -i -e 's|https://127.0.0.1:49558|https://host.docker.internal:49558|g' -e 's|https://127.0.0.1:64226|https://host.docker.internal:64226|g' ~/.kube/config.docker
```

##### Step 3: Verify the change

```bash
grep "server:" ~/.kube/config.docker
```

You should see something like:
```
server: https://host.docker.internal:49558
```

**Note:** Your original `~/.kube/config` remains untouched and will continue to work normally with kubectl on your host machine.

#### TLS Certificate Handling

The TLS certificates for kind/Docker Desktop clusters are issued for specific hostnames (like `kubernetes`, `localhost`, `kind-*-control-plane`), but not for `host.docker.internal`.

The application automatically handles this by using the `--insecure-skip-tls-verify` flag for kubectl commands when running inside Docker. This is safe for local development with kind/Docker Desktop clusters.

**Note:** For production deployments or remote clusters, consider using proper certificate management or service account tokens instead.

#### Verify Kubernetes Connectivity

Test the Docker-specific kubeconfig before starting the application:

```bash
# Test the Docker config from your host
kubectl --kubeconfig ~/.kube/config.docker get services -n local-kie-sandbox-dev-deployments --insecure-skip-tls-verify
```

After starting the application, verify that it can connect to your Kubernetes cluster:

```bash
# Check if deployments are being fetched
docker-compose logs web-app | grep "deployments"

# You should see logs like:
# Fetched deployments successfully
```

Test the API endpoint:
```bash
curl http://localhost:3000/api/deployments
```

Expected response:
```json
{
  "success": true,
  "deployments": [
    {
      "workspaceName": "fiserv-Regulatory-Reporting",
      "deploymentId": "qdd901b130",
      "workspaceId": "5cdb50be-1b37-48c3-a94c-18d33ea9db9f"
    }
  ]
}
```

### Passing Environment Variables

You can pass environment variables in several ways:

**Option 1: Using .env file**
```bash
# Edit .env file with your values
docker-compose up -d
```

**Option 2: Command-line**
```bash
PORT=3001 docker-compose up -d
```

**Option 3: Export to shell**
```bash
export PORT=3001
export K8S_NAMESPACE=my-custom-namespace
docker-compose up -d
```

## Architecture

The application uses a **dynamic deployment architecture**:

### Services

1. **Web Application** (Always Running)
   - Node.js/Express server with web UI
   - Exposed on port 3000 (configurable)
   - Integrates with Ollama for LLM capabilities
   - Provides WebSocket API for real-time interactions
   - Fetches available deployments from Kubernetes
   - Manages MCP server container lifecycle

2. **BAMOE MCP Server** (Deployed On-Demand)
   - Automatically deployed when a user selects a deployment
   - Exposed on port 18080
   - Configured with the selected deployment's OpenAPI URL
   - Automatically redeployed when user switches deployments

### Dynamic Deployment Workflow

1. **On Startup**: Only the Web Application container starts
2. **User Action**: User opens the UI and sees available deployments fetched from Kubernetes
3. **Deployment Selection**: User selects a deployment from the dropdown
4. **MCP Deployment**: Application automatically runs `docker run` to deploy the MCP server container with the selected deployment ID
5. **Deployment Switch**: When user selects a different deployment:
   - Old MCP server container is stopped and removed
   - New MCP server container is deployed with the new deployment ID
   - Tools are reloaded for the new deployment

### Kubernetes Integration

- The application connects to your Kubernetes cluster to fetch available BAMOE deployments
- Deployments are identified by service names matching the pattern `dev-deployment-*`
- Workspace names are extracted from Kubernetes service annotations
- The kubeconfig is mounted from `~/.kube/config` into the container

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

2. Create Docker-specific kubeconfig (see [Kubernetes Configuration](#kubernetes-configuration-for-docker)):
```bash
cp ~/.kube/config ~/.kube/config.docker
# Follow the sed commands to update server addresses
```

3. Create environment configuration (optional):
```bash
cp .env.example .env
# Customize settings like PORT, OLLAMA_MODEL, K8S_NAMESPACE if needed
```

4. Start the application:
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
    - OLLAMA_MODEL=${OLLAMA_MODEL:-granite3.3:8b}
    - OLLAMA_BASE_URL=${OLLAMA_HOST:-http://host.docker.internal:11434}
  # ... rest of configuration
```

**User Deployment Steps:**

1. Create Docker-specific kubeconfig (see [Kubernetes Configuration](#kubernetes-configuration-for-docker)):
```bash
cp ~/.kube/config ~/.kube/config.docker
# Follow the sed commands to update server addresses
```

2. (Optional) Create `.env` file for customization:
```bash
cp .env.example .env
# Customize PORT, OLLAMA_MODEL, K8S_NAMESPACE if needed
```

3. Pull and start services:
```bash
docker-compose pull
docker-compose up -d
```

4. Open http://localhost:3000 and select a deployment from the dropdown

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
OLLAMA_MODEL=granite3.3:8b
```

**Important:** The `OLLAMA_BASE_URL` must include `/api` at the end. The application automatically appends this if missing.

4. Check the application logs for Ollama initialization:
```bash
docker-compose logs web-app | grep "Initializing Ollama"
```

Expected output:
```
Initializing Ollama with model: granite3.3:8b, baseURL: http://host.docker.internal:11434/api
```

### BAMOE Connection Issues

**Symptom:** Errors like `fetch failed` or `[BAMOE] Error: fetch failed` when executing DMN models

**Solution:**

1. Verify BAMOE deployment is accessible from your host:
```bash
# Replace {DEPLOYMENT_ID} with your selected deployment ID from the UI
curl http://localhost/dev-deployment-{DEPLOYMENT_ID}/docs/openapi.json
```

2. Check BAMOE configuration in logs:
```bash
docker-compose logs web-app | grep "\[BAMOE\] Configuration"
```

Expected output:
```
[BAMOE] Configuration: DEPLOYMENT_ID=qdd901b130, BAMOE_HOST=host.docker.internal, BAMOE_BASE_URL=http://host.docker.internal/dev-deployment-qdd901b130
```

**Important:** The `BAMOE_HOST` must be `host.docker.internal` when running in Docker, not `localhost`.

3. Verify you selected a deployment in the UI:
   - Open http://localhost:3000
   - Check if the deployment dropdown shows available deployments
   - Select a deployment if "None" is selected

4. Test BAMOE endpoint from the container:
```bash
# Replace with your actual deployment ID
docker exec bamoe-web-app wget -qO- http://host.docker.internal/dev-deployment-qdd901b130/docs/openapi.json
```

5. Check if the MCP server container is running:
```bash
docker ps --filter "name=bamoe-mcp-server"
```

If not running, select a deployment in the UI to trigger deployment.

### Kubernetes Deployment Fetching Issues

**Symptom:** Deployment dropdown shows "No deployments found" or "Error loading deployments"

**Solution:**

1. Verify kubectl can access your cluster from the host:
```bash
kubectl get services -n local-kie-sandbox-dev-deployments
```

2. Check if the Docker-specific kubeconfig is correctly configured:
```bash
grep "server:" ~/.kube/config.docker
# Should show: server: https://host.docker.internal:<PORT>
```

3. Verify the kubeconfig is mounted in the container:
```bash
docker exec bamoe-web-app ls -la /root/.kube/config
```

4. Test kubectl from inside the container:
```bash
docker exec bamoe-web-app kubectl get services -n local-kie-sandbox-dev-deployments --insecure-skip-tls-verify
```

5. Check the logs for deployment fetching errors:
```bash
docker-compose logs web-app | grep -i "deployment\|kubectl"
```

6. Verify your Kubernetes namespace is correct:
   - Check the `K8S_NAMESPACE` environment variable
   - Ensure BAMOE services exist in that namespace

### Environment Variable Issues

**Verify all environment variables are correctly set:**

```bash
# Check in the container
docker exec bamoe-web-app sh -c 'env | grep -E "OLLAMA|BAMOE|K8S"'
```

Expected output:
```
OLLAMA_BASE_URL=http://host.docker.internal:11434/api
OLLAMA_MODEL=granite3.3:8b
BAMOE_HOST=host.docker.internal
K8S_NAMESPACE=local-kie-sandbox-dev-deployments
```

**Note:** `DEPLOYMENT_ID` is no longer set as an environment variable. It's dynamically set when a user selects a deployment in the UI.

**If environment variables are missing or incorrect:**

1. Update your `.env` file
2. Restart the containers:
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
    "model": "granite3.3:8b",
    "messages": [{"role": "user", "content": "test"}],
    "stream": false
  }'
```

**Test BAMOE MCP server:**
```bash
# Note: MCP server only runs after selecting a deployment in the UI
docker ps --filter "name=bamoe-mcp-server"
```

**Test web application startup:**
```bash
docker-compose logs web-app | grep "Server running"
```

Expected output:
```
Server running at http://localhost:3000
No MCP tools loaded yet. Please select a deployment in the UI.
```

**Test Kubernetes deployment fetching:**
```bash
curl http://localhost:3000/api/deployments
```

Expected output:
```json
{
  "success": true,
  "deployments": [
    {
      "workspaceName": "fiserv-Regulatory-Reporting",
      "deploymentId": "qdd901b130",
      "workspaceId": "5cdb50be-1b37-48c3-a94c-18d33ea9db9f"
    }
  ]
}
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
