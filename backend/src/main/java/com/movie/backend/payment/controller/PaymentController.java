package com.movie.backend.payment.controller;

import com.movie.backend.payment.dto.ProcessPaymentRequest;
import com.movie.backend.payment.dto.UpdatePaymentStatusRequest;
import com.movie.backend.payment.entity.Payment;
import com.movie.backend.payment.service.PaymentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/process")
    public Payment processPayment(@RequestBody ProcessPaymentRequest request) {
        return paymentService.processPayment(request);
    }

    @GetMapping("/user/{userId}")
    public List<Payment> getUserPayments(@PathVariable Long userId) {
        return paymentService.getUserPayments(userId);
    }

    @GetMapping("/{paymentId}")
    public Payment getPayment(
            @PathVariable Long paymentId,
            @RequestParam(required = false) Long requestUserId,
            @RequestParam(required = false) Long performedByAdminId
    ) {
        if (performedByAdminId != null) {
            return paymentService.getPaymentForManager(performedByAdminId, paymentId);
        }
        return paymentService.getPaymentForUser(requestUserId, paymentId);
    }

    @GetMapping("/admin/all")
    public List<Payment> getAllPaymentsForManager(@RequestParam Long performedByAdminId) {
        return paymentService.getAllPaymentsForManager(performedByAdminId);
    }

    @PutMapping("/{paymentId}/status")
    public Payment updatePaymentStatus(
            @PathVariable Long paymentId,
            @RequestParam Long performedByAdminId,
            @RequestBody UpdatePaymentStatusRequest request
    ) {
        return paymentService.updatePaymentStatus(performedByAdminId, paymentId, request);
    }

    @DeleteMapping("/admin/history/{paymentId}")
    public String clearPaymentHistoryItem(
            @PathVariable Long paymentId,
            @RequestParam Long performedByAdminId
    ) {
        paymentService.clearPaymentHistoryItem(performedByAdminId, paymentId);
        return "Payment history item cleared";
    }

    @DeleteMapping("/admin/history")
    public String clearAllPaymentHistory(@RequestParam Long performedByAdminId) {
        paymentService.clearAllPaymentHistory(performedByAdminId);
        return "All payment history cleared";
    }
}