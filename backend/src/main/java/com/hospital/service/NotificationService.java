package com.hospital.service;

import com.hospital.dto.NotificationRequest;
import com.hospital.dto.NotificationResponse;
import com.hospital.entity.Notification;
import com.hospital.entity.Role;
import com.hospital.entity.User;
import com.hospital.exception.AccessDeniedException;
import com.hospital.repository.NotificationRepository;
import com.hospital.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository) {

        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // =========================
    // CREATE NOTIFICATION
    // =========================

    public NotificationResponse createNotification(
            NotificationRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Notification notification = Notification.builder()
                .user(user)
                .title(request.getTitle())
                .message(request.getMessage())
                .readStatus(false)
                .createdAt(LocalDateTime.now())
                .build();

        return toResponse(
                notificationRepository.save(notification)
        );
    }

    // =========================
    // GET USER NOTIFICATIONS
    // =========================

    public List<NotificationResponse> getUserNotifications(
            Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        checkUserAccess(user);

        return notificationRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // GET UNREAD NOTIFICATIONS
    // =========================

    public List<NotificationResponse> getUnreadNotifications(
            Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        checkUserAccess(user);

        return notificationRepository
                .findByUserIdAndReadStatusFalse(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // GET NOTIFICATION BY ID
    // =========================

    public NotificationResponse getNotificationById(Long id) {

        Notification notification =
                notificationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found"));

        checkNotificationAccess(notification);

        return toResponse(notification);
    }

    // =========================
    // MARK NOTIFICATION AS READ
    // =========================

    public NotificationResponse markAsRead(Long id) {

        Notification notification =
                notificationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found"));

        checkNotificationAccess(notification);

        notification.setReadStatus(true);

        return toResponse(
                notificationRepository.save(notification)
        );
    }

    // =========================
    // CHECK USER ACCESS
    // =========================

    private void checkUserAccess(User targetUser) {

        String loggedInUsername =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        User loggedInUser =
                userRepository.findByUsername(loggedInUsername)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Logged-in user not found"));

        /*
         * ADMIN can access notifications
         * of any user.
         */
        if (loggedInUser.getRole() == Role.ADMIN) {
            return;
        }

        /*
         * Other users can access only
         * their own notifications.
         */
        if (!targetUser.getId().equals(loggedInUser.getId())) {

            throw new AccessDeniedException(
                    "You are not allowed to access these notifications"
            );
        }
    }

    // =========================
    // CHECK NOTIFICATION ACCESS
    // =========================

    private void checkNotificationAccess(
            Notification notification) {

        checkUserAccess(notification.getUser());
    }

    // =========================
    // ENTITY → RESPONSE
    // =========================

    private NotificationResponse toResponse(
            Notification notification) {

        User user = notification.getUser();

        return new NotificationResponse(
                notification.getId(),
                user.getId(),
                user.getUsername(),
                notification.getTitle(),
                notification.getMessage(),
                notification.isReadStatus(),
                notification.getCreatedAt()
        );
    }
}