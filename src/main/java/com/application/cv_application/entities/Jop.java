package com.application.cv_application.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
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
    private Integer salary;
    private String jobType;
    private String location;
    private String status;
    private LocalDateTime postedDate;

    @OneToMany(mappedBy = "jop")
    private List<Employee> employees;
    @OneToMany(mappedBy = "jop")
    private List<Application> applications;
    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;
    @ManyToOne
    @JoinColumn(name = "Manager_id")
    private Employee manager;


}
