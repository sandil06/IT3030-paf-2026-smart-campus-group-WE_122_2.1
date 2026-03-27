package com.campus.hub.dto;

import com.campus.hub.model.TicketComment;
import com.campus.hub.model.TicketPriority;
import com.campus.hub.model.TicketStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TicketDTO {
    private String id;
    private String resourceId;
    /** Enriched resource name for display. */
    private String resourceName;
    private String reporterId;
    private String category;
    private String description;
    private TicketPriority priority;
    private TicketStatus status;
    private String assignedTo;
    private List<TicketComment> comments;
    private List<String> attachments;
    private String rejectionReason;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
