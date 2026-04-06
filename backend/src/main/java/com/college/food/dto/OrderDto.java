package com.college.food.dto;

import com.college.food.model.Order;
import com.college.food.model.OrderItem;
import com.college.food.model.OrderStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDto {

    @Data
    public static class OrderRequest {
        private List<OrderItemRequest> items;
        private String specialInstructions;
    }

    @Data
    public static class OrderItemRequest {
        private Long menuItemId;
        private Integer quantity;
    }

    public static class OrderResponse {
        private Long id;
        private String studentName;
        private Long studentId;
        private List<ItemDetail> items;
        private OrderStatus status;
        private BigDecimal total;
        private String specialInstructions;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public OrderResponse() {}

        public OrderResponse(Order order) {
            this.id = order.getId();
            this.studentName = order.getStudent().getName();
            this.studentId = order.getStudent().getId();
            this.status = order.getStatus();
            this.total = order.getTotal();
            this.specialInstructions = order.getSpecialInstructions();
            this.createdAt = order.getCreatedAt();
            this.updatedAt = order.getUpdatedAt();
            this.items = order.getItems().stream().map(ItemDetail::new).toList();
        }

        public Long getId() { return id; }
        public String getStudentName() { return studentName; }
        public Long getStudentId() { return studentId; }
        public List<ItemDetail> getItems() { return items; }
        public OrderStatus getStatus() { return status; }
        public BigDecimal getTotal() { return total; }
        public String getSpecialInstructions() { return specialInstructions; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
    }

    public static class ItemDetail {
        private String name;
        private Integer quantity;
        private BigDecimal price;

        public ItemDetail() {}

        public ItemDetail(OrderItem item) {
            this.name = item.getMenuItem().getName();
            this.quantity = item.getQuantity();
            this.price = item.getPrice();
        }

        public String getName() { return name; }
        public Integer getQuantity() { return quantity; }
        public BigDecimal getPrice() { return price; }
    }

    @Data
    public static class StatusUpdateRequest {
        private OrderStatus status;
    }
}
