import { CheckCircle, Plus, List, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

interface ReportSendModalProps {
  isOpen: boolean
  modalType: 'success' | 'error'
  modalMessage: string
  onStayOnPage: () => void
  onGoBack: () => void
  onClose: () => void
}
