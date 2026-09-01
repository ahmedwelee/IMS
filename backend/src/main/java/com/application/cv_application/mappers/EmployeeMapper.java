package com.application.cv_application.mappers;

import com.application.cv_application.entities.Client;
import com.application.cv_application.entities.Employee;
import com.application.cv_application.entities.Jop;
import com.application.cv_application.requests.ClientRequest;
import com.application.cv_application.requests.EmployeeRequest;
import com.application.cv_application.response.ClientResponse;
import com.application.cv_application.response.EmployeeResponse;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class EmployeeMapper {

    public EmployeeResponse toResponse(Employee employee) {
        return EmployeeResponse.builder()
                .id(employee.getId())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .dateOfBirth(employee.getDateOfBirth())
                .startDate(employee.getStartDate())
                .title(employee.getTitle())
                .position(employee.getPosition())
                .salary(employee.getSalary())
                .jopName(employee.getJop() != null ? employee.getJop().getJopName() : null)
                .clientName(employee.getClient() != null ? employee.getClient().getName() : null)
                .isActive(employee.isActive())
                .build();
    }

    public Employee toEmployee(EmployeeRequest request, Jop jop, Client client) {
        return Employee.builder()
                .email(request.email())
                .firstName(request.firstName())
                .lastName(request.lastName())
                .dateOfBirth(request.dateOfBirth())
                .startDate(request.startDate())
                .title(request.title())
                .position(request.position())
                .salary(request.salary())
                .jop(jop != null ? jop : null)
                .client(client != null ? client : null)
                .isActive(request.isActive())
                .build();
    }

}

