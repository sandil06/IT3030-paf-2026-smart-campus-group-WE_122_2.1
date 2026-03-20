package com.campus.hub.controller;

import com.campus.hub.exception.UnauthorizedException;
import com.campus.hub.model.BookingStatus;
import com.campus.hub.model.TicketStatus;
import com.campus.hub.repository.BookingRepository;
import com.campus.hub.repository.NotificationRepository;
import com.campus.hub.repository.ResourceRepository;
import com.campus.hub.repository.TicketRepository;
import com.campus.hub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Dashboard statistics endpoint for the Admin Dashboard UI.
 * Returns aggregate counts for bookings, tickets, resources, and users.
 *
 * <pre>GET /api/admin/stats</pre>
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final BookingRepository  bookingRepository;
    private final TicketRepository   ticketRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository     userRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(
            @RequestAttribute("userRole") String userRole) {

        if (!"ADMIN".equals(userRole)) {
            throw new UnauthorizedException("Only ADMIN can access dashboard stats.");
        }

        Map<String, Object> stats = Map.of(
            "totalResources",        resourceRepository.count(),
            "totalUsers",            userRepository.count(),
            "bookings", Map.of(
                "pending",   bookingRepository.countByStatus(BookingStatus.PENDING),
                "approved",  bookingRepository.countByStatus(BookingStatus.APPROVED),
                "rejected",  bookingRepository.countByStatus(BookingStatus.REJECTED),
                "cancelled", bookingRepository.countByStatus(BookingStatus.CANCELLED),
                "total",     bookingRepository.count()
            ),
            "tickets", Map.of(
                "open",        ticketRepository.countByStatus(TicketStatus.OPEN),
                "inProgress",  ticketRepository.countByStatus(TicketStatus.IN_PROGRESS),
                "resolved",    ticketRepository.countByStatus(TicketStatus.RESOLVED),
                "closed",      ticketRepository.countByStatus(TicketStatus.CLOSED),
                "rejected",    ticketRepository.countByStatus(TicketStatus.REJECTED),
                "total",       ticketRepository.count()
            )
        );

        return ResponseEntity.ok(stats);
    }
}
