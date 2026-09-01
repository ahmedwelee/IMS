package com.application.cv_application.repositories;

import com.application.cv_application.entities.Jop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface JopRepository extends JpaRepository<Jop, Integer> {


    List<Jop> findByStatusIgnoreCase(String status);

    List<Jop> findByClient_Id(Integer clientId);

    List<Jop> findByJobTypeIgnoreCase(String jobType);

    @Query("SELECT COUNT(j) FROM Jop j")
    int countJops();
}
