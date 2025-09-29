package com.application.cv_application.services;

import com.application.cv_application.entities.Candidate;
import com.application.cv_application.entities.Employee;
import com.application.cv_application.enums.Position;
import com.application.cv_application.repositories.CandidateRepository;
import com.application.cv_application.repositories.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final EmployeeRepository employeeRepository;
    private final CandidateRepository candidateRepository;

    public void checkUser(OidcUser oidcUser) {
        String email = oidcUser.getEmail();
        String username = oidcUser.getPreferredUsername();

        // Extract Keycloak roles
        Collection<? extends GrantedAuthority> authorities = oidcUser.getAuthorities();
        List<String> roles = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .filter(r -> r.startsWith("ROLE_"))
                .map(r -> r.substring(5)) // remove ROLE_
                .toList();

        if (roles.contains("Director") || roles.contains("Manager")) {
            if (!employeeRepository.existsByEmail(email)) {
                Employee emp = new Employee();
                emp.setEmail(email);

                // Convert string role to enum
                Position pos = roles.contains("Director") ? Position.DIRECTOR : Position.MANAGER;
                emp.setPosition(pos);

                employeeRepository.save(emp);
            }
        } else {
            // Candidate case
            if (!candidateRepository.existsByEmail(email)) {
                Candidate cand = new Candidate();
                cand.setEmail(email);
                candidateRepository.save(cand);
            }
        }
    }
}

