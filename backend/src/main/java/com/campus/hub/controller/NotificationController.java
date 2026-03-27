package com.campus.hub.controller;

import com.campus.hub.dto.NotificationDTO;
import com.campus.hub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Notification endpoints.
 *
 * <pre>
 * GET    /api/notifications/user/{userId}         — get user's notifications
 * GET    /api/notifications/user/{userId}/unread-count — unread badge count
 * PUT    /api/notifications/{id}/read             — mark one as read
 * PUT    /api/notifications/user/{userId}/read-all — mark all as read
 * DELETE /api/notifications/{id}                  — delete one
 * DELETE /api/notifications/user/{userId}/clear-all — clear all
 * </pre>
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(
            @PathVariable String userId,
            @RequestAttribute("userId") String requestUserId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @PathVariable String userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable String id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(
            @PathVariable String userId,
            @RequestAttribute("userId") String requestUserId) {
        int count = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("markedRead", count));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable String id,
            @RequestAttribute("userId") String requestUserId) {
        notificationService.deleteNotification(id, requestUserId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/user/{userId}/clear-all")
    public ResponseEntity<Void> clearAll(
            @PathVariable String userId,
            @RequestAttribute("userId") String requestUserId) {
        notificationService.clearAll(userId);
        return ResponseEntity.noContent().build();
    }
}
