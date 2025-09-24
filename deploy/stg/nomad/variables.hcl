resources = {
  cpu    = 500,
  memory = 256
}

healthcheck = {
  path     = "/healthcheck",
  protocol = "https"
}

upstreams = [
  { name = "app-webapp", port = 3000 },
  { name = "service-internal-api", port = 10002 },
  { name = "app-studiescenter", port = 20000 },
  { name = "service-localization", port = 4000 },
  { name = "app-auth", port = 10010 },
  { name = "service-redirect-manager", port = 3015 }
]

basic_auth = {}