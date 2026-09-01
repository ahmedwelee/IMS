package com.application.cv_application.entities;

import jakarta.persistence.*;
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
    @Column(unique = true)
    private String email;
    private String password;
    private boolean isActive = true;

    @OneToMany(mappedBy = "candidate")
    private List<Application> applications;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
