package com.application.cv_application.controllers;

import com.application.cv_application.requests.EmployeeRequest;
import com.application.cv_application.response.EmployeeResponse;
import com.application.cv_application.services.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    public ResponseEntity<EmployeeResponse> save(
            @RequestBody EmployeeRequest request
    ) {
        return ResponseEntity.ok(employeeService.createEmployee(request));
    }

    @GetMapping
    public ResponseEntity<List<EmployeeResponse>> getAll()
    {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponse> getById(
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @GetMapping("/managers")
    public ResponseEntity<List<EmployeeResponse>> getAllManagers() {
        return ResponseEntity.ok(employeeService.getAllManagers());
    }

    @GetMapping("/client/{clientName}")
    public ResponseEntity<List<EmployeeResponse>> getEmployeesByClient(@PathVariable String clientName) {
        return ResponseEntity.ok(employeeService.getEmployeesByClient(clientName));
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getCount(){
        int count = employeeService.getCount();
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponse> update(
            @PathVariable Integer id, @RequestBody EmployeeRequest request
    ) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<EmployeeResponse> updateEmployeeStatus(@PathVariable Integer id,
                                                                 @RequestParam boolean isActive) {
        return ResponseEntity.ok(employeeService.updateEmployeeStatus(id, isActive));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Integer id
    ) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }
}
