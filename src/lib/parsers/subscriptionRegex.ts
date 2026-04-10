/**
 * src/lib/parsers/subscriptionRegex.ts
 * ─────────────────────────────────────
 * Regex engine để phát hiện và bóc tách thông tin đăng ký dịch vụ
 * từ nội dung email (receipt/invoice).
 *
 * Hỗ trợ: Netflix, Spotify, iCloud, YouTube Premium, Canva, Adobe
 *
 * Design:
 * - Zero external dependencies (no LLM calls → cost-free, stable)
 * - Strip HTML trước khi parse
 * - Trả về null nếu không nhận diện được dịch vụ
 */

import type { BillingCycle } from '@/types/database.types';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ParsedSubscription {
  serviceName: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  transactionDate: string; // YYYY-MM-DD
  nextBillingDate: string; // YYYY-MM-DD (calculated)
  logoUrl: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

interface ServiceDefinition {
  /** Canonical display name */
  name: string;
  /** Logo URL (Clearbit CDN) */
  logoUrl: string;
  /** Keywords to identify this service in email subject or body */
  keywords: RegExp;
  /** Override billing cycle if known from price tier */
  defaultCycle?: BillingCycle;
}

const SERVICE_CATALOG: ServiceDefinition[] = [
  {
    name: 'Netflix',
    logoUrl: 'https://logo.clearbit.com/netflix.com',
    keywords: /netflix/i,
  },
  {
    name: 'Spotify',
    logoUrl: 'https://logo.clearbit.com/spotify.com',
    keywords: /spotify/i,
  },
  {
    name: 'iCloud',
    logoUrl: 'https://logo.clearbit.com/apple.com',
    keywords: /icloud|apple\s+storage|apple\s+one/i,
  },
  {
    name: 'YouTube Premium',
    logoUrl: 'https://logo.clearbit.com/youtube.com',
    keywords: /youtube\s+premium|youtube\s+music/i,
  },
  {
    name: 'Canva',
    logoUrl: 'https://logo.clearbit.com/canva.com',
    keywords: /canva\s+pro|canva\s+for\s+teams|canva/i,
  },
  {
    name: 'Adobe',
    logoUrl: 'https://logo.clearbit.com/adobe.com',
    keywords: /adobe\s+(?:creative\s+cloud|acrobat|photoshop|illustrator|premiere|express)/i,
  },
  {
    name: 'Microsoft 365',
    logoUrl: 'https://logo.clearbit.com/microsoft.com',
    keywords: /microsoft\s+365|office\s+365|microsoft\s+personal|microsoft\s+family/i,
  },
  {
    name: 'Google One',
    logoUrl: 'https://logo.clearbit.com/google.com',
    keywords: /google\s+one/i,
  },
  {
    name: 'Notion',
    logoUrl: 'https://logo.clearbit.com/notion.so',
    keywords: /notion\s+plus|notion\s+pro|notion\s+ai/i,
  },
  {
    name: 'Figma',
    logoUrl: 'https://logo.clearbit.com/figma.com',
    keywords: /figma\s+professional|figma\s+organization|figma\s+team/i,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// AMOUNT EXTRACTION PATTERNS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Priority-ordered list of regex patterns to extract payment amounts.
 * Each pattern must capture the amount in group 1 and optionally currency in group 2.
 */
const AMOUNT_PATTERNS: RegExp[] = [
  // Vietnamese: "99.000 VND", "49,000đ", "49.000 đồng"
  /(\d{1,3}(?:[.,]\d{3})*)\s*(?:VND|đ|đồng)/i,
  // USD: "$9.99", "USD 14.99", "9.99 USD"
  /\$\s*(\d+(?:\.\d{1,2})?)/i,
  /(\d+(?:\.\d{1,2})?)\s*USD/i,
  // Generic "Amount: 99.000" or "Số tiền: 99.000"
  /(?:amount|total|charge|s[oố]\s*ti[eề]n|thanh\s*to[aá]n)[:\s]+(?:VND\s*)?(\d{1,3}(?:[.,]\d{3})*(?:\.\d{1,2})?)/i,
  // "charged X VND"
  /charged?\s+(?:VND\s*)?(\d{1,3}(?:[.,]\d{3})*)/i,
];

/**
 * Extracts the most likely payment amount from email text.
 * Returns { amount, currency } or null if not found.
 */
function extractAmount(text: string): { amount: number; currency: string } | null {
  for (const pattern of AMOUNT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      // Normalize: remove thousand separators, handle both . and , as decimal
      const raw = match[1].replace(/\./g, '').replace(/,/g, '');
      const amount = parseFloat(raw);
      if (!isNaN(amount) && amount > 0) {
        // Infer currency
        const currency = /đ|đồng|VND/i.test(match[0]) ? 'VND' : 'USD';
        return { amount, currency };
      }
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATE EXTRACTION PATTERNS
// ─────────────────────────────────────────────────────────────────────────────

const DATE_PATTERNS: RegExp[] = [
  // DD/MM/YYYY  or DD-MM-YYYY
  /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
  // YYYY-MM-DD (ISO)
  /(\d{4})-(\d{2})-(\d{2})/,
  // "April 10, 2026" or "10 April 2026"
  /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i,
  /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})/i,
  // Tháng 4 năm 2026 / ngày 10/04/2026
  /ng[aà]y\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i,
];

const MONTH_MAP: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

/**
 * Extracts the first recognizable date from email text.
 * Returns YYYY-MM-DD string or today's date as fallback.
 */
function extractDate(text: string): string {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;

    try {
      let year: number, month: number, day: number;

      if (/(\d{4})-(\d{2})-(\d{2})/.test(match[0])) {
        // ISO: YYYY-MM-DD
        [, year, month, day] = match.map(Number) as [string, number, number, number];
      } else if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/.test(match[0]) || /ng[aà]y/.test(match[0])) {
        // DD/MM/YYYY
        day = parseInt(match[1]);
        month = parseInt(match[2]);
        year = parseInt(match[3]);
      } else {
        // Named month variants
        const monthStr = (match[1] || match[2])?.toLowerCase();
        if (!monthStr) continue;
        if (MONTH_MAP[monthStr] !== undefined) {
          // "Month DD, YYYY"
          month = MONTH_MAP[monthStr];
          day = parseInt(match[2] || match[1]);
          year = parseInt(match[3]);
        } else {
          // "DD Month YYYY"
          day = parseInt(match[1]);
          month = MONTH_MAP[(match[2] || '').toLowerCase()] ?? 1;
          year = parseInt(match[3]);
        }
      }

      if (year > 2000 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    } catch {
      continue;
    }
  }

  // Fallback: today
  return new Date().toISOString().split('T')[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// BILLING CYCLE DETECTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Infers billing cycle from email content:
 * - Keywords: "yearly", "annual", "hàng năm", "1 year" → yearly
 * - Keywords: "monthly", "hàng tháng", "1 month" → monthly
 * - Price heuristic: VND amounts > 500.000 or USD > 60 → likely yearly
 */
function detectBillingCycle(text: string, amount: number, currency: string): BillingCycle {
  const lowerText = text.toLowerCase();

  const yearlyKeywords = /\b(?:yearly|annual(?:ly)?|per\s+year|hàng\s+năm|mỗi\s+năm|1\s+year|12\s+months?)\b/i;
  const monthlyKeywords = /\b(?:monthly|per\s+month|hàng\s+tháng|mỗi\s+tháng|1\s+month)\b/i;

  if (yearlyKeywords.test(lowerText)) return 'yearly';
  if (monthlyKeywords.test(lowerText)) return 'monthly';

  // Price heuristic fallback
  if (currency === 'VND' && amount > 500_000) return 'yearly';
  if (currency === 'USD' && amount > 60) return 'yearly';

  return 'monthly'; // safe default
}

// ─────────────────────────────────────────────────────────────────────────────
// NEXT BILLING DATE CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Adds one billing period to a given date.
 * - monthly: +30 days (safe average)
 * - yearly: +365 days
 */
export function calculateNextBillingDate(lastDate: string, cycle: BillingCycle): string {
  const date = new Date(lastDate);
  if (cycle === 'yearly') {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
  return date.toISOString().split('T')[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PARSE FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strips HTML tags and decodes common HTML entities.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Main entry point.
 * Parses a single Gmail message (subject + body) and returns
 * a ParsedSubscription if a supported service is detected.
 *
 * @param subject  Email subject line
 * @param body     Raw email body (HTML or plain text)
 * @returns ParsedSubscription or null if unrecognized
 */
export function parseSubscriptionEmail(
  subject: string,
  body: string
): ParsedSubscription | null {
  const plainSubject = stripHtml(subject);
  const plainBody = stripHtml(body);
  const fullText = `${plainSubject}\n${plainBody}`;

  // 1. Identify service
  const service = SERVICE_CATALOG.find(
    (s) => s.keywords.test(plainSubject) || s.keywords.test(plainBody)
  );
  if (!service) return null;

  // 2. Extract amount
  const amountResult = extractAmount(fullText);
  if (!amountResult) return null;
  const { amount, currency } = amountResult;

  // 3. Extract transaction date
  const transactionDate = extractDate(fullText);

  // 4. Detect billing cycle
  const billingCycle = detectBillingCycle(fullText, amount, currency);

  // 5. Calculate next billing date
  const nextBillingDate = calculateNextBillingDate(transactionDate, billingCycle);

  return {
    serviceName: service.name,
    amount,
    currency,
    billingCycle,
    transactionDate,
    nextBillingDate,
    logoUrl: service.logoUrl,
  };
}

/**
 * Smart deduplication helper:
 * Given multiple ParsedSubscription records from the same service,
 * returns the one with the most recent transactionDate as the canonical record.
 * The next_billing_date is recalculated from that most-recent date.
 */
export function deduplicateSubscriptions(
  records: ParsedSubscription[]
): ParsedSubscription[] {
  const byService = new Map<string, ParsedSubscription[]>();

  for (const record of records) {
    const key = record.serviceName.toLowerCase();
    if (!byService.has(key)) byService.set(key, []);
    byService.get(key)!.push(record);
  }

  const result: ParsedSubscription[] = [];
  for (const group of byService.values()) {
    // Sort by transactionDate descending → pick most recent
    group.sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
    const latest = group[0];
    // Recalculate next billing from the most recent transaction
    result.push({
      ...latest,
      nextBillingDate: calculateNextBillingDate(latest.transactionDate, latest.billingCycle),
    });
  }

  return result;
}
