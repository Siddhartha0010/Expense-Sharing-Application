package com.expense.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "expenses")
@Data
public class Expense {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String description;
    
    private BigDecimal amount;
    
    private String category;
    
    private String splitType;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @ManyToOne
    @JoinColumn(name = "group_id")
    @JsonIgnore
    private ExpenseGroup group;
    
    @ManyToOne
    @JoinColumn(name = "paid_by_id")
    private User paidBy;
    
    @ElementCollection
    @CollectionTable(name = "expense_splits")
    @MapKeyJoinColumn(name = "user_id")
    @Column(name = "amount")
    @JsonIgnore
    private Map<User, BigDecimal> splits = new HashMap<>();
}