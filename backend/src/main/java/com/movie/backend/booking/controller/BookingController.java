package com.movie.backend.booking.controller;

import com.movie.backend.booking.dto.CreateBookingRequest;
import com.movie.backend.booking.dto.UpdateBookingRequest;
import com.movie.backend.booking.entity.Booking;
import com.movie.backend.booking.service.BookingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public Booking createBooking(@RequestBody CreateBookingRequest request) {
        return bookingService.createBooking(request);
    }

    @GetMapping("/availability")
    public List<String> getUnavailableSeats(
            @RequestParam Long movieId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate showDate,
            @RequestParam String showTime
    ) {
        return bookingService.getUnavailableSeats(movieId, showDate, showTime);
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getUserBookings(@PathVariable Long userId) {
        return bookingService.getUserBookings(userId);
    }

    @GetMapping("/{bookingId}")
    public Booking getBooking(
            @PathVariable Long bookingId,
            @RequestParam(required = false) Long requestUserId,
            @RequestParam(required = false) Long performedByAdminId
    ) {
        if (performedByAdminId != null) {
            return bookingService.getBookingForManager(performedByAdminId, bookingId);
        }
        return bookingService.getBookingForUser(requestUserId, bookingId);
    }

    @PutMapping("/{bookingId}")
    public Booking updateBooking(
            @PathVariable Long bookingId,
            @RequestParam Long requestUserId,
            @RequestBody UpdateBookingRequest request
    ) {
        return bookingService.updateBooking(requestUserId, bookingId, request);
    }

    @DeleteMapping("/{bookingId}")
    public Booking cancelBooking(
            @PathVariable Long bookingId,
            @RequestParam Long requestUserId
    ) {
        return bookingService.cancelBooking(requestUserId, bookingId);
    }

    @GetMapping("/admin/all")
    public List<Booking> getAllBookingsForManager(@RequestParam Long performedByAdminId) {
        return bookingService.getAllBookingsForManager(performedByAdminId);
    }

    @DeleteMapping("/admin/history/{bookingId}")
    public String clearBookingHistoryItem(
            @PathVariable Long bookingId,
            @RequestParam Long performedByAdminId
    ) {
        bookingService.clearBookingHistoryItem(performedByAdminId, bookingId);
        return "Booking history item cleared";
    }

    @DeleteMapping("/admin/history")
    public String clearAllBookingHistory(@RequestParam Long performedByAdminId) {
        bookingService.clearAllBookingHistory(performedByAdminId);
        return "All booking history cleared";
    }
}