package com.movie.backend.payment.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.movie.backend.booking.entity.Booking;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "payment_type")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", unique = true)
    private Booking booking;

    @Column(nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod = PaymentMethod.NONE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    private String cardNumberMasked;
    private String cardHolderName;
    private String expiryDate;

    private String walletProvider;
    private String walletReference;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public String displayPaymentType() {
        return "BASE";
    }

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Transient
    public String getPaymentType() {
        return displayPaymentType();
    }

    @Transient
    public Long getBookingId() {
        return booking != null ? booking.getId() : null;
    }

    @Transient
    public Long getUserId() {
        return booking != null ? booking.getUserId() : null;
    }

    @Transient
    public String getMovieTitle() {
        return booking != null ? booking.getMovieTitle() : null;
    }

    @Transient
    public String getBookingStatus() {
        return booking != null ? booking.getStatus().name() : null;
    }

    public Long getId() {
        return id;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public String getCardNumberMasked() {
        return cardNumberMasked;
    }

    public void setCardNumberMasked(String cardNumberMasked) {
        this.cardNumberMasked = cardNumberMasked;
    }

    public String getCardHolderName() {
        return cardHolderName;
    }

    public void setCardHolderName(String cardHolderName) {
        this.cardHolderName = cardHolderName;
    }

    public String getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(String expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getWalletProvider() {
        return walletProvider;
    }

    public void setWalletProvider(String walletProvider) {
        this.walletProvider = walletProvider;
    }

    public String getWalletReference() {
        return walletReference;
    }

    public void setWalletReference(String walletReference) {
        this.walletReference = walletReference;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}