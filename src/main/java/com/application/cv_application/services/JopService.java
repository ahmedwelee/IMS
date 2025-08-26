package com.application.cv_application.services;

import com.application.cv_application.entities.Client;
import com.application.cv_application.entities.Employee;
import com.application.cv_application.entities.Jop;
import com.application.cv_application.mappers.JopMapper;
import com.application.cv_application.repositories.ClientRepository;
import com.application.cv_application.repositories.EmployeeRepository;
import com.application.cv_application.repositories.JopRepository;
import com.application.cv_application.requests.JopRequest;
import com.application.cv_application.response.JopResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JopService {

    private final JopRepository jopRepository;
    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;
    private final JopMapper jopMapper;

    public JopResponse saveJop(JopRequest request) {
        Client client = clientRepository.findById(request.clientId())
                .orElseThrow(() -> new RuntimeException("Client not found"));
        Employee manager = employeeRepository.findById(request.managerId())
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        Jop jop = jopMapper.toJop(request, client, manager);
        return jopMapper.toResponse(jopRepository.save(jop));
    }

    public List<JopResponse> getAllJops() {
        return jopRepository.findAll().stream()
                .map(jopMapper::toResponse)
                .collect(Collectors.toList());
    }

    public JopResponse getJopById(Integer id) {
        Jop jop = jopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Jop not found"));
        return jopMapper.toResponse(jop);
    }

    public JopResponse updateJop(Integer id, JopRequest request) {
        Jop jop = jopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Jop not found"));

        Client client = clientRepository.findById(request.clientId())
                .orElseThrow(() -> new RuntimeException("Client not found"));
        Employee manager = employeeRepository.findById(request.managerId())
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        jop.setJopName(request.jopName());
        jop.setDescription(request.description());
        jop.setClient(client);
        jop.setManager(manager);

        return jopMapper.toResponse(jopRepository.save(jop));
    }

    public void deleteJop(Integer id) {
        jopRepository.deleteById(id);
    }
}
