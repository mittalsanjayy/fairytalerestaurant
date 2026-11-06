FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
RUN useradd --create-home --uid 1001 app && mkdir -p /app/instance /app/uploads && chown -R app /app
USER app

EXPOSE 8000
# Creates any missing tables (safe to repeat), then starts the server.
CMD ["sh", "-c", "python scripts/init_db.py && exec gunicorn -c gunicorn.conf.py wsgi:app"]
