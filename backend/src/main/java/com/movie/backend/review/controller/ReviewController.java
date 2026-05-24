package com.movie.backend.review.controller;

import com.movie.backend.review.dto.CreateReviewRequest;
import com.movie.backend.review.dto.ReviewSummaryResponse;
import com.movie.backend.review.dto.UpdateReviewRequest;
import com.movie.backend.review.entity.Review;
import com.movie.backend.review.service.ReviewService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public Review createReview(@RequestBody CreateReviewRequest request) {
        return reviewService.createReview(request);
    }

    @GetMapping("/movie/{movieId}")
    public List<Review> getReviewsByMovie(@PathVariable Long movieId) {
        return reviewService.getReviewsByMovie(movieId);
    }

    @GetMapping("/movie/{movieId}/summary")
    public ReviewSummaryResponse getReviewSummaryByMovie(@PathVariable Long movieId) {
        return reviewService.getReviewSummaryByMovie(movieId);
    }

    @GetMapping("/user/{userId}")
    public List<Review> getUserReviews(@PathVariable Long userId) {
        return reviewService.getUserReviews(userId);
    }

    @GetMapping("/user/{userId}/movie/{movieId}")
    public Review getUserReviewForMovie(@PathVariable Long userId, @PathVariable Long movieId) {
        return reviewService.getUserReviewForMovie(userId, movieId);
    }

    @PutMapping("/{reviewId}")
    public Review updateReview(
            @PathVariable Long reviewId,
            @RequestParam Long requestUserId,
            @RequestBody UpdateReviewRequest request
    ) {
        return reviewService.updateReview(requestUserId, reviewId, request);
    }

    @DeleteMapping("/{reviewId}")
    public String deleteReview(
            @PathVariable Long reviewId,
            @RequestParam Long requestUserId
    ) {
        reviewService.deleteReview(requestUserId, reviewId);
        return "Review deleted successfully";
    }

    @GetMapping("/admin/all")
    public List<Review> getAllReviewsForManager(@RequestParam Long performedByAdminId) {
        return reviewService.getAllReviewsForManager(performedByAdminId);
    }

    @DeleteMapping("/admin/{reviewId}")
    public String adminDeleteReview(
            @PathVariable Long reviewId,
            @RequestParam Long performedByAdminId
    ) {
        reviewService.adminDeleteReview(performedByAdminId, reviewId);
        return "Review removed by admin successfully";
    }
}
