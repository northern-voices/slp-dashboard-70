import { useState } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useDocuments, useDeleteDocument } from '@/hooks/documents/use-documents'
import { documentsApi, Document } from '@/api/documents'
import { Loader2, Plus, Trash2, Eye, FileImage } from 'lucide-react'
import { format } from 'date-fns'
import AttendanceSheetModal from './AttendanceSheetModal'
