package com.campus.hub.repository;

import com.campus.hub.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Notification> findByUserIdAndReadStatus(String userId, Boolean readStatus);

    long countByUserIdAndReadStatus(String userId, Boolean readStatus);

    void deleteByUserId(String userId);
}
