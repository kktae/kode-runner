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

# ==============================================================================
# Certificate Manager (Next-Gen GCP SSL Management supporting Wildcards *.your-custom-domain.com)
# ==============================================================================

# 1. DNS Authorization for Certificate Manager Domain Validation
resource "google_certificate_manager_dns_authorization" "dns_auth" {
  depends_on  = [google_project_service.enabled_apis]
  name        = "${var.app_name}-dns-auth"
  description = "DNS Authorization for Wildcard SSL Certificate on ${var.domain_name}"
  domain      = var.domain_name
}

# 2. Certificate Manager Wildcard Managed SSL Certificate (*.your-custom-domain.com & your-custom-domain.com)
resource "google_certificate_manager_certificate" "wildcard_cert" {
  depends_on  = [google_project_service.enabled_apis]
  name        = "${var.app_name}-wildcard-cert"
  description = "Google-managed Wildcard SSL Certificate for ${var.domain_name} and subdomains"
  scope       = "DEFAULT"

  managed {
    domains = [
      var.domain_name,
      "*.${var.domain_name}"
    ]
    dns_authorizations = [
      google_certificate_manager_dns_authorization.dns_auth.id
    ]
  }
}

# 3. Certificate Map
resource "google_certificate_manager_certificate_map" "cert_map" {
  depends_on  = [google_project_service.enabled_apis]
  name        = "${var.app_name}-cert-map"
  description = "Certificate Map for ${var.domain_name} and subdomains"
}

# 4. Certificate Map Entries
resource "google_certificate_manager_certificate_map_entry" "cert_map_entry_main" {
  name         = "${var.app_name}-cert-map-entry-main"
  map          = google_certificate_manager_certificate_map.cert_map.name
  certificates = [google_certificate_manager_certificate.wildcard_cert.id]
  hostname     = var.domain_name
}

resource "google_certificate_manager_certificate_map_entry" "cert_map_entry_wildcard" {
  name         = "${var.app_name}-cert-map-entry-wildcard"
  map          = google_certificate_manager_certificate_map.cert_map.name
  certificates = [google_certificate_manager_certificate.wildcard_cert.id]
  hostname     = "*.${var.domain_name}"
}

# URL Map for HTTPS Traffic
resource "google_compute_url_map" "https_url_map" {
  name            = "${var.app_name}-https-url-map"
  default_service = google_compute_backend_service.lb_backend.id
}

# Target HTTPS Proxy using Certificate Map (Certificate Manager Integration)
resource "google_compute_target_https_proxy" "https_proxy" {
  name            = "${var.app_name}-https-proxy-v2"
  url_map         = google_compute_url_map.https_url_map.id
  certificate_map = "//certificatemanager.googleapis.com/${google_certificate_manager_certificate_map.cert_map.id}"

  depends_on = [
    google_certificate_manager_certificate_map_entry.cert_map_entry_main,
    google_certificate_manager_certificate_map_entry.cert_map_entry_wildcard
  ]

  lifecycle {
    create_before_destroy = true
  }
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
