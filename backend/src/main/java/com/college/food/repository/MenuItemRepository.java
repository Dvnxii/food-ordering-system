package com.college.food.repository;

import com.college.food.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByAvailableTrue();
    List<MenuItem> findByCategory(String category);
    List<MenuItem> findByCategoryAndAvailableTrue(String category);
}
