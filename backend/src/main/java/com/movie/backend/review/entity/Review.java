package com.movie.backend.review.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.movie.backend.movie.entity.Movie;
import com.movie.backend.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "reviews",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "movie_id"})
)
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "review_type")
public abstract class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public abstract String displayReviewType();

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
    public String getReviewType() {
        return displayReviewType();
    }

    @Transient
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    @Transient
    public String getUsername() {
        return user != null ? user.getUsername() : null;
    }

    @Transient
    public String getUserFullName() {
        return user != null ? user.getFullName() : null;
    }

    @Transient
    public String getUserProfileImage() {
        return user != null ? user.getProfileImage() : null;
    }

    @Transient
    public Long getMovieId() {
        return movie != null ? movie.getId() : null;
    }

    @Transient
    public String getMovieTitle() {
        return movie != null ? movie.getTitle() : null;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Movie getMovie() {
        return movie;
    }

    public void setMovie(Movie movie) {
        this.movie = movie;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
