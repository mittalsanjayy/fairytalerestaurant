"""Gunicorn settings. One worker with several threads by default: in-memory rate limits stay
exact (they are per process). Raise WEB_CONCURRENCY only together with a Redis
RATELIMIT_STORAGE_URI."""

import os

bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"
workers = int(os.getenv("WEB_CONCURRENCY", "1"))
threads = int(os.getenv("WEB_THREADS", "4"))
worker_class = "gthread"
timeout = 30
graceful_timeout = 20
keepalive = 5
accesslog = "-"
errorlog = "-"
forwarded_allow_ips = "*"  # only reachable through the reverse proxy inside the compose network
