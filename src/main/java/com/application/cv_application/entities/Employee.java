package com.application.cv_application.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Employee extends User {

    private LocalDate startDate;
    private String position;

    @ManyToOne
    @JoinColumn(name = "jop_id")
    private Jop jop;
    @OneToMany(mappedBy = "employee")
    private List<Client> clients;
}
