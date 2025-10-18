package com.application.cv_application.mappers;

import com.application.cv_application.entities.Candidate;
import com.application.cv_application.requests.CandidateRequest;
import com.application.cv_application.response.CandidateResponse;
import org.springframework.stereotype.Component;

@Component
public class CandidateMapper {

    public CandidateResponse toResponse(Candidate candidate) {
        return CandidateResponse.builder()
                .id(candidate.getId())
                .fullName(candidate.getFirstName() + " " + candidate.getLastName())
                .phoneNumber(candidate.getPhoneNumber())
                .address(candidate.getAddress())
                .nationality(candidate.getNationality())
                .gender(candidate.getGender())
                .dateOfBirth(candidate.getDateOfBirth())
                .isActive(candidate.isActive())
                .build();
    }


    public Candidate toEntity(CandidateRequest request) {
        return Candidate.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phoneNumber(request.phoneNumber())
                .address(request.address())
                .nationality(request.nationality())
                .gender(request.gender())
                .dateOfBirth(request.dateOfBirth())
                .isActive(request.isActive())
                .build();
    }
}

