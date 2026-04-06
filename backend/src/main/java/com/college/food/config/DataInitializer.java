package com.college.food.config;

import com.college.food.model.MenuItem;
import com.college.food.model.User;
import com.college.food.repository.MenuItemRepository;
import com.college.food.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final MenuItemRepository menuItemRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedMenu();
        log.info("========================================");
        log.info("  Sample data loaded!");
        log.info("  Student login: student@college.edu / password123");
        log.info("  Staff login:   staff@canteen.edu  / password123");
        log.info("  H2 Console:    http://localhost:8080/h2-console");
        log.info("========================================");
    }

    private void seedUsers() {
        if (userRepository.count() > 0) return;

        userRepository.saveAll(List.of(
            User.builder()
                .name("Rahul Sharma")
                .email("student@college.edu")
                .password(passwordEncoder.encode("password123"))
                .role(User.Role.STUDENT)
                .build(),
            User.builder()
                .name("Priya Patel")
                .email("student2@college.edu")
                .password(passwordEncoder.encode("password123"))
                .role(User.Role.STUDENT)
                .build(),
            User.builder()
                .name("Canteen Staff")
                .email("staff@canteen.edu")
                .password(passwordEncoder.encode("password123"))
                .role(User.Role.STAFF)
                .build()
        ));
    }

    private void seedMenu() {
        if (menuItemRepository.count() > 0) return;

        menuItemRepository.saveAll(List.of(
            // Breakfast
            MenuItem.builder().name("Masala Dosa").description("Crispy dosa with spiced potato filling").price(new BigDecimal("45.00")).category("Breakfast").prepTimeMinutes(10).available(true).build(),
            MenuItem.builder().name("Poha").description("Flattened rice with vegetables and spices").price(new BigDecimal("25.00")).category("Breakfast").prepTimeMinutes(8).available(true).build(),
            MenuItem.builder().name("Idli Sambar").description("Steamed rice cakes with sambar and chutney").price(new BigDecimal("35.00")).category("Breakfast").prepTimeMinutes(5).available(true).build(),
            MenuItem.builder().name("Aloo Paratha").description("Stuffed whole wheat flatbread with pickle").price(new BigDecimal("40.00")).category("Breakfast").prepTimeMinutes(12).available(true).build(),

            // Lunch
            MenuItem.builder().name("Veg Thali").description("Rice, dal, sabzi, roti, salad, and dessert").price(new BigDecimal("80.00")).category("Lunch").prepTimeMinutes(15).available(true).build(),
            MenuItem.builder().name("Paneer Butter Masala").description("Cottage cheese in rich tomato gravy with naan").price(new BigDecimal("95.00")).category("Lunch").prepTimeMinutes(15).available(true).build(),
            MenuItem.builder().name("Chicken Biryani").description("Aromatic basmati rice with spiced chicken").price(new BigDecimal("110.00")).category("Lunch").prepTimeMinutes(20).available(true).build(),
            MenuItem.builder().name("Rajma Chawal").description("Kidney bean curry with steamed rice").price(new BigDecimal("70.00")).category("Lunch").prepTimeMinutes(10).available(true).build(),

            // Snacks
            MenuItem.builder().name("Samosa (2 pcs)").description("Crispy pastry with spiced potato filling").price(new BigDecimal("20.00")).category("Snacks").prepTimeMinutes(5).available(true).build(),
            MenuItem.builder().name("Vada Pav").description("Mumbai style spiced potato burger").price(new BigDecimal("25.00")).category("Snacks").prepTimeMinutes(5).available(true).build(),
            MenuItem.builder().name("Pav Bhaji").description("Spiced mixed vegetable mash with buttered bread").price(new BigDecimal("55.00")).category("Snacks").prepTimeMinutes(10).available(true).build(),
            MenuItem.builder().name("Maggi Noodles").description("Spicy instant noodles with vegetables").price(new BigDecimal("30.00")).category("Snacks").prepTimeMinutes(7).available(true).build(),

            // Drinks
            MenuItem.builder().name("Masala Chai").description("Spiced Indian tea with milk").price(new BigDecimal("15.00")).category("Drinks").prepTimeMinutes(3).available(true).build(),
            MenuItem.builder().name("Lassi").description("Chilled yogurt drink, sweet or salted").price(new BigDecimal("30.00")).category("Drinks").prepTimeMinutes(3).available(true).build(),
            MenuItem.builder().name("Cold Coffee").description("Blended coffee with ice cream").price(new BigDecimal("45.00")).category("Drinks").prepTimeMinutes(5).available(true).build(),
            MenuItem.builder().name("Fresh Lime Soda").description("Refreshing lime soda with mint").price(new BigDecimal("25.00")).category("Drinks").prepTimeMinutes(3).available(true).build()
        ));
    }
}
