package com.application.cv_application.response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JopResponse {
    private Integer id;
    private String jopName;
    private String description;
    private String clientName;
    private String managerName;
}
