package com.movie.backend.user.repository;

import com.movie.backend.user.entity.AdminPermission;
import com.movie.backend.user.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email)

    @Modifying
    @Transactional
    @Query(value = """
            UPDATE users
            SET user_type = ?2,
                is_admin = ?3,
                admin_permission = ?4
            WHERE id = ?1
            """, nativeQuery = true)
    int changeUserRole(Long userId, String userType, boolean isAdmin, String adminPermission);
}