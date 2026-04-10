import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;
function getAIModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("AI Error: Missing GEMINI_API_KEY in environment variables");
    return null;
  }
  
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  
  // Using gemini-1.5-flash-latest for better stability and lower latency
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
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

  const modelName = "gemini-1.5-flash-latest";
  const modelInstance = (genAI as GoogleGenerativeAI).getGenerativeModel({ 
    model: modelName 
  });

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
    const chat = modelInstance.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: "Đã hiểu, mình là Pesse AI. Mình đã sẵn sàng hỗ trợ bạn quản lý tài chính." }] },
        ...history
      ]
    });

    const result = await chat.sendMessage(lastMessage);
    const responseText = result.response.text();

    return NextResponse.json({ content: responseText });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    
    let errorMessage = 'AI đang gặp sự cố kết nối, vui lòng thử lại sau.';
    
    const errText = error.message?.toLowerCase() || '';
    
    if (errText.includes('429') || errText.includes('quota') || errText.includes('limit')) {
      errorMessage = 'Lỗi Quota/Limit: API Key của bạn bị giới hạn lượt sử dụng hoặc chưa kích hoạt thanh toán trên Google AI Studio.';
    } else if (errText.includes('403') || errText.includes('404') || errText.includes('permission') || errText.includes('not found')) {
      errorMessage = 'Lỗi 403/404: API chưa được kích hoạt cho Key này. Vui lòng vào Google AI Studio kích hoạt "Generative Language API" rồi thử lại.';
    } else {
      errorMessage = `Lỗi hệ thống (${modelName}): ${error.message}`;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
