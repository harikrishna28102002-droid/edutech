# -------------------------------------------------------------
# Hardened Ephemeral Docker Sandbox for Executing FastAPI Code
# Non-root user, minimal footprint, pre-installed FastAPI test suite
# -------------------------------------------------------------

FROM python:3.11-slim

# Create unprivileged sandbox user
RUN groupadd -g 10001 sandbox && \
    useradd -u 10001 -g sandbox -m -d /sandbox -s /bin/sh sandbox

WORKDIR /sandbox

# Install pre-built FastAPI test dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Secure file permissions
RUN chown -R sandbox:sandbox /sandbox

# Drop root privileges permanently
USER sandbox:sandbox

# Set Python unbuffered mode for real-time streaming output
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

ENTRYPOINT ["python", "-u"]
CMD ["-"]
