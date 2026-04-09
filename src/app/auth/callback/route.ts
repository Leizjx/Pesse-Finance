import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    console.log(`[QA LOG] Authenticating OAuth callback code...`);
    const startTime = Date.now();
    
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && session) {
      console.log(`[QA LOG] Token received from Google. Elapsed: ${Date.now() - startTime}ms`);
      // Exchange successful -> user is signed in

      // 1. Kiểm tra xem có cấu hình kết nối data ở Local Cookie không
      const cookieStore = await cookies();
      const tempConfigStr = cookieStore.get('pesse_temp_connection')?.value;

      // 2. Trích xuất provider_refresh_token từ session (do scopes mua quyền gmail.readonly)
      const providerRefreshToken = session.provider_refresh_token; 
      const emailAddress = session.user.email; // Sử dụng email của account Google vừa login
      const provider = session.user.app_metadata?.provider;

      let config: any = null;
      if (tempConfigStr) {
        try {
          config = JSON.parse(decodeURIComponent(tempConfigStr));
        } catch(e) {
          console.error("Error processing data connection config:", e);
        }
      }

      // 3. Upsert vào bảng data_connections nếu là Google VÀ có token (từ Social Login chung) HOẶC có config từ Modal
      if (emailAddress && ((provider === 'google' && providerRefreshToken) || config)) {
          await supabase.from('data_connections').upsert({
            user_id: session.user.id,
            email_address: emailAddress,
            provider: config?.provider || (provider === 'google' ? 'gmail' : 'unknown'),
            nickname: config?.nickname || 'Tài khoản Google liên kết (tự động)',
            selected_banks: config?.selectedBanks || [],
            sync_status: 'active', // Set active so cron job can pick it up
            provider_refresh_token: providerRefreshToken || null
          }, { onConflict: 'user_id, email_address' });
      }

      if (tempConfigStr) {
        // 4. Xóa cookie sau khi xử lý thành công
        const response = NextResponse.redirect(`${origin}/dashboard/data-connection`);
        response.cookies.delete('pesse_temp_connection');
        return response;
      }

      // Ensure the profile has been created via database triggers.
      // Wait up to 3 times (500ms intervals)
      let profileReady = false;
      
      console.log(`[QA LOG] Simulating 2000ms DB delay to force /sync-profile...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      for (let i = 0; i < 3; i++) {
        console.log(`[QA LOG] Checking profiles table. Attempt #${i + 1}...`);
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();
        if (!error && data) {
          console.log(`[QA LOG] Profile found on attempt #${i + 1}.`);
          profileReady = true;
          break;
        }
        console.log(`[QA LOG] Profile NOT found on attempt #${i + 1}. Error: ${error?.message}`);
        // Sleep 500ms before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const totalTime = Date.now() - startTime;

      if (!profileReady) {
        console.log(`[QA LOG] Profile STILL NOT READY. Redirecting to /sync-profile. Total time: ${totalTime}ms`);
        // If profile is still not ready, push them to sync-profile
        return NextResponse.redirect(`${origin}/sync-profile?next=${encodeURIComponent(next)}`);
      }

      console.log(`[QA LOG] Profile Ready. Redirecting to ${next}. Total time: ${totalTime}ms`);
      // Triggers in Supabase handle profile creation automatically.
      revalidatePath('/', 'layout');
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If there's no code or an error occurred during exchange, fallback to login
  return NextResponse.redirect(`${origin}/login?error=Lỗi+xác+thực+mạng+xã+hội`);
}
