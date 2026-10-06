import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import type { Screening } from '@/types/database'

interface GraduateConfirmDialogProps {
  screening: Screening | null
  isSaving: boolean
  onConfirm: (notes: string) => void
  onCancel: () => void
}
