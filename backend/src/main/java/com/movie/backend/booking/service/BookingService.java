package com.movie.backend.booking.service;

import com.movie.backend.booking.dto.CreateBookingRequest;
import com.movie.backend.booking.dto.UpdateBookingRequest;
import com.movie.backend.booking.entity.*;
import com.movie.backend.booking.repository.BookingRepository;
import com.movie.backend.booking.repository.BookingSeatRepository;
import com.movie.backend.movie.entity.Movie;
import com.movie.backend.movie.repository.MovieRepository;
import com.movie.backend.payment.entity.Payment;
import com.movie.backend.payment.entity.PaymentMethod;
import com.movie.backend.payment.entity.PaymentStatus;
import com.movie.backend.payment.repository.PaymentRepository;
import com.movie.backend.user.entity.AdminPermission;
import com.movie.backend.user.entity.User;
import com.movie.backend.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;

    private final Queue<CreateBookingRequest> bookingQueue = new ConcurrentLinkedQueue<>();

    public BookingService(
            BookingRepository bookingRepository,
            BookingSeatRepository bookingSeatRepository,
            PaymentRepository paymentRepository,
            UserRepository userRepository,
            MovieRepository movieRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.movieRepository = movieRepository;
    }

    private void requireBookingManager(Long performedByAdminId) {
        User actor = userRepository.findById(performedByAdminId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));

        boolean allowed = actor.isAdmin() && (
                actor.getAdminPermission() == AdminPermission.TICKET_MANAGER ||
                        actor.getAdminPermission() == AdminPermission.ADMIN_MANAGER
        );

        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only TICKET_MANAGER or ADMIN_MANAGER can do this action");
        }
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private Movie getMovie(Long movieId) {
        return movieRepository.findById(movieId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found"));
    }

    private Booking getBooking(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    private List<String> normalizeSeats(List<String> seats) {
        if (seats == null || seats.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please select at least one seat");
        }

        return seats.stream()
                .filter(Objects::nonNull)
                .map(value -> value.trim().toUpperCase())
                .filter(value -> !value.isBlank())
                .distinct()
                .toList();
    }

    private SeatType parseSeatType(String seatTypeText) {
        try {
            return SeatType.valueOf(seatTypeText.toUpperCase());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seat type must be STANDARD or PREMIUM");
        }
    }

    private void validateSeatAvailability(Long movieId, java.time.LocalDate showDate, String showTime, List<String> selectedSeats, Long currentBookingIdToIgnore) {
        List<BookingSeat> occupied = bookingSeatRepository.findByMovieIdCopyAndShowDateAndShowTimeOrderBySeatCodeAsc(movieId, showDate, showTime);

        Set<String> occupiedSet = new HashSet<>();
        for (BookingSeat seat : occupied) {
            if (currentBookingIdToIgnore != null && seat.getBooking() != null && currentBookingIdToIgnore.equals(seat.getBooking().getId())) {
                continue;
            }
            occupiedSet.add(seat.getSeatCode());
        }

        for (String seatCode : selectedSeats) {
            if (occupiedSet.contains(seatCode)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Seat already booked: " + seatCode);
            }
        }
    }

    private Booking buildBookingEntity(User user, Movie movie, CreateBookingRequest request, List<String> normalizedSeats, SeatType seatType) {
        Booking booking = seatType == SeatType.PREMIUM ? new PremiumBooking() : new StandardBooking();

        booking.setUser(user);
        booking.setMovie(movie);
        booking.setContactName(request.getContactName());
        booking.setContactEmail(request.getContactEmail());
        booking.setContactMobile(request.getContactMobile());
        booking.setShowDate(request.getShowDate());
        booking.setShowTime(request.getShowTime());
        booking.setSeatType(seatType);
        booking.setSeatCount(normalizedSeats.size());
        booking.setTotalAmount(booking.getSeatPrice() * normalizedSeats.size());
        booking.setStatus(BookingStatus.PENDING_PAYMENT);

        return booking;
    }

    private void saveSeats(Booking booking, List<String> seatCodes) {
        List<BookingSeat> seats = new ArrayList<>();

        for (String seatCode : seatCodes) {
            BookingSeat seat = new BookingSeat();
            seat.setBooking(booking);
            seat.setMovieIdCopy(booking.getMovie().getId());
            seat.setShowDate(booking.getShowDate());
            seat.setShowTime(booking.getShowTime());
            seat.setSeatCode(seatCode);
            seats.add(seat);
        }

        bookingSeatRepository.saveAll(seats);
        booking.setBookingSeats(seats);
    }

    private void createPendingPaymentPlaceholder(Booking booking) {
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(booking.getTotalAmount());
        payment.setPaymentMethod(PaymentMethod.NONE);
        payment.setStatus(PaymentStatus.PENDING);
        paymentRepository.save(payment);
        booking.setPayment(payment);
    }

    @Transactional
    public synchronized Booking createBooking(CreateBookingRequest request) {
        bookingQueue.offer(request);
        return processNextBookingInQueue();
    }

    @Transactional
    protected Booking processNextBookingInQueue() {
        CreateBookingRequest request = bookingQueue.poll();

        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No booking request in queue");
        }

        User user = getUser(request.getUserId());
        Movie movie = getMovie(request.getMovieId());

        List<String> normalizedSeats = normalizeSeats(request.getSelectedSeats());
        SeatType seatType = parseSeatType(request.getSeatType());

        validateSeatAvailability(movie.getId(), request.getShowDate(), request.getShowTime(), normalizedSeats, null);

        Booking booking = buildBookingEntity(user, movie, request, normalizedSeats, seatType);
        booking = bookingRepository.save(booking);

        saveSeats(booking, normalizedSeats);
        createPendingPaymentPlaceholder(booking);

        return bookingRepository.findById(booking.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found after save"));
    }

    public List<Booking> getUserBookings(Long userId) {
        getUser(userId);
        return bookingRepository.findByUser_IdOrderByCreatedAtDesc(userId);
    }

    public Booking getBookingForUser(Long requestUserId, Long bookingId) {
        Booking booking = getBooking(bookingId);

        if (!booking.getUser().getId().equals(requestUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This booking does not belong to this user");
        }

        return booking;
    }

    public Booking getBookingForManager(Long performedByAdminId, Long bookingId) {
        requireBookingManager(performedByAdminId);
        return getBooking(bookingId);
    }

    public List<Booking> getAllBookingsForManager(Long performedByAdminId) {
        requireBookingManager(performedByAdminId);
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<String> getUnavailableSeats(Long movieId, java.time.LocalDate showDate, String showTime) {
        return bookingSeatRepository.findByMovieIdCopyAndShowDateAndShowTimeOrderBySeatCodeAsc(movieId, showDate, showTime)
                .stream()
                .map(BookingSeat::getSeatCode)
                .toList();
    }

    @Transactional
    public Booking updateBooking(Long requestUserId, Long bookingId, UpdateBookingRequest request) {
        Booking booking = getBookingForUser(requestUserId, bookingId);

        if (booking.getStatus() == BookingStatus.CANCELED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Canceled booking cannot be updated");
        }

        if (booking.getPayment() != null && booking.getPayment().getStatus() == PaymentStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Completed booking cannot be edited");
        }

        List<String> normalizedSeats = normalizeSeats(request.getSelectedSeats());
        SeatType seatType = parseSeatType(request.getSeatType());

        validateSeatAvailability(
                booking.getMovie().getId(),
                request.getShowDate(),
                request.getShowTime(),
                normalizedSeats,
                booking.getId()
        );

        booking.setContactName(request.getContactName());
        booking.setContactEmail(request.getContactEmail());
        booking.setContactMobile(request.getContactMobile());
        booking.setShowDate(request.getShowDate());
        booking.setShowTime(request.getShowTime());
        booking.setSeatType(seatType);
        booking.setSeatCount(normalizedSeats.size());

        double seatPrice = seatType == SeatType.PREMIUM ? new PremiumBooking().getSeatPrice() : new StandardBooking().getSeatPrice();
        booking.setTotalAmount(seatPrice * normalizedSeats.size());

        bookingSeatRepository.deleteByBooking_Id(booking.getId());
        saveSeats(booking, normalizedSeats);

        if (booking.getPayment() != null && booking.getPayment().getStatus() == PaymentStatus.PENDING) {
            booking.getPayment().setAmount(booking.getTotalAmount());
            paymentRepository.save(booking.getPayment());
        }

        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking cancelBooking(Long requestUserId, Long bookingId) {
        Booking booking = getBookingForUser(requestUserId, bookingId);

        if (booking.getStatus() == BookingStatus.CANCELED) {
            return booking;
        }

        booking.setStatus(BookingStatus.CANCELED);
        bookingSeatRepository.deleteByBooking_Id(booking.getId());

        if (booking.getPayment() != null && booking.getPayment().getStatus() == PaymentStatus.COMPLETED) {
            booking.getPayment().setStatus(PaymentStatus.REFUND_PENDING);
            paymentRepository.save(booking.getPayment());
        }

        return bookingRepository.save(booking);
    }

    @Transactional
    public void clearBookingHistoryItem(Long performedByAdminId, Long bookingId) {
        requireBookingManager(performedByAdminId);
        Booking booking = getBooking(bookingId);
        bookingSeatRepository.deleteByBooking_Id(booking.getId());
        paymentRepository.findByBooking_Id(booking.getId()).ifPresent(paymentRepository::delete);
        bookingRepository.delete(booking);
    }

    @Transactional
    public void clearAllBookingHistory(Long performedByAdminId) {
        requireBookingManager(performedByAdminId);
        paymentRepository.deleteAllInBatch();
        bookingSeatRepository.deleteAllInBatch();
        bookingRepository.deleteAllInBatch();
    }
}