# ═══════════════════════════════════════════════════════════════
#  seek. Search Engine — Multi-stage Docker Build
#  Stage 1: Build frontend (Node)
#  Stage 2: Build backend  (Gradle + Java 21)
#  Stage 3: Production runtime (JRE 21)
# ═══════════════════════════════════════════════════════════════

# ── Stage 1: Build Frontend ─────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ .
RUN npm run build

# ── Stage 2: Build Backend ──────────────────────────────────
FROM gradle:8.5-jdk21 AS backend-build
WORKDIR /app
COPY build.gradle settings.gradle gradlew ./
COPY gradle/ gradle/
# Download dependencies first (layer caching)
RUN gradle dependencies --no-daemon || true
COPY src/ src/
# Copy frontend build into Spring Boot static resources
COPY --from=frontend-build /app/frontend/dist/ src/main/resources/static/
RUN gradle bootJar --no-daemon -x test

# ── Stage 3: Production Runtime ─────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the built JAR
COPY --from=backend-build /app/build/libs/*.jar app.jar

# Set ownership
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port (Railway/Render will set PORT env var)
EXPOSE 8080

# JVM tuning for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar --server.port=${PORT:-8080}"]
