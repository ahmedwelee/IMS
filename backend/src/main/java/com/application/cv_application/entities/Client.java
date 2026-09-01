package com.application.cv_application.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Client {

    @Id
    @GeneratedValue
    private Integer id;
    private String name;
    private String type;
    private String phoneNumber;
    private String address;
    @Column(unique = true)
    private String email;
    @CreatedDate
    private LocalDate createdAt;
    @LastModifiedDate
    @Column(insertable = false)
    private LocalDate updatedAt;

    @OneToMany(mappedBy = "client")
    private List<Jop> jops;
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @OneToMany(mappedBy = "client")
    private List<Employee> employees;

}
