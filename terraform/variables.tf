variable "gcp_project_id" {
  type        = string
  description = "GCP Project ID where resources will be deployed"
}

variable "gcp_region" {
  type        = string
  description = "GCP Region for deployment"
  default     = "asia-northeast3" # Seoul Region
}

variable "app_name" {
  type        = string
  description = "Application and resource naming prefix"
  default     = "kode-runner"
}

variable "container_image" {
  type        = string
  description = "Artifact Registry Docker image path (e.g. asia-northeast3-docker.pkg.dev/PROJECT_ID/kode-runner-repo/kode-runner-app:latest)"
  default     = ""
}
