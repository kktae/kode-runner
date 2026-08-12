# Dedicated Service Account for Cloud Run (Google Cloud Least Privilege Best Practice)
resource "google_service_account" "cloud_run_sa" {
  account_id   = "${var.app_name}-cloud-run-sa"
  display_name = "Cloud Run Service Account for ${var.app_name}"
  description  = "Dedicated least-privilege service account for Cloud Run service"
}

# Grant Logging Writer role for Cloud Logging
resource "google_project_iam_member" "cloud_run_logging" {
  project = var.gcp_project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# Grant Artifact Registry Reader role for pulling container images
resource "google_project_iam_member" "cloud_run_artifact_reader" {
  project = var.gcp_project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}
