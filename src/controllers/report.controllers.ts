import { Context } from 'hono';
import { reportService } from '@/services/report.service';
import { ReportQuery, ExportReportQuery } from '@/types/report';
import { ResponseHandler } from '@/utils/response.handler';

/**
 * Lấy tổng quan báo cáo
 * @param c Context
 * @returns Response
 */
export async function getOverview(c: Context) {
  try {
    const machineId = c.get('machineId');
    const overview = await reportService.getOverview(machineId);
    return ResponseHandler.success(c, overview, 'Lấy tổng quan báo cáo thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Lấy tóm tắt báo cáo
 * @param c Context
 * @returns Response
 */
export async function getSummary(c: Context) {
  try {
    const machineId = c.get('machineId');
    const summary = await reportService.getSummary(machineId);
    return ResponseHandler.success(c, summary, 'Lấy tóm tắt báo cáo thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Lấy dòng tiền
 * @param c Context
 * @returns Response
 */
export async function getCashFlow(c: Context) {
  try {
    const machineId = c.get('machineId');
    const query = c.req.query() as unknown as ReportQuery;
    const cashFlow = await reportService.getCashFlow(machineId, query);
    return ResponseHandler.success(c, cashFlow, 'Lấy dòng tiền thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Lấy bảng cân đối kế toán
 * @param c Context
 * @returns Response
 */
export async function getBalanceSheet(c: Context) {
  try {
    const machineId = c.get('machineId');
    const query = c.req.query() as unknown as ReportQuery;
    const balanceSheet = await reportService.getBalanceSheet(machineId, query);
    return ResponseHandler.success(c, balanceSheet, 'Lấy bảng cân đối kế toán thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Lấy báo cáo kết quả hoạt động kinh doanh
 * @param c Context
 * @returns Response
 */
export async function getIncomeStatement(c: Context) {
  try {
    const machineId = c.get('machineId');
    const query = c.req.query() as unknown as ReportQuery;
    const incomeStatement = await reportService.getIncomeStatement(machineId, query);
    return ResponseHandler.success(c, incomeStatement, 'Lấy báo cáo kết quả hoạt động kinh doanh thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Lấy xu hướng
 * @param c Context
 * @returns Response
 */
export async function getTrends(c: Context) {
  try {
    const machineId = c.get('machineId');
    const query = c.req.query() as unknown as ReportQuery;
    const trends = await reportService.getTrends(machineId, query);
    return ResponseHandler.success(c, trends, 'Lấy xu hướng thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Lấy phân tích danh mục
 * @param c Context
 * @returns Response
 */
export async function getCategoryAnalysis(c: Context) {
  try {
    const machineId = c.get('machineId');
    const query = c.req.query() as unknown as ReportQuery;
    const analysis = await reportService.getCategoryAnalysis(machineId, query);
    return ResponseHandler.success(c, analysis, 'Lấy phân tích danh mục thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Lấy dự đoán
 * @param c Context
 * @returns Response
 */
export async function getPredictions(c: Context) {
  try {
    const machineId = c.get('machineId');
    const predictions = await reportService.getPredictions(machineId);
    return ResponseHandler.success(c, predictions, 'Lấy dự đoán thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}

/**
 * Xuất báo cáo
 * @param c Context
 * @returns Response
 */
export async function exportReport(c: Context) {
  try {
    const machineId = c.get('machineId');
    const query = c.req.query() as unknown as ExportReportQuery;
    const report = await reportService.exportReport(machineId, query);
    return ResponseHandler.success(c, report, 'Xuất báo cáo thành công');
  } catch (error: any) {
    return ResponseHandler.error(c, error.message);
  }
}
