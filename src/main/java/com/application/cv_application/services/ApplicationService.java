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
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

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
                .orElseThrow(() -> new EntityNotFoundException("Application not found"));
    }

    public ApplicationResponse createApplication(ApplicationRequest request) {
        Candidate candidate = candidateRepository.findById(request.candidateId())
                .orElseThrow(() -> new EntityNotFoundException("Candidate not found"));
        Jop jop = jopRepository.findById(request.jopId())
                .orElseThrow(() -> new EntityNotFoundException("Jop not found"));

        // modify candidate's information if needed


        Application application = mapper.toEntity(request, candidate, jop);
        // save the CV in the application
        return mapper.toResponse(applicationRepository.save(application));
    }

    public ApplicationResponse updateApplication(Integer id, ApplicationRequest request) {
        Application existing = applicationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Application not found"));

        Candidate candidate = candidateRepository.findById(request.candidateId())
                .orElseThrow(() -> new EntityNotFoundException("Candidate not found"));
        Jop jop = jopRepository.findById(request.jopId())
                .orElseThrow(() -> new EntityNotFoundException("Jop not found"));
        
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

    public List<ApplicationResponse> getApplicationsByStatus(String status) {
        return applicationRepository.findByStatus(status).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getApplicationsByCandidate(Integer candidateId) {
        return applicationRepository.findByCandidateId(candidateId).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getApplicationsByJob(Integer jopId) {
        return applicationRepository.findByJopId(jopId).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> searchApplications(String query) {
        return applicationRepository.searchApplications(query).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public int getCount() {
        return (int) applicationRepository.count();
    }
}

