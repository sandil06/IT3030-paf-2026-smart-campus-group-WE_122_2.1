package com.campus.hub.dto;

import com.campus.hub.model.NotificationType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private String id;
    private String userId;
    private String message;
    private NotificationType type;
    private Boolean readStatus;
    private LocalDateTime createdAt;
}
