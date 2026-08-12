output "artifact_registry_repository_url" {
  description = "Docker repository URL in Artifact Registry"
  value       = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project_id}/${google_artifact_registry_repository.app_repo.repository_id}"
}

output "cloud_run_service_url" {
  description = "Public URL of the deployed Cloud Run service"
  value       = google_cloud_run_v2_service.cloud_run_app.uri
}

output "redis_host" {
  description = "Private IP host of Memorystore for Redis"
  value       = google_redis_instance.redis_instance.host
}

output "redis_port" {
  description = "Port of Memorystore for Redis"
  value       = google_redis_instance.redis_instance.port
}
