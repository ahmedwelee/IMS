package com.application.cv_application.mappers;

import com.application.cv_application.entities.Client;
import com.application.cv_application.entities.Employee;
import com.application.cv_application.entities.Jop;
import com.application.cv_application.requests.EmployeeRequest;
import com.application.cv_application.response.EmployeeResponse;
import org.springframework.stereotype.Component;

@Component
public class EmployeeMapper {

    public EmployeeResponse toResponse(Employee employee) {
        return EmployeeResponse.builder()
                .id(employee.getId())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .dateOfBirth(employee.getDateOfBirth())
                .startDate(employee.getStartDate())
                .position(employee.getPosition())
                .jopName(employee.getJop() != null ? employee.getJop().getJopName() : null)
                .clientName(employee.getClient() != null ? employee.getClient().getFullName() : null)
                .build();
    }

    public Employee toEmployyee( EmployeeRequest request, Jop jop, Client client) {
        return Employee.builder()
                .email(request.email())
                .firstName(request.firstName())
                .lastName(request.lastName())
                .dateOfBirth(request.dateOfBirth())
                .startDate(request.startDate())
                .position(request.position())
                .jop(jop)
                .client(client)
                .build();
    }
}

