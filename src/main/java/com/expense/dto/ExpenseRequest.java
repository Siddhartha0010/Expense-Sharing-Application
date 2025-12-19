package com.expense.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class ExpenseRequest {
    private String description;
    private BigDecimal amount;
    private String category;
    private String splitType;      // EQUAL, EXACT, PERCENTAGE
    private Long paidByUserId;
    private Long groupId;
    private Map<Long, BigDecimal> splits; // userId -> amount or percentage
}