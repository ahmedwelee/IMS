package com.application.cv_application.mappers;

import com.application.cv_application.entities.Application;
import com.application.cv_application.entities.Candidate;
import com.application.cv_application.entities.Jop;
import com.application.cv_application.repositories.CandidateRepository;
import com.application.cv_application.requests.ApplicationRequest;
import com.application.cv_application.response.ApplicationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ApplicationMapper {

    private final CandidateRepository candidateRepository;

    public ApplicationResponse toResponse(Application application) {
        return new ApplicationResponse(
                application.getId(),
                application.getApplicationName(),
                application.getAppliedDate(),
                application.getUpdatedDate(),
                application.getStatus(),
                application.getCandidate().getFullName(),
                application.getCvPath(),
                application.getJop().getJopName()
        );
    }

    public Application toEntity(ApplicationRequest request, Candidate candidate, Jop jop) {
         candidateRepository.findById(request.candidateId())
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        // Update candidate fields from request
        candidate.setFirstName(request.firstname());
        candidate.setLastName(request.lastname());
        candidate.setPhoneNumber(request.phoneNumber());
        candidate.setAddress(request.address());
        candidate.setNationality(request.nationality());
        candidate.setGender(request.gender());
        candidate.setDateOfBirth(request.dateOfBirth());

        return Application.builder()
                .appliedDate(request.appliedDate())
                .updatedDate(request.updatedDate())
                .status(request.status())
                .candidate(candidate)
                .jop(jop)
                .build();
    }
}

