package com.application.cv_application.mappers;

import com.application.cv_application.entities.Client;
import com.application.cv_application.entities.Employee;
import com.application.cv_application.entities.Jop;
import com.application.cv_application.requests.JopRequest;
import com.application.cv_application.response.JopResponse;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class JopMapper {
    public static Jop toEntity(JopRequest request, Client client, Employee manager) {
        Jop jop = new Jop();
        jop.setJopName(request.jopName());
        jop.setDescription(request.description());
        jop.setSalary(request.salary());
        jop.setJobType(request.jobType());
        jop.setLocation(request.location());
        jop.setStatus(request.status());
        jop.setPostedDate(LocalDateTime.now());
        jop.setClient(client);
        jop.setManager(manager);
        return jop;
    }

    public static JopResponse toResponse(Jop jop) {
        return new JopResponse(
                jop.getId(),
                jop.getJopName(),
                jop.getDescription(),
                jop.getSalary(),
                jop.getJobType(),
                jop.getLocation(),
                jop.getStatus(),
                jop.getPostedDate(),
                jop.getClient() != null ? jop.getClient().getName() : null,
                jop.getManager() != null ? jop.getManager().getFullName() : null,
                jop.getApplications() != null ? jop.getApplications().size() : 0  // ✅ count applications
        );
    }
}

