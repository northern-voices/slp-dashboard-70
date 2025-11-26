import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Download,
  FileText,
  Volume2,
  Mic,
  Target,
  TrendingUp,
  Calendar,
  Users,
  GraduationCap,
} from 'lucide-react'

interface ReportDetailContentProps {
  reportId?: string
}

const ReportDetailContent = ({ reportId }: ReportDetailContentProps) => {
  // Mock data - in a real app, this would be fetched based on reportId
  const report = {
    id: reportId,
    title: 'Class Wide Hearing Screen - Fall 2024',
    type: 'hearing',
    date: '2024-11-20',
    status: 'completed',
    academicYear: '2024-2025',
    grades: ['K', '1st', '2nd'],
    studentCount: 68,
    description:
      'Comprehensive hearing screening assessment conducted across multiple grade levels to identify students who may require additional audiological evaluation or intervention services.',
    summary:
      'This report presents the results of hearing screenings conducted for 68 students across Kindergarten, 1st, and 2nd grades during the Fall 2024 semester. The screening process followed standard protocols to assess hearing acuity and identify students who may benefit from further evaluation.',
    results: {
      passed: 62,
      failed: 4,
      incomplete: 2,
    },
    recommendations: [
      '4 students require follow-up audiological evaluation',
      '2 students need to complete screening due to absence',
      'Continue monitoring students with borderline results',
      'Schedule annual re-screening for all students',
    ],
  }

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'hearing':
        return <Volume2 className='w-6 h-6 text-blue-600' />
      case 'speech-screens':
        return <Mic className='w-6 h-6 text-green-600' />
      case 'goal-sheets':
        return <Target className='w-6 h-6 text-orange-600' />
      case 'progress-reports':
        return <TrendingUp className='w-6 h-6 text-purple-600' />
      default:
        return <FileText className='w-6 h-6 text-gray-600' />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className='bg-green-100 text-green-800'>Completed</Badge>
      case 'pending':
        return <Badge className='bg-yellow-100 text-yellow-800'>Pending</Badge>
      case 'failed':
        return <Badge className='bg-red-100 text-red-800'>Failed</Badge>
      default:
        return <Badge variant='secondary'>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className='space-y-6'>
      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4'>
            <div className='flex items-start space-x-4'>
              <div className='flex-shrink-0'>{getReportIcon(report.type)}</div>
              <div className='flex-1 min-w-0'>
                <CardTitle className='text-xl font-semibold text-gray-900 mb-2'>
                  {report.title}
                </CardTitle>
                <CardDescription className='text-base'>{report.description}</CardDescription>
              </div>
            </div>
            <div className='flex flex-col lg:items-end space-y-2'>
              {getStatusBadge(report.status)}
              <Button className='w-full lg:w-auto'>
                <Download className='w-4 h-4 mr-2' />
                Download Report
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Report Metadata */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-3'>
              <Calendar className='w-5 h-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-900'>Date Generated</p>
                <p className='text-sm text-gray-600'>{formatDate(report.date)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-3'>
              <Users className='w-5 h-5 text-green-600' />
              <div>
                <p className='text-sm font-medium text-gray-900'>Students Included</p>
                <p className='text-sm text-gray-600'>{report.studentCount} students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-3'>
              <GraduationCap className='w-5 h-5 text-purple-600' />
              <div>
                <p className='text-sm font-medium text-gray-900'>Grade Levels</p>
                <p className='text-sm text-gray-600'>{report.grades.join(', ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Summary */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>Report Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-gray-700 leading-relaxed'>{report.summary}</p>
        </CardContent>
      </Card>

      {/* Results Overview */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>Results Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='text-center p-4 bg-green-50 rounded-lg'>
              <div className='text-2xl font-bold text-green-600'>{report.results.passed}</div>
              <div className='text-sm text-green-800'>Students Passed</div>
            </div>
            <div className='text-center p-4 bg-red-50 rounded-lg'>
              <div className='text-2xl font-bold text-red-600'>{report.results.failed}</div>
              <div className='text-sm text-red-800'>Students Failed</div>
            </div>
            <div className='text-center p-4 bg-yellow-50 rounded-lg'>
              <div className='text-2xl font-bold text-yellow-600'>{report.results.incomplete}</div>
              <div className='text-sm text-yellow-800'>Incomplete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className='space-y-2'>
            {report.recommendations.map((recommendation, index) => (
              <li key={index} className='flex items-start space-x-2'>
                <div className='w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0'></div>
                <span className='text-gray-700'>{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default ReportDetailContent
