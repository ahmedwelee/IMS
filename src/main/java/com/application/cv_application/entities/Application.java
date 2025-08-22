package com.application.cv_application.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Application {

    @Id
    @GeneratedValue
    private Integer id;
    private String applicationName;
    private LocalDate appliedDate;
    private LocalDate updatedDate;
    private String status;

    @OneToMany(mappedBy = "application")
    private List<Candidate> candidates;
    @OneToMany(mappedBy = "application")
    private List<Jop> jops;
}
