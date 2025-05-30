
import { Report as DatabaseReport } from '@/types/database';

export interface DisplayReport {
  id: number;
  title: string;
  type: 'summary' | 'individual' | 'progress';
  date: string;
  status: string;
  description: string;
  studentCount?: number;
}

export class ReportTransformer {
  static toDisplayFormat(dbReport: DatabaseReport): DisplayReport {
    return {
      id: parseInt(dbReport.id),
      title: dbReport.title,
      type: this.extractReportType(dbReport.title, dbReport.content),
      date: this.formatDate(dbReport.generated_at),
      status: dbReport.status,
      description: this.truncateDescription(dbReport.content),
      studentCount: undefined // Would be calculated from screening data
    };
  }

  static toDisplayFormatBatch(dbReports: DatabaseReport[]): DisplayReport[] {
    return dbReports.map(report => this.toDisplayFormat(report));
  }

  private static extractReportType(title: string, content: string): 'summary' | 'individual' | 'progress' {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();
    
    if (titleLower.includes('summary') || contentLower.includes('summary')) {
      return 'summary';
    }
    if (titleLower.includes('progress') || contentLower.includes('progress')) {
      return 'progress';
    }
    return 'individual';
  }

  private static formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  private static truncateDescription(content: string, maxLength: number = 100): string {
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...' 
      : content;
  }
}

export class FilterUtils {
  static filterReports(
    reports: DisplayReport[],
    searchTerm: string,
    reportType: string,
    timeframe?: string
  ): DisplayReport[] {
    return reports.filter(report => {
      const matchesSearch = searchTerm === '' || 
        report.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = reportType === 'all' || 
        report.type === reportType;
      
      // Add timeframe filtering logic here if needed
      
      return matchesSearch && matchesType;
    });
  }
}
