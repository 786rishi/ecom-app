FROM amazoncorretto:17-alpine
RUN apk add --no-cache curl

RUN apk add --no-cache curl openssl

# Copy cert
COPY server.crt /tmp/server.crt

# Import into JVM truststore

RUN keytool -importcert \
    -alias keycloak \
    -file /tmp/server.crt \
    -keystore /usr/lib/jvm/java-17-amazon-corretto/lib/security/cacerts \
    -storepass changeit \
    -noprompt

COPY target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]