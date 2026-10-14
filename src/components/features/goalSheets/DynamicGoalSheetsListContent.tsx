import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  ResponsiveTable,
  ResponsiveTableRow,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/responsive-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Download, Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useDeleteDynamicGoalSheet } from '@/hooks/goalSheets/use-dynamic-goal-sheets-mutations'
import { exportDynamicGoalSheetPdf } from '@/lib/exportDynamicGoalSheetPdf'
import type { DynamicGoalSheetWithSessions } from '@/types/database'

interface DynamicGoalSheetsListContentProps {
  sheets: DynamicGoalSheetWithSessions[]
  isLoading: boolean
}

const DynamicGoalSheetsListContent = ({ sheets, isLoading }: DynamicGoalSheetsListContentProps) => {
  const navigate = useNavigate()
  const { currentSchool } = useOrganization()
  const deleteGoalSheet = useDeleteDynamicGoalSheet()
  const [sheetToDelete, setSheetToDelete] = useState<DynamicGoalSheetWithSessions | null>(null)

  const handleOpen = (sheet: DynamicGoalSheetWithSessions) => {
    const path = currentSchool
      ? `/school/${currentSchool.id}/speech-screening-reports/dynamic-goal-sheets/${sheet.id}`
      : `/speech-screening-reports/dynamic-goal-sheets/${sheet.id}`
    navigate(path)
  }

  const handleExportPdf = (sheet: DynamicGoalSheetWithSessions) => {
    exportDynamicGoalSheetPdf(sheet).catch(error => {
      console.error('Failed to export PDF:', error)
    })
  }

  const handleConfirmDelete = () => {
    if (!sheetToDelete) return
    deleteGoalSheet.mutate(sheetToDelete.id, {
      onSuccess: () => setSheetToDelete(null),
    })
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <span className='text-sm text-gray-600'>Loading goal sheets...</span>
      </div>
    )
  }

  if (sheets.length === 0) {
    return <div className='py-8 text-sm text-center text-gray-500'>No dynamic goal sheets found.</div>
  }

  return (
    <>
      <ResponsiveTable className='w-full'>
        <TableHeader>
          <tr>
            <TableHead>Student</TableHead>
            <TableHead>Goal</TableHead>
            <TableHead>Sessions</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className='w-12'></TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {sheets.map(sheet => (
            <ResponsiveTableRow
              key={sheet.id}
              onClick={() => handleOpen(sheet)}
              className='cursor-pointer'
              mobileCardContent={
                <div className='space-y-2'>
                  <h3 className='font-medium'>
                    {sheet.student?.first_name} {sheet.student?.last_name}
                  </h3>
                  <p className='text-sm text-gray-600 truncate'>{sheet.goal_text}</p>
                  <p className='text-xs text-gray-500'>
                    {sheet.sessions.length} session{sheet.sessions.length === 1 ? '' : 's'} ·
                    Updated {format(new Date(sheet.updated_at), 'MMM d, yyyy')}
                  </p>
                </div>
              }>
              <TableCell className='max-w-0'>
                <div className='truncate'>
                  {sheet.student?.first_name} {sheet.student?.last_name}
                </div>
              </TableCell>
              <TableCell className='max-w-0'>
                <div className='truncate' title={sheet.goal_text}>
                  {sheet.goal_text}
                </div>
              </TableCell>
              <TableCell>{sheet.sessions.length}</TableCell>
              <TableCell className='whitespace-nowrap'>
                {format(new Date(sheet.updated_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell onClick={e => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='sm'>
                      <MoreHorizontal className='w-4 h-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='bg-white'>
                    <DropdownMenuItem onClick={() => handleOpen(sheet)}>
                      <Eye className='w-4 h-4 mr-2' />
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportPdf(sheet)}>
                      <Download className='w-4 h-4 mr-2' />
                      Export PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem className='text-red-600' onClick={() => setSheetToDelete(sheet)}>
                      <Trash2 className='w-4 h-4 mr-2' />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </ResponsiveTableRow>
          ))}
        </TableBody>
      </ResponsiveTable>

      <AlertDialog open={!!sheetToDelete} onOpenChange={open => !open && setSheetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this goal sheet?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the goal sheet for {sheetToDelete?.student?.first_name}{' '}
              {sheetToDelete?.student?.last_name} and all its sessions. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteGoalSheet.isPending}
              className='bg-red-600 hover:bg-red-700'>
              {deleteGoalSheet.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default DynamicGoalSheetsListContent
