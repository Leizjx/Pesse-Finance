import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface GmailConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface ReceiptMessage {
  id: string;
  body: string;
  from: string;
  subject: string;
  date: string;
}

export class GmailSyncService {
  private authClient: OAuth2Client;

  constructor(config: GmailConfig) {
    this.authClient = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
  }

  public setCredentials(refreshToken: string) {
    this.authClient.setCredentials({ refresh_token: refreshToken });
  }

  /**
   * Fetch messages matching a specific Gmail query
   */
  public async fetchMessages(query: string, limit = 50): Promise<ReceiptMessage[]> {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.authClient });
      
      const listRes = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: limit,
      });

      const messages = listRes.data.messages || [];
      if (messages.length === 0) return [];

      const detailedMessages = await Promise.all(
        messages.map(async (msg) => {
          try {
            const detail = await gmail.users.messages.get({
              userId: 'me',
              id: msg.id!,
              format: 'full',
            });
            return this.transformMessage(detail.data);
          } catch (err) {
            console.error(`[GmailService] Error fetching message ${msg.id}:`, err);
            return null;
          }
        })
      );

      return detailedMessages.filter((m): m is ReceiptMessage => m !== null);
    } catch (error) {
      console.error('[GmailService] Fetch error:', error);
      return [];
    }
  }

  /**
   * Đánh dấu thư là đã đọc bằng cách xóa nhãn UNREAD
   */
  public async markAsRead(messageId: string): Promise<boolean> {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.authClient });
      await gmail.users.messages.batchModify({
        userId: 'me',
        requestBody: {
          ids: [messageId],
          removeLabelIds: ['UNREAD'],
        },
      });
      console.log(`[GmailService] Marked message ${messageId} as read.`);
      return true;
    } catch (error) {
      console.error(`[GmailService] Failed to mark message ${messageId} as read:`, error);
      return false;
    }
  }

  private transformMessage(data: any): ReceiptMessage {
    const headers = data.payload.headers || [];
    const from = headers.find((h: any) => h.name === 'From')?.value || '';
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
    const date = headers.find((h: any) => h.name === 'Date')?.value || '';

    return {
      id: data.id,
      from,
      subject,
      date,
      body: this.extractBody(data.payload),
    };
  }

  private extractBody(payload: any): string {
    let body = '';
    
    // 1. Kiểm tra dữ liệu trực tiếp ở level cao nhất (Trường hợp VCB: Has Parts = false)
    if (payload.body?.data) {
      body = Buffer.from(payload.body.data, 'base64url').toString('utf8');
    } 
    
    // 2. Nếu vẫn trống, thử tìm trong các parts (Trường hợp Gmail thông thường)
    if (!body && payload.parts) {
      const htmlPart = payload.parts.find((p: any) => p.mimeType === 'text/html');
      const plainPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
      
      const targetPart = htmlPart || plainPart;
      
      if (targetPart?.body?.data) {
        body = Buffer.from(targetPart.body.data, 'base64url').toString('utf8');
      } else {
        // Tìm kiếm đệ quy trong các phần tử lồng nhau
        for (const p of payload.parts) {
          if (p.parts) {
            const nestedBody = this.extractBody(p);
            if (nestedBody) {
              body = nestedBody;
              break;
            }
          }
        }
      }
    }

    // 3. Nếu vẫn không thấy gì, lấy tạm snippet làm cứu cánh cuối cùng
    if (!body && payload.snippet) {
      body = payload.snippet;
    }
    
    // NÂNG CẤP: Làm sạch HTML để AI dễ đọc hơn
    if (body.includes('<')) {
      body = body
        .replace(/<style([\s\S]*?)<\/style>/gi, '') // Bỏ CSS
        .replace(/<script([\s\S]*?)<\/script>/gi, '') // Bỏ Script
        .replace(/<[^>]+>/g, ' ') // Bỏ tất cả tag
        .replace(/\s+/g, ' ')     // Thu gọn khoảng trắng
        .trim();
    }
    
    return body;
  }
}
