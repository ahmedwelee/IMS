package com.application.cv_application.mappers;

import com.application.cv_application.entities.Application;
import com.application.cv_application.entities.Candidate;
import com.application.cv_application.entities.Jop;
import com.application.cv_application.requests.ApplicationRequest;
import com.application.cv_application.response.ApplicationResponse;
import org.springframework.stereotype.Component;

@Component
public class ApplicationMapper {

    public ApplicationResponse toResponse(Application application) {
        return new ApplicationResponse(
                application.getId(),
                application.getApplicationName(),
                application.getAppliedDate(),
                application.getUpdatedDate(),
                application.getStatus(),
                application.getCandidate().getFullName(),
                application.getJop().getJopName()
        );
    }

    public Application toEntity(ApplicationRequest request, Candidate candidate, Jop jop) {
        return Application.builder()
                .applicationName(request.applicationName())
                .appliedDate(request.appliedDate())
                .updatedDate(request.updatedDate())
                .status(request.status())
                .candidate(candidate)
                .jop(jop)
                .build();
    }
}

