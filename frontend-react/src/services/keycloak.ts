import Keycloak, { KeycloakInstance } from "keycloak-js";

const keycloak: KeycloakInstance = new (Keycloak as any)({
  url: process.env.REACT_APP_KEYCLOAK_BASE_URL || "http://localhost:8080",
  realm: "master",
  clientId: "fb-login",
});
export default keycloak;
