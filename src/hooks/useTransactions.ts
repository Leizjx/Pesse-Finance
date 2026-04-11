/**
 * useTransactions.ts
 * ------------------
 * TanStack Query hooks for transaction CRUD and budget management.
 *
 * Pattern:
 * - useQuery for reads (auto-cached, refetched on stale)
 * - useMutation for writes with automatic cache invalidation
 * - Optimistic balance update in Zustand on transaction create/delete
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/useAppStore";
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  fetchBudgets,
  createBudget,
  deleteBudget,
} from "@/services/transactionService";
import type { CreateTransactionInput, CreateBudgetInput } from "@/types/database.types";

// ── Query Keys ────────────────────────────────────────────────────────────────
// Centralized to avoid string typos across components
export const queryKeys = {
  transactions: (userId: string) => ["transactions", userId] as const,
  budgets: (userId: string) => ["budgets", userId] as const,
};

// ─────────────────────────────────────────────
// TRANSACTIONS
// ─────────────────────────────────────────────

export function useTransactions() {
  const userId = useAppStore((s) => s.user?.id);

  return useQuery({
    queryKey: queryKeys.transactions(userId ?? ""),
    queryFn: () => fetchTransactions(userId!),
    enabled: !!userId,
    select: (data) => {
      if (!data) return { all: [], income: [], expenses: [], totalIncome: 0, totalExpenses: 0 };
      return data.reduce((acc, t) => {
        acc.all.push(t);
        if (t.type === 'income') {
          acc.income.push(t);
          acc.totalIncome += t.amount;
        } else {
          acc.expenses.push(t);
          acc.totalExpenses += t.amount;
        }
        return acc;
      }, {
        all: [] as typeof data,
        income: [] as typeof data,
        expenses: [] as typeof data,
        totalIncome: 0,
        totalExpenses: 0
      });
    },
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  const userId = useAppStore((s) => s.user?.id);
  const updateBalance = useAppStore((s) => s.updateBalance);

  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      createTransaction(userId!, input),

    onSuccess: (newTransaction) => {
      // Invalidate transactions cache → triggers refetch
      qc.invalidateQueries({ queryKey: queryKeys.transactions(userId!) });

      // Optimistic balance update: income adds, expense subtracts
      const delta =
        newTransaction.type === "income"
          ? newTransaction.amount
          : -newTransaction.amount;
      updateBalance(delta);
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  const userId = useAppStore((s) => s.user?.id);

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<CreateTransactionInput>;
    }) => updateTransaction(id, input),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.transactions(userId!) });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  const userId = useAppStore((s) => s.user?.id);
  const updateBalance = useAppStore((s) => s.updateBalance);

  return useMutation({
    mutationFn: (variables: { id: string; amount: number; type: "income" | "expense" }) =>
      deleteTransaction(variables.id),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.transactions(userId!) });

      // Reverse balance effect
      const delta = variables.type === "income" ? -variables.amount : variables.amount;
      updateBalance(delta);
    },
  });
}

// ─────────────────────────────────────────────
// BUDGETS
// ─────────────────────────────────────────────

export function useBudgets() {
  const userId = useAppStore((s) => s.user?.id);

  return useQuery({
    queryKey: queryKeys.budgets(userId ?? ""),
    queryFn: () => fetchBudgets(userId!),
    enabled: !!userId,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  const userId = useAppStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (input: CreateBudgetInput) => createBudget(userId!, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.budgets(userId!) });
    },
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  const userId = useAppStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.budgets(userId!) });
    },
  });
}
