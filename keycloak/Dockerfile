FROM quay.io/keycloak/keycloak:latest

# Set admin credentials
ENV KEYCLOAK_ADMIN=admin
ENV KEYCLOAK_ADMIN_PASSWORD=admin

# Enable DEBUG logging
ENV KC_LOG_LEVEL=DEBUG

# Optional: more detailed category logs (VERY useful for your case)
ENV KC_LOG_LEVEL_ORG_KEYCLOAK_BROKER=DEBUG
ENV KC_LOG_LEVEL_ORG_KEYCLOAK_SOCIAL=DEBUG

# Expose port
EXPOSE 8080

# Start Keycloak in dev mode
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start-dev"]