package com.application.cv_application.requests;

import com.application.cv_application.enums.Position;

import java.time.LocalDate;

public record EmployeeRequest(
         String email,
         String firstName,
         String lastName,
         LocalDate dateOfBirth,
         LocalDate startDate,
         String title,
         Position position,
         Integer salary,
         Integer jopId,
         Integer clientId
) {
}
