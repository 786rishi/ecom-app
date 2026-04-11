import Keycloak, { KeycloakInstance } from "keycloak-js";

const keycloak: KeycloakInstance = new (Keycloak as any)({
  url: "http://localhost:8080",
  realm: "master",
  clientId: "fb-login",
});
export default keycloak;
