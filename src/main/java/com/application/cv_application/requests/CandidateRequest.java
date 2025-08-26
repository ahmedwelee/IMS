package com.application.cv_application.requests;

import java.time.LocalDate;

public record CandidateRequest(
        String firstName,
        String lastName,
        String phoneNumber,
        String address,
        String nationality,
        String gender,
        LocalDate dateOfBirth,
        String cvPath
) {}

