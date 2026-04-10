import { GoogleGenerativeAI } from "@google/generative-ai";

export interface FinancialData {
  monthlyIncome: number;
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  subscriptions: {
    service_name: string;
    amount: number;
    currency: string;
    billing_cycle: string;
  }[];
}

let genAI: GoogleGenerativeAI | null = null;

function getAIModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
}

export async function generateFinancialInsight(data: FinancialData): Promise<string> {
  const model = getAIModel();
  
  if (!model) {
    console.warn("AI Insight Error: GEMINI_API_KEY is missing");
    return "Hãy cài đặt API Key trong file .env.local để kích hoạt Cố vấn AI bạn nhé!";
  }

  const prompt = `
    Bạn là một Senior Financial Advisor vui vẻ, gần gũi và am hiểu thị trường Việt Nam.
    Hãy phân tích dữ liệu tài chính sau và đưa ra một lời khuyên cực kỳ đi thẳng vào vấn đề. 
    YÊU CẦU BẮT BUỘC: 
    - CHỈ VIẾT ĐÚNG 2 ĐẾN 3 CÂU NGẮN GỌN (tối đa 40 chữ).
    - KHÔNG DÙNG gạch đầu dòng, KHÔNG in đậm (**, *), CHỈ viết văn bản trơn thuần túy.

    Dữ liệu tài chính tháng này:
    - Thu nhập: ${data.monthlyIncome.toLocaleString('vi-VN')} VND
    - Tổng chi tiêu: ${data.totalExpenses.toLocaleString('vi-VN')} VND
    - Chi tiêu theo hạng mục: ${JSON.stringify(data.expensesByCategory)}
    - Danh sách dịch vụ đăng ký (Subscriptions): ${data.subscriptions.length > 0 ? data.subscriptions.map(s => `${s.service_name} (${s.amount} ${s.currency}/${s.billing_cycle})`).join(', ') : 'Chưa có'}

    Yêu cầu:
    1. Lời khuyên phải cá nhân hóa dựa trên con số cụ thể.
    2. Nếu chi tiêu cho Subscription quá cao (VD > 10% thu nhập), hãy nhắc nhở khéo léo.
    3. Ngôn ngữ: Tiếng Việt, sử dụng các từ ngữ gần gũi, tích cực.
    4. Không sử dụng các định dạng markdown phức tạp, chỉ text thuần túy.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    if (!text) throw new Error("Empty response from AI");
    
    return text;
  } catch (error) {
    console.error("Gemini AI Error Detail:", error);
    return "AI của mình đang bận phân tích số liệu một chút, hẹn bạn lát nữa sẽ có lời khuyên tài chính cực hay nhé!";
  }
}
