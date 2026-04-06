package com.college.food.model;

public enum OrderStatus {
    PLACED,      // Student placed the order
    CONFIRMED,   // Canteen confirmed the order
    PREPARING,   // Food is being prepared
    READY,       // Food is ready for pickup
    COLLECTED,   // Student collected the food
    CANCELLED    // Order was cancelled
}
