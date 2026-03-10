# 👁️ ViksitNetra - Sovereign Intelligence Platform

ViksitNetra is a production-grade, multi-node, GPU-accelerated Sovereign AI Platform built to unify massive volumes of fragmented government data across state sectors into an intelligent, interactive command center.

This repository contains a **FastAPI + Neo4j + Redis + GraphRAG** stack, fully containerized and ready for **Yotta Shakti sovereign cloud** and instant **Render.com** demos.

---

## 🚀 One‑Click Render Deployment (Instant Public Demo)

- **Recommended Render service type**: `Web Service` (Docker)
- **Runtime**: `Free` tier, `Auto deploy` from GitHub

### **Step 1 – Push this repo to GitHub**

```bash
git init
git add .
git commit -m "feat: viksitnetra sovereign graphrag platform"
git branch -M main
git remote add origin https://github.com/<your-github-user>/viksitnetra.git
git push -u origin main
```

### **Step 2 – Create Render Backend Service (Docker)**

1. Log in to Render and select **New → Web Service**.
2. Connect your GitHub repository `viksitnetra`.
3. In **Environment**, choose:
   - **Build Command**: *(leave empty – Docker auto-builds)*
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2`
4. In **Instance Type**, keep `Free`.
5. Set environment variables:

```text
NEO4J_URI=neo4j://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=sovereign_secret
REDIS_URL=redis://redis:6379/0
ENVIRONMENT=render
```

6. Click **Create Web Service** and wait until status is `Live`.

The **public URL** (for example, `https://viksitnetra-backend.onrender.com`) will be shown on the Render dashboard; open `/api/docs` on that URL for Swagger UI.

> Note: From this environment I cannot authenticate to your Render account, so you must click through the steps above to obtain the exact live URL.

---

## 🇮🇳 Yotta Shakti Deployment Guide (Shakti Cluster, `viksitnetra-prod`)

### **Prerequisites**

- **Kubernetes access** to your Yotta Shakti cluster (`kubectl` configured).
- **Namespace** `viksitnetra-prod` available (workflow will create it if missing).
- **NVIDIA GPU pool** (H100 / L40S) with the **NVIDIA device plugin** enabled.
- **Secrets**:
  - `viksitnetra-secrets` in `viksitnetra-prod` with:
    - `neo4j-password`
    - `neo4j-auth-string`

### **Step 1 – Apply Config & Data Services**

```bash
kubectl create namespace viksitnetra-prod || true

kubectl apply -f deploy/k8s/configmap.yaml
kubectl apply -f deploy/k8s/redis.yaml
kubectl apply -f deploy/k8s/neo4j.yaml
```

### **Step 2 – Deploy GPU‑Accelerated Backend & Frontend**

```bash
kubectl apply -f deploy/k8s/deployment.yaml
kubectl apply -f deploy/k8s/service.yaml
```

The backend deployment requests `nvidia.com/gpu` resources suitable for **H100/L40S** pools on Shakti.

### **Step 3 – Expose via Ingress & Enable Auto‑Scaling**

```bash
kubectl apply -f deploy/k8s/ingress.yaml
kubectl apply -f deploy/k8s/hpa.yaml
```

### **Step 4 – Verify Sovereign Rollout**

```bash
kubectl get pods -n viksitnetra-prod -w
kubectl get hpa -n viksitnetra-prod
```

Once Pods are `Running` and the Ingress is provisioned, ViksitNetra is live on your Yotta Shakti sovereign cluster.

---

## 🐙 GitHub CI/CD to Yotta Shakti

The repository includes `.github/workflows/ci-cd.yml` which:

- Builds and pushes **GPU-ready backend** and **frontend** images to `index.docker.shakti.yotta.in`.
- Applies all manifests in `deploy/k8s/` to the `viksitnetra-prod` namespace.

### **Secrets required in GitHub**

- **`YOTTA_USERNAME` / `YOTTA_PASSWORD`**: credentials for the Yotta Shakti container registry.
- **`YOTTA_KUBECONFIG`**: base64‑encoded kubeconfig with access to the Shakti cluster.

Once configured, a simple:

```bash
git push origin main
```

will trigger the CI/CD workflow and perform a full rollout to the Shakti cluster.

