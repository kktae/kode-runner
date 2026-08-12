variable "gcp_project_id" {
  type        = string
  description = "GCP Project ID where resources will be deployed"

  validation {
    condition     = length(var.gcp_project_id) > 0
    error_message = "The gcp_project_id variable must not be empty."
  }
}

variable "gcp_region" {
  type        = string
  description = "GCP Region for deployment"
  default     = "asia-northeast3" # Seoul Region

  validation {
    condition     = can(regex("^[a-z]+-[a-z]+[0-9]+$", var.gcp_region))
    error_message = "The gcp_region variable must be a valid GCP region name (e.g. asia-northeast3)."
  }
}

variable "app_name" {
  type        = string
  description = "Application and resource naming prefix"
  default     = "kode-runner"
}

variable "container_image" {
  type        = string
  description = "Artifact Registry Docker image path"
  default     = ""
}

variable "environment" {
  type        = string
  description = "Deployment environment name"
  default     = "production"
}

variable "domain_name" {
  type        = string
  description = "Custom domain name for Cloud Load Balancer and Managed SSL Certificate"
  default     = "your-custom-domain.com"
}
