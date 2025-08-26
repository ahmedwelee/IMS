package com.application.cv_application.mappers;

import com.application.cv_application.entities.Client;
import com.application.cv_application.entities.Employee;
import com.application.cv_application.entities.Jop;
import com.application.cv_application.requests.JopRequest;
import com.application.cv_application.response.JopResponse;
import org.springframework.stereotype.Component;

@Component
public class JopMapper {

    public JopResponse toResponse(Jop jop) {
        return JopResponse.builder()
                .id(jop.getId())
                .jopName(jop.getJopName())
                .description(jop.getDescription())
                .clientName(jop.getClient() != null ? jop.getClient().getFullName() : null)
                .managerName(jop.getManager() != null ? jop.getManager().getFullName() : null)
                .build();
    }

    public Jop toJop(JopRequest request, Client client, Employee manager) {
        return Jop.builder()
                .jopName(request.jopName())
                .description(request.description())
                .client(client)
                .manager(manager)
                .build();
    }
}

