package com.application.cv_application.services;

import com.application.cv_application.entities.Client;
import com.application.cv_application.entities.Employee;
import com.application.cv_application.mappers.ClientMapper;
import com.application.cv_application.repositories.ClientRepository;
import com.application.cv_application.repositories.EmployeeRepository;
import com.application.cv_application.requests.ClientRequest;
import com.application.cv_application.response.ClientResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;
    private final ClientMapper clientMapper;

    public List<ClientResponse> getAllClients() {
        return clientRepository.findAll()
                .stream()
                .map(clientMapper::toResponse)
                .collect(Collectors.toList());
    }

    public ClientResponse getClientById(Integer id) {
        return clientRepository.findById(id)
                .map(clientMapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Client not found"));
    }

    public ClientResponse createClient(ClientRequest request) {
        Employee employee = fetchEmployee(request.employeeId());
        Client client = clientMapper.toEntity(request, employee);
        return clientMapper.toResponse(clientRepository.save(client));
    }

    public ClientResponse updateClient(Integer id, ClientRequest request) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Client not found"));
        Employee employee = fetchEmployee(request.employeeId());
        clientMapper.updateEntity(client, request, employee);
        return clientMapper.toResponse(clientRepository.save(client));
    }

    public void deleteClient(Integer id) {
        if (!clientRepository.existsById(id)) {
            throw new EntityNotFoundException("Client not found");
        }
        clientRepository.deleteById(id);
    }

    private Employee fetchEmployee(Integer employeeId) {
        if (employeeId == null) return null;
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));
    }
}
