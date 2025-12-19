package com.expense.dto;

import lombok.Data;
import java.util.List;

@Data
public class GroupRequest {
    private String name;
    private List<Long> memberIds;
}