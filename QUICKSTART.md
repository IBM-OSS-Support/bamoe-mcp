# BAMOE MCP Web App - Quick Start Guide

This guide will help you quickly set up and run the BAMOE MCP Web App using pre-built Docker images.

## For End Users (Running the Application)

### What You Need

To run the BAMOE MCP Web App, you only need:
1. **docker-compose.yml** - The Docker Compose file
2. **.env.example** - Environment variable template (optional)
3. **Docker and Docker Compose** installed on your machine
4. **kubectl** configured with access to a Kubernetes cluster with BAMOE deployments
5. **Docker-specific kubeconfig** (see setup below)

**Note:** Ollama with granite3.3:8b model is included in the Docker setup - no manual installation required!

### Quick Start

#### Step 1: Set Up Docker-Specific Kubeconfig

Create a Docker-specific kubeconfig (keeps your original config untouched):

**First, find your cluster port(s):**
```bash
kubectl config view | grep server:
```

---

**On macOS:**
```bash
# Create Docker-specific config
cp ~/.kube/config ~/.kube/config.docker

# Replace PORT with your actual port number
sed -i '' -e 's|https://127.0.0.1:PORT|https://host.docker.internal:PORT|g' ~/.kube/config.docker

# For multiple clusters, update all ports:
sed -i '' -e 's|https://127.0.0.1:52717|https://host.docker.internal:52717|g' -e 's|https://127.0.0.1:53692|https://host.docker.internal:53692|g' ~/.kube/config.docker

# Verify
grep "server:" ~/.kube/config.docker
```

---

**On Linux:**
```bash
# Create Docker-specific config
cp ~/.kube/config ~/.kube/config.docker

# Replace PORT with your actual port number
sed -i -e 's|https://127.0.0.1:PORT|https://host.docker.internal:PORT|g' ~/.kube/config.docker

# For multiple clusters, update all ports:
sed -i -e 's|https://127.0.0.1:52717|https://host.docker.internal:52717|g' -e 's|https://127.0.0.1:53692|https://host.docker.internal:53692|g' ~/.kube/config.docker

# Verify
grep "server:" ~/.kube/config.docker
```

---

**On Windows (PowerShell):**
```powershell
# Create Docker-specific config
Copy-Item $HOME\.kube\config $HOME\.kube\config.docker

# Find your cluster port(s)
kubectl config view | Select-String "server:"

# Replace PORT with your actual port number (e.g., 52717)
(Get-Content $HOME\.kube\config.docker) -replace 'https://127.0.0.1:PORT', 'https://host.docker.internal:PORT' | Set-Content $HOME\.kube\config.docker

# For multiple clusters (replace with your actual ports):
(Get-Content $HOME\.kube\config.docker) -replace 'https://127.0.0.1:52717', 'https://host.docker.internal:52717' -replace 'https://127.0.0.1:53692', 'https://host.docker.internal:53692' | Set-Content $HOME\.kube\config.docker

# Verify
Select-String "server:" $HOME\.kube\config.docker
```

**On Windows (Git Bash):**
```bash
# Create Docker-specific config
cp ~/.kube/config ~/.kube/config.docker

# Replace PORT with your actual port number
sed -i 's|https://127.0.0.1:PORT|https://host.docker.internal:PORT|g' ~/.kube/config.docker

# For multiple clusters, update all ports:
sed -i -e 's|https://127.0.0.1:52717|https://host.docker.internal:52717|g' -e 's|https://127.0.0.1:53692|https://host.docker.internal:53692|g' ~/.kube/config.docker

# Verify
grep "server:" ~/.kube/config.docker
```

**On Windows (Manual Edit):**
1. Copy the file:
   - Open File Explorer
   - Navigate to `C:\Users\YourUsername\.kube\`
   - Copy `config` and rename the copy to `config.docker`
2. Edit `config.docker` in Notepad or VS Code:
   - Find lines containing `server: https://127.0.0.1:PORT`
   - Replace `127.0.0.1` with `host.docker.internal`
   - Save the file

#### Step 2: (Optional) Configure Environment Variables

```bash
# On macOS/Linux:
cp .env.example .env

# On Windows (PowerShell):
Copy-Item .env.example .env

# Edit .env to customize (optional):
# - PORT (default: 3000)
# - OLLAMA_MODEL (default: granite3.3:8b)
# - K8S_NAMESPACE (default: local-kie-sandbox-dev-deployments)
```

#### Step 3: Start the Application

```bash
docker-compose up -d
```

#### Step 4: Access the Application

Open your browser to: **http://localhost:3000**

1. The UI will show available BAMOE deployments from your Kubernetes cluster
2. Select a deployment from the dropdown
3. The MCP server will automatically deploy for the selected deployment
4. Start chatting with the AI!

#### Step 5: Stop the Application

```bash
docker-compose down
```

### How It Works

The distribution setup maintains all the functionality of the original application:

1. **Ollama Container**: Runs Ollama with granite3.3:8b model pre-loaded (from pre-built image)
2. **Web App Container**: Runs the Express server and serves the UI (from pre-built image)
3. **Dynamic MCP Server Deployment**: The web app automatically deploys MCP server containers on-demand when you select a deployment
4. **Kubernetes Integration**: Fetches available BAMOE deployments from your cluster

### Prerequisites Details

#### 1. Docker and Docker Compose
Install from: https://docs.docker.com/get-docker/

Verify installation:
```bash
docker --version
docker-compose --version
```

#### 2. Kubernetes Access
Ensure you have kubectl configured with access to your Kubernetes cluster:
```bash
kubectl get services -n local-kie-sandbox-dev-deployments
```

### Troubleshooting

#### No deployments showing in UI?

1. Verify kubectl can access your cluster:
```bash
kubectl get services -n local-kie-sandbox-dev-deployments
```

2. Check the Docker-specific kubeconfig:
```bash
# On macOS/Linux:
grep "server:" ~/.kube/config.docker

# On Windows (PowerShell):
Select-String "server:" $HOME\.kube\config.docker

# Should show: server: https://host.docker.internal:<PORT>
```

3. Test the kubeconfig:
```bash
# On macOS/Linux:
kubectl --kubeconfig ~/.kube/config.docker get services -n local-kie-sandbox-dev-deployments --insecure-skip-tls-verify

# On Windows (PowerShell):
kubectl --kubeconfig $HOME\.kube\config.docker get services -n local-kie-sandbox-dev-deployments --insecure-skip-tls-verify
```

#### Ollama connection errors?

1. Verify Ollama container is running:
```bash
docker ps --filter "name=bamoe-ollama"
```

2. Check Ollama container logs:
```bash
docker-compose logs ollama
```

3. Test Ollama API:
```bash
# On macOS/Linux:
curl http://localhost:11434/api/tags

# On Windows (PowerShell):
curl http://localhost:11434/api/tags
# or if curl is not available:
Invoke-WebRequest -Uri http://localhost:11434/api/tags
```

4. If Ollama container is not starting, restart services:
```bash
docker-compose down
docker-compose up -d
```

#### View application logs?

```bash
docker-compose logs -f
```

#### Port conflicts?

If port 3000 is in use, create a `.env` file:
```bash
# On macOS/Linux:
echo "PORT=3001" > .env

# On Windows (PowerShell):
"PORT=3001" | Out-File -FilePath .env -Encoding utf8
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

### Clean Up

To completely remove all containers and networks:

```bash
# Stop and remove containers
docker-compose down

# Also stop any dynamically created MCP servers
docker stop $(docker ps -q --filter "name=bamoe-mcp-server") 2>/dev/null || true
docker rm $(docker ps -aq --filter "name=bamoe-mcp-server") 2>/dev/null || true
```

### Configuration Reference

#### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Web application port | `3000` |
| `OLLAMA_MODEL` | Ollama model to use | `granite3.3:8b` |
| `BAMOE_HOST` | BAMOE server host | `host.docker.internal` |
| `K8S_NAMESPACE` | Kubernetes namespace for BAMOE deployments | `local-kie-sandbox-dev-deployments` |

**Note:** Ollama runs as a containerized service - no manual configuration needed!

### Distribution Package

For easy distribution to users, provide these files:
- `docker-compose.yml` - Main deployment file
- `.env.example` - Environment template
- `QUICKSTART.md` - This file (setup instructions)

Users only need these three files plus Docker and kubectl configured! Ollama is included automatically.

### Support

For issues or questions:
- Check the troubleshooting section above
- Review the main README.md for detailed architecture information
- Check Docker logs: `docker-compose logs -f`
