package com.application.cv_application.entities;

import com.application.cv_application.enums.Position;
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
    private String title;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Position position;
    private boolean isActive;

    @ManyToOne
    @JoinColumn(name = "jop_id")
    private Jop jop;
    @OneToMany(mappedBy = "employee")
    private List<Client> clients;
    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;
    @OneToMany(mappedBy = "manager")
    private List<Jop> jops;

    public String getFullName() {
        return getFirstName() + " " + getLastName();
    }
}
