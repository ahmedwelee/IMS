package com.application.cv_application.requests;


import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record JopRequest(

         Integer id,
         @NotNull(message = "100")
         @NotEmpty(message = "100")
         String jopName,
         @NotNull(message = "101")
         @NotEmpty(message = "101")
         String description,
         @NotNull(message = "102")
         @NotEmpty(message = "102")
         Integer clientId,
         @NotNull(message = "103")
         @NotEmpty(message = "103")
         Integer managerId
) {
}
