package com.expense.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "expense_groups")
@Data
public class ExpenseGroup {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @ManyToMany
    @JoinTable(
        name = "group_members",
        joinColumns = @JoinColumn(name = "group_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> members = new ArrayList<>();
    
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Expense> expenses = new ArrayList<>();
}