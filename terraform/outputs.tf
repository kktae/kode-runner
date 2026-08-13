output "artifact_registry_repository_url" {
  description = "Docker repository URL in Artifact Registry"
  value       = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project_id}/${google_artifact_registry_repository.app_repo.repository_id}"
}

output "cloud_run_service_url" {
  description = "Direct URL of the deployed Cloud Run service"
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

output "load_balancer_ip" {
  description = "Global Static IP address assigned to External Application Load Balancer"
  value       = google_compute_global_address.lb_ip.address
}

output "custom_domain_url" {
  description = "HTTPS URL for Custom Domain"
  value       = "https://${var.domain_name}"
}

output "dns_authorization_cname_record" {
  description = "DNS CNAME Record required for Wildcard Certificate Manager Validation"
  value = {
    name  = google_certificate_manager_dns_authorization.dns_auth.dns_resource_record[0].name
    type  = google_certificate_manager_dns_authorization.dns_auth.dns_resource_record[0].type
    value = google_certificate_manager_dns_authorization.dns_auth.dns_resource_record[0].data
  }
}
