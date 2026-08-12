# Enable required GCP APIs
resource "google_project_service" "enabled_apis" {
  for_each = toset([
    "run.googleapis.com",
    "redis.googleapis.com",
    "artifactregistry.googleapis.com",
    "vpcaccess.googleapis.com",
    "compute.googleapis.com"
  ])

  service            = each.key
  disable_on_destroy = false
}

# Artifact Registry Repository for Docker Images
resource "google_artifact_registry_repository" "app_repo" {
  depends_on    = [google_project_service.enabled_apis]
  location      = var.gcp_region
  repository_id = "${var.app_name}-repo"
  description   = "Docker repository for Kode Runner application"
  format        = "DOCKER"
}

# VPC Network
resource "google_compute_network" "vpc_network" {
  depends_on              = [google_project_service.enabled_apis]
  name                    = "${var.app_name}-vpc"
  auto_create_subnetworks = false
}

# Subnet for Serverless VPC Access & Services
resource "google_compute_subnetwork" "vpc_subnet" {
  name          = "${var.app_name}-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.gcp_region
  network       = google_compute_network.vpc_network.id
}

# Serverless VPC Access Connector (Optimized for 400 CCU WebSocket Sync Traffic)
resource "google_vpc_access_connector" "vpc_connector" {
  depends_on    = [google_project_service.enabled_apis]
  name          = "${var.app_name}-vpc-conn"
  region        = var.gcp_region
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.vpc_network.name
  min_instances = 2
  max_instances = 10
  machine_type  = "e2-micro"
}

# Memorystore for Redis (1GB Basic Tier - Handles 50k+ OPS for 400 CCU Pub/Sub Sync)
resource "google_redis_instance" "redis_instance" {
  depends_on         = [google_project_service.enabled_apis]
  name               = "${var.app_name}-redis"
  tier               = "BASIC"
  memory_size_gb     = 1
  region             = var.gcp_region
  authorized_network = google_compute_network.vpc_network.id
  redis_version      = "REDIS_7_0"
  display_name       = "Kode Runner Redis Instance"

  redis_configs = {
    maxmemory-policy = "allkeys-lru"
    timeout          = "300"
  }
}

# Cloud Run v2 Service (Scaled & Sized for Max 400 CCU)
resource "google_cloud_run_v2_service" "cloud_run_app" {
  depends_on = [
    google_project_service.enabled_apis,
    google_redis_instance.redis_instance,
    google_vpc_access_connector.vpc_connector
  ]

  name     = "${var.app_name}-service"
  location = var.gcp_region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    # Set max 100 concurrent WebSocket connections per Cloud Run container
    max_instance_request_concurrency = 100

    vpc_access {
      connector = google_vpc_access_connector.vpc_connector.id
      egress    = "PRIVATE_RANGES_ONLY"
    }

    scaling {
      # Min 2 active instances = 200 CCU baseline capacity with zero cold starts
      min_instance_count = 2
      # Max 10 instances = Scale up to 1,000 CCU peak headroom
      max_instance_count = 10
    }

    containers {
      image = length(var.container_image) > 0 ? var.container_image : "${var.gcp_region}-docker.pkg.dev/${var.gcp_project_id}/${google_artifact_registry_repository.app_repo.repository_id}/${var.app_name}-app:latest"

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = "2000m"  # 2 vCPU per instance for high-throughput Socket.io event loop
          memory = "1024Mi" # 1 GiB RAM
        }
        cpu_idle = false # Always-allocated CPU for zero latency persistent WebSockets
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "REDIS_HOST"
        value = google_redis_instance.redis_instance.host
      }

      env {
        name  = "REDIS_PORT"
        value = tostring(google_redis_instance.redis_instance.port)
      }
    }
  }
}

# Allow public unauthenticated access to Cloud Run app
resource "google_cloud_run_v2_service_iam_member" "public_access" {
  project  = google_cloud_run_v2_service.cloud_run_app.project
  location = google_cloud_run_v2_service.cloud_run_app.location
  name     = google_cloud_run_v2_service.cloud_run_app.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
