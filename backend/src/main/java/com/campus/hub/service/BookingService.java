package com.campus.hub.service;

// fix: overlap check uses exclusive end boundary to prevent back-to-back conflicts

import com.campus.hub.dto.BookingDTO;
import com.campus.hub.dto.CreateBookingRequest;
import com.campus.hub.exception.ConflictException;
import com.campus.hub.exception.ResourceNotFoundException;
import com.campus.hub.exception.ValidationException;
import com.campus.hub.model.Booking;
import com.campus.hub.model.BookingStatus;
import com.campus.hub.model.NotificationType;
import com.campus.hub.model.Resource;
import com.campus.hub.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceService resourceService;
    private final NotificationService notificationService;

    public BookingDTO createBooking(CreateBookingRequest request) {
        log.info("Creating booking: userId={}, resourceId={}", request.getUserId(), request.getResourceId());

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new ValidationException("Start time must be before end time");
        }

        Resource resource = resourceService.fetchResource(request.getResourceId());
        if (!resource.isBookable()) {
            throw new ValidationException("Cannot book a resource that is OUT_OF_SERVICE");
        }

        // Check capacity
        if (resource.getCapacity() != null && request.getAttendees() != null
                && request.getAttendees() > resource.getCapacity()) {
            throw new ValidationException(
                "Number of attendees (" + request.getAttendees() +
                ") exceeds resource capacity (" + resource.getCapacity() + ")"
            );
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                request.getResourceId(), request.getStartTime(), request.getEndTime());

        if (!conflicts.isEmpty()) {
            throw new ConflictException("The resource is already booked for the requested time period.");
        }

        Booking booking = Booking.builder()
                .userId(request.getUserId())
                .resourceId(request.getResourceId())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .attendees(request.getAttendees())
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);
        log.info("Booking created: id={}, status=PENDING", saved.getId());
        return mapToDTO(saved, resource.getName());
    }

    public List<BookingDTO> getUserBookings(String userId) {
        log.debug("Fetching bookings for userId={}", userId);
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(b -> mapToDTOWithEnrichment(b))
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getAllBookings(BookingStatus status, String resourceId) {
        log.debug("Admin: fetching all bookings status={}, resourceId={}", status, resourceId);
        List<Booking> bookings;
        if (status != null && resourceId != null) {
            bookings = bookingRepository.findByStatusAndResourceId(status, resourceId);
        } else if (status != null) {
            bookings = bookingRepository.findByStatus(status);
        } else if (resourceId != null) {
            bookings = bookingRepository.findByResourceId(resourceId);
        } else {
            bookings = bookingRepository.findAllByOrderByCreatedAtDesc();
        }
        return bookings.stream().map(this::mapToDTOWithEnrichment).collect(Collectors.toList());
    }

    public BookingDTO approveBooking(String id) {
        log.info("Admin approving booking id={}", id);
        Booking booking = fetchBooking(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ValidationException("Only PENDING bookings can be approved. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.APPROVED);
        Booking updated = bookingRepository.save(booking);

        notificationService.createNotification(
                updated.getUserId(),
                "✅ Your booking has been approved! Resource: " + enrichResourceName(updated.getResourceId())
                        + " | " + updated.getStartTime().toLocalDate(),
                NotificationType.BOOKING_APPROVED
        );
        return mapToDTOWithEnrichment(updated);
    }

    public BookingDTO rejectBooking(String id, String reason) {
        log.info("Admin rejecting booking id={} reason='{}'", id, reason);
        Booking booking = fetchBooking(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ValidationException("Only PENDING bookings can be rejected. Current status: " + booking.getStatus());
        }
        if (reason == null || reason.isBlank()) {
            throw new ValidationException("Rejection reason is required.");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        Booking updated = bookingRepository.save(booking);

        notificationService.createNotification(
                updated.getUserId(),
                "❌ Your booking has been rejected. Reason: " + reason,
                NotificationType.BOOKING_REJECTED
        );
        return mapToDTOWithEnrichment(updated);
    }

    public BookingDTO cancelBooking(String id, String userId) {
        log.info("Cancelling booking id={} by userId={}", id, userId);
        Booking booking = fetchBooking(id);

        if (!booking.getUserId().equals(userId)) {
            throw new ValidationException("You can only cancel your own bookings.");
        }

        if (booking.getStatus() == BookingStatus.APPROVED || booking.getStatus() == BookingStatus.PENDING) {
            booking.setStatus(BookingStatus.CANCELLED);
            Booking updated = bookingRepository.save(booking);

            notificationService.createNotification(
                    updated.getUserId(),
                    "🚫 Your booking has been cancelled. Resource: " + enrichResourceName(updated.getResourceId()),
                    NotificationType.BOOKING_CANCELLED
            );
            return mapToDTOWithEnrichment(updated);
        } else {
            throw new ValidationException("Only PENDING or APPROVED bookings can be cancelled. Current status: " + booking.getStatus());
        }
    }

    protected Booking fetchBooking(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    /** Safe resource name lookup — falls back to ID if resource deleted. */
    private String enrichResourceName(String resourceId) {
        try {
            return resourceService.fetchResource(resourceId).getName();
        } catch (Exception e) {
            return resourceId;
        }
    }

    /** Map with resource name enrichment (safe). */
    private BookingDTO mapToDTOWithEnrichment(Booking booking) {
        String resourceName = enrichResourceName(booking.getResourceId());
        return mapToDTO(booking, resourceName);
    }

    private BookingDTO mapToDTO(Booking booking, String resourceName) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setUserId(booking.getUserId());
        dto.setResourceId(booking.getResourceId());
        dto.setResourceName(resourceName);
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setPurpose(booking.getPurpose());
        dto.setAttendees(booking.getAttendees());
        dto.setStatus(booking.getStatus());
        dto.setRejectionReason(booking.getRejectionReason());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        return dto;
    }
}
