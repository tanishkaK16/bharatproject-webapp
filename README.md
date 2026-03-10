# 👁️ ViksitNetra - Sovereign Intelligence Platform

ViksitNetra is a production-grade, multi-node, GPU-accelerated Sovereign AI Platform built to unify massive volumes of fragmented government data across state sectors into an intelligent, interactive command center. 

This repository contains the full Dockerized microservice architecture ready for hyperscale deployment.

## 🚀 Live Demo URLs (Preview Deployments)
*Since the actual Yotta Shakti cluster serves verified government intra-nets, this preview has been mapped to free-tier cloud environments for immediate validation.*
- **Render.com Cloud App:** `https://viksitnetra-agentic-demo.onrender.com`
- **Render.com API:** `https://viksitnetra-agentic-backend.onrender.com/api/docs`
*(Note: Initial boot might take ~50 seconds as Render free instances spin up from standby).*

---

## 🇮🇳 Yotta Shakti Cluster 5-Minute Deployment Guide

Follow these steps to deploy ViksitNetra directly into a verified Indian Sovereign Node (e.g., Yotta Data Services D1 Campus).

### **Prerequisites**
- Yotta `kubectl` cluster access with namespace `viksitnetra-prod`
- NVIDIA GPU pool allocated (Nvidia H100s for inference)
- Yotta Cloud Secrets configured: `viksitnetra-secrets` (holds Neo4j & Proxy passwords)

### **Step 1: Apply Configurations & Databases**
Deploy the base configuration, in-memory cache, and the Graph DB node.
```bash
kubectl apply -f deploy/k8s/configmap.yaml
kubectl apply -f deploy/k8s/redis.yaml
kubectl apply -f deploy/k8s/neo4j.yaml
```

### **Step 2: Start The GPU-Accelerated FastAPI Backend**
This step mounts sovereign LLMs via the NVIDIA container runtime explicitly mapped in the Deployments.
```bash
kubectl apply -f deploy/k8s/deployment.yaml
kubectl apply -f deploy/k8s/service.yaml
```

### **Step 3: Map The Ingress routing & Auto-Scale**
Expose the platform via Nginx Reverse-Proxy to the `gov.in` domain and initiate scaling.
```bash
kubectl apply -f deploy/k8s/ingress.yaml
kubectl apply -f deploy/k8s/hpa.yaml
```

### **Step 4: Verify Sovereign Rollout**
Confirm the HPA targets and GPU allocations are actively scheduling.
```bash
kubectl get pods -n viksitnetra-prod -w
kubectl get hpa -n viksitnetra-prod
```
Once the Pods emit `Running`, ViksitNetra is live.

---

## 🐙 Pushing to GitHub & Activating CI/CD

The repository is built following GitHub Actions CI/CD. The `/deploy/docker` mapping pushes straight into `index.docker.shakti.yotta.in`.

1. **Initialize & Commit your Local Build:**
```bash
git init
git add .
git commit -m "feat: Production-ready GraphRAG Sovereign AI Deployment"
```

2. **Connect to your Government VC Repository:**
```bash
git remote add origin https://github.com/my-gov-organization/viksitnetra.git
git branch -M main
```

3. **Deploy via Action Triggers:**
```bash
git push -u origin main
```
*The `.github/workflows/deploy.yml` pipeline will immediately spin up, compile the Python3.11/Node containers, auto-inject Neo4j credentials, and execute a secure Kube rollout against the Shakti endpoints.*
