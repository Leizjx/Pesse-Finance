/**
 * transactionService.ts
 * ---------------------
 * All Supabase CRUD operations for transactions and budgets.
 * Called by hooks (useTransactions) — never called directly from UI components.
 */

import { createClient } from "@/lib/supabaseClient";
import type {
  Transaction,
  Budget,
  CreateTransactionInput,
  CreateBudgetInput,
} from "@/types/database.types";

// ─────────────────────────────────────────────
// TRANSACTIONS
// ─────────────────────────────────────────────

export async function fetchTransactions(userId: string): Promise<Transaction[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Transaction[];
}

export async function createTransaction(
  userId: string,
  input: CreateTransactionInput
): Promise<Transaction> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("transactions")
    .insert({ ...input, user_id: userId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Transaction;
}

export async function updateTransaction(
  id: string,
  input: Partial<CreateTransactionInput>
): Promise<Transaction> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("transactions")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────
// BUDGETS
// ─────────────────────────────────────────────

export async function fetchBudgets(userId: string): Promise<Budget[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Budget[];
}

export async function createBudget(
  userId: string,
  input: CreateBudgetInput
): Promise<Budget> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("budgets")
    .insert({ ...input, user_id: userId, spent_amount: 0 })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Budget;
}

export async function deleteBudget(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("budgets").delete().eq("id", id);

  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────

export async function fetchProfile(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}
