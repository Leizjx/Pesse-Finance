/**
 * src/lib/parsers/bankRegex.ts
 * 
 * Bộ xử lý Regex bóc tách nội dung email biến động số dư cho các ngân hàng lớn.
 * Dùng Regex giúp tiết kiệm chi phí gọi API LLM và rất ổn định với format có sẵn.
 */

import { TransactionCategory, TransactionType } from "@/types/database.types";

export interface ParsedTransaction {
  amount: number;
  type: TransactionType;
  date: string; // ISO String
  note: string;
  category: TransactionCategory; // Default to 'other' or a guessed category
  bank_id: string; // The ID of the bank it was parsed from (vcb, tcb, etc.)
}

// =========================================================================
// 1. VIETCOMBANK (VCB) REGEX RULE
// =========================================================================
// VD email: "Tài khoản 01234456789 thay đổi +1,500,000 VND vào ngày 09/04/2026. Số dư hiện tại... Nội dung: Chuyen tien hoc phi"
// Mẫu Regex linh hoạt cho cả 2 loại email của VCB
const VCB_REGEX = {
  // Loại 1: Biến động số dư có dấu +/-
  fluctuation: /([+-])\s*([\d,.]+)\s*VND/i,
  fluctuationNote: /(?:Nội dung|Chi tiết|ND)[^\w]*?(.+?)(?:<br|\n|\r|$|Cám ơn)/i,
  
  // Loại 2: Biên lai chuyển tiền (chỉ có trừ tiền)
  receiptAmount: /Số tiền\s*(?:Amount)?\s*([\d,.]+)\s*VND/i,
  receiptNote: /Nội dung chuyển tiền\s*(?:Details of Payment)?\s*(.+?)\s*(?:Cám ơn|Lưu ý|<br|\n|$)/i
};

function parseVCB(emailBody: string): Partial<ParsedTransaction> | null {
  // 1. Xử lý email Biến động số dư (Balance Fluctuation)
  const flucMatch = emailBody.match(VCB_REGEX.fluctuation);
  if (flucMatch) {
    const sign = flucMatch[1]; 
    const amount = parseFloat(flucMatch[2].replace(/,/g, '')); 
    const type: TransactionType = sign === '+' ? 'income' : 'expense';

    const noteMatch = emailBody.match(VCB_REGEX.fluctuationNote);
    const note = noteMatch ? noteMatch[1].trim() : "Giao dịch VCB";
    
    return { amount, type, note, bank_id: 'vcb', category: 'other' };
  }

  // 2. Xử lý email Biên lai chuyển tiền (Payment Receipt)
  if (emailBody.toLowerCase().includes('biên lai chuyển tiền')) {
    const receiptMatch = emailBody.match(VCB_REGEX.receiptAmount);
    if (!receiptMatch) return null;

    const amount = parseFloat(receiptMatch[1].replace(/,/g, ''));
    const type: TransactionType = 'expense'; // Biên lai chuyển khoản hiển nhiên là tiền ra

    const noteMatch = emailBody.match(VCB_REGEX.receiptNote);
    const note = noteMatch ? noteMatch[1].trim() : "Chuyển tiền VCB";

    return { amount, type, note, bank_id: 'vcb', category: 'other' };
  }

  return null; // Không quét thấy lượng tiền hợp lệ
}

// =========================================================================
// 2. TECHCOMBANK (TCB) REGEX RULE
// =========================================================================
// TCB thường dùng số tiền +/- liền mạch hoặc format riêng.
const TCB_REGEX = {
  amountAndType: /(?:\+|-)[\d,.]+\s*VND/i, 
  // Ví dụ trích xuất tương tự, viết Regex bám sát format email của TCB.
};

function parseTCB(emailBody: string): Partial<ParsedTransaction> | null {
  // Demo mock logic (cần regex thực tế của TCB để hoàn thiện)
  const amountMatch = emailBody.match(/([+-])([\d,.]+)\s*VND/i);
  if (!amountMatch) return null;

  const sign = amountMatch[1];
  const amount = parseFloat(amountMatch[2].replace(/,/g, ''));
  const type: TransactionType = sign === '+' ? 'income' : 'expense';

  return { amount, type, note: "Giao dịch TCB", bank_id: 'tcb', category: 'other' };
}

// =========================================================================
// 3. MAIN PARSER ENTRY PORT
// =========================================================================
export function parseBankEmail(emailBody: string, bankId: string): Partial<ParsedTransaction> | null {
  // Làm phẳng HTML thành Test để Regex dễ hoạt động hơn
  const plainText = emailBody.replace(/<[^>]+>/g, ' '); 

  switch (bankId.toLowerCase()) {
    case 'vcb':
      return parseVCB(plainText);
    case 'tcb':
      return parseTCB(plainText);
    default:
      console.warn(`Chưa hỗ trợ parse Regex cho ngân hàng: ${bankId}`);
      return null;
  }
}
