/**
 * database.types.ts
 * -----------------
 * Single source of truth for all database entities in Pesse Finance.
 * Zod schemas are co-located for runtime validation at form/API boundaries.
 * Strict types — no `any`, no optional where not intentional.
 */

import { z } from "zod";

// ─────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────

export interface Profile {
  id: string; // UUID — matches Supabase auth.users.id
  email: string;
  full_name: string;
  total_balance: number;
  avatar_url: string | null;
  created_at: string; // ISO 8601
  updated_at: string;
}

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email("Email không hợp lệ"),
  full_name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  total_balance: z.number().finite("Số dư phải là số hợp lệ"),
  avatar_url: z.string().url().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// ─────────────────────────────────────────────
// TRANSACTION
// ─────────────────────────────────────────────

export type TransactionType = "income" | "expense";

export const TRANSACTION_CATEGORIES = [
  "food",
  "transport",
  "entertainment",
  "health",
  "education",
  "shopping",
  "utilities",
  "rent",
  "salary",
  "investment",
  "other",
] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export interface Transaction {
  id: string; // UUID
  user_id: string; // FK → profiles.id
  amount: number; // Always positive; type determines direction
  category: TransactionCategory;
  type: TransactionType;
  date: string; // ISO 8601 date string
  note: string | null;
  bank_id: string | null; // e.g., 'vcb', 'tcb' for determining logo rendering
  created_at: string;
  updated_at: string;
}

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  category: z.enum(TRANSACTION_CATEGORIES, "Danh mục không hợp lệ"),
  type: z.enum(["income", "expense"] as const, 'Loại phải là "income" hoặc "expense"'),
  date: z.string().date("Ngày không hợp lệ"),
  note: z.string().max(500, "Ghi chú tối đa 500 ký tự").nullable(),
  bank_id: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// For form submission — omit server-generated fields
export const CreateTransactionSchema = TransactionSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;

// ─────────────────────────────────────────────
// BUDGET
// ─────────────────────────────────────────────

export type BudgetPeriod = "monthly" | "weekly" | "yearly";

export interface Budget {
  id: string; // UUID
  user_id: string; // FK → profiles.id
  category: TransactionCategory;
  limit_amount: number; // Maximum allowed spend
  spent_amount: number; // Current spend (computed from transactions)
  period: BudgetPeriod;
  created_at: string;
  updated_at: string;
}

export const BudgetSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  category: z.enum(TRANSACTION_CATEGORIES),
  limit_amount: z.number().positive("Giới hạn ngân sách phải lớn hơn 0"),
  spent_amount: z.number().nonnegative(),
  period: z.enum(["monthly", "weekly", "yearly"] as const),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateBudgetSchema = BudgetSchema.omit({
  id: true,
  user_id: true,
  spent_amount: true,
  created_at: true,
  updated_at: true,
});

export type CreateBudgetInput = z.infer<typeof CreateBudgetSchema>;

// ─────────────────────────────────────────────
// DATA CONNECTIONS
// ─────────────────────────────────────────────

export interface DataConnection {
  id: string; // UUID
  user_id: string; // FK → profiles.id
  email_address: string;
  nickname: string | null;
  provider: "gmail";
  selected_banks: string[]; // JSONB stored as array of strings
  sync_status: "active" | "syncing" | "error" | "disconnected";
  provider_refresh_token: string | null;
  last_sync_at: string | null; // ISO 8601
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────
// AUTH FORM SCHEMAS (Zod — used by login/register forms)
// ─────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z
  .object({
    full_name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirm_password"],
  });

export type RegisterInput = z.infer<typeof RegisterSchema>;
