# Use Python 3.8 as the base image
FROM python:3.8-slim

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY apps/ai-server/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code and model files
COPY apps/ai-server/ /app/apps/ai-server/
COPY packages/models/model/ /app/packages/models/model/

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "apps.ai-server.main:app", "--host", "0.0.0.0", "--port", "8000"] 