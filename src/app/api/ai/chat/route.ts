import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;
function getAIModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { messages } = await req.json();
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
  }

  // 1. Fetch user data for context
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

  const [{ data: profile }, { data: transactions }, { data: subscriptions }] = await Promise.all([
    supabase.from('profiles').select('full_name, total_balance').eq('id', user.id).single(),
    supabase.from('transactions').select('*').eq('user_id', user.id).gte('date', firstDayOfMonth),
    supabase.from('subscriptions').select('*').eq('user_id', user.id)
  ]);

  const totalExpenses = transactions?.reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : 0), 0) || 0;
  const income = transactions?.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : 0), 0) || 0;
  
  const categories: Record<string, number> = {};
  transactions?.forEach(t => {
    if (t.type === 'expense') {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    }
  });

  const subsContext = subscriptions && subscriptions.length > 0 
    ? subscriptions.map(s => `${s.service_name}: ${s.amount} ${s.currency}`).join(', ') 
    : 'Không có';

  const systemPrompt = `
    Bạn là Pesse AI, một trợ lý tài chính cá nhân thông minh, vui vẻ và thân thiện của ứng dụng Pesse Finance.
    Người dùng tên: ${profile?.full_name || 'Bạn'}.
    
    Tình hình tài chính tháng này:
    - Thu nhập: ${income.toLocaleString('vi-VN')} VND
    - Chi tiêu: ${totalExpenses.toLocaleString('vi-VN')} VND
    - Hạng mục chi: ${JSON.stringify(categories)}
    - Gói đăng ký: ${subsContext}

    Quy tắc:
    - Trả lời bằng tiếng Việt, ngắn gọn.
    - Xưng hô "mình" và "bạn".
    - Dựa vào dữ liệu tài chính thật để trả lời, tính toán chính xác.
    - Nếu không có dữ liệu, hãy khuyên họ nhập giao dịch.
  `;

  // 2. Initialize Gemini Model
  const model = getAIModel();
  if (!model) {
    return NextResponse.json({ error: 'Thiếu API Key cấu hình cho AI' }, { status: 500 });
  }

  // Filter messages specifically for the AI chat.
  let historyRaw = messages.slice(0, -1);
  
  if (historyRaw.length > 0 && historyRaw[0].id === 'welcome') {
    historyRaw = historyRaw.slice(1);
  }

  const history = historyRaw.map((msg: any) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  const lastMessage = messages[messages.length - 1].content;

  try {
    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: "Đã hiểu, mình đã ghi nhớ. Bạn cần giúp gì nào?" }] },
      ...history,
      { role: 'user', parts: [{ text: lastMessage }] }
    ];

    const result = await model.generateContent({ contents });
    const responseText = result.response.text();

    return NextResponse.json({ content: responseText });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    
    let errorMessage = 'AI đang gặp sự cố kết nối, vui lòng thử lại sau.';
    
    // Check for 429 Quota errors specifically
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      errorMessage = 'Lỗi Quota: API Key của bạn đã hết lượt sử dụng miễn phí hoặc bị giới hạn (limit: 0) do khu vực đăng ký tài khoản. Vui lòng thiết lập Billing (thanh toán) trên Google AI Studio hoặc sử dụng API Key khác để tiếp tục.';
    } else if (error.message?.includes('404')) {
       errorMessage = 'Lỗi 404: Mô hình AI không khả dụng với API Key này. Vui lòng kiểm tra lại quyền truy cập thẻ Google Cloud của bạn.';
    } else {
       errorMessage = `Lỗi mạng: ${error.message}`;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
