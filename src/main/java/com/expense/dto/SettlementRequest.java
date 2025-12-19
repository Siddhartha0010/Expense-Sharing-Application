package com.expense.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SettlementRequest {
    private Long fromUserId;
    private Long toUserId;
    private Long groupId;
    private BigDecimal amount;
}