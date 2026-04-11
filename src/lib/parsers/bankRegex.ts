/**
 * src/lib/parsers/bankRegex.ts
 * 
 * Bộ xử lý Regex nâng cao để bóc tách thông tin giao dịch ngân hàng từ email.
 * Hỗ trợ các ngân hàng: VCB, Techcombank, MB Bank, TPBank, ACB.
 */

import { TransactionCategory, TransactionType } from "@/types/database.types";

export interface ParsedTransaction {
  amount: number;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  note: string;
  category: TransactionCategory;
  bank_id: string;
}

// =========================================================================
// HELPERS
// =========================================================================

function normalizeText(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ') // Strip HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')     // Normalize spaces
    .trim();
}

function extractDate(text: string): string {
  // Ưu tiên format DD/MM/YYYY hoặc DD/MM/YY
  const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (dateMatch) {
    let day = dateMatch[1].padStart(2, '0');
    let month = dateMatch[2].padStart(2, '0');
    let year = dateMatch[3];
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month}-${day}`;
  }
  return new Date().toISOString().split('T')[0];
}

// =========================================================================
// BANK SPECIFIC PARSERS
// =========================================================================

/**
 * VIETCOMBANK
 * Email ví dụ: "thay đổi +1,500,000 VND", "Số tiền: 500,000 VND"
 */
function parseVCB(text: string): Partial<ParsedTransaction> | null {
  // 1. Biến động số dư (+/-) - Thường là từ vcbdigibank@vietcombank.com.vn
  const flucMatch = text.match(/([+-])\s*([\d,.]+)\s*(?:VND|VNĐ|đ)/i);
  if (flucMatch) {
    const amount = parseFloat(flucMatch[2].replace(/[.,]/g, ''));
    return {
      amount,
      type: flucMatch[1] === '+' ? 'income' : 'expense',
      note: text.match(/(?:ND|Nội dung|Chi tiết)[:\s]+(.*?)(?:\s[Vv]ào|$)/i)?.[1].trim() || "Giao dịch VCB",
      date: extractDate(text)
    };
  }

  // 2. Biên lai chuyển tiền (Payment Receipt) - Format dạng bảng
  // Regex này được thiết kế để "nhìn xuyên" qua các bảng HTML phức tạp
  const receiptAmountMatch = text.match(/(?:Số tiền|Amount)[\s\r\n]*(?:Amount)?[\s\r\n]*([\d,.]+)\s*(?:VND|VNĐ|đ)/i);
  
  if (receiptAmountMatch) {
    // Tìm nội dung chuyển tiền (Details of Payment)
    // Hỗ trợ cả Cảm ơn (có dấu hỏi) và Cám ơn (dấu sắc) làm mốc dừng
    const noteMatch = text.match(/(?:Nội dung chuyển tiền|Details of Payment)[\s\r\n]*(?:Details of Payment)?[\s\r\n]*(.+?)(?:\s*(?:Cảm ơn|Cám ơn|Lưu ý|Trans\. Date)|$)/i);
    
    return {
      amount: parseFloat(receiptAmountMatch[1].replace(/[.,]/g, '')),
      type: 'expense',
      note: noteMatch ? noteMatch[1].trim() : "Chuyển tiền VCB",
      date: extractDate(text)
    };
  }
  return null;
}

/**
 * TECHCOMBANK
 */
function parseTCB(text: string): Partial<ParsedTransaction> | null {
  const match = text.match(/([+-])\s*([\d,.]+)\s*(?:VND|VNĐ|đ)/i);
  if (match) {
    return {
      amount: parseFloat(match[2].replace(/[.,]/g, '')),
      type: match[1] === '+' ? 'income' : 'expense',
      note: "Giao dịch TCB",
      date: extractDate(text)
    };
  }
  return null;
}

/**
 * MB BANK
 */
function parseMB(text: string): Partial<ParsedTransaction> | null {
  const match = text.match(/(?:Số tiền thay đổi|GD)[:\s]*([+-])\s*([\d,.]+)\s*(?:VND|VNĐ|đ)/i);
  if (match) {
    return {
      amount: parseFloat(match[2].replace(/[.,]/g, '')),
      type: match[1] === '+' ? 'income' : 'expense',
      note: text.match(/(?:ND|Nội dung)[:\s]+(.*?)(?:\svào|$)/i)?.[1].trim() || "Giao dịch MB Bank",
      date: extractDate(text)
    };
  }
  return null;
}

/**
 * TPBANK
 */
function parseTPB(text: string): Partial<ParsedTransaction> | null {
  const match = text.match(/([+-])\s*([\d,.]+)\s*(?:VND|VNĐ|đ)/i);
  if (match) {
    return {
      amount: parseFloat(match[2].replace(/[.,]/g, '')),
      type: match[1] === '+' ? 'income' : 'expense',
      note: text.match(/(?:ND|Nội dung)[:\s]+(.*?)(?:\svào|$)/i)?.[1].trim() || "Giao dịch TPBank",
      date: extractDate(text)
    };
  }
  return null;
}

/**
 * ACB
 */
function parseACB(text: string): Partial<ParsedTransaction> | null {
  const match = text.match(/(?:Số tiền|giao dịch)[:\s]*([+-])\s*([\d,.]+)/i);
  if (match) {
    return {
      amount: parseFloat(match[2].replace(/[.,]/g, '')),
      type: match[1] === '+' ? 'income' : 'expense',
      note: "Giao dịch ACB",
      date: extractDate(text)
    };
  }
  return null;
}

// =========================================================================
// ENTRY POINT
// =========================================================================

export function parseBankEmail(emailBody: string, bankId: string): Partial<ParsedTransaction> | null {
  const cleanText = normalizeText(emailBody);
  
  let result: Partial<ParsedTransaction> | null = null;
  const bid = bankId.toLowerCase();

  if (bid === 'vcb') result = parseVCB(cleanText);
  else if (bid === 'tcb') result = parseTCB(cleanText);
  else if (bid === 'mb')  result = parseMB(cleanText);
  else if (bid === 'tpb') result = parseTPB(cleanText);
  else if (bid === 'acb') result = parseACB(cleanText);

  if (result) {
    return {
      ...result,
      bank_id: bid,
      category: 'other' // Category is guessed later by AI or manual
    };
  }

  return null;
}
