import React from 'react';
import { Bell, ShieldCheck, AlertCircle } from 'lucide-react';

const logs = [
  { id: 1, message: 'Đăng nhập thành công từ thiết bị mới', time: '10 phút trước', type: 'info', icon: ShieldCheck },
  { id: 2, message: 'Cảnh báo: Chi tiêu vượt mức ngân sách ăn uống', time: '2 giờ trước', type: 'warning', icon: AlertCircle },
  { id: 3, message: 'Đã đồng bộ dữ liệu với ngân hàng', time: '1 ngày trước', type: 'success', icon: Bell },
];

export const SystemLog = () => {
  return (
    <div className="neumorphic p-6 rounded-large h-full">
      <h2 className="font-bold text-lg text-on-surface mb-6">Nhật ký hệ thống</h2>
      
      <div className="flex flex-col gap-6">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-4">
            <div className={`mt-1 ${
              log.type === 'warning' ? 'text-error' : 
              log.type === 'success' ? 'text-success' : 'text-primary'
            }`}>
              <log.icon size={20} />
            </div>
            <div>
              <p className="text-sm text-on-surface font-medium leading-tight mb-1">{log.message}</p>
              <p className="text-xs text-on-surface-variant">{log.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
