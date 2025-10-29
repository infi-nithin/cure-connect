package com.cureconnect.app.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.cureconnect.app.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    @EntityGraph(attributePaths = {"roles"})
    Optional<User> findByEmail(String email);

    @Query("SELECT COUNT(u) FROM User u WHERE u.enabled = true")
    Long countActiveUsers();

    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = 'DOCTOR' AND u.enabled = true")
    Long countActiveDoctors();

    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = 'PATIENT' AND u.enabled = true")
    Long countActivePatients();
}
