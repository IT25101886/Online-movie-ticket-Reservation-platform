package com.movie.backend.booking.repository;

import com.movie.backend.booking.entity.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {
    List<BookingSeat> findByBooking_IdOrderBySeatCodeAsc(Long bookingId);
    List<BookingSeat> findByMovieIdCopyAndShowDateAndShowTimeOrderBySeatCodeAsc(Long movieIdCopy, LocalDate showDate, String showTime);
    void deleteByBooking_Id(Long bookingId);
}
