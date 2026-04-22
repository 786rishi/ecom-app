package com.example.userservice.convertor;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.*;

public class KeycloakRoleConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        // 🔥 1. Extract REALM roles (optional)
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess != null && realmAccess.get("roles") != null) {
            List<String> roles = (List<String>) realmAccess.get("roles");
            roles.forEach(role ->
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + role))
            );
        }

        // 🔥 2. Extract CLIENT roles (IMPORTANT for your case)
        Map<String, Object> resourceAccess = jwt.getClaim("resource_access");

        if (resourceAccess != null) {
            Map<String, Object> client = (Map<String, Object>) resourceAccess.get("fb-login");

            if (client != null && client.get("roles") != null) {
                List<String> roles = (List<String>) client.get("roles");

                roles.forEach(role ->
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + role))
                );
            }
        }

        return new JwtAuthenticationToken(jwt, authorities);
    }
}

//public class KeycloakRoleConverter implements Converter<Jwt, AbstractAuthenticationToken> {
//
//    @Override
//    public AbstractAuthenticationToken convert(Jwt jwt) {
//
//        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
//
//        Collection<String> roles = new ArrayList<>();
//
//        if (realmAccess != null && realmAccess.containsKey("roles")) {
//            roles = (Collection<String>) realmAccess.get("roles");
//        }
//
//        List authorities = roles.stream()
//                .map(role -> "ROLE_" + role)
//                .map(org.springframework.security.core.authority.SimpleGrantedAuthority::new)
//                .collect(Collectors.toList());
//
//        return new JwtAuthenticationToken(jwt, authorities);
//    }
//}
