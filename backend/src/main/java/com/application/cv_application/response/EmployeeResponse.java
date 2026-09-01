package com.application.cv_application.response;

import com.application.cv_application.enums.Position;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeResponse {
    private Integer id;
    private String fullName;
    private String email;
    private LocalDate dateOfBirth;
    private LocalDate startDate;
    private String title;
    private Position position;
    private Integer salary;
    private String jopName;
    private String clientName;
    private Boolean isActive;
}

