import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  User,
  Calendar,
  Phone,
  FileText,
  GraduationCap,
  Edit,
  Save,
  X,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import type { Student } from '@/types/database'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useToast } from '@/hooks/use-toast'
import { studentsApi } from '@/api/students'

interface StudentInfoHeaderProps {
  student?: Student | null
  onEdit?: () => void
  onDelete?: () => void
  onMoveUpGrade?: () => void
  isLoading?: boolean
}

const StudentInfoHeader = ({
  student,
  onEdit,
  onDelete,
  onMoveUpGrade,
  isLoading = false,
}: StudentInfoHeaderProps) => {
  const [localStudent, setLocalStudent] = useState<Student | null>(null)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [editedNotes, setEditedNotes] = useState('')
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNoteText, setEditingNoteText] = useState('')
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedFirstName, setEditedFirstName] = useState('')
  const [editedLastName, setEditedLastName] = useState('')
  const [studentNotes, setStudentNotes] = useState<
    Array<{
      id: string
      note_text: string
      created_at: string
      updated_at: string
      created_by: {
        id: string
        first_name: string
        last_name: string
      }
    }>
  >([])
  const [isLoadingNotes, setIsLoadingNotes] = useState(false)
  const { toast } = useToast()

  // Update local student when prop changes
  useEffect(() => {
    setLocalStudent(student || null)
  }, [student])

  // Fetch student notes when component mounts or student changes
  useEffect(() => {
    const fetchNotes = async () => {
      if (!student?.id) return

      setIsLoadingNotes(true)
      try {
        const notes = await studentsApi.getStudentNotes(student.id)
        setStudentNotes(notes)
      } catch (error) {
        console.error('Error fetching student notes:', error)
        toast({
          title: 'Error',
          description: 'Failed to load student notes.',
          variant: 'destructive',
        })
      } finally {
        setIsLoadingNotes(false)
      }
    }

    fetchNotes()
  }, [student?.id, toast])

  const getAgeFromBirthDate = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleEditNotes = () => {
    setEditedNotes('')
    setIsEditingNotes(true)
  }

  const handleSaveNotes = async () => {
    if (!student?.id || !editedNotes.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a note before saving.',
        variant: 'destructive',
      })
      return
    }

    try {
      await studentsApi.createStudentNote(student.id, editedNotes.trim())
      setIsEditingNotes(false)
      setEditedNotes('')
      // Refresh notes list
      const notes = await studentsApi.getStudentNotes(student.id)
      setStudentNotes(notes)
      toast({
        title: 'Note saved',
        description: 'Student note has been successfully saved.',
      })
    } catch (error) {
      console.error('Error saving note:', error)
      toast({
        title: 'Error',
        description: 'Failed to save note. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCancelEdit = () => {
    setIsEditingNotes(false)
    setEditedNotes('')
  }

  const handleEditName = () => {
    if (!localStudent) return
    setEditedFirstName(localStudent.first_name)
    setEditedLastName(localStudent.last_name)
    setIsEditingName(true)
  }

  const handleSaveName = async () => {
    if (!localStudent?.id || !editedFirstName.trim() || !editedLastName.trim()) {
      toast({
        title: 'Error',
        description: 'First name and last name are required.',
        variant: 'destructive',
      })
      return
    }

    try {
      await studentsApi.updateStudent(localStudent.id, {
        first_name: editedFirstName.trim(),
        last_name: editedLastName.trim(),
      })

      // Update local student state immediately
      setLocalStudent({
        ...localStudent,
        first_name: editedFirstName.trim(),
        last_name: editedLastName.trim(),
      })

      setIsEditingName(false)
      toast({
        title: 'Name updated',
        description: 'Student name has been successfully updated.',
      })

      // Trigger a refresh of the student data if onEdit is provided
      if (onEdit) {
        onEdit()
      }
    } catch (error) {
      console.error('Error updating student name:', error)
      toast({
        title: 'Error',
        description: 'Failed to update student name. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCancelEditName = () => {
    setIsEditingName(false)
    setEditedFirstName('')
    setEditedLastName('')
  }

  const handleDeleteStudent = () => {
    if (onDelete) {
      onDelete()
      setDeleteConfirmation('') // Reset confirmation text
    }
  }

  const handleMoveUpGrade = () => {
    if (onMoveUpGrade) {
      onMoveUpGrade()
      toast({
        title: 'Grade updated',
        description: 'Student has been moved up to the next grade.',
      })
    }
  }

  const handleEditNote = (noteId: string, noteText: string) => {
    setEditingNoteId(noteId)
    setEditingNoteText(noteText)
  }

  const handleSaveEditedNote = async (noteId: string) => {
    if (!editingNoteText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a note before saving.',
        variant: 'destructive',
      })
      return
    }

    try {
      await studentsApi.updateStudentNote(noteId, editingNoteText.trim())
      setEditingNoteId(null)
      setEditingNoteText('')
      // Refresh notes list
      if (student?.id) {
        const notes = await studentsApi.getStudentNotes(student.id)
        setStudentNotes(notes)
      }
      toast({
        title: 'Note updated',
        description: 'Student note has been successfully updated.',
      })
    } catch (error) {
      console.error('Error updating note:', error)
      toast({
        title: 'Error',
        description: 'Failed to update note. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCancelEditNote = () => {
    setEditingNoteId(null)
    setEditingNoteText('')
  }

  const handleDeleteNote = async () => {
    if (!deletingNoteId) return

    try {
      await studentsApi.deleteStudentNote(deletingNoteId)
      // Refresh notes list
      if (student?.id) {
        const notes = await studentsApi.getStudentNotes(student.id)
        setStudentNotes(notes)
      }
      setDeletingNoteId(null)
      toast({
        title: 'Note deleted',
        description: 'Student note has been successfully deleted.',
      })
    } catch (error) {
      console.error('Error deleting note:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete note. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const studentFullName = localStudent ? `${localStudent.first_name} ${localStudent.last_name}` : ''

  if (isLoading) {
    return (
      <Card className='mb-6'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center py-8'>
            <div className='text-center'>
              <LoadingSpinner size='md' className='mx-auto mb-2' />
              <p className='text-gray-600'>Loading student information...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!localStudent) {
    return (
      <Card className='mb-6'>
        <CardContent className='p-6'>
          <div className='text-center py-8'>
            <p className='text-gray-600'>Student information not available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='mb-6'>
      <CardContent className='p-6'>
        <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6'>
          {/* Student Basic Info */}
          <div className='flex-1'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4'>
              <div className='flex items-center space-x-3 mb-3 sm:mb-0'>
                <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                  <User className='w-6 h-6 text-blue-600' />
                </div>
                <div>
                  <h1 className='text-2xl font-semibold text-gray-900'>
                    {localStudent.first_name} {localStudent.last_name}
                  </h1>
                  <p className='text-gray-600'>Student ID: {localStudent.student_id}</p>
                </div>
              </div>

              <div className='flex items-center space-x-2 flex-wrap gap-2'>
                {/* Edit Button */}
                <Button variant='outline' size='sm' onClick={handleEditName}>
                  <Edit className='w-4 h-4 mr-2' />
                  Edit
                </Button>
              </div>
            </div>

            {/* Student Details Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div className='flex items-start gap-2'>
                <GraduationCap className='w-4 h-4 text-gray-400 mt-0.5' />
                <div>
                  <span className='text-sm font-medium text-gray-700'>Grade</span>
                  <p className='text-sm text-gray-600'>{localStudent.grade}</p>
                </div>
              </div>

              {/* <div className='flex items-start gap-2'>
                <Calendar className='w-4 h-4 text-gray-400 mt-0.5' />
                <div>
                  <span className='text-sm font-medium text-gray-700'>Age</span>
                  <p className='text-sm text-gray-600'>
                    {getAgeFromBirthDate(student.date_of_birth)} years old
                  </p>
                </div>
              </div> */}

              {/* <div className='flex items-start gap-2'>
                <Phone className='w-4 h-4 text-gray-400 mt-0.5' />
                <div>
                  <span className='text-sm font-medium text-gray-700'>Emergency Contact</span>
                  <p className='text-sm text-gray-600'>{student.emergency_contact_name}</p>
                  <p className='text-sm text-gray-500'>{student.emergency_contact_phone}</p>
                </div>
              </div> */}
            </div>

            {/* Additional Info */}
            <div className='mt-4 pt-4 border-t'>
              <div className='flex items-start gap-2'>
                <div className='flex-1'>
                  {isEditingNotes ? (
                    <div className='space-y-2'>
                      <Textarea
                        value={editedNotes}
                        onChange={e => setEditedNotes(e.target.value)}
                        placeholder='Enter a new note...'
                        className='min-h-[80px]'
                      />
                      <div className='flex gap-2'>
                        <Button size='sm' onClick={handleSaveNotes} className='h-7 px-3'>
                          <Save className='w-3 h-3 mr-1' />
                          Save Note
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={handleCancelEdit}
                          className='h-7 px-3'>
                          <X className='w-3 h-3 mr-1' />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleEditNotes}
                      className='w-full justify-start'>
                      <Edit className='w-3 h-3 mr-2' />
                      Add a note
                    </Button>
                  )}
                </div>
              </div>

              {/* Student Notes Table */}
              <div className='mt-6'>
                <h3 className='text-sm font-medium text-gray-700 mb-3'>Note History</h3>
                {isLoadingNotes ? (
                  <div className='flex items-center justify-center py-8'>
                    <LoadingSpinner size='sm' />
                  </div>
                ) : studentNotes.length === 0 ? (
                  <p className='text-sm text-gray-500 text-center py-4'>No notes yet</p>
                ) : (
                  <div className='border rounded-lg overflow-hidden'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Note</TableHead>
                          <TableHead className='w-[200px]'>Date Created</TableHead>
                          <TableHead className='w-[200px]'>Last Updated</TableHead>
                          <TableHead className='w-[200px]'>Noted By</TableHead>
                          <TableHead className='w-[100px]'></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentNotes.map(note => (
                          <TableRow key={note.id}>
                            <TableCell className='text-sm text-gray-700'>
                              {editingNoteId === note.id ? (
                                <div className='space-y-2'>
                                  <Textarea
                                    value={editingNoteText}
                                    onChange={e => setEditingNoteText(e.target.value)}
                                    placeholder='Edit note...'
                                    className='min-h-[60px]'
                                  />
                                  <div className='flex gap-2'>
                                    <Button
                                      size='sm'
                                      onClick={() => handleSaveEditedNote(note.id)}
                                      className='h-7 px-3'>
                                      <Save className='w-3 h-3 mr-1' />
                                      Save
                                    </Button>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      onClick={handleCancelEditNote}
                                      className='h-7 px-3'>
                                      <X className='w-3 h-3 mr-1' />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                note.note_text
                              )}
                            </TableCell>
                            <TableCell className='text-sm text-gray-600'>
                              {formatDate(note.created_at)}
                            </TableCell>
                            <TableCell className='text-sm text-gray-600'>
                              {formatDate(note.updated_at)}
                            </TableCell>
                            <TableCell className='text-sm text-gray-600'>
                              {note.created_by.first_name} {note.created_by.last_name}
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => handleEditNote(note.id, note.note_text)}
                                  className='h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                                  disabled={editingNoteId === note.id}>
                                  <Edit className='w-4 h-4' />
                                </Button>
                                <AlertDialog
                                  open={deletingNoteId === note.id}
                                  onOpenChange={open => !open && setDeletingNoteId(null)}>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() => setDeletingNoteId(note.id)}
                                      className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
                                      disabled={editingNoteId === note.id}>
                                      <Trash2 className='w-4 h-4' />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Note</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this note? This action
                                        cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel onClick={() => setDeletingNoteId(null)}>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={handleDeleteNote}
                                        className='bg-red-600 hover:bg-red-700'>
                                        Delete Note
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Name Modal */}
        <Dialog open={isEditingName} onOpenChange={setIsEditingName}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Student Name</DialogTitle>
              <DialogDescription>Update the student's first and last name below.</DialogDescription>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>First Name</label>
                <Input
                  value={editedFirstName}
                  onChange={e => setEditedFirstName(e.target.value)}
                  placeholder='First Name'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Last Name</label>
                <Input
                  value={editedLastName}
                  onChange={e => setEditedLastName(e.target.value)}
                  placeholder='Last Name'
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={handleCancelEditName}>
                Cancel
              </Button>
              <Button onClick={handleSaveName}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default StudentInfoHeader
