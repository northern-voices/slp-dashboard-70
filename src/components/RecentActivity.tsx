import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useStudentsBySchool } from '@/hooks/students'
import { useScreenings } from '@/hooks/screenings'
import { formatDistanceToNow } from 'date-fns'
import { GraduationCap, FileText, Eye } from 'lucide-react'
import { Screening } from '@/types/database'

const RecentActivity = () => {
  const navigate = useNavigate()
  const { currentSchool, userProfile } = useOrganization()

  // Fetch recent students and screenings
  const { data: students = [], isLoading: studentsLoading } = useStudentsBySchool(currentSchool?.id)

  const { data: screenings = [], isLoading: screeningsLoading } = useScreenings()

  const isLoading = studentsLoading || screeningsLoading

  // Filter screenings by current school and get recent ones
  const schoolScreenings = currentSchool
    ? screenings.filter(screening => {
        // Handle cases where school_id might be empty or undefined
        if (!screening.school_id || screening.school_id === '') {
          return false // Skip screenings without school_id
        }
        return screening.school_id === currentSchool.id
      })
    : []

  const recentScreenings = schoolScreenings
    .sort((a, b) => {
      try {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } catch (error) {
        console.error('Error sorting screenings by date:', error)
        return 0
      }
    })
    .slice(0, 5)

  // Get recent students (last 5 added or updated)
  const recentStudents = students
    .sort((a, b) => {
      try {
        const dateA = new Date(a.updated_at || a.created_at).getTime()
        const dateB = new Date(b.updated_at || b.created_at).getTime()
        return dateB - dateA
      } catch (error) {
        console.error('Error sorting students by date:', error)
        return 0
      }
    })
    .slice(0, 5)

  const getScreeningTypeIcon = (screening: Screening) => {
    // Check if it's a speech or hearing screening based on available fields
    if (screening.vocabulary_support !== undefined || screening.error_patterns?.articulation) {
      return '🗣️'
    } else if (screening.right_volume_db !== undefined || screening.left_volume_db !== undefined) {
      return '👂'
    }
    return '📋' // Default icon
  }

  const getScreeningTypeLabel = (screening: Screening) => {
    // Check if it's a speech or hearing screening based on available fields
    if (screening.vocabulary_support !== undefined || screening.error_patterns?.articulation) {
      return 'Speech'
    } else if (screening.right_volume_db !== undefined || screening.left_volume_db !== undefined) {
      return 'Hearing'
    }
    return 'Progress' // Default label
  }

  const handleViewStudent = (studentId: string) => {
    if (currentSchool) {
      navigate(`/school/${currentSchool.id}/students/${studentId}`)
    } else {
      navigate(`/students/${studentId}`)
    }
  }

  const handleViewScreenings = () => {
    if (currentSchool) {
      navigate(`/school/${currentSchool.id}/screenings`)
    } else {
      navigate('/screenings')
    }
  }

  const handleViewStudents = () => {
    if (currentSchool) {
      navigate(`/school/${currentSchool.id}/students`)
    } else {
      navigate('/students')
    }
  }

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {[1, 2].map(i => (
          <Card key={i} className='bg-white border border-gray-100 shadow-sm rounded-xl'>
            <CardHeader className='pb-3'>
              <div className='h-4 bg-gray-200 rounded w-32 animate-pulse'></div>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='space-y-3'>
                {[1, 2, 3].map(j => (
                  <div key={j} className='h-4 bg-gray-200 rounded w-full animate-pulse'></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!currentSchool) {
    return (
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='bg-white border border-gray-100 shadow-sm rounded-xl'>
          <CardContent className='p-6'>
            <div className='text-center'>
              <GraduationCap className='w-12 h-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>Select a School</h3>
              <p className='text-gray-600 text-sm'>
                Choose a school to view recent activity and manage students.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      {/* Recent Students */}
      <Card className='bg-white border border-gray-100 shadow-sm rounded-xl'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg font-semibold text-gray-900'>Recent Students</CardTitle>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleViewStudents}
              className='text-brand hover:text-brand/80'>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className='pt-0'>
          {recentStudents.length > 0 ? (
            <div className='space-y-3'>
              {recentStudents.map(student => (
                <div
                  key={student.id}
                  className='flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer'
                  onClick={() => handleViewStudent(student.id)}>
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-brand/10 rounded-full flex items-center justify-center'>
                      <GraduationCap className='w-4 h-4 text-brand' />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {student.first_name} {student.last_name}
                      </p>
                      <p className='text-xs text-gray-500'>{student.grade || 'N/A'}</p>
                    </div>
                  </div>
                  <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                    <Eye className='w-4 h-4' />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-6'>
              <GraduationCap className='w-12 h-12 text-gray-400 mx-auto mb-3' />
              <p className='text-gray-600 text-sm'>No students found in this school.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Screenings */}
      <Card className='bg-white border border-gray-100 shadow-sm rounded-xl'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg font-semibold text-gray-900'>Recent Screenings</CardTitle>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleViewScreenings}
              className='text-brand hover:text-brand/80'>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className='pt-0'>
          {recentScreenings.length > 0 ? (
            <div className='space-y-3'>
              {recentScreenings.map(screening => (
                <div
                  key={screening.id}
                  className='flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center'>
                      <FileText className='w-4 h-4 text-emerald-600' />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {screening.student_name || 'Unknown Student'}
                      </p>
                      <div className='flex items-center space-x-2'>
                        <Badge variant='secondary' className='text-xs'>
                          {getScreeningTypeLabel(screening)}
                        </Badge>
                        <span className='text-xs text-gray-500'>
                          {(() => {
                            try {
                              return formatDistanceToNow(new Date(screening.created_at), {
                                addSuffix: true,
                              })
                            } catch (error) {
                              console.error('Error formatting date:', error)
                              return 'Recently'
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className='text-2xl'>{getScreeningTypeIcon(screening)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-6'>
              <FileText className='w-12 h-12 text-gray-400 mx-auto mb-3' />
              <p className='text-gray-600 text-sm'>No recent screenings found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default RecentActivity
