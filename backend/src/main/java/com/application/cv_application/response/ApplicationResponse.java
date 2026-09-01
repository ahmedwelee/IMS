package com.application.cv_application.response;

import java.time.LocalDate;

public record ApplicationResponse(
        Integer id,
        LocalDate appliedDate,
        LocalDate updatedDate,
        String candidateFullName,
        String jopName,
        String status,
        String phoneNumber,
        String address,
        String nationality,
        String gender,
        LocalDate dateOfBirth,
        String cvPath,
        Integer candidateId,
        Integer jobId
) {}

