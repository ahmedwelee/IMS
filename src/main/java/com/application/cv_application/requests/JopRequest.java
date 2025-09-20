package com.application.cv_application.requests;


import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record JopRequest(
        String jopName,
        String description,
        Integer salary,
        String jobType,
        String location,
        String status,
        Integer clientId,
        Integer managerId
) {}
