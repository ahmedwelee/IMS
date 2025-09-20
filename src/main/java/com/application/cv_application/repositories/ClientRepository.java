package com.application.cv_application.repositories;

import com.application.cv_application.entities.Client;
import com.application.cv_application.response.TopClientsResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ClientRepository extends JpaRepository<Client, Integer> {

    List<Client> findByNameContainingIgnoreCase(String name);

    //  Filter by type
    List<Client> findByType(String type);

    //  Filter by employee
    List<Client> findByEmployeeId(Integer employeeId);

    @Query("SELECT COUNT(c) FROM Client c")
    int countClients();
    @Query("""
    SELECT new com.application.cv_application.response.TopClientsResponse(
        c.id,
        c.name,
        c.email,
        c.type,
        c.createdAt,
        e.firstName || ' ' || e.lastName,
        COUNT(j)
    )
    FROM Client c
    LEFT JOIN c.employee e
    LEFT JOIN c.jops j
    GROUP BY c.id, c.name, c.email, c.type, c.createdAt, e.firstName, e.lastName
    ORDER BY COUNT(j) DESC
""")
    List<TopClientsResponse> findTopClientsByJobCount(Pageable pageable);

}
