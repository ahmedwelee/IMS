package com.application.cv_application.repositories;

import com.application.cv_application.entities.Employee;
import com.application.cv_application.enums.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {

    boolean existsByEmail(String email);

    List<Employee> findEmployeeByPosition(Position position);

    List<Employee> findByClient_NameContainingIgnoreCase(String clientName);

    @Query("SELECT COUNT(e) FROM Employee e")
    int countEmployees();

    Optional<Employee> findByEmail(String email);
}
