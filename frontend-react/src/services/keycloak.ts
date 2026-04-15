import Keycloak, { KeycloakInstance } from "keycloak-js";

const keycloakUrl = process.env.REACT_APP_KEYCLOAK_BASE_URL || "http://localhost:8080";
console.log('Keycloak URL from environment:', keycloakUrl);

const keycloak: KeycloakInstance = new (Keycloak as any)({
  url: keycloakUrl,
  realm: "master",
  clientId: "fb-login",
  // Ensure proper SSL settings for localhost development
  sslRequired: "none",
  // Enable public client mode (no client secret)
  publicClient: true,
  // Configure redirect URIs
  redirectUri: window.location.origin,
  // Enable logging in development
  enableLogging: process.env.NODE_ENV === "development"
});
export default keycloak;
