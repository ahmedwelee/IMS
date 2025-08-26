package com.application.cv_application.services;

import com.application.cv_application.entities.Candidate;
import com.application.cv_application.mappers.CandidateMapper;
import com.application.cv_application.repositories.CandidateRepository;
import com.application.cv_application.requests.CandidateRequest;
import com.application.cv_application.response.CandidateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final CandidateMapper mapper;

    public List<CandidateResponse> getAllCandidates() {
        return candidateRepository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public CandidateResponse getCandidateById(Integer id) {
        return candidateRepository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
    }

    public CandidateResponse createCandidate(CandidateRequest request) {
        Candidate candidate = mapper.toEntity(request);
        return mapper.toResponse(candidateRepository.save(candidate));
    }

    public CandidateResponse updateCandidate(Integer id, CandidateRequest request) {
        Candidate existing = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        existing.setFirstName(request.firstName());
        existing.setLastName(request.lastName());
        existing.setPhoneNumber(request.phoneNumber());
        existing.setAddress(request.address());
        existing.setNationality(request.nationality());
        existing.setGender(request.gender());
        existing.setDateOfBirth(request.dateOfBirth());
        existing.setCvPath(request.cvPath());

        return mapper.toResponse(candidateRepository.save(existing));
    }

    public void deleteCandidate(Integer id) {
        candidateRepository.deleteById(id);
    }
}

