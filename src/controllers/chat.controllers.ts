import { Context } from 'hono';
import { chatService } from '@/services/chat.service';
import { 
  CreateConversationInput, 
  SendMessageInput, 
  AnalyzeInput, 
  AssistantInput 
} from '@/types/chat';
import { ResponseHandler } from '@/utils/response.handler';
import { NotFoundError } from '@/utils/app.error';

/**
 * Tạo cuộc trò chuyện mới
 * @param c Context
 * @returns Response
 */
export async function createConversation(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const body = await c.req.json() as CreateConversationInput;
    const conversation = await chatService.createConversation(userId, machineId, body.title);
    return ResponseHandler.success(c, conversation, 'Tạo cuộc trò chuyện thành công', 201);
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Lấy danh sách cuộc trò chuyện
 * @param c Context
 * @returns Response
 */
export async function listConversations(c: Context) {
  try {
    const userId = c.get('userId');
    const conversations = await chatService.listConversations(userId);
    return ResponseHandler.success(c, conversations, 'Lấy danh sách cuộc trò chuyện thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Lấy thông tin cuộc trò chuyện
 * @param c Context
 * @returns Response
 */
export async function getConversation(c: Context) {
  try {
    const { id } = c.req.param();
    const userId = c.get('userId');
    const conversation = await chatService.getConversation(id, userId);
    if (!conversation) {
      throw new NotFoundError('Cuộc trò chuyện không tồn tại');
    }
    return ResponseHandler.success(c, conversation, 'Lấy thông tin cuộc trò chuyện thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Xóa cuộc trò chuyện
 * @param c Context
 * @returns Response
 */
export async function deleteConversation(c: Context) {
  try {
    const { id } = c.req.param();
    const userId = c.get('userId');
    await chatService.deleteConversation(id, userId);
    return ResponseHandler.success(c, null, 'Xóa cuộc trò chuyện thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Gửi tin nhắn mới
 * @param c Context
 * @returns Response
 */
export async function sendMessage(c: Context) {
  try {
    const userId = c.get('userId');
    const { id } = c.req.param();
    const body = await c.req.json() as SendMessageInput;
    const message = await chatService.sendMessage(id, userId, body);
    return ResponseHandler.success(c, message, 'Gửi tin nhắn thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Lấy lịch sử chat theo máy
 * @param c Context
 * @returns Response
 */
export async function getMessages(c: Context) {
  try {
    const { id } = c.req.param();
    const userId = c.get('userId');
    const messages = await chatService.getMessages(id, userId);
    return ResponseHandler.success(c, messages, 'Lấy lịch sử chat thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Hỏi trợ lý ảo
 * @param c Context
 * @returns Response
 */
export async function askAssistant(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const body = await c.req.json() as AssistantInput;
    const response = await chatService.askAssistant(machineId, userId, body);
    return ResponseHandler.success(c, response, 'Đã nhận được câu trả lời từ trợ lý');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Phân tích tài chính
 * @param c Context
 * @returns Response
 */
export async function analyzeFinances(c: Context) {
  try {
    const userId = c.get('userId');
    const machineId = c.get('machineId');
    const body = await c.req.json() as AnalyzeInput;
    const analysis = await chatService.analyzeFinances(machineId, userId, body);
    return ResponseHandler.success(c, analysis, 'Phân tích tài chính thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}
