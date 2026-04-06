package com.college.food.repository;

import com.college.food.model.Order;
import com.college.food.model.OrderStatus;
import com.college.food.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByStudentOrderByCreatedAtDesc(User student);

    List<Order> findByStatusInOrderByCreatedAtDesc(List<OrderStatus> statuses);

    List<Order> findByStatusOrderByCreatedAtAsc(OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.status NOT IN ('COLLECTED', 'CANCELLED') ORDER BY o.createdAt DESC")
    List<Order> findActiveOrders();

    long countByStatus(OrderStatus status);
}
