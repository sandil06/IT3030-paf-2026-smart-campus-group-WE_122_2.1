package com.campus.hub.repository;

import com.campus.hub.model.Ticket;
import com.campus.hub.model.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, String> {

    List<Ticket> findByReporterIdOrderByCreatedAtDesc(String reporterId);

    List<Ticket> findAllByOrderByCreatedAtDesc();

    List<Ticket> findByAssignedTo(String assignedTo);

    List<Ticket> findByStatus(TicketStatus status);

    long countByStatus(TicketStatus status);
}
