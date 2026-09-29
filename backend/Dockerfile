# ==============================================================================
# EstateVal AI - Production Backend Container
# ==============================================================================
FROM python:3.11-slim

WORKDIR /app

# Prevent Python from writing pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=5000

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy application assets
COPY app.py .
COPY estate_model.pkl .
COPY model_metadata.json .
COPY model.pkl .
COPY mean_std.json .

EXPOSE 5000

# Run with Gunicorn WSGI server for production concurrency
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "3", "--timeout", "120", "app:app"]
