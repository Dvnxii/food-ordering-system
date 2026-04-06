package com.college.food.controller;

import com.college.food.model.MenuItem;
import com.college.food.model.Order;
import com.college.food.model.OrderStatus;
import com.college.food.repository.MenuItemRepository;
import com.college.food.repository.OrderRepository;
import com.college.food.service.AlgorithmService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/algorithms")
@RequiredArgsConstructor
public class AlgorithmController {

    private final AlgorithmService algorithmService;
    private final MenuItemRepository menuItemRepository;
    private final OrderRepository orderRepository;

    // ── Binary Search: find menu items in price range ────────────────
    @GetMapping("/menu/search")
    public ResponseEntity<?> searchMenuByPrice(
            @RequestParam(defaultValue = "0") double minPrice,
            @RequestParam(defaultValue = "999") double maxPrice) {

        List<MenuItem> allItems = menuItemRepository.findByAvailableTrue();
        List<MenuItem> result = algorithmService.binarySearchByPrice(
            allItems,
            BigDecimal.valueOf(minPrice),
            BigDecimal.valueOf(maxPrice)
        );
        return ResponseEntity.ok(Map.of(
            "algorithm", "Binary Search",
            "complexity", "O(log n)",
            "minPrice", minPrice,
            "maxPrice", maxPrice,
            "totalItems", allItems.size(),
            "foundItems", result.size(),
            "results", result
        ));
    }

    // ── DFS: traverse menu category tree ─────────────────────────────
    @GetMapping("/menu/dfs")
    public ResponseEntity<?> dfsMenuTraversal() {
        List<MenuItem> items = menuItemRepository.findAll();
        AlgorithmService.CategoryNode tree = algorithmService.buildMenuTree(items);
        List<String> dfsResult = algorithmService.dfsMenuTraversal(tree);
        List<String> bfsResult = algorithmService.bfsMenuTraversal(tree);
        return ResponseEntity.ok(Map.of(
            "algorithm", "DFS & BFS",
            "complexity", "O(V + E)",
            "dfsOrder", dfsResult,
            "bfsOrder", bfsResult
        ));
    }

    // ── Sorting: sort orders by priority ─────────────────────────────
    @GetMapping("/orders/sorted")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<?> getSortedOrders() {
        List<Order> activeOrders = orderRepository.findActiveOrders();
        List<Order> sorted = algorithmService.sortOrdersByPriority(activeOrders);
        return ResponseEntity.ok(Map.of(
            "algorithm", "Priority Sort (Merge Sort internally)",
            "complexity", "O(n log n)",
            "totalOrders", sorted.size(),
            "sortedOrders", sorted.stream().map(o -> Map.of(
                "id", o.getId(),
                "status", o.getStatus(),
                "student", o.getStudent().getName(),
                "total", o.getTotal(),
                "createdAt", o.getCreatedAt()
            )).toList()
        ));
    }

    // ── Greedy: assign orders to staff optimally ──────────────────────
    @PostMapping("/orders/assign")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<?> greedyAssignment(@RequestBody List<String> staffMembers) {
        List<Order> pendingOrders = orderRepository.findByStatusOrderByCreatedAtAsc(OrderStatus.PLACED);
        List<AlgorithmService.StaffAssignment> assignments =
            algorithmService.greedyOrderAssignment(pendingOrders, staffMembers);

        return ResponseEntity.ok(Map.of(
            "algorithm", "Greedy - Shortest Job First",
            "complexity", "O(n log n)",
            "staffCount", staffMembers.size(),
            "ordersAssigned", assignments.size(),
            "assignments", assignments.stream().map(a -> Map.of(
                "orderId", a.orderId,
                "assignedTo", a.staffName,
                "prepTimeMinutes", a.estimatedPrepTime,
                "startsAtMinute", a.startTime,
                "endsAtMinute", a.endTime
            )).toList()
        ));
    }
}
