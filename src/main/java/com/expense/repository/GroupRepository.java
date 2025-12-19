package com.expense.repository;

import com.expense.entity.ExpenseGroup;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRepository extends JpaRepository<ExpenseGroup, Long> {
}