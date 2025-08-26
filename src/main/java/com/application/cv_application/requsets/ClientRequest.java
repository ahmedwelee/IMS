package com.application.cv_application.requsets;

public record ClientRequest(
        String firstName,
        String lastName,
        String phoneNumber,
        String nationality,
        String gender,
        Integer employeeId
) {}
