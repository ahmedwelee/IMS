package com.application.cv_application.services;

import com.application.cv_application.entities.Client;
import com.application.cv_application.entities.Employee;
import com.application.cv_application.entities.Jop;
import com.application.cv_application.enums.Position;
import com.application.cv_application.mappers.EmployeeMapper;
import com.application.cv_application.repositories.ClientRepository;
import com.application.cv_application.repositories.EmployeeRepository;
import com.application.cv_application.repositories.JopRepository;
import com.application.cv_application.requests.EmployeeRequest;
import com.application.cv_application.response.EmployeeResponse;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final JopRepository jopRepository;
    private final ClientRepository clientRepository;
    private final EmployeeMapper employeeMapper;
    private final JopRepository jopRepo;
    private final ClientRepository clientRepo;

    public EmployeeResponse createEmployee(EmployeeRequest request) {
        // check if the an employee with the same email already exists or not
        if (employeeRepository.existsByEmail(request.email())) {
            throw new EntityExistsException("Employee with email " + request.email() + " already exists");
        }
        Jop jop = request.jopId() != null
                ? jopRepo.findById(request.jopId()).orElse(null)
                : null;

        Client client = request.clientId() != null
                ? clientRepo.findById(request.clientId()).orElse(null)
                : null;

        Employee employee = employeeMapper.toEmployee(request, jop, client);
        Employee saved = employeeRepository.save(employee);
        return employeeMapper.toResponse(saved);
    }


    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(employeeMapper::toResponse)
                .collect(Collectors.toList());
    }

    public EmployeeResponse getEmployeeById(Integer id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));
        return employeeMapper.toResponse(employee);
    }

    public List<EmployeeResponse> getAllManagers() {
        List<Employee> managers = employeeRepository.findEmployeeByPosition(Position.MANAGER);
        return managers.stream()
                .map(employeeMapper::toResponse)
                .collect(Collectors.toList());
    }

    public EmployeeResponse updateEmployee(Integer id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));


        employee.setEmail(request.email());
        employee.setFirstName(request.firstName());
        employee.setLastName(request.lastName());
        employee.setDateOfBirth(request.dateOfBirth());
        employee.setStartDate(request.startDate());
        employee.setTitle(request.title());
        employee.setPosition(request.position());
        employee.setSalary(request.salary());
        employee.setActive(request.isActive());

        return employeeMapper.toResponse(employeeRepository.save(employee));
    }

    public void deleteEmployee(Integer id) {
        employeeRepository.deleteById(id);
    }

    public List<EmployeeResponse> getEmployeesByClient(String clientName) {
        return employeeRepository.findByClient_NameContainingIgnoreCase(clientName).stream()
                .map(employeeMapper::toResponse)
                .collect(Collectors.toList());
    }

    public int getCount() {
        return (int) employeeRepository.count();
    }

    public EmployeeResponse updateEmployeeStatus(Integer employeeId, boolean isActive) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        employee.setActive(isActive);  // assuming you have a boolean field isActive in Employee entity
        Employee updated = employeeRepository.save(employee);

        return employeeMapper.toResponse(updated);
    }
}

