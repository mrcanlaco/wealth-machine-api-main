import { supabaseAdmin } from '@/providers/supabase';
import { machineService } from '@/services/machine.service';
import { Chat, ChatError, ChatQuery, ChatReport, AssistantInput, AnalyzeInput } from '@/types/chat';

class ChatService {
  private readonly conversationsTable  = 'conversations';
  private readonly messagesTable = 'messages';

  async createConversation(userId: string, machineId: string, title: string): Promise<any> {
    try {
      // Check if user has permission
      await machineService.checkPermission(machineId, userId, ['owner', 'member']);

      const { data: conversation, error } = await supabaseAdmin
        .from(this.conversationsTable)
        .insert({
          title,
          user_id: userId,
          machine_id: machineId,
        })
        .select('*')
        .single();

      if (error) throw new ChatError(error.message, 400);
      return conversation;
    } catch (error) {
      if (error instanceof ChatError) throw error;
      throw new ChatError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  async listConversations(userId: string, query?: ChatQuery): Promise<any[]> {
    try {
      // Check if user has permission
      await machineService.checkPermission(userId, userId, ['owner', 'member']);

      let queryBuilder = supabaseAdmin
        .from(this.conversationsTable)
        .select('*')
        .eq('user_id', userId);

      if (query) {
        const { startDate, endDate } = query;

        if (startDate) queryBuilder = queryBuilder.gte('created_at', startDate);
        if (endDate) queryBuilder = queryBuilder.lte('created_at', endDate);
      }

      const { data: conversations, error } = await queryBuilder
        .order('updated_at', { ascending: false });

      if (error) throw new ChatError(error.message, 400);
      return conversations;
    } catch (error) {
      if (error instanceof ChatError) throw error;
      throw new ChatError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  async getConversation(id: string, userId: string): Promise<any> {
    try {
      // Check if user has permission
      await machineService.checkPermission(userId, userId, ['owner', 'member']);

      const { data: conversation, error } = await supabaseAdmin
        .from(this.conversationsTable)
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw new ChatError(error.message, 400);
      if (!conversation) throw new ChatError('Không tìm thấy cuộc hội thoại', 404);
      return conversation;
    } catch (error) {
      if (error instanceof ChatError) throw error;
      throw new ChatError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  async deleteConversation(id: string, userId: string): Promise<void> {
    try {
      // Check if user has permission
      await machineService.checkPermission(userId, userId, ['owner']);

      // First delete all messages in the conversation
      await supabaseAdmin
        .from(this.messagesTable)
        .delete()
        .eq('conversation_id', id);

      // Then delete the conversation
      const { error } = await supabaseAdmin
        .from(this.conversationsTable)
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw new ChatError(error.message, 400);
    } catch (error) {
      if (error instanceof ChatError) throw error;
      throw new ChatError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  async sendMessage(conversationId: string, userId: string, data: Chat): Promise<any> {
    try {
      // Check if user has permission
      await machineService.checkPermission(userId, userId, ['owner', 'member']);

      const { content, type, metadata } = data;

      const { data: message, error } = await supabaseAdmin
        .from(this.messagesTable)
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          content,
          type,
          metadata
        })
        .select('*')
        .single();

      if (error) throw new ChatError(error.message, 400);

      // Update conversation's updated_at
      await supabaseAdmin
        .from(this.conversationsTable)
        .update({ updated_at: new Date() })
        .eq('id', conversationId);

      return message;
    } catch (error) {
      if (error instanceof ChatError) throw error;
      throw new ChatError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  async getMessages(conversationId: string, userId: string, query?: ChatQuery): Promise<any[]> {
    try {
      // Check if user has permission
      await machineService.checkPermission(userId, userId, ['owner', 'member']);

      let queryBuilder = supabaseAdmin
        .from(this.messagesTable)
        .select('*')
        .eq('conversation_id', conversationId);

      if (query) {
        const { startDate, endDate } = query;

        if (startDate) queryBuilder = queryBuilder.gte('created_at', startDate);
        if (endDate) queryBuilder = queryBuilder.lte('created_at', endDate);
      }

      const { data: messages, error } = await queryBuilder
        .order('created_at', { ascending: true });

      if (error) throw new ChatError(error.message, 400);
      return messages;
    } catch (error) {
      if (error instanceof ChatError) throw error;
      throw new ChatError('Lỗi hệ thống, vui lòng thử lại sau', 500);
    }
  }

  async askAssistant(machineId: string, userId: string, payload: AssistantInput): Promise<any> {
    // TODO: Implement PDF report generation
    throw new ChatError('Chức năng đang được phát triển', 501);
  }

  async analyzeFinances(machineId: string, userId: string, data: AnalyzeInput): Promise<any> {    
    // TODO: Implement PDF report generation
    throw new ChatError('Chức năng đang được phát triển', 501);
  }

  async generateReport(machineId: string, userId: string, data: ChatReport): Promise<any> {
       // TODO: Implement PDF report generation
       throw new ChatError('Chức năng đang được phát triển', 501);
  }

  private async generatePDFReport(messages: any[]): Promise<any> {
    // TODO: Implement PDF report generation
    throw new ChatError('Chức năng đang được phát triển', 501);
  }

  private async generateCSVReport(messages: any[]): Promise<any> {
    // TODO: Implement CSV report generation
    throw new ChatError('Chức năng đang được phát triển', 501);
  }

  private async generateExcelReport(messages: any[]): Promise<any> {
    // TODO: Implement Excel report generation
    throw new ChatError('Chức năng đang được phát triển', 501);
  }
}

export const chatService = new ChatService();