package com.expense.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    private String email;
    
    private String phone;
    
    @ManyToMany(mappedBy = "members")
    @JsonIgnore
    private List<ExpenseGroup> groups = new ArrayList<>();
}