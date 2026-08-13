# Global External Static IP Address for Load Balancer
resource "google_compute_global_address" "lb_ip" {
  name        = "${var.app_name}-lb-ip"
  description = "Global static IP address for ${var.app_name} Load Balancer"
}

# Serverless Network Endpoint Group (Serverless NEG) pointing to Cloud Run Service
resource "google_compute_region_network_endpoint_group" "serverless_neg" {
  name                  = "${var.app_name}-serverless-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.gcp_region

  cloud_run {
    service = google_cloud_run_v2_service.cloud_run_app.name
  }
}

# Backend Service for Cloud Load Balancer
resource "google_compute_backend_service" "lb_backend" {
  name                  = "${var.app_name}-backend-service"
  protocol              = "HTTPS"
  port_name             = "http"
  load_balancing_scheme = "EXTERNAL_MANAGED"

  backend {
    group = google_compute_region_network_endpoint_group.serverless_neg.id
  }

  log_config {
    enable      = true
    sample_rate = 1.0
  }
}

# Google Managed SSL Certificate for Custom Domain (your-custom-domain.com, www, and mzs)
resource "google_compute_managed_ssl_certificate" "lb_ssl_cert" {
  name = "${var.app_name}-managed-ssl-cert-v2"

  managed {
    domains = [
      var.domain_name,
      "www.${var.domain_name}",
      "mzs.${var.domain_name}"
    ]
  }

  lifecycle {
    create_before_destroy = true
  }
}

# URL Map for HTTPS Traffic
resource "google_compute_url_map" "https_url_map" {
  name            = "${var.app_name}-https-url-map"
  default_service = google_compute_backend_service.lb_backend.id
}

# Target HTTPS Proxy
resource "google_compute_target_https_proxy" "https_proxy" {
  name             = "${var.app_name}-https-proxy"
  url_map          = google_compute_url_map.https_url_map.id
  ssl_certificates = [google_compute_managed_ssl_certificate.lb_ssl_cert.id]
}

# Global Forwarding Rule for HTTPS (Port 443)
resource "google_compute_global_forwarding_rule" "https_forwarding_rule" {
  name                  = "${var.app_name}-https-forwarding-rule"
  ip_protocol           = "TCP"
  port_range            = "443"
  target                = google_compute_target_https_proxy.https_proxy.id
  ip_address            = google_compute_global_address.lb_ip.id
  load_balancing_scheme = "EXTERNAL_MANAGED"
}

# URL Map for HTTP to HTTPS Redirect
resource "google_compute_url_map" "http_redirect_url_map" {
  name = "${var.app_name}-http-redirect-url-map"

  default_url_redirect {
    https_redirect = true
    strip_query    = false
  }
}

# Target HTTP Proxy for Redirect
resource "google_compute_target_http_proxy" "http_redirect_proxy" {
  name    = "${var.app_name}-http-redirect-proxy"
  url_map = google_compute_url_map.http_redirect_url_map.id
}

# Global Forwarding Rule for HTTP (Port 80 -> Redirects to 443)
resource "google_compute_global_forwarding_rule" "http_redirect_forwarding_rule" {
  name                  = "${var.app_name}-http-redirect-forwarding-rule"
  ip_protocol           = "TCP"
  port_range            = "80"
  target                = google_compute_target_http_proxy.http_redirect_proxy.id
  ip_address            = google_compute_global_address.lb_ip.id
  load_balancing_scheme = "EXTERNAL_MANAGED"
}
