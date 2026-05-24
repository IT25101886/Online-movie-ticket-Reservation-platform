package com.movie.backend.payment.service;

import com.movie.backend.booking.entity.Booking;
import com.movie.backend.booking.entity.BookingStatus;
import com.movie.backend.booking.repository.BookingRepository;
import com.movie.backend.payment.dto.ProcessPaymentRequest;
import com.movie.backend.payment.dto.UpdatePaymentStatusRequest;
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

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            BookingRepository bookingRepository,
            UserRepository userRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    private void requirePaymentManager(Long performedByAdminId) {
        User actor = userRepository.findById(performedByAdminId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));

        boolean allowed = actor.isAdmin() && (
                actor.getAdminPermission() == AdminPermission.PAYMENT_MANAGER ||
                        actor.getAdminPermission() == AdminPermission.ADMIN_MANAGER
        );

        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only PAYMENT_MANAGER or ADMIN_MANAGER can do this action");
        }
    }

    private Booking getBooking(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    private Payment getPayment(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private String maskCardNumber(String cardNumber) {
        String digits = cardNumber.replaceAll("\\s+", "");
        if (digits.length() < 4) {
            return "****";
        }
        String last4 = digits.substring(digits.length() - 4);
        return "**** **** **** " + last4;
    }

    private PaymentMethod parseMethod(String methodText) {
        try {
            return PaymentMethod.valueOf(methodText.toUpperCase());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment method must be CARD or DIGITAL_WALLET");
        }
    }

    private void validateCardRequest(ProcessPaymentRequest request) {
        if (request.getCardHolderName() == null || request.getCardHolderName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Card holder name is required");
        }

        if (request.getCardNumber() == null || request.getCardNumber().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Card number is required");
        }

        String digits = request.getCardNumber().replaceAll("\\s+", "");
        if (!Pattern.matches("\\d{12,19}", digits)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Card number must contain 12 to 19 digits");
        }

        if (request.getExpiryDate() == null || request.getExpiryDate().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expiry date is required");
        }

        if (!Pattern.matches("(0[1-9]|1[0-2])/\\d{2}", request.getExpiryDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expiry date must be in MM/YY format");
        }

        try {
            YearMonth expiry = YearMonth.parse(request.getExpiryDate(), DateTimeFormatter.ofPattern("MM/yy"));
            if (expiry.isBefore(YearMonth.now())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Card expiry date is in the past");
            }
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid expiry date");
        }

        if (request.getCvv() == null || request.getCvv().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CVV is required");
        }

        if (!Pattern.matches("\\d{3,4}", request.getCvv())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CVV must be 3 or 4 digits");
        }
    }

    private void validateWalletRequest(ProcessPaymentRequest request) {
        if (request.getWalletProvider() == null || request.getWalletProvider().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Wallet provider is required");
        }

        if (request.getWalletReference() == null || request.getWalletReference().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Wallet reference is required");
        }
    }

    @Transactional
    public Payment processPayment(ProcessPaymentRequest request) {
        User user = getUser(request.getUserId());
        Booking booking = getBooking(request.getBookingId());

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This booking does not belong to this user");
        }

        if (booking.getStatus() == BookingStatus.CANCELED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Canceled booking cannot be paid");
        }

        PaymentMethod method = parseMethod(request.getPaymentMethod());

        if (method == PaymentMethod.CARD) {
            validateCardRequest(request);
        } else if (method == PaymentMethod.DIGITAL_WALLET) {
            validateWalletRequest(request);
        }

        Payment payment = paymentRepository.findByBooking_Id(booking.getId()).orElse(null);

        if (payment == null) {
            payment = new Payment();
            payment.setBooking(booking);
            payment.setAmount(booking.getTotalAmount());
            payment.setPaymentMethod(PaymentMethod.NONE);
            payment.setStatus(PaymentStatus.PENDING);
        }

        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment already completed for this booking");
        }

        payment.setAmount(booking.getTotalAmount());
        payment.setPaymentMethod(method);

        if (method == PaymentMethod.CARD) {
            payment.setCardNumberMasked(maskCardNumber(request.getCardNumber()));
            payment.setCardHolderName(request.getCardHolderName());
            payment.setExpiryDate(request.getExpiryDate());

            payment.setWalletProvider(null);
            payment.setWalletReference(null);
        } else {
            payment.setWalletProvider(request.getWalletProvider());
            payment.setWalletReference(request.getWalletReference());

            payment.setCardNumberMasked(null);
            payment.setCardHolderName(null);
            payment.setExpiryDate(null);
        }

        payment.setStatus(PaymentStatus.COMPLETED);

        Payment saved = paymentRepository.save(payment);

        booking.setPayment(saved);
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        return saved;
    }

    public List<Payment> getUserPayments(Long userId) {
        getUser(userId);
        return paymentRepository.findByBooking_User_IdOrderByCreatedAtDesc(userId);
    }

    public Payment getPaymentForUser(Long requestUserId, Long paymentId) {
        Payment payment = getPayment(paymentId);

        if (!payment.getBooking().getUser().getId().equals(requestUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This payment does not belong to this user");
        }

        return payment;
    }

    public Payment getPaymentForManager(Long performedByAdminId, Long paymentId) {
        requirePaymentManager(performedByAdminId);
        return getPayment(paymentId);
    }

    public List<Payment> getAllPaymentsForManager(Long performedByAdminId) {
        requirePaymentManager(performedByAdminId);
        return paymentRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Payment updatePaymentStatus(Long performedByAdminId, Long paymentId, UpdatePaymentStatusRequest request) {
        requirePaymentManager(performedByAdminId);

        Payment payment = getPayment(paymentId);
        PaymentStatus newStatus;

        try {
            newStatus = PaymentStatus.valueOf(request.getStatus().toUpperCase());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid payment status");
        }

        payment.setStatus(newStatus);
        Payment updated = paymentRepository.save(payment);

        Booking booking = payment.getBooking();
        if (newStatus == PaymentStatus.COMPLETED) {
            booking.setStatus(BookingStatus.CONFIRMED);
        } else if (newStatus == PaymentStatus.REFUND_PENDING || newStatus == PaymentStatus.REFUNDED) {
            booking.setStatus(BookingStatus.CANCELED);
        }

        bookingRepository.save(booking);

        return updated;
    }

    @Transactional
    public void clearPaymentHistoryItem(Long performedByAdminId, Long paymentId) {
        requirePaymentManager(performedByAdminId);
        Payment payment = getPayment(paymentId);
        paymentRepository.delete(payment);
    }

    @Transactional
    public void clearAllPaymentHistory(Long performedByAdminId) {
        requirePaymentManager(performedByAdminId);
        paymentRepository.deleteAllInBatch();
    }
}