package com.application.cv_application.mappers;

import com.application.cv_application.entities.Client;
import com.application.cv_application.entities.Employee;
import com.application.cv_application.entities.Jop;
import com.application.cv_application.requests.ClientRequest;
import com.application.cv_application.response.ClientResponse;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.stream.Collectors;

@Component
public class ClientMapper {

    public Client toEntity(ClientRequest request, Employee employee) {
        Client client = new Client();
        client.setName(request.name());
        client.setType(request.type());
        client.setPhoneNumber(request.phoneNumber());
        client.setAddress(request.address());
        client.setEmail(request.email());
        client.setEmployee(employee);
        client.setCreatedAt(LocalDate.now());
        return client;
    }

    public ClientResponse toResponse(Client client) {
        ClientResponse response = new ClientResponse();
        response.setId(client.getId());
        response.setName(client.getName());
        response.setType(client.getType());
        response.setPhoneNumber(client.getPhoneNumber());
        response.setAddress(client.getAddress());
        response.setEmail(client.getEmail());
        response.setCreatedAt(client.getCreatedAt());
        response.setUpdatedAt(client.getUpdatedAt());

        if (client.getEmployee() != null) {
            response.setEmployeeId(client.getEmployee().getId());
            response.setEmployeeName(client.getEmployee().getFullName());
        }

        if (client.getJops() != null) {
            response.setJopNames(
                    client.getJops().stream()
                            .map(Jop::getJopName)
                            .collect(Collectors.toList())
            );
        }

        return response;
    }

    public void updateEntity(Client client, ClientRequest request, Employee employee) {
        client.setName(request.name());
        client.setType(request.type());
        client.setPhoneNumber(request.phoneNumber());
        client.setAddress(request.address());
        client.setEmail(request.email());
        client.setEmployee(employee);
    }
}
