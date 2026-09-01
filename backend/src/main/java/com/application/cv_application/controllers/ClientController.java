package com.application.cv_application.controllers;

import com.application.cv_application.requests.ClientRequest;
import com.application.cv_application.response.ClientResponse;
import com.application.cv_application.response.TopClientsResponse;
import com.application.cv_application.services.ClientService;
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

    @GetMapping("/search")
    public ResponseEntity<List<ClientResponse>> searchClientsByName(@RequestParam("name") String name) {
        return ResponseEntity.ok(clientService.searchClientsByName(name));
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getClientCount() {
        int count = clientService.countClients();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/top")
    public ResponseEntity<List<TopClientsResponse>> getTopClients(
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(clientService.getTopClientsByJobCount(limit));
    }

    // ✅ GET /clients?type=Company
    @GetMapping(params = "type")
    public ResponseEntity<List<ClientResponse>> getClientsByType(@RequestParam("type") String type) {
        return ResponseEntity.ok(clientService.getClientsByType(type));
    }

    // ✅ GET /clients?employeeId=3
    @GetMapping(params = "employeeId")
    public ResponseEntity<List<ClientResponse>> getClientsByEmployee(@RequestParam("employeeId") Integer employeeId) {
        return ResponseEntity.ok(clientService.getClientsByEmployee(employeeId));
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

