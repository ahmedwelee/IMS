package com.application.cv_application.requests;

import java.time.LocalDate;

public record ApplicationRequest(
        LocalDate appliedDate,
        LocalDate updatedDate,
        Integer candidateId,
        Integer jopId,
        String status,
        String firstname,
        String lastname,
        String phoneNumber,
        String address,
        String nationality,
        String gender,
        LocalDate dateOfBirth
) {}

