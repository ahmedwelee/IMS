package com.application.cv_application.services;

import com.application.cv_application.entities.Candidate;
import com.application.cv_application.repositories.CandidateRepository;
import com.application.cv_application.repositories.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.Collection;

@Service
@RequiredArgsConstructor
public class UserService {

    private final EmployeeRepository employeeRepository;
    private final CandidateRepository candidateRepository;

    public void checkUser(OidcUser oidcUser) {
        String username = oidcUser.getPreferredUsername(); // or oidcUser.getName()
        String email = oidcUser.getEmail();

        // extract roles from Keycloak token
        Collection<? extends GrantedAuthority> authorities = oidcUser.getAuthorities();
        String role = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .filter(r -> r.startsWith("ROLE_")) // Spring prefixes roles
                .map(r -> r.substring(5))          // remove "ROLE_"
                .findFirst()
                .orElse("candidate"); // default fallback

        // Check DB
        if (employeeRepository.existsByEmail(email)) {
            // already registered → do nothing
            return;
        }

        // Register new user
        Candidate user = new Candidate();
        user.setEmail(email);
         // store Keycloak role in your DB
        candidateRepository.save(user);
    }
}

