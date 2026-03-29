package com.campus.hub.repository;

import com.campus.hub.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

/**
 * Repository for {@link User} entities.
 * Email is the natural unique key — used for look-up on every login.
 */
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
