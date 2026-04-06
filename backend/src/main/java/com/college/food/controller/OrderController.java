package com.college.food.controller;

import com.college.food.dto.OrderDto;
import com.college.food.model.Order;
import com.college.food.model.OrderStatus;
import com.college.food.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // ─── STUDENT ENDPOINTS ───────────────────────────────────────────

    /** Student: place a new order */
    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<OrderDto.OrderResponse> placeOrder(
            @RequestBody OrderDto.OrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Order order = orderService.placeOrder(request, userDetails.getUsername());
        return ResponseEntity.ok(new OrderDto.OrderResponse(order));
    }

    /** Student: view their own order history */
    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public List<OrderDto.OrderResponse> getMyOrders(@AuthenticationPrincipal UserDetails userDetails) {
        return orderService.getStudentOrders(userDetails.getUsername())
                .stream().map(OrderDto.OrderResponse::new).toList();
    }

    /** Student: get a specific order */
    @GetMapping("/{id}")
    public ResponseEntity<OrderDto.OrderResponse> getOrder(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        return ResponseEntity.ok(new OrderDto.OrderResponse(order));
    }

    // ─── STAFF ENDPOINTS ────────────────────────────────────────────

    /** Staff: view all active orders on the canteen panel */
    @GetMapping("/active")
    @PreAuthorize("hasRole('STAFF')")
    public List<OrderDto.OrderResponse> getActiveOrders() {
        return orderService.getActiveOrders()
                .stream().map(OrderDto.OrderResponse::new).toList();
    }

    /** Staff: update order status (CONFIRMED → PREPARING → READY → COLLECTED) */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<OrderDto.OrderResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody OrderDto.StatusUpdateRequest request) {

        Order updated = orderService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(new OrderDto.OrderResponse(updated));
    }

    /** Staff: dashboard stats */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(orderService.getDashboardStats());
    }
}
