import { supabase } from '@/providers/supabase';
import { Notification, CreateNotificationInput } from '@/types/notification';

class NotificationService {
  // Lấy danh sách thông báo của user (có phân trang)
  async getNotifications(user_id: string, page = 1, pageSize = 10): Promise<Notification[]> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw new Error(error.message);
    return data as Notification[];
  }

  // Tạo thông báo mới
  async createNotification(input: CreateNotificationInput): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{ ...input }])
      .single();
    if (error) throw new Error(error.message);
    return data as Notification;
  }

  // Đánh dấu đã đọc
  async markAsRead(user_id: string, id: string): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', user_id)
      .single();
    if (error) throw new Error(error.message);
    return data as Notification;
  }

  // Xóa thông báo
  async deleteNotification(user_id: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);
    if (error) throw new Error(error.message);
  }
}

export const notificationService = new NotificationService();
