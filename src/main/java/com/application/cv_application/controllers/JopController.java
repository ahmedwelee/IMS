package com.application.cv_application.controllers;


import com.application.cv_application.requests.JopRequest;
import com.application.cv_application.response.JopResponse;
import com.application.cv_application.services.JopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jops")
@RequiredArgsConstructor
public class JopController {

    private final JopService service;


    @PostMapping
    public ResponseEntity<JopResponse> create(
            @RequestBody JopRequest request
    ) {
        return ResponseEntity.ok(service.saveJop(request));
    }

    @GetMapping
    public ResponseEntity<List<JopResponse>> getAll() {
        return ResponseEntity.ok(service.getAllJops());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JopResponse> getById(
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(service.getJopById(id));
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