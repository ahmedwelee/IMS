package com.application.cv_application.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientResponse {
    private Integer id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String phoneNumber;
    private String nationality;
    private String gender;
    private Integer employeeId;
}
