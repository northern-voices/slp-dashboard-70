import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import GoalSheetHeader from '@/components/students/goal-sheet/GoalSheetHeader'
import GoalSheetForm from '@/components/students/goal-sheet/GoalSheetForm'
import { useToast } from '@/hooks/use-toast'

const GenerateGoalSheet = () => {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async values => {
    setIsSubmitting(true)
    try {
      // TODO: Replace with actual API call
      console.log('Goal sheet submitted:', values)
      toast({
        title: 'Goal Sheet Saved',
        description: 'The goal sheet has been successfully created and saved.',
      })
      navigate(`/students/${studentId}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save the goal sheet. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate(`/students/${studentId}`)
  }

  if (!studentId) {
    return <div>Student ID not found</div>
  }

  return (
    <div className='max-w-4xl mx-auto'>
      <GoalSheetHeader studentId={studentId} />
      <GoalSheetForm onSubmit={handleSubmit} onCancel={handleCancel} isSubmitting={isSubmitting} />
    </div>
  )
}

export default GenerateGoalSheet
