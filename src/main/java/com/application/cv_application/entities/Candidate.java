package com.application.cv_application.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Candidate {

    @Id
    @GeneratedValue
    private Integer id;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String address;
    private String nationality;
    private String gender;
    private LocalDate dateOfBirth;
    private String cvPath;

    @ManyToOne
    @JoinColumn(name = "application_id")
    private Application application;
}
