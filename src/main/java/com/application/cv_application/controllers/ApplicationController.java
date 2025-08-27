package com.application.cv_application.controllers;

import com.application.cv_application.requests.ApplicationRequest;
import com.application.cv_application.response.ApplicationResponse;
import com.application.cv_application.services.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService service;

    @GetMapping
    public List<ApplicationResponse> getAll() {

        return service.getAllApplications();
    }

    @GetMapping("/{id}")
    public ApplicationResponse getById(@PathVariable Integer id) {
        return service.getApplicationById(id);
    }

    @PostMapping
    public ApplicationResponse create(@RequestBody ApplicationRequest request) {
        return service.createApplication(request);
    }

    @PutMapping("/{id}")
    public ApplicationResponse update(@PathVariable Integer id, @RequestBody ApplicationRequest request) {
        return service.updateApplication(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        service.deleteApplication(id);
    }
}

