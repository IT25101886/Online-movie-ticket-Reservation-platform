package com.movie.backend.review.repository;

import com.movie.backend.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByMovie_IdOrderByCreatedAtDesc(Long movieId);
    List<Review> findByUser_IdOrderByCreatedAtDesc(Long userId);
    List<Review> findAllByOrderByCreatedAtDesc();
    Optional<Review> findByUser_IdAndMovie_Id(Long userId, Long movieId);
}