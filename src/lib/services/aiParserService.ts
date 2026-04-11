import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Định dạng dữ liệu AI trả về
 */
export interface AiParsedTransaction {
  amount: number;
  transaction_id: string;
  date: string;
  bank_name: string;
  description: string;
  type: 'income' | 'expense';
  category?: string;
}

export class AiParserService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Nâng cấp lên mô hình 2.0 Flash để tương thích với tài khoản người dùng
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  /**
   * Bóc tách thông tin giao dịch từ nội dung Email bằng Gemini AI
   */
  public async parseTransaction(body: string): Promise<AiParsedTransaction | null> {
    try {
      console.log(`[AiParserService] Sending request to Gemini... (Body length: ${body.length})`);
      const prompt = `
        Hãy trích xuất thông tin giao dịch từ email ngân hàng sau đây và trả về định dạng JSON thuần túy. 
        Email Content: """${body.substring(0, 5000)}"""

        Yêu cầu định dạng JSON:
        {
          "amount": number (số dương, không lấy dấu +/-),
          "transaction_id": string (mã tham chiếu hoặc mã giao dịch),
          "date": string (định dạng YYYY-MM-DD),
          "bank_name": string (tên ngân hàng),
          "description": string (nội dung chuyển khoản hoặc chi tiết),
          "category": string (danh mục chi tiêu ví dụ: Ăn uống, Di chuyển, Shopping, Tiền lương, v.v.),
          "type": "income" | "expense" (dựa vào dấu + hoặc - hoặc từ ngữ như "đến", "đi", "trừ", "cộng")
        }

        QUAN TRỌNG: Chỉ trả về JSON, không giải thích. Nếu không phải email giao dịch, trả về null.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      console.log(`[AiParserService] Raw AI Response:`, text);

      // Làm sạch text nếu AI trả về markdown 
      if (text.includes('```')) {
        text = text.replace(/```json|```/g, '').trim();
      }

      // Đôi khi AI trả về văn bản kèm JSON, ta dùng regex để lấy phần JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
         console.warn('[AiParserService] No JSON structure found in AI response');
         return null;
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Kiểm tra các trường bắt buộc tối thiểu
      if (!parsed.amount) {
        return null;
      }

      return parsed as AiParsedTransaction;
    } catch (error) {
      console.error('[AiParserService] Error parsing with Gemini:', error);
      return null;
    }
  }
}
