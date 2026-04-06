package com.college.food.service;

import com.college.food.dto.OrderDto;
import com.college.food.model.MenuItem;
import com.college.food.model.Order;
import com.college.food.model.OrderItem;
import com.college.food.model.OrderStatus;
import com.college.food.model.User;
import com.college.food.repository.MenuItemRepository;
import com.college.food.repository.OrderRepository;
import com.college.food.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public Order placeOrder(OrderDto.OrderRequest request, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Order order = Order.builder()
                .student(student)
                .status(OrderStatus.PLACED)
                .specialInstructions(request.getSpecialInstructions())
                .items(new ArrayList<>())
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (OrderDto.OrderItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found: " + itemReq.getMenuItemId()));

            if (!menuItem.getAvailable()) {
                throw new RuntimeException(menuItem.getName() + " is currently unavailable");
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .menuItem(menuItem)
                    .quantity(itemReq.getQuantity())
                    .price(menuItem.getPrice())
                    .build();

            order.getItems().add(orderItem);
            total = total.add(menuItem.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity())));
        }

        order.setTotal(total);
        Order saved = orderRepository.save(order);

        notificationService.notifyViaWebSocket(
                student.getId(), "NEW_ORDER",
                "New order placed by " + student.getName(), saved.getId()
        );

        log.info("Order #{} placed by student {}", saved.getId(), studentEmail);
        return saved;
    }

    @Transactional
    public Order updateStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);

        if (newStatus == OrderStatus.CONFIRMED) {
            notificationService.notifyOrderConfirmed(saved);
        } else if (newStatus == OrderStatus.PREPARING) {
            notificationService.notifyOrderPreparing(saved);
        } else if (newStatus == OrderStatus.READY) {
            notificationService.notifyOrderReady(saved);
        }

        return saved;
    }

    public List<Order> getStudentOrders(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return orderRepository.findByStudentOrderByCreatedAtDesc(student);
    }

    public List<Order> getActiveOrders() {
        return orderRepository.findActiveOrders();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
    }

    public Map<String, Long> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("placed",    orderRepository.countByStatus(OrderStatus.PLACED));
        stats.put("confirmed", orderRepository.countByStatus(OrderStatus.CONFIRMED));
        stats.put("preparing", orderRepository.countByStatus(OrderStatus.PREPARING));
        stats.put("ready",     orderRepository.countByStatus(OrderStatus.READY));
        return stats;
    }
}
