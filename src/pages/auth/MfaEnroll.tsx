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
  returnTo?: string
}

const MfaEnroll = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  const returnTo = (location.state as LocationState)?.returnTo || '/'

  useEffect(() => {
    const startEnrollment = async () => {
      // Unenroll any existing factors first (handles re-enrollment from profile)
      const { data: existing } = await supabase.auth.mfa.listFactors()
      for (const factor of existing?.totp ?? []) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id })
      }

      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
      if (error) {
        toast({
          title: 'Failed to start 2FA setup',
          description: error.message,
          variant: 'destructive',
        })
        return
      }
      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      setFactorId(data.id)
    }

    startEnrollment()
  }, [])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!factorId || code.length !== 6) return

    setIsVerifying(true)
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code })
      if (error) throw error
      toast({ title: 'Two-factor authentication enabled' })
      navigate(returnTo, { replace: true })
    } catch {
      toast({
        title: 'Invalid code',
        description: 'Check your authenticator app and try again.',
        variant: 'destructive',
      })
      setCode('')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <AuthLayout
      title='Set Up Two-Factor Authentication'
      subtitle='Secure your account with an authenticator app'>
      <div className='space-y-6'>
        <div className='p-4 space-y-1 text-sm text-blue-800 rounded-lg bg-blue-50'>
          <p className='font-medium'>2FA is required for your account.</p>
          <p>Scan the QR code below with Google Authenticator, Authy, or any TOTP app.</p>
        </div>

        {qrCode ? (
          <div className='flex flex-col items-center gap-3'>
            <div
              className='p-3 bg-white border border-gray-200 rounded-lg'
              dangerouslySetInnerHTML={{ __html: qrCode }}
            />
            <button
              type='button'
              className='text-sm text-blue-600 hover:underline'
              onClick={() => setShowSecret(!showSecret)}>
              Can't scan? Enter the key manually
            </button>
            {showSecret && (
              <div className='w-full p-3 font-mono text-sm tracking-widest text-center break-all border rounded-md bg-gray-50'>
                {secret}
              </div>
            )}
          </div>
        ) : (
          <div className='flex justify-center py-8'>
            <div className='w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin' />
          </div>
        )}

        <form onSubmit={handleVerify} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='code'>Verification Code</Label>
            <Input
              id='code'
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder='000000'
              inputMode='numeric'
              maxLength={6}
              className='font-mono text-xl tracking-widest text-center'
              autoFocus
            />
            <p className='text-xs text-gray-500'>Enter the 6-digit code shown in your app.</p>
          </div>

          <Button type='submit' className='w-full' disabled={isVerifying || code.length !== 6}>
            <ShieldCheck className='w-4 h-4 mr-2' />
            {isVerifying ? 'Verifying...' : 'Activate 2FA'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}

export default MfaEnroll
