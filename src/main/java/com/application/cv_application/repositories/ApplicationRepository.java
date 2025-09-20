package com.application.cv_application.repositories;

import com.application.cv_application.entities.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application,Integer> {


    List<Application> findByStatus(String status);

    List<Application> findByCandidateId(Integer candidateId);

    List<Application> findByJopId(Integer jopId);

    @Query("SELECT a FROM Application a " +
            "WHERE LOWER(a.status) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "   OR LOWER(a.jop.jopName) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "   OR LOWER(a.candidate.firstName ) LIKE LOWER(CONCAT('%', :query, '%'))"+
            "   OR LOWER(a.candidate.lastName ) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Application> searchApplications(String query);

    @Query("SELECT COUNT(a) FROM Application a")
    int countApplications();
}
