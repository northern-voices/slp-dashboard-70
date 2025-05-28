
import { Report } from '@/types/database';

export class DataValidator {
  static validateReport(report: unknown): report is Report {
    if (!report || typeof report !== 'object') {
      return false;
    }

    const r = report as Record<string, unknown>;
    
    return (
      typeof r.id === 'string' &&
      typeof r.screening_id === 'string' &&
      typeof r.title === 'string' &&
      typeof r.content === 'string' &&
      typeof r.generated_at === 'string' &&
      typeof r.status === 'string' &&
      ['draft', 'final', 'reviewed'].includes(r.status as string) &&
      typeof r.follow_up_required === 'boolean'
    );
  }

  static validateReports(reports: unknown): reports is Report[] {
    return Array.isArray(reports) && reports.every(report => this.validateReport(report));
  }

  static sanitizeString(input: string): string {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateDateRange(startDate: string, endDate?: string): boolean {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return false;
    }

    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return false;
      }
      return start <= end;
    }

    return true;
  }
}
