package com.movie.backend.payment.repository;

import com.movie.backend.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBooking_Id(Long bookingId);
    List<Payment> findByBooking_User_IdOrderByCreatedAtDesc(Long userId);
    List<Payment> findAllByOrderByCreatedAtDesc();
}