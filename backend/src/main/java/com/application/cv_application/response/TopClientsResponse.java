package com.application.cv_application.response;

import java.time.LocalDate;

public record TopClientsResponse(
        Integer id,
        String name,
        String email,
        String type,
        LocalDate createdAt,
        String employeeName,
        Long jobsCount
) {
}
