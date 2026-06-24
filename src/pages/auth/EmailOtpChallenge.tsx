import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import AuthLayout from '@/components/auth/AuthLayout'
import { supabase } from '@/lib/supabase'
import { Mail, ShieldCheck } from 'lucide-react'

interface LocationState {
  from: { pathname: string }
}

const EmailOtpChallenge = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [hasTotpFactor, setHasTotpFactor] = useState(false)

  const from = (location.state as LocationState)?.from?.pathname || '/'

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: factors } = await supabase.auth.mfa.listFactors()

      if (!user?.email) {
        navigate('/auth/login', { replace: true })
        return
      }

      setHasTotpFactor((factors?.totp?.length ?? 0) > 0)
      setEmail(user.email)
      setUserId(user.id)

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: user.email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/email-otp`,
        },
      })
      if (otpError) {
        console.error('Failed to send OTP:', otpError)
        toast({
          title: 'Failed to send verification code',
          description: otpError.message,
          variant: 'destructive',
        })
        return
      }
      setCodeSent(true)
    }

    init()
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || code.length !== 6) return

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
      if (error) throw error

      sessionStorage.setItem(`email_mfa_${userId}`, 'true')
      navigate(from, { replace: true })
    } catch {
      toast({
        title: 'Invalid code',
        description: 'Check your email and try again.',
        variant: 'destructive',
      })
      setCode('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) return
    setIsResending(true)
    try {
      await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/email-otp`,
        },
      })
      toast({ title: 'Code resent', description: 'Check your email for a new code.' })
    } catch {
      toast({ title: 'Failed to resend', description: 'Please try again.', variant: 'destructive' })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout
      title='Check Your Email'
      subtitle={`We sent a 6-digit code to ${email || 'your email'}`}>
      <div className='space-y-6'>
        {codeSent && (
          <div className='flex items-start gap-3 p-4 text-sm text-blue-800 rounded-lg bg-blue-50'>
            <Mail className='w-4 h-4 mt-0.5 shrink-0' />
            <p>
              A verification code was sent to <strong>{email}</strong>. It expires in 10 minutes.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='code'>Verification Code</Label>
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
          </div>

          <Button type='submit' className='w-full' disabled={isLoading || code.length !== 6}>
            <ShieldCheck className='w-4 h-4 mr-2' />
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>
        </form>

        <div className='text-center'>
          <button
            type='button'
            onClick={handleResend}
            disabled={isResending}
            className='text-sm text-blue-600 hover:underline disabled:opacity-50'>
            {isResending ? 'Sending...' : "Didn't receive it? Resend code"}
          </button>
        </div>

        {hasTotpFactor && (
          <div className='text-center'>
            <button
              type='button'
              onClick={() => {
                navigate('/auth/mfa', { state: { from: { pathname: from } } })
              }}
              className='text-sm text-muted-foreground hover:underline'>
              Use authenticator app instead
            </button>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}

export default EmailOtpChallenge
