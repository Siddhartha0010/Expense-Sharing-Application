package com.expense.controller;

import com.expense.dto.*;
import com.expense.entity.*;
import com.expense.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    // ========== USER ENDPOINTS ==========

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody UserRequest request) {
        return ResponseEntity.ok(expenseService.createUser(request));
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(expenseService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.getUserById(id));
    }

    // ========== GROUP ENDPOINTS ==========

    @PostMapping("/groups")
    public ResponseEntity<ExpenseGroup> createGroup(@RequestBody GroupRequest request) {
        return ResponseEntity.ok(expenseService.createGroup(request));
    }

    @GetMapping("/groups")
    public ResponseEntity<List<ExpenseGroup>> getAllGroups() {
        return ResponseEntity.ok(expenseService.getAllGroups());
    }

    @GetMapping("/groups/{id}")
    public ResponseEntity<ExpenseGroup> getGroupById(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.getGroupById(id));
    }

    @PostMapping("/groups/{groupId}/members/{userId}")
    public ResponseEntity<ExpenseGroup> addMemberToGroup(
            @PathVariable Long groupId, 
            @PathVariable Long userId) {
        return ResponseEntity.ok(expenseService.addMemberToGroup(groupId, userId));
    }

    // ========== EXPENSE ENDPOINTS ==========

    @PostMapping("/expenses")
    public ResponseEntity<Expense> addExpense(@RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(expenseService.addExpense(request));
    }

    @GetMapping("/groups/{groupId}/expenses")
    public ResponseEntity<List<Expense>> getGroupExpenses(@PathVariable Long groupId) {
        return ResponseEntity.ok(expenseService.getExpensesByGroup(groupId));
    }

    // ========== BALANCE ENDPOINTS ==========

    @GetMapping("/groups/{groupId}/balances")
    public ResponseEntity<List<BalanceResponse>> getGroupBalances(@PathVariable Long groupId) {
        return ResponseEntity.ok(expenseService.getGroupBalances(groupId));
    }

    @GetMapping("/groups/{groupId}/users/{userId}/balance")
    public ResponseEntity<UserBalanceResponse> getUserBalance(
            @PathVariable Long groupId,
            @PathVariable Long userId) {
        return ResponseEntity.ok(expenseService.getUserBalance(groupId, userId));
    }

    // ========== SETTLEMENT ENDPOINT ==========

    @PostMapping("/settlements")
    public ResponseEntity<Expense> settleDue(@RequestBody SettlementRequest request) {
        return ResponseEntity.ok(expenseService.settleDue(request));
    }
}