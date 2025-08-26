package com.application.cv_application.response;

import java.time.LocalDate;

public record ApplicationResponse(
        Integer id,
        String applicationName,
        LocalDate appliedDate,
        LocalDate updatedDate,
        String status,
        String candidateFullName,
        String jopTitle
) {}

