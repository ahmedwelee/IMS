package com.application.cv_application.controllers;

import com.application.cv_application.requests.ApplicationRequest;
import com.application.cv_application.response.ApplicationResponse;
import com.application.cv_application.services.ApplicationService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    // ✅ GET /applications/status/{status}
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(service.getApplicationsByStatus(status));
    }

    // ✅ GET /applications/candidate/{candidateId}
    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsByCandidate(@PathVariable Integer candidateId) {
        return ResponseEntity.ok(service.getApplicationsByCandidate(candidateId));
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getApplicationCount() {
        int count = service.getCount();
        return ResponseEntity.ok(count);
    }

    // ✅ GET /applications/job/{jopId}
    @GetMapping("/job/{jopId}")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsByJob(@PathVariable Integer jopId) {
        return ResponseEntity.ok(service.getApplicationsByJob(jopId));
    }

    // ✅ GET /applications/search?q=query
    @GetMapping("/search")
    public ResponseEntity<List<ApplicationResponse>> searchApplications(@RequestParam("q") String query) {
        return ResponseEntity.ok(service.searchApplications(query));
    }

    @GetMapping("/{applicationId}/cv")
    public ResponseEntity<Resource> getApplicationCv(@PathVariable Integer applicationId) {
        Resource cv = service.getApplicationCv(applicationId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + cv.getFilename() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(cv);
    }

    @PostMapping
    public ApplicationResponse create(@RequestBody ApplicationRequest request) {
        return service.createApplication(request);
    }

    @PostMapping(value = "/{applicationId}/cv", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadApplicationCv(
            @PathVariable Integer applicationId,
            @RequestPart("file") MultipartFile file
    ) {
        service.uploadApplicationCv(applicationId, file);
        return ResponseEntity.accepted().build();
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

