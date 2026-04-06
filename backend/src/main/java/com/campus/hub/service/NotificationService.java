package com.campus.hub.service;

import com.campus.hub.dto.NotificationDTO;
import com.campus.hub.exception.ResourceNotFoundException;
import com.campus.hub.model.Notification;
import com.campus.hub.model.NotificationType;
import com.campus.hub.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * Internal method — called by Booking/Ticket services to create notifications.
     */
    public void createNotification(String userId, String message, NotificationType type) {
        log.debug("Creating notification for userId={}, type={}", userId, type);
        Notification notification = Notification.builder()
                .userId(userId)
                .message(message)
                .type(type)
                .readStatus(false)
                .build();
        notificationRepository.save(notification);
    }

    public List<NotificationDTO> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadStatus(userId, false);
    }

    public NotificationDTO markAsRead(String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        notification.setReadStatus(true);
        return mapToDTO(notificationRepository.save(notification));
    }

    /** Mark all notifications for a user as read. */
    public int markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadStatus(userId, false);
        unread.forEach(n -> n.setReadStatus(true));
        notificationRepository.saveAll(unread);
        log.info("Marked {} notifications as read for userId={}", unread.size(), userId);
        return unread.size();
    }

    /** Delete a single notification. Only the owner can delete. */
    public void deleteNotification(String id, String userId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        if (!notification.getUserId().equals(userId)) {
            throw new com.campus.hub.exception.UnauthorizedException("You can only delete your own notifications.");
        }
        notificationRepository.delete(notification);
    }

    /** Delete all notifications for a user (clear all). */
    @Transactional
    public void clearAll(String userId) {
        notificationRepository.deleteByUserId(userId);
        log.info("Cleared all notifications for userId={}", userId);
    }

    private NotificationDTO mapToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUserId());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setReadStatus(notification.getReadStatus());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}
