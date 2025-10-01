package com.application.cv_application.services;

import com.application.cv_application.entities.Candidate;
import com.application.cv_application.entities.Employee;
import com.application.cv_application.enums.Position;
import com.application.cv_application.repositories.CandidateRepository;
import com.application.cv_application.repositories.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final EmployeeRepository employeeRepository;
    private final CandidateRepository candidateRepository;

    public void checkUser(String email, String username, Collection<String> roles) {
        if (roles.contains("Director") || roles.contains("Manager")) {
            employeeRepository.findByEmail(email)
                    .orElseGet(() -> {
                        Employee emp = new Employee();
                        emp.setEmail(email);
                        emp.setPosition(roles.contains("Director") ? Position.DIRECTOR : Position.MANAGER);
                        return employeeRepository.save(emp);
                    });
        } else {
            candidateRepository.findByEmail(email)
                    .orElseGet(() -> {
                        Candidate cand = new Candidate();
                        cand.setEmail(email);
                        return candidateRepository.save(cand);
                    });
        }
    }
}

