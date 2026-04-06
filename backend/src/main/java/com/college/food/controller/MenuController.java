package com.college.food.controller;

import com.college.food.model.MenuItem;
import com.college.food.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuItemRepository menuItemRepository;

    @GetMapping
    public List<MenuItem> getAllAvailableItems() {
        return menuItemRepository.findByAvailableTrue();
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('STAFF')")
    public List<MenuItem> getAllItems() {
        return menuItemRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('STAFF')")
    public MenuItem addItem(@RequestBody MenuItem item) {
        return menuItemRepository.save(item);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<MenuItem> updateItem(@PathVariable Long id, @RequestBody MenuItem updated) {
        return menuItemRepository.findById(id).map(item -> {
            item.setName(updated.getName());
            item.setDescription(updated.getDescription());
            item.setPrice(updated.getPrice());
            item.setCategory(updated.getCategory());
            item.setAvailable(updated.getAvailable());
            item.setPrepTimeMinutes(updated.getPrepTimeMinutes());
            return ResponseEntity.ok(menuItemRepository.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<MenuItem> toggleAvailability(@PathVariable Long id) {
        return menuItemRepository.findById(id).map(item -> {
            item.setAvailable(!item.getAvailable());
            return ResponseEntity.ok(menuItemRepository.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        menuItemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
