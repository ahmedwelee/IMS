package com.application.cv_application.requests;

import java.time.LocalDate;

public record EmployeeRequest(
         String email,
         String firstName,
         String lastName,
         LocalDate dateOfBirth,
         LocalDate startDate,
         String position,
         Integer jopId,
         Integer clientId
) {
}
