import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, FileText, Volume2, Mic, Target, TrendingUp, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ReportShareActions from './ReportShareActions'
import BulkReportActions from './BulkReportActions'
import QuickSendModal from './QuickSendModal'

interface GeneratedReport {
  id: number
  title: string
  type: 'hearing' | 'speech-screens' | 'goal-sheets' | 'progress-reports'
  date: string
  status: 'completed' | 'pending' | 'failed'
  academicYear: string
  grades: string[]
  studentCount: number
}

const GeneratedReportsList = () => {
  const navigate = useNavigate()
  const [selectedReports, setSelectedReports] = useState<number[]>([])
  const [quickSendModal, setQuickSendModal] = useState<{
    isOpen: boolean
    reportId?: number
    reportTitle?: string
  }>({ isOpen: false })

  // Mock data for generated reports
  const reports: GeneratedReport[] = [
    {
      id: 1,
      title: 'Class Wide Hearing Screen - Fall 2024',
      type: 'hearing',
      date: '2024-11-20',
      status: 'completed',
      academicYear: '2024-2025',
      grades: ['K', '1st', '2nd'],
      studentCount: 68,
    },
    {
      id: 2,
      title: 'Speech Screening Report - Lincoln Elementary',
      type: 'speech-screens',
      date: '2024-11-18',
      status: 'completed',
      academicYear: '2024-2025',
      grades: ['3rd', '4th', '5th'],
      studentCount: 42,
    },
    {
      id: 3,
      title: 'Progress Reports - Quarter 1',
      type: 'progress-reports',
      date: '2024-11-15',
      status: 'pending',
      academicYear: '2024-2025',
      grades: ['K', '1st'],
      studentCount: 25,
    },
    {
      id: 4,
      title: 'Goal Sheets - Washington Middle School',
      type: 'goal-sheets',
      date: '2024-11-10',
      status: 'completed',
      academicYear: '2024-2025',
      grades: ['6th', '7th', '8th'],
      studentCount: 84,
    },
  ]

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'hearing':
        return <Volume2 className='w-5 h-5 text-blue-600' />
      case 'speech-screens':
        return <Mic className='w-5 h-5 text-green-600' />
      case 'goal-sheets':
        return <Target className='w-5 h-5 text-orange-600' />
      case 'progress-reports':
        return <TrendingUp className='w-5 h-5 text-purple-600' />
      default:
        return <FileText className='w-5 h-5 text-gray-600' />
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
      month: 'short',
      day: 'numeric',
    })
  }

  const handleViewReport = (reportId: number) => {
    navigate(`/speech-screening-reports/${reportId}`)
  }

  const handleReportSelection = (reportId: number, checked: boolean) => {
    if (checked) {
      setSelectedReports(prev => [...prev, reportId])
    } else {
      setSelectedReports(prev => prev.filter(id => id !== reportId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const completedReportIds = reports
        .filter(report => report.status === 'completed')
        .map(report => report.id)
      setSelectedReports(completedReportIds)
    } else {
      setSelectedReports([])
    }
  }

  const openQuickSendModal = (reportId: number, reportTitle: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setQuickSendModal({
      isOpen: true,
      reportId,
      reportTitle,
    })
  }

  const completedReports = reports.filter(report => report.status === 'completed')
  const allCompletedSelected =
    completedReports.length > 0 &&
    completedReports.every(report => selectedReports.includes(report.id))

  return (
    <>
      <Card className='w-full'>
        <CardHeader>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            <div>
              <CardTitle className='text-lg font-semibold'>Generated Reports</CardTitle>
              <CardDescription>
                Recent class-wide reports that have been generated and are available for
                distribution
              </CardDescription>
            </div>

            {completedReports.length > 0 && (
              <div className='flex items-center gap-3'>
                <label className='flex items-center gap-2 text-sm font-medium cursor-pointer'>
                  <Checkbox checked={allCompletedSelected} onCheckedChange={handleSelectAll} />
                  Select All ({completedReports.length})
                </label>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {/* Bulk Actions Bar */}
            <BulkReportActions
              selectedReports={selectedReports}
              onSelectionChange={setSelectedReports}
              totalReports={completedReports.length}
            />

            {/* Reports List */}
            {reports.map(report => (
              <div
                key={report.id}
                className='flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border rounded-lg hover:bg-gray-50 space-y-3 lg:space-y-0'>
                <div className='flex items-start space-x-4'>
                  {/* Selection Checkbox */}
                  {report.status === 'completed' && (
                    <Checkbox
                      checked={selectedReports.includes(report.id)}
                      onCheckedChange={checked =>
                        handleReportSelection(report.id, checked as boolean)
                      }
                      className='mt-1'
                    />
                  )}

                  <div className='flex-shrink-0 mt-1'>{getReportIcon(report.type)}</div>
                  <div className='flex-1 min-w-0'>
                    <h5
                      className='font-medium text-gray-900 break-words cursor-pointer hover:text-blue-600'
                      onClick={() => handleViewReport(report.id)}>
                      {report.title}
                    </h5>
                    <div className='flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600'>
                      <span>{formatDate(report.date)}</span>
                      <span>•</span>
                      <span>{report.academicYear}</span>
                      <span>•</span>
                      <span>{report.studentCount} students</span>
                      <span>•</span>
                      <span>Grades: {report.grades.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className='flex items-center justify-between lg:justify-end space-x-3'>
                  {getStatusBadge(report.status)}

                  {/* Action Buttons */}
                  <div className='flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-2'>
                    <div className='flex space-x-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        className='h-9'
                        onClick={e => {
                          e.stopPropagation()
                          handleViewReport(report.id)
                        }}>
                        <Eye className='w-4 h-4 mr-2' />
                        View
                      </Button>
                      {report.status === 'completed' && (
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-9'
                          onClick={e => e.stopPropagation()}>
                          <Download className='w-4 h-4 mr-2' />
                          Download
                        </Button>
                      )}
                    </div>

                    {/* Enhanced Share Actions */}
                    <ReportShareActions
                      reportId={report.id}
                      reportTitle={report.title}
                      reportType={report.type}
                      status={report.status}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Send Modal */}
      <QuickSendModal
        isOpen={quickSendModal.isOpen}
        onClose={() => setQuickSendModal({ isOpen: false })}
        reportId={quickSendModal.reportId || 0}
        reportTitle={quickSendModal.reportTitle || ''}
      />
    </>
  )
}

export default GeneratedReportsList
