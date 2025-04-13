//个性化申请传输对象：

package com.example.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonalizedRequestDTO {
    private Long id;
    private Long userId;
    private String username;
    private String userIdentity;
    private String taskId;
    private String preferDay;
    private String preferPeriod;
}