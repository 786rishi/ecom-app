import Keycloak, { KeycloakInstance } from "keycloak-js";

const keycloakUrl = process.env.REACT_APP_KEYCLOAK_BASE_URL || "http://localhost:8080";
console.log('Keycloak URL from environment:', keycloakUrl);

const keycloak: KeycloakInstance = new (Keycloak as any)({
  url: keycloakUrl,
  realm: "master",
  clientId: "fb-login",
});
export default keycloak;
