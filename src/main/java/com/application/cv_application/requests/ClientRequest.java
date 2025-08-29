package com.application.cv_application.requests;

public record ClientRequest(
        String firstName,
        String lastName,
        String phoneNumber,
        String nationality,
        String gender,
        Integer employeeId
) {}
