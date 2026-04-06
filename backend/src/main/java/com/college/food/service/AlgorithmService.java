package com.college.food.service;

import com.college.food.model.MenuItem;
import com.college.food.model.Order;
import com.college.food.model.OrderStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@Slf4j
public class AlgorithmService {

    // ════════════════════════════════════════════════════════════════
    // 1. BINARY SEARCH — Search menu items by price range
    //    Time Complexity: O(log n) after sorting O(n log n)
    // ════════════════════════════════════════════════════════════════

    public List<MenuItem> binarySearchByPrice(List<MenuItem> items, BigDecimal minPrice, BigDecimal maxPrice) {
        // First sort by price — O(n log n)
        List<MenuItem> sorted = new ArrayList<>(items);
        sorted.sort(Comparator.comparing(MenuItem::getPrice));

        // Binary search for left boundary (minPrice) — O(log n)
        int left = findLeftBoundary(sorted, minPrice);
        // Binary search for right boundary (maxPrice) — O(log n)
        int right = findRightBoundary(sorted, maxPrice);

        if (left > right) return new ArrayList<>();
        return sorted.subList(left, right + 1);
    }

    private int findLeftBoundary(List<MenuItem> sorted, BigDecimal minPrice) {
        int lo = 0, hi = sorted.size() - 1, result = sorted.size();
        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            if (sorted.get(mid).getPrice().compareTo(minPrice) >= 0) {
                result = mid;
                hi = mid - 1;
            } else {
                lo = mid + 1;
            }
        }
        return result;
    }

    private int findRightBoundary(List<MenuItem> sorted, BigDecimal maxPrice) {
        int lo = 0, hi = sorted.size() - 1, result = -1;
        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            if (sorted.get(mid).getPrice().compareTo(maxPrice) <= 0) {
                result = mid;
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return result;
    }

    // ════════════════════════════════════════════════════════════════
    // 2. DFS — Traverse menu category tree
    //    Categories have subcategories (e.g. Food > Breakfast > Dosa)
    //    Time Complexity: O(V + E) where V=nodes, E=edges
    // ════════════════════════════════════════════════════════════════

    public static class CategoryNode {
        public String name;
        public List<CategoryNode> children;
        public List<String> items;

        public CategoryNode(String name) {
            this.name = name;
            this.children = new ArrayList<>();
            this.items = new ArrayList<>();
        }
    }

    public List<String> dfsMenuTraversal(CategoryNode root) {
        List<String> result = new ArrayList<>();
        Deque<CategoryNode> stack = new ArrayDeque<>();
        stack.push(root);

        while (!stack.isEmpty()) {
            CategoryNode node = stack.pop();
            result.add(node.name);
            // Add all items in this category
            result.addAll(node.items);
            // Push children to stack (DFS)
            for (int i = node.children.size() - 1; i >= 0; i--) {
                stack.push(node.children.get(i));
            }
        }
        log.info("DFS traversal result: {}", result);
        return result;
    }

    public List<String> bfsMenuTraversal(CategoryNode root) {
        List<String> result = new ArrayList<>();
        Queue<CategoryNode> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            CategoryNode node = queue.poll();
            result.add(node.name);
            result.addAll(node.items);
            // Add children to queue (BFS — level by level)
            queue.addAll(node.children);
        }
        log.info("BFS traversal result: {}", result);
        return result;
    }

    public CategoryNode buildMenuTree(List<MenuItem> items) {
        CategoryNode root = new CategoryNode("Menu");
        Map<String, CategoryNode> categoryMap = new HashMap<>();

        // Group items by category
        for (MenuItem item : items) {
            String cat = item.getCategory() != null ? item.getCategory() : "Other";
            categoryMap.computeIfAbsent(cat, CategoryNode::new).items.add(item.getName());
        }

        // Attach categories to root
        categoryMap.values().forEach(root.children::add);
        return root;
    }

    // ════════════════════════════════════════════════════════════════
    // 3. SORTING — Sort orders by priority
    //    Priority: PLACED > PREPARING > CONFIRMED > READY > COLLECTED
    //    Secondary sort: by creation time (oldest first)
    //    Time Complexity: O(n log n) — merge sort internally
    // ════════════════════════════════════════════════════════════════

    public List<Order> sortOrdersByPriority(List<Order> orders) {
        Map<OrderStatus, Integer> priorityMap = new HashMap<>();
        priorityMap.put(OrderStatus.PLACED,    1); // highest priority
        priorityMap.put(OrderStatus.CONFIRMED, 2);
        priorityMap.put(OrderStatus.PREPARING, 3);
        priorityMap.put(OrderStatus.READY,     4);
        priorityMap.put(OrderStatus.COLLECTED, 5);
        priorityMap.put(OrderStatus.CANCELLED, 6); // lowest priority

        List<Order> sorted = new ArrayList<>(orders);
        sorted.sort(Comparator
            .comparingInt((Order o) -> priorityMap.getOrDefault(o.getStatus(), 99))
            .thenComparing(Order::getCreatedAt) // oldest first within same priority
        );

        log.info("Orders sorted by priority: {}",
            sorted.stream().map(o -> "#" + o.getId() + "(" + o.getStatus() + ")").toList());
        return sorted;
    }

    // ════════════════════════════════════════════════════════════════
    // 4. GREEDY ALGORITHM — Assign orders to staff optimally
    //    Goal: minimize total waiting time
    //    Strategy: assign shortest preparation time orders first
    //    (Shortest Job First — greedy approach)
    //    Time Complexity: O(n log n)
    // ════════════════════════════════════════════════════════════════

    public static class StaffAssignment {
        public Long orderId;
        public String staffName;
        public int estimatedPrepTime;
        public int startTime;
        public int endTime;

        public StaffAssignment(Long orderId, String staffName, int prepTime, int startTime) {
            this.orderId = orderId;
            this.staffName = staffName;
            this.estimatedPrepTime = prepTime;
            this.startTime = startTime;
            this.endTime = startTime + prepTime;
        }
    }

    public List<StaffAssignment> greedyOrderAssignment(List<Order> orders, List<String> staffMembers) {
        if (staffMembers.isEmpty()) return new ArrayList<>();

        // Greedy: sort orders by estimated prep time (shortest first)
        List<Order> sortedOrders = new ArrayList<>(orders);
        sortedOrders.sort(Comparator.comparingInt(o ->
            o.getItems().stream()
                .mapToInt(item -> item.getMenuItem().getPrepTimeMinutes() * item.getQuantity())
                .sum()
        ));

        // Track when each staff member becomes free
        Map<String, Integer> staffFreeAt = new HashMap<>();
        staffMembers.forEach(s -> staffFreeAt.put(s, 0));

        List<StaffAssignment> assignments = new ArrayList<>();

        for (Order order : sortedOrders) {
            // Greedy choice: pick the staff member who is free earliest
            String assignedStaff = staffFreeAt.entrySet().stream()
                .min(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(staffMembers.get(0));

            int prepTime = order.getItems().stream()
                .mapToInt(item -> item.getMenuItem().getPrepTimeMinutes() * item.getQuantity())
                .sum();
            prepTime = Math.max(prepTime, 5); // minimum 5 minutes

            int startTime = staffFreeAt.get(assignedStaff);
            StaffAssignment assignment = new StaffAssignment(
                order.getId(), assignedStaff, prepTime, startTime
            );
            assignments.add(assignment);

            // Update when this staff member will be free next
            staffFreeAt.put(assignedStaff, startTime + prepTime);

            log.info("Greedy: Order #{} assigned to {} (prep: {}min, starts at t={}min)",
                order.getId(), assignedStaff, prepTime, startTime);
        }

        return assignments;
    }
}
