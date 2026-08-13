#!/usr/bin/env bash

set -e

# Region and naming configuration
REGION="asia-northeast3"
APP_NAME="kode-runner"
TERRAFORM_DIR="terraform"

echo "=== Kode Runner GCP Deployment Script ==="

# Check gcloud CLI
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed."
    exit 1
fi

# Get GCP Project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")

if [ -z "$PROJECT_ID" ]; then
    read -p "Enter your GCP Project ID: " PROJECT_ID
fi

echo "Target GCP Project ID: ${PROJECT_ID}"
echo "Target GCP Region: ${REGION}"

TAG_SUFFIX=$(date +%Y%m%d%H%M%S)
IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${APP_NAME}-repo/${APP_NAME}-app:${TAG_SUFFIX}"
IMAGE_LATEST="${REGION}-docker.pkg.dev/${PROJECT_ID}/${APP_NAME}-repo/${APP_NAME}-app:latest"

echo "Step 1/4: Authenticating Docker with Artifact Registry..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

echo "Step 2/4: Building Docker image without cache for linux/amd64 (${IMAGE_TAG})..."
docker build --no-cache --platform linux/amd64 -t "${IMAGE_TAG}" -t "${IMAGE_LATEST}" .

echo "Step 3/4: Pushing Docker image to Artifact Registry..."
docker push "${IMAGE_TAG}"
docker push "${IMAGE_LATEST}"

echo "Step 4/4: Running Terraform Infrastructure Apply..."
cd "${TERRAFORM_DIR}"
terraform init
terraform apply -var="gcp_project_id=${PROJECT_ID}" -var="gcp_region=${REGION}" -var="app_name=${APP_NAME}" -var="container_image=${IMAGE_TAG}" -auto-approve

echo ""
echo "=== Deployment Completed Successfully! ==="
echo "Cloud Run Direct URL:"
terraform output -raw cloud_run_service_url || true
echo ""
echo "Global External Load Balancer Static IP:"
terraform output -raw load_balancer_ip || true
echo ""
echo "Custom Domain URL:"
terraform output -raw custom_domain_url || true
echo ""
echo "DNS A-Record Configuration Guide:"
echo "Please set your DNS provider A-Record for 'your-custom-domain.com' and Wildcard '*.your-custom-domain.com' to the Global Load Balancer Static IP above."
echo ""
echo "Wildcard SSL Certificate Manager CNAME Validation Record:"
terraform output -json dns_authorization_cname_record || true
echo ""
