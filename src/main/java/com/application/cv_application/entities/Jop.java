package com.application.cv_application.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Jop {

    @Id
    @GeneratedValue
    private Integer id;
    private String jopName;
    private String description;

    @OneToMany(mappedBy = "jop")
    private List<Employee> employees;
    @ManyToOne
    @JoinColumn(name = "application_id")
    private Application application;
    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;


}
