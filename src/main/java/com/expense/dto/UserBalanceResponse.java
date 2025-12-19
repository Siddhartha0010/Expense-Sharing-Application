package com.expense.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class UserBalanceResponse {
    private Long userId;
    private String userName;
    private BigDecimal totalOwed;      // Others owe this user
    private BigDecimal totalOwing;     // This user owes others
    private BigDecimal netBalance;     // Positive = owed, Negative = owes
    private List<BalanceResponse> owesTo;
    private List<BalanceResponse> owedBy;
}