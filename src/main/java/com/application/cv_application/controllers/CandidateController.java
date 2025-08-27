package com.application.cv_application.controllers;

import com.application.cv_application.requests.CandidateRequest;
import com.application.cv_application.response.CandidateResponse;
import com.application.cv_application.services.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService service;

    @GetMapping
    public List<CandidateResponse> getAll() {
        return service.getAllCandidates();
    }

    @GetMapping("/{id}")
    public CandidateResponse getById(@PathVariable Integer id) {
        return service.getCandidateById(id);
    }

    @PostMapping
    public CandidateResponse create(@RequestBody CandidateRequest request) {
        return service.createCandidate(request);
    }

    @PutMapping("/{id}")
    public CandidateResponse update(
            @PathVariable Integer id,
            @RequestBody CandidateRequest request
    ) {
        return service.updateCandidate(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        service.deleteCandidate(id);
    }
}

