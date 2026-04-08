package com.campus.hub.controller;

import com.campus.hub.exception.UnauthorizedException;
import com.campus.hub.model.*;
import com.campus.hub.repository.*;
import com.campus.hub.dto.CreateUserRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(@RequestAttribute("userRole") String userRole) {
        if (!"ADMIN".equals(userRole)) throw new UnauthorizedException("Only ADMIN can access users.");
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(
            @RequestAttribute("userRole") String userRole,
            @Valid @RequestBody CreateUserRequest request) {
        if (!"ADMIN".equals(userRole)) throw new UnauthorizedException("Only ADMIN can access users.");

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new com.campus.hub.exception.ValidationException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .role(Role.valueOf(request.getRole().toUpperCase()))
                .build();
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateUserRole(
            @RequestAttribute("userRole") String userRole,
            @PathVariable String id,
            @RequestParam String role) {
        if (!"ADMIN".equals(userRole)) throw new UnauthorizedException("Only ADMIN can access users.");

        User user = userRepository.findById(id)
                .orElseThrow(() -> new com.campus.hub.exception.ResourceNotFoundException("User not found"));
        user.setRole(Role.valueOf(role.toUpperCase()));
        return ResponseEntity.ok(userRepository.save(user));
    }
}
