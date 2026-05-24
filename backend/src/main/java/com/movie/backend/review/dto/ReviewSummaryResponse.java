package com.movie.backend.review.dto;

public class ReviewSummaryResponse {
    private Long movieId;
    private String movieTitle;
    private int totalReviews;
    private double averageRating;
    private int verifiedReviews;
    private int publicReviews;
    private int fiveStarCount;
    private int fourStarCount;
    private int threeStarCount;
    private int twoStarCount;
    private int oneStarCount;

    public Long getMovieId() {
        return movieId;
    }

    public void setMovieId(Long movieId) {
        this.movieId = movieId;
    }

    public String getMovieTitle() {
        return movieTitle;
    }

    public void setMovieTitle(String movieTitle) {
        this.movieTitle = movieTitle;
    }

    public int getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(int totalReviews) {
        this.totalReviews = totalReviews;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public int getVerifiedReviews() {
        return verifiedReviews;
    }

    public void setVerifiedReviews(int verifiedReviews) {
        this.verifiedReviews = verifiedReviews;
    }

    public int getPublicReviews() {
        return publicReviews;
    }

    public void setPublicReviews(int publicReviews) {
        this.publicReviews = publicReviews;
    }

    public int getFiveStarCount() {
        return fiveStarCount;
    }

    public void setFiveStarCount(int fiveStarCount) {
        this.fiveStarCount = fiveStarCount;
    }

    public int getFourStarCount() {
        return fourStarCount;
    }

    public void setFourStarCount(int fourStarCount) {
        this.fourStarCount = fourStarCount;
    }

    public int getThreeStarCount() {
        return threeStarCount;
    }

    public void setThreeStarCount(int threeStarCount) {
        this.threeStarCount = threeStarCount;
    }

    public int getTwoStarCount() {
        return twoStarCount;
    }

    public void setTwoStarCount(int twoStarCount) {
        this.twoStarCount = twoStarCount;
    }

    public int getOneStarCount() {
        return oneStarCount;
    }

    public void setOneStarCount(int oneStarCount) {
        this.oneStarCount = oneStarCount;
    }
}