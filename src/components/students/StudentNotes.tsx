import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
import { Edit, Save, X, Trash2 } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useToast } from '@/hooks/use-toast'
import { studentsApi } from '@/api/students'

interface Note {
  id: string
  note_text: string
  created_at: string
  updated_at: string
  created_by: { id: string; first_name: string; last_name: string }
}

interface StudentNotesProps {
  studentId: string
  formatDate: (dateString: string) => string
}

const StudentNotes = ({ studentId, formatDate }: StudentNotesProps) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [editedNotes, setEditedNotes] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNoteText, setEditingNoteText] = useState('')
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)
  const [studentNotes, setStudentNotes] = useState<Note[]>([])
  const [isLoadingNotes, setIsLoadingNotes] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoadingNotes(true)
      try {
        const notes = await studentsApi.getStudentNotes(studentId)
        setStudentNotes(notes)
      } catch {
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
  }, [studentId, toast])

  const refreshNotes = async () => {
    const notes = await studentsApi.getStudentNotes(studentId)
    setStudentNotes(notes)
  }

  const handleSaveNotes = async () => {
    if (!editedNotes.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a note before saving.',
        variant: 'destructive',
      })
      return
    }
    try {
      await studentsApi.createStudentNote(studentId, editedNotes.trim())
      setIsEditingNotes(false)
      setEditedNotes('')
      await refreshNotes()
      toast({ title: 'Note saved', description: 'Student note has been successfully saved.' })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save note. Please try again.',
        variant: 'destructive',
      })
    }
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
      await refreshNotes()
      toast({ title: 'Note updated', description: 'Student note has been successfully updated.' })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update note. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteNote = async () => {
    if (!deletingNoteId) return
    try {
      await studentsApi.deleteStudentNote(deletingNoteId)
      await refreshNotes()
      setDeletingNoteId(null)
      toast({ title: 'Note deleted', description: 'Student note has been successfully deleted.' })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete note. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className='pt-4 mt-4 border-t'>
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
                <Button size='sm' onClick={handleSaveNotes} className='px-3 h-7'>
                  <Save className='w-3 h-3 mr-1' />
                  Save Note
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setIsEditingNotes(false)
                    setEditedNotes('')
                  }}
                  className='px-3 h-7'>
                  <X className='w-3 h-3 mr-1' />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsEditingNotes(true)}
              className='justify-start w-full'>
              <Edit className='w-3 h-3 mr-2' />
              Add a note
            </Button>
          )}
        </div>
      </div>

      <div className='mt-6'>
        <h3 className='mb-3 text-sm font-medium text-gray-700'>Note History</h3>
        {isLoadingNotes ? (
          <div className='flex items-center justify-center py-8'>
            <LoadingSpinner size='sm' />
          </div>
        ) : studentNotes.length === 0 ? (
          <p className='py-4 text-sm text-center text-gray-500'>No notes yet</p>
        ) : (
          <div className='overflow-hidden border rounded-lg'>
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
                            className='min-h-[60px]'
                          />
                          <div className='flex gap-2'>
                            <Button
                              size='sm'
                              onClick={() => handleSaveEditedNote(note.id)}
                              className='px-3 h-7'>
                              <Save className='w-3 h-3 mr-1' />
                              Save
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => {
                                setEditingNoteId(null)
                                setEditingNoteText('')
                              }}
                              className='px-3 h-7'>
                              <X className='w-3 h-3 mr-1' />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        note.note_text
                      )}
                    </TableCell>
                    <TableCell
                      className='text-sm
  text-gray-600'>
                      {formatDate(note.created_at)}
                    </TableCell>
                    <TableCell
                      className='text-sm
  text-gray-600'>
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
                          onClick={() => {
                            setEditingNoteId(note.id)
                            setEditingNoteText(note.note_text)
                          }}
                          className='w-8 h-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50'
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
                              className='w-8 h-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
                              disabled={editingNoteId === note.id}>
                              <Trash2 className='w-4 h-4' />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Note</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this note? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeletingNoteId(null)}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteNote}
                                className='bg-red-600
  hover:bg-red-700'>
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
  )
}

export default StudentNotes
