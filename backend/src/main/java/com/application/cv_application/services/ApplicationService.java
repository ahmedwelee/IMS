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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;


@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final JopRepository jopRepository;
    private final FileStorageService fileStorageService;
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
        candidateRepository.save(application.getCandidate());
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

    public void uploadApplicationCv(Integer applicationId, MultipartFile file) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new EntityNotFoundException("No application found with ID:: " + applicationId));

        // Save file using your FileStorageService (same as book cover logic)
        String cvPath = fileStorageService.saveFile(file, "application_" + applicationId);

        application.setCvPath(cvPath); // assuming Application entity has `cv` field
        applicationRepository.save(application);
    }



    public Resource getApplicationCv(Integer applicationId) {

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new EntityNotFoundException("Application not found"));

        String cvFilename = application.getCvPath();

        if (cvFilename == null || cvFilename.isBlank()) {
            throw new EntityNotFoundException("CV not uploaded for this application");
        }

        // ✅ Delegate to FileStorageService
        return fileStorageService.loadFile(cvFilename);
    }


}

