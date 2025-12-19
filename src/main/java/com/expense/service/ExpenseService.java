package com.expense.service;

import com.expense.dto.*;
import com.expense.entity.*;
import com.expense.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;

    // ========== USER OPERATIONS ==========
    
    public User createUser(UserRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ========== GROUP OPERATIONS ==========
    
    public ExpenseGroup createGroup(GroupRequest request) {
        ExpenseGroup group = new ExpenseGroup();
        group.setName(request.getName());
        
        List<User> members = userRepository.findAllById(request.getMemberIds());
        group.setMembers(members);
        
        return groupRepository.save(group);
    }

    public List<ExpenseGroup> getAllGroups() {
        return groupRepository.findAll();
    }

    public ExpenseGroup getGroupById(Long id) {
        return groupRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Group not found"));
    }

    public ExpenseGroup addMemberToGroup(Long groupId, Long userId) {
        ExpenseGroup group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        group.getMembers().add(user);
        return groupRepository.save(group);
    }

    // ========== EXPENSE OPERATIONS ==========
    
    public Expense addExpense(ExpenseRequest request) {
        ExpenseGroup group = groupRepository.findById(request.getGroupId())
            .orElseThrow(() -> new RuntimeException("Group not found"));
        User paidBy = userRepository.findById(request.getPaidByUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        Expense expense = new Expense();
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setSplitType(request.getSplitType());
        expense.setGroup(group);
        expense.setPaidBy(paidBy);

        Map<User, BigDecimal> splits = calculateSplits(request, group.getMembers());
        expense.setSplits(splits);

        return expenseRepository.save(expense);
    }

    private Map<User, BigDecimal> calculateSplits(ExpenseRequest request, List<User> members) {
        Map<User, BigDecimal> splits = new HashMap<>();
        BigDecimal amount = request.getAmount();
        String splitType = request.getSplitType();

        if ("EQUAL".equalsIgnoreCase(splitType)) {
            BigDecimal splitAmount = amount.divide(
                BigDecimal.valueOf(members.size()), 2, RoundingMode.HALF_UP);
            for (User member : members) {
                splits.put(member, splitAmount);
            }
        } 
        else if ("EXACT".equalsIgnoreCase(splitType)) {
            for (Map.Entry<Long, BigDecimal> entry : request.getSplits().entrySet()) {
                User user = userRepository.findById(entry.getKey())
                    .orElseThrow(() -> new RuntimeException("User not found"));
                splits.put(user, entry.getValue());
            }
        } 
        else if ("PERCENTAGE".equalsIgnoreCase(splitType)) {
            for (Map.Entry<Long, BigDecimal> entry : request.getSplits().entrySet()) {
                User user = userRepository.findById(entry.getKey())
                    .orElseThrow(() -> new RuntimeException("User not found"));
                BigDecimal percentage = entry.getValue();
                BigDecimal splitAmount = amount.multiply(percentage)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                splits.put(user, splitAmount);
            }
        }

        return splits;
    }

    public List<Expense> getExpensesByGroup(Long groupId) {
        return expenseRepository.findByGroupId(groupId);
    }

    // ========== BALANCE OPERATIONS ==========
    
    public List<BalanceResponse> getGroupBalances(Long groupId) {
        List<Expense> expenses = expenseRepository.findByGroupId(groupId);
        
        Map<Long, BigDecimal> netBalances = new HashMap<>();
        Map<Long, String> userNames = new HashMap<>();

        for (Expense expense : expenses) {
            Long payerId = expense.getPaidBy().getId();
            userNames.put(payerId, expense.getPaidBy().getName());
            
            netBalances.merge(payerId, expense.getAmount(), BigDecimal::add);

            for (Map.Entry<User, BigDecimal> split : expense.getSplits().entrySet()) {
                Long userId = split.getKey().getId();
                userNames.put(userId, split.getKey().getName());
                netBalances.merge(userId, split.getValue().negate(), BigDecimal::add);
            }
        }

        return simplifyDebts(netBalances, userNames);
    }

    private List<BalanceResponse> simplifyDebts(Map<Long, BigDecimal> netBalances, Map<Long, String> userNames) {
        List<BalanceResponse> settlements = new ArrayList<>();
        
        List<Map.Entry<Long, BigDecimal>> creditors = new ArrayList<>();
        List<Map.Entry<Long, BigDecimal>> debtors = new ArrayList<>();

        for (Map.Entry<Long, BigDecimal> entry : netBalances.entrySet()) {
            if (entry.getValue().compareTo(BigDecimal.ZERO) > 0) {
                creditors.add(new AbstractMap.SimpleEntry<>(entry.getKey(), entry.getValue()));
            } else if (entry.getValue().compareTo(BigDecimal.ZERO) < 0) {
                debtors.add(new AbstractMap.SimpleEntry<>(entry.getKey(), entry.getValue().abs()));
            }
        }

        int i = 0, j = 0;
        while (i < debtors.size() && j < creditors.size()) {
            Map.Entry<Long, BigDecimal> debtor = debtors.get(i);
            Map.Entry<Long, BigDecimal> creditor = creditors.get(j);

            BigDecimal amount = debtor.getValue().min(creditor.getValue());

            if (amount.compareTo(BigDecimal.ZERO) > 0) {
                settlements.add(new BalanceResponse(
                    debtor.getKey(),
                    userNames.get(debtor.getKey()),
                    creditor.getKey(),
                    userNames.get(creditor.getKey()),
                    amount.setScale(2, RoundingMode.HALF_UP)
                ));
            }

            debtor.setValue(debtor.getValue().subtract(amount));
            creditor.setValue(creditor.getValue().subtract(amount));

            if (debtor.getValue().compareTo(BigDecimal.ZERO) == 0) i++;
            if (creditor.getValue().compareTo(BigDecimal.ZERO) == 0) j++;
        }

        return settlements;
    }

    // ========== USER BALANCE VIEW ==========
    
    public UserBalanceResponse getUserBalance(Long groupId, Long userId) {
        List<BalanceResponse> allBalances = getGroupBalances(groupId);
        User user = getUserById(userId);

        List<BalanceResponse> owesTo = new ArrayList<>();
        List<BalanceResponse> owedBy = new ArrayList<>();
        BigDecimal totalOwing = BigDecimal.ZERO;
        BigDecimal totalOwed = BigDecimal.ZERO;

        for (BalanceResponse balance : allBalances) {
            if (balance.getFromUserId().equals(userId)) {
                owesTo.add(balance);
                totalOwing = totalOwing.add(balance.getAmount());
            }
            if (balance.getToUserId().equals(userId)) {
                owedBy.add(balance);
                totalOwed = totalOwed.add(balance.getAmount());
            }
        }

        UserBalanceResponse response = new UserBalanceResponse();
        response.setUserId(userId);
        response.setUserName(user.getName());
        response.setTotalOwed(totalOwed);
        response.setTotalOwing(totalOwing);
        response.setNetBalance(totalOwed.subtract(totalOwing));
        response.setOwesTo(owesTo);
        response.setOwedBy(owedBy);

        return response;
    }

    // ========== SETTLE DUES ==========
    
    public Expense settleDue(SettlementRequest request) {
        ExpenseGroup group = groupRepository.findById(request.getGroupId())
            .orElseThrow(() -> new RuntimeException("Group not found"));
        User fromUser = userRepository.findById(request.getFromUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        User toUser = userRepository.findById(request.getToUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Create a settlement expense (payment)
        Expense settlement = new Expense();
        settlement.setDescription("Settlement: " + fromUser.getName() + " paid " + toUser.getName());
        settlement.setAmount(request.getAmount());
        settlement.setCategory("SETTLEMENT");
        settlement.setSplitType("EXACT");
        settlement.setGroup(group);
        settlement.setPaidBy(fromUser);

        // Only the receiver owes this amount (cancels out the debt)
        Map<User, BigDecimal> splits = new HashMap<>();
        splits.put(toUser, request.getAmount());
        settlement.setSplits(splits);

        return expenseRepository.save(settlement);
    }
}