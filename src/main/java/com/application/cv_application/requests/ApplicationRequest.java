package com.application.cv_application.requests;

import java.time.LocalDate;

public record ApplicationRequest(
        String applicationName,
        LocalDate appliedDate,
        LocalDate updatedDate,
        String status,
        Integer candidateId,
        Integer jopId
) {}

