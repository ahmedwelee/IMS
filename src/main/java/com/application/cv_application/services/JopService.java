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
import jakarta.persistence.EntityNotFoundException;
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

    public JopResponse createJop(JopRequest request) {
        Client client = clientRepository.findById(request.clientId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found"));

        Employee manager = employeeRepository.findById(request.managerId())
                .orElseThrow(() -> new EntityNotFoundException("Manager not found"));

        Jop jop = JopMapper.toEntity(request, client, manager);
        return JopMapper.toResponse(jopRepository.save(jop));
    }

    public List<JopResponse> getAllJops() {
        return jopRepository.findAll()
                .stream()
                .map(JopMapper::toResponse)
                .collect(Collectors.toList());
    }

    public JopResponse getJopById(Integer id) {
        Jop jop = jopRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Jop not found"));
        return JopMapper.toResponse(jop);
    }

    public JopResponse updateJop(Integer id, JopRequest request) {
        Jop jop = jopRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Jop not found"));

        Client client = clientRepository.findById(request.clientId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found"));

        Employee manager = employeeRepository.findById(request.managerId())
                .orElseThrow(() -> new EntityNotFoundException("Manager not found"));

        jop.setJopName(request.jopName());
        jop.setDescription(request.description());
        jop.setSalary(request.salary());
        jop.setJobType(request.jobType());
        jop.setLocation(request.location());
        jop.setStatus(request.status());
        // check if it's updated to OPEN => we set a new value : jop.setPostedDate(request.postedDate());
        jop.setClient(client);
        jop.setManager(manager);

        return JopMapper.toResponse(jopRepository.save(jop));
    }

    public void deleteJop(Integer id) {
        if (!jopRepository.existsById(id)) {
            throw new EntityNotFoundException("Jop not found");
        }
        jopRepository.deleteById(id);
    }

    public List<JopResponse> getJobsByStatus(String status) {
        return jopRepository.findByStatusIgnoreCase(status).stream()
                .map(JopMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<JopResponse> getJobsByClient(Integer clientId) {
        return jopRepository.findByClient_Id(clientId).stream()
                .map(JopMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<JopResponse> getJobsByType(String jobType) {
        return jopRepository.findByJobTypeIgnoreCase(jobType).stream()
                .map(JopMapper::toResponse)
                .collect(Collectors.toList());
    }

    public int countJobs() {
        return (int) jopRepository.count();
    }
}
