package com.application.cv_application.services;

import com.application.cv_application.entities.Client;
import com.application.cv_application.entities.Employee;
import com.application.cv_application.mappers.ClientMapper;
import com.application.cv_application.repositories.ClientRepository;
import com.application.cv_application.repositories.EmployeeRepository;
import com.application.cv_application.requests.ClientRequest;
import com.application.cv_application.response.ClientResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClientService {

    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;
    private final ClientMapper clientMapper;

    public ClientService(ClientRepository clientRepository, EmployeeRepository employeeRepository, ClientMapper clientMapper) {
        this.clientRepository = clientRepository;
        this.employeeRepository = employeeRepository;
        this.clientMapper = clientMapper;
    }

    public ClientResponse create(ClientRequest request) {
        Employee employee = null;
        if (request.employeeId() != null) {
            employee = employeeRepository.findById(request.employeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found with id " + request.employeeId()));
        }

        Client client = clientMapper.toEntity(request, employee);
        Client saved = clientRepository.save(client);
        return clientMapper.toResponse(saved);
    }

    public List<ClientResponse> getAll() {
        return clientRepository.findAll()
                .stream()
                .map(clientMapper::toResponse)
                .toList();
    }

    public ClientResponse getById(Integer id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id " + id));
        return clientMapper.toResponse(client);
    }

    public ClientResponse update(Integer id, ClientRequest request) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id " + id));

        Employee employee = null;
        if (request.employeeId() != null) {
            employee = employeeRepository.findById(request.employeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found with id " + request.employeeId()));
        }

        clientMapper.updateEntity(client, request, employee);
        Client updated = clientRepository.save(client);
        return clientMapper.toResponse(updated);
    }

    public void delete(Integer id) {
        if (!clientRepository.existsById(id)) {
            throw new RuntimeException("Client not found with id " + id);
        }
        clientRepository.deleteById(id);
    }
}