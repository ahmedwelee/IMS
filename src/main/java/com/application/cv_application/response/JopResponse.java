package com.application.cv_application.response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JopResponse {

    private Integer id;
    private String jopName;
    private String description;
    private Integer salary;
    private String jobType;
    private String location;
    private String status;
    private LocalDateTime postedDate;
    private String clientName;
    private String managerName;
    private Integer applicationsCount;
}
