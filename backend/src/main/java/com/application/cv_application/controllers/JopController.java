package com.application.cv_application.controllers;


import com.application.cv_application.requests.JopRequest;
import com.application.cv_application.response.JopResponse;
import com.application.cv_application.services.JopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
public class JopController {

    private final JopService service;


    @PostMapping
    public ResponseEntity<JopResponse> create(
            @RequestBody JopRequest request
    ) {
        return ResponseEntity.ok(service.createJop(request));
    }

    @GetMapping
    public ResponseEntity<List<JopResponse>> getAll() {
        return ResponseEntity.ok(service.getAllJops());
    }

    @GetMapping("/open-jobs/getALl")
    public ResponseEntity<List<JopResponse>> openJobsGetAll() {
        return ResponseEntity.ok(service.getAllJops());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JopResponse> getById(
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(service.getJopById(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<JopResponse>> getJobsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(service.getJobsByStatus(status));
    }

    // ✅ GET /jobs/client/{clientId}
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<JopResponse>> getJobsByClient(@PathVariable Integer clientId) {
        return ResponseEntity.ok(service.getJobsByClient(clientId));
    }

    // ✅ GET /jobs/type/{jobType}
    @GetMapping("/type/{jobType}")
    public ResponseEntity<List<JopResponse>> getJobsByType(@PathVariable String jobType) {
        return ResponseEntity.ok(service.getJobsByType(jobType));
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getJobsCount() {
        int count = service.countJobs();
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JopResponse> update(
            @PathVariable Integer id,
            @RequestBody JopRequest request
    ) {
        return ResponseEntity.ok(service.updateJop(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Integer id
    ) {
        service.deleteJop(id);
        return ResponseEntity.noContent().build();
    }
}