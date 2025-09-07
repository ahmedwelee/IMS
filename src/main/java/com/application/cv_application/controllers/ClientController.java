package com.application.cv_application.controllers;

import com.application.cv_application.requests.ClientRequest;
import com.application.cv_application.response.ClientResponse;
import com.application.cv_application.services.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clients")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @PostMapping
    public ResponseEntity<ClientResponse> create(@RequestBody ClientRequest request) {
        return ResponseEntity.ok(clientService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<ClientResponse>> getAll() {
        return ResponseEntity.ok(clientService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(clientService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientResponse> update(@PathVariable Integer id, @RequestBody ClientRequest request) {
        return ResponseEntity.ok(clientService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        clientService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

