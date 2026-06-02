import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OrgUser } from '@/types/database'

export interface UserEditFormData {
  first_name: string
  last_name: string
  role: string
}

interface UserEditModalProps {
  isOpen: boolean
  onClose: () => void
  user: OrgUser | null
  onSave: (userId: string, data: UserEditFormData) => void
}

const UserEditModal = ({ isOpen, onClose, user, onSave }: UserEditModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UserEditFormData>({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      role: user?.role || 'slp',
    },
  })

  useEffect(() => {
    reset({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      role: user?.role || 'slp',
    })
  }, [user, reset])

  const onSubmit = (data: UserEditFormData) => {
    if (!user) return
    onSave(user.id, data)
    onClose()
  }
}

export default UserEditModal
