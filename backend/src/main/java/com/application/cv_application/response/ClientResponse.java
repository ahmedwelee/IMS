package com.application.cv_application.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientResponse {
    private Integer id;
    private String name;
    private String type;
    private String phoneNumber;
    private String address;
    private String email;
    private LocalDate createdAt;
    private LocalDate updatedAt;
    private Integer employeeId;
    private String employeeName;
    private Integer jobsCount;
}
