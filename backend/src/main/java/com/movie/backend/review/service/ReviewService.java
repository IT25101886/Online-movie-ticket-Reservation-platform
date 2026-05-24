package com.movie.backend.review.service;

import com.movie.backend.booking.entity.BookingStatus;
import com.movie.backend.booking.repository.BookingRepository;
import com.movie.backend.movie.entity.Movie;
import com.movie.backend.movie.repository.MovieRepository;
import com.movie.backend.review.dto.CreateReviewRequest;
import com.movie.backend.review.dto.ReviewSummaryResponse;
import com.movie.backend.review.dto.UpdateReviewRequest;
import com.movie.backend.review.entity.PublicReview;
import com.movie.backend.review.entity.Review;
import com.movie.backend.review.entity.VerifiedReview;
import com.movie.backend.review.repository.ReviewRepository;
import com.movie.backend.user.entity.AdminPermission;
import com.movie.backend.user.entity.User;
import com.movie.backend.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    private final BookingRepository bookingRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            UserRepository userRepository,
            MovieRepository movieRepository,
            BookingRepository bookingRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.movieRepository = movieRepository;
        this.bookingRepository = bookingRepository;
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private Movie getMovie(Long movieId) {
        return movieRepository.findById(movieId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found"));
    }

    private Review getReview(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));
    }

    private void requireReviewManager(Long performedByAdminId) {
        User actor = getUser(performedByAdminId);

        boolean allowed = actor.isAdmin() && (
                actor.getAdminPermission() == AdminPermission.REVIEW_MANAGER ||
                        actor.getAdminPermission() == AdminPermission.ADMIN_MANAGER
        );

        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only REVIEW_MANAGER or ADMIN_MANAGER can do this action");
        }
    }

    private void validateReviewInput(Integer rating, String comment) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
        }

        if (comment == null || comment.trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment is required");
        }
    }

    private boolean isVerifiedPurchase(Long userId, Long movieId) {
        return bookingRepository.existsByUser_IdAndMovie_IdAndStatus(userId, movieId, BookingStatus.CONFIRMED);
    }

    public Review createReview(CreateReviewRequest request) {
        User user = getUser(request.getUserId());
        Movie movie = getMovie(request.getMovieId());

        validateReviewInput(request.getRating(), request.getComment());

        if (reviewRepository.findByUser_IdAndMovie_Id(user.getId(), movie.getId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already reviewed this movie. Please edit your existing review.");
        }

        Review review = isVerifiedPurchase(user.getId(), movie.getId())
                ? new VerifiedReview()
                : new PublicReview();

        review.setUser(user);
        review.setMovie(movie);
        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());

        return reviewRepository.save(review);
    }

    public List<Review> getReviewsByMovie(Long movieId) {
        getMovie(movieId);
        return reviewRepository.findByMovie_IdOrderByCreatedAtDesc(movieId);
    }

    public ReviewSummaryResponse getReviewSummaryByMovie(Long movieId) {
        Movie movie = getMovie(movieId);
        List<Review> reviews = reviewRepository.findByMovie_IdOrderByCreatedAtDesc(movieId);

        ReviewSummaryResponse summary = new ReviewSummaryResponse();
        summary.setMovieId(movie.getId());
        summary.setMovieTitle(movie.getTitle());
        summary.setTotalReviews(reviews.size());

        if (reviews.isEmpty()) {
            summary.setAverageRating(0.0);
            return summary;
        }

        int total = 0;
        int verifiedCount = 0;
        int publicCount = 0;
        int five = 0;
        int four = 0;
        int three = 0;
        int two = 0;
        int one = 0;

        for (Review review : reviews) {
            total += review.getRating();

            if ("VERIFIED".equalsIgnoreCase(review.getReviewType())) {
                verifiedCount++;
            } else {
                publicCount++;
            }

            switch (review.getRating()) {
                case 5 -> five++;
                case 4 -> four++;
                case 3 -> three++;
                case 2 -> two++;
                case 1 -> one++;
            }
        }

        double avg = (double) total / reviews.size();
        avg = Math.round(avg * 10.0) / 10.0;

        summary.setAverageRating(avg);
        summary.setVerifiedReviews(verifiedCount);
        summary.setPublicReviews(publicCount);
        summary.setFiveStarCount(five);
        summary.setFourStarCount(four);
        summary.setThreeStarCount(three);
        summary.setTwoStarCount(two);
        summary.setOneStarCount(one);

        return summary;
    }

    public List<Review> getUserReviews(Long userId) {
        getUser(userId);
        return reviewRepository.findByUser_IdOrderByCreatedAtDesc(userId);
    }

    public Review getUserReviewForMovie(Long userId, Long movieId) {
        getUser(userId);
        getMovie(movieId);

        return reviewRepository.findByUser_IdAndMovie_Id(userId, movieId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found for this user and movie"));
    }

    public Review updateReview(Long requestUserId, Long reviewId, UpdateReviewRequest request) {
        Review review = getReview(reviewId);

        if (!review.getUser().getId().equals(requestUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own review");
        }

        validateReviewInput(request.getRating(), request.getComment());

        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());

        return reviewRepository.save(review);
    }

    public void deleteReview(Long requestUserId, Long reviewId) {
        Review review = getReview(reviewId);

        if (!review.getUser().getId().equals(requestUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own review");
        }

        reviewRepository.delete(review);
    }

    public List<Review> getAllReviewsForManager(Long performedByAdminId) {
        requireReviewManager(performedByAdminId);
        return reviewRepository.findAllByOrderByCreatedAtDesc();
    }

    public void adminDeleteReview(Long performedByAdminId, Long reviewId) {
        requireReviewManager(performedByAdminId);
        Review review = getReview(reviewId);
        reviewRepository.delete(review);
    }
}