package com.application.cv_application.services;

import com.application.cv_application.entities.Application;
import com.application.cv_application.entities.Candidate;
import com.application.cv_application.entities.Jop;
import com.application.cv_application.mappers.ApplicationMapper;
import com.application.cv_application.repositories.ApplicationRepository;
import com.application.cv_application.repositories.CandidateRepository;
import com.application.cv_application.repositories.JopRepository;
import com.application.cv_application.requests.ApplicationRequest;
import com.application.cv_application.response.ApplicationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final JopRepository jopRepository;
    private final ApplicationMapper mapper;

    public List<ApplicationResponse> getAllApplications() {
        return applicationRepository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public ApplicationResponse getApplicationById(Integer id) {
        return applicationRepository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    public ApplicationResponse createApplication(ApplicationRequest request) {
        Candidate candidate = candidateRepository.findById(request.candidateId())
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        Jop jop = jopRepository.findById(request.jopId())
                .orElseThrow(() -> new RuntimeException("Jop not found"));

        Application application = mapper.toEntity(request, candidate, jop);
        return mapper.toResponse(applicationRepository.save(application));
    }

    public ApplicationResponse updateApplication(Integer id, ApplicationRequest request) {
        Application existing = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        Candidate candidate = candidateRepository.findById(request.candidateId())
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        Jop jop = jopRepository.findById(request.jopId())
                .orElseThrow(() -> new RuntimeException("Jop not found"));

        existing.setApplicationName(request.applicationName());
        existing.setAppliedDate(request.appliedDate());
        existing.setUpdatedDate(request.updatedDate());
        existing.setStatus(request.status());
        existing.setCandidate(candidate);
        existing.setJop(jop);

        return mapper.toResponse(applicationRepository.save(existing));
    }

    public void deleteApplication(Integer id) {
        applicationRepository.deleteById(id);
    }
}

