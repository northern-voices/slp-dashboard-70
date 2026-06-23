import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import AuthLayout from '@/components/auth/AuthLayout'
import { supabase } from '@/lib/supabase'
import { ShieldCheck } from 'lucide-react'
interface LocationState {
  from: { pathname: string }
}

const MfaChallenge = () => {
  const [isInitializing, setIsInitializing] = useState(true)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [code, setCode] = useState('')

  const from = (location.state as LocationState)?.from?.pathname || '/'

  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const factor = data?.totp?.[0]

      if (!factor) {
        // No factor found — send to enroll
        navigate('/auth/email-otp', { state: { from: { pathname: from } }, replace: true })
        return
      }
      setFactorId(factor.id)
      setIsInitializing(false)
    })
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!factorId || code.length !== 6) return

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code })
      if (error) throw error
      navigate(from, { replace: true })
    } catch {
      toast({
        title: 'Invalid code',
        description: 'Check your authenticator app and try again.',
        variant: 'destructive',
      })
      setCode('')
    } finally {
      setIsLoading(false)
    }
  }

  if (isInitializing) return null

  return (
    <AuthLayout
      title='Two-Factor Authentication'
      subtitle='Enter the code from your authenticator app'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='code'>Authentication Code</Label>
          <Input
            id='code'
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder='000000'
            inputMode='numeric'
            maxLength={6}
            className='font-mono text-2xl tracking-widest text-center'
            autoFocus
          />
          <p className='text-xs text-center text-gray-500'>
            Open your authenticator app to view your 6-digit code.
          </p>
        </div>

        <Button type='submit' className='w-full' disabled={isLoading || code.length !== 6}>
          <ShieldCheck className='w-4 h-4 mr-2' />
          {isLoading ? 'Verifying...' : 'Verify'}
        </Button>

        <div className='text-center'>
          <button
            type='button'
            onClick={() => navigate('/auth/email-otp', { state: { from: { pathname: from } } })}
            className='text-sm text-muted-foreground hover:underline'>
            Use email verification instead
          </button>
        </div>
      </form>
    </AuthLayout>
  )
}

export default MfaChallenge
