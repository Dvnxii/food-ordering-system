package com.college.food.service;

import com.college.food.model.Order;
import com.college.food.model.User;
import com.college.food.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    @Value("${app.firebase.enabled:false}")
    private boolean firebaseEnabled;

    /**
     * Send real-time WebSocket notification to a specific student's browser.
     * The student must be connected via WebSocket to receive this.
     */
    public void notifyViaWebSocket(Long studentId, String type, String message, Long orderId) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", type);
        payload.put("message", message);
        payload.put("orderId", orderId);
        payload.put("timestamp", System.currentTimeMillis());

        // Sends to /user/{studentId}/queue/notifications
        messagingTemplate.convertAndSendToUser(
                studentId.toString(),
                "/queue/notifications",
                payload
        );

        // Also broadcast to staff topic so staff panel updates live
        messagingTemplate.convertAndSend("/topic/orders", payload);

        log.info("WebSocket notification sent to student {}: {}", studentId, message);
    }

    /**
     * Send Firebase push notification to student's phone.
     * Works even when the browser tab is closed.
     */
    public void notifyViaPush(Long studentId, String title, String body) {
        if (!firebaseEnabled) {
            log.debug("Firebase disabled — skipping push notification for student {}", studentId);
            return;
        }

        User student = userRepository.findById(studentId).orElse(null);
        if (student == null || student.getFcmToken() == null) {
            log.debug("No FCM token for student {}", studentId);
            return;
        }

        try {
            // Dynamic class loading so app starts even without firebase-service-account.json
            Class<?> messagingClass = Class.forName("com.google.firebase.messaging.FirebaseMessaging");
            Class<?> messageClass = Class.forName("com.google.firebase.messaging.Message");
            Class<?> notifClass = Class.forName("com.google.firebase.messaging.Notification");

            Object notif = notifClass.getMethod("builder")
                    .invoke(null);
            notif = notif.getClass().getMethod("setTitle", String.class).invoke(notif, title);
            notif = notif.getClass().getMethod("setBody", String.class).invoke(notif, body);
            Object builtNotif = notif.getClass().getMethod("build").invoke(notif);

            Object msgBuilder = messageClass.getMethod("builder").invoke(null);
            msgBuilder = msgBuilder.getClass().getMethod("setNotification", Class.forName("com.google.firebase.messaging.Notification"))
                    .invoke(msgBuilder, builtNotif);
            msgBuilder = msgBuilder.getClass().getMethod("setToken", String.class)
                    .invoke(msgBuilder, student.getFcmToken());
            Object msg = msgBuilder.getClass().getMethod("build").invoke(msgBuilder);

            Object instance = messagingClass.getMethod("getInstance").invoke(null);
            String response = (String) messagingClass.getMethod("send", Class.forName("com.google.firebase.messaging.Message"))
                    .invoke(instance, msg);

            log.info("FCM push sent to student {}: {}", studentId, response);
        } catch (Exception e) {
            log.error("FCM push failed for student {}: {}", studentId, e.getMessage());
        }
    }

    /**
     * Main method called when canteen staff marks an order as READY.
     * Sends both WebSocket (browser) and FCM push (phone).
     */
    public void notifyOrderReady(Order order) {
        String message = "Your order #" + order.getId() + " is ready for pickup at the canteen!";
        Long studentId = order.getStudent().getId();

        notifyViaWebSocket(studentId, "ORDER_READY", message, order.getId());
        notifyViaPush(studentId, "Order Ready! 🍽️", message);
    }

    public void notifyOrderConfirmed(Order order) {
        String message = "Order #" + order.getId() + " confirmed. We're preparing your food!";
        Long studentId = order.getStudent().getId();
        notifyViaWebSocket(studentId, "ORDER_CONFIRMED", message, order.getId());
        notifyViaPush(studentId, "Order Confirmed ✅", message);
    }

    public void notifyOrderPreparing(Order order) {
        String message = "Your order #" + order.getId() + " is being prepared now.";
        Long studentId = order.getStudent().getId();
        notifyViaWebSocket(studentId, "ORDER_PREPARING", message, order.getId());
    }
}
