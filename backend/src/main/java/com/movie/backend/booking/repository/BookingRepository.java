package com.movie.backend.booking.repository;

import com.movie.backend.booking.entity.Booking;
import com.movie.backend.booking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser_IdOrderByCreatedAtDesc(Long userId);
    List<Booking> findAllByOrderByCreatedAtDesc();
    boolean existsByUser_IdAndMovie_IdAndStatus(Long userId, Long movieId, BookingStatus status);
}