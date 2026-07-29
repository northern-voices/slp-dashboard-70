import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ReportPasswordInputProps {
  password: string
  onChange: (password: string) => void
}

const ReportPasswordInput = ({ password, onChange }: ReportPasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className='space-y-2'>
      <Label className='text-sm font-medium flex items-center gap-1.5'>
        <Lock className='w-3.5 h-3.5' />
        Report Password
      </Label>

      <div className='relative'>
        <Input
          value={password}
          onChange={e => onChange(e.target.value)}
          type={showPassword ? 'text' : 'password'}
          placeholder='Password the recipient will need to view this report'
        />

        <button
          type='button'
          onClick={() => setShowPassword(!showPassword)}
          className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'>
          {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
        </button>
      </div>

      <p className='text-xs text-muted-foreground'>
        Share this password with the recipient separately - it's never included in the email itself
      </p>
    </div>
  )
}

export default ReportPasswordInput
