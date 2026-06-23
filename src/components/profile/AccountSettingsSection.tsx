import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { Lock, LogOut, Mail, Smartphone } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const AccountSettingsSection = () => {
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [preference, setPreference] = useState<'email' | 'totp'>('email')

  const { toast } = useToast()
  const navigate = useNavigate()
  const [mfaFactor, setMfaFactor] = useState<{ id: string } | null>(null)
  const [mfaLoading, setMfaLoading] = useState(true)

  useEffect(() => {
    Promise.all([supabase.auth.mfa.listFactors(), supabase.auth.getUser()]).then(
      ([
        { data: factors },
        {
          data: { user },
        },
      ]) => {
        setMfaFactor(factors?.totp?.[0] ?? null)
        setPreference(user?.user_metadata?.preferred_mfa ?? 'email')
        setMfaLoading(false)
      }
    )
  }, [])

  const passwordForm = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onPasswordSubmit = (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      })
      return
    }

    console.log('Updating password:', data)
    toast({
      title: 'Password Updated',
      description: 'Your password has been changed successfully.',
    })
    setShowPasswordForm(false)
    passwordForm.reset()
  }

  const handleSwitchToEmail = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { preferred_mfa: 'email' },
      })
      if (error) throw error
      toast({
        title: 'Switched to email verification',
        description: 'You will receive a code by email on your next login.',
      })
      setPreference('email')
    } catch {
      toast({ title: 'Failed to switch', description: 'Please try again.', variant: 'destructive' })
    }
  }

  const handleSwitchToTotp = async () => {
    await supabase.auth.updateUser({ data: { preferred_mfa: 'totp' } })

    if (mfaFactor) {
      setPreference('totp')
      toast({
        title: 'Switched to authenticator app',
        description: 'You will use your authenticator app on your next login.',
      })
    } else {
      navigate('/auth/mfa/enroll', { state: { returnTo: '/profile?tab=account' } })
    }
  }

  const handleReenroll = async () => {
    if (mfaFactor) {
      await supabase.auth.mfa.unenroll({ factorId: mfaFactor.id })
    }
    navigate('/auth/mfa/enroll', { state: { returnTo: '/profile?tab=account' } })
  }

  const handleLogoutAllDevices = () => {
    toast({
      title: 'Sessions Ended',
      description: 'You have been logged out from all other devices.',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center'>
          <Lock className='w-5 h-5 mr-2' />
          Account Security
        </CardTitle>
        <CardDescription>Manage your account</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Password Section */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <Label className='text-base font-medium'>Password</Label>
              <p className='text-sm text-muted-foreground'>Last changed 3 months ago</p>
            </div>
            <Button variant='outline' onClick={() => setShowPasswordForm(!showPasswordForm)}>
              Change Password
            </Button>
          </div>

          {showPasswordForm && (
            <Card className='bg-muted/20'>
              <CardContent className='pt-6'>
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                    className='space-y-4'>
                    <FormField
                      control={passwordForm.control}
                      name='currentPassword'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input {...field} type='password' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name='newPassword'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input {...field} type='password' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name='confirmPassword'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input {...field} type='password' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className='flex gap-2'>
                      <Button type='submit'>Update Password</Button>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => setShowPasswordForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Two-Factor Authentication */}
        <div className='py-4 space-y-4 border-t'>
          <div>
            <Label className='text-base font-medium'>Two-Factor Authentication</Label>
            <p className='text-sm text-muted-foreground'>
              Choose how you verify your identity when signing in
            </p>
          </div>

          {mfaLoading ? (
            <p className='text-sm text-muted-foreground'>Checking status...</p>
          ) : (
            <div className='grid gap-3'>
              {/* Email Option */}
              <div
                className={`flex items-start justify-between p-4 rounded-lg border-2 transition-colors ${
                  preference === 'email' ? 'border-border bg-brand/5' : 'border-border bg-muted/20'
                }`}>
                <div className='flex items-start gap-3'>
                  <Mail className='w-5 h-5 mt-0.5 text-muted-foreground' />
                  <div>
                    <p className='text-sm font-medium'>Email Verification</p>
                    <p className='text-xs text-muted-foreground mt-0.5'>
                      A 6-digit code is sent to your email each time you sign in
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2 ml-4 shrink-0'>
                  {preference === 'email' ? (
                    <span className='px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700'>
                      Active
                    </span>
                  ) : (
                    <Button variant='outline' size='sm' onClick={handleSwitchToEmail}>
                      Switch
                    </Button>
                  )}
                </div>
              </div>

              {/* Authenticator App Option */}
              <div
                className={`flex items-start justify-between p-4 rounded-lg border-2 transition-colors ${
                  preference === 'totp' ? 'border-border bg-brand/5' : 'border-border bg-muted/20'
                }`}>
                <div className='flex items-start gap-3'>
                  <Smartphone className='w-5 h-5 mt-0.5 text-muted-foreground' />
                  <div>
                    <p className='text-sm font-medium'>Authenticator App</p>
                    <p className='text-xs text-muted-foreground mt-0.5'>
                      Use Google Authenticator or Authy for a time-based code
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2 ml-4 shrink-0'>
                  {preference === 'totp' ? (
                    <>
                      <span className='px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700'>
                        Active
                      </span>
                      <div className='w-px h-4 bg-border' />
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-muted-foreground'
                        onClick={handleReenroll}>
                        Re-enroll
                      </Button>
                    </>
                  ) : (
                    <Button variant='outline' size='sm' onClick={handleSwitchToTotp}>
                      Switch
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Sessions */}
        {/* <div className='pt-4 space-y-4 border-t'>
          <div className='flex items-center justify-between'>
            <div>
              <Label className='text-base font-medium'>Active Sessions</Label>
              <p className='text-sm text-muted-foreground'>
                You are currently logged in on 3 devices
              </p>
            </div>
            <Button variant='outline' onClick={handleLogoutAllDevices}>
              <LogOut className='w-4 h-4 mr-2' />
              Logout All Devices
            </Button>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between p-3 rounded-md bg-muted/20'>
              <div>
                <p className='text-sm font-medium'>Current Session</p>
                <p className='text-xs text-muted-foreground'>Chrome on Windows • Active now</p>
              </div>
              <span className='px-2 py-1 text-xs rounded-full bg-success/10 text-success'>
                Current
              </span>
            </div>
            <div className='flex items-center justify-between p-3 rounded-md bg-muted/20'>
              <div>
                <p className='text-sm font-medium'>Mobile Device</p>
                <p className='text-xs text-muted-foreground'>Safari on iPhone • 2 hours ago</p>
              </div>
              <Button variant='ghost' size='sm'>
                Logout
              </Button>
            </div>
          </div>
        </div> */}
      </CardContent>
    </Card>
  )
}

export default AccountSettingsSection
