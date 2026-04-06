package com.college.food.dto;

import com.college.food.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDto {

    @Data
    public static class RegisterRequest {
        @NotBlank
        private String name;
        @Email @NotBlank
        private String email;
        @Size(min = 6)
        private String password;
        private User.Role role = User.Role.STUDENT;
    }

    @Data
    public static class LoginRequest {
        @Email @NotBlank
        private String email;
        @NotBlank
        private String password;
    }

    public static class AuthResponse {
        private String token;
        private String name;
        private String email;
        private String role;
        private Long userId;

        public AuthResponse() {}

        public AuthResponse(String token, User user) {
            this.token = token;
            this.name = user.getName();
            this.email = user.getEmail();
            this.role = user.getRole().name();
            this.userId = user.getId();
        }

        public String getToken() { return token; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getRole() { return role; }
        public Long getUserId() { return userId; }
    }
}
