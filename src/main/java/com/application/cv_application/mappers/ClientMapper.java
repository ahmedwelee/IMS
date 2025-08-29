package com.application.cv_application.mappers;

import com.application.cv_application.entities.Client;
import com.application.cv_application.entities.Employee;
import com.application.cv_application.requests.ClientRequest;
import com.application.cv_application.response.ClientResponse;
import org.springframework.stereotype.Component;

@Component
public class ClientMapper {

    public ClientResponse toResponse(Client client) {
        if (client == null) return null;

        return ClientResponse.builder()
                .id(client.getId())
                .firstName(client.getFirstName())
                .lastName(client.getLastName())
                .fullName(client.getFullName())
                .phoneNumber(client.getPhoneNumber())
                .nationality(client.getNationality())
                .gender(client.getGender())
                .employeeId(client.getEmployee() != null ? client.getEmployee().getId() : null)
                .build();
    }

    public Client toEntity(ClientRequest request, Employee employee) {
        if (request == null) return null;

        Client client = new Client();
        client.setFirstName(request.firstName());
        client.setLastName(request.lastName());
        client.setPhoneNumber(request.phoneNumber());
        client.setNationality(request.nationality());
        client.setGender(request.gender());
        client.setEmployee(employee);
        return client;
    }

    public void updateEntity(Client client, ClientRequest request, Employee employee) {
        client.setFirstName(request.firstName());
        client.setLastName(request.lastName());
        client.setPhoneNumber(request.phoneNumber());
        client.setNationality(request.nationality());
        client.setGender(request.gender());
        client.setEmployee(employee);
    }
}
