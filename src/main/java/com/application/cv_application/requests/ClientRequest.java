package com.application.cv_application.requests;

public record ClientRequest(
        String name,
        String type,
        String phoneNumber,
        String address,
        String email,
        Integer employeeId
) {}

