import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface User {
  id: string
  email: string
  name: string
  role: string
  organizationId: string
  isEmailVerified: boolean
  onboardingCompleted: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  signup: (
    email: string,
    password: string,
    organizationName: string,
    firstName: string,
    lastName: string
  ) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  resendVerificationEmail: (email: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (token: string, newPassword: string) => Promise<void>
  acceptInvitation: (
    token: string,
    userData: {
      email?: string
      password?: string
      organizationName?: string
      firstName?: string
      lastName?: string
    }
  ) => Promise<void>
  checkUserExists: (email: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformUser = (supabaseUser: SupabaseUser, userMetadata?: any): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name:
        userMetadata?.name ||
        `${supabaseUser.user_metadata?.first_name || ''} ${
          supabaseUser.user_metadata?.last_name || ''
        }`.trim() ||
        supabaseUser.user_metadata?.name ||
        '',
      role: userMetadata?.role || supabaseUser.user_metadata?.role || 'slp',
      organizationId:
        userMetadata?.organizationId || supabaseUser.user_metadata?.organizationId || '1',
      isEmailVerified: supabaseUser.email_confirmed_at !== null,
      onboardingCompleted:
        userMetadata?.onboardingCompleted ||
        supabaseUser.user_metadata?.onboardingCompleted ||
        false,
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
          setUser(null)
        } else if (session?.user) {
          // TODO: fetch additional user data from your profiles table here
          const loggedInUser = transformUser(session.user)
          setUser(loggedInUser)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // TODO: fetch additional user data from your profiles table here
        const transformedUser = transformUser(session.user)
        setUser(transformedUser)
      } else {
        setUser(null)
      }

      setIsLoading(false)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // User state will be updated by the auth state change listener
      console.log('Login successful:', data)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
        throw error
      }
      // User state will be updated by the auth state change listener
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }, [])

  const signup = useCallback(
    async (
      email: string,
      password: string,
      organizationName: string,
      firstName: string,
      lastName: string
    ): Promise<void> => {
      setIsLoading(true)
      try {
        const userExists = await checkUserExists(email)

        if (userExists) {
          throw new Error(
            'An account with this email already exists. Please try logging in instead.'
          )
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              organizationName,
              first_name: firstName,
              last_name: lastName,
              role: 'admin',
            },
            emailRedirectTo: `${window.location.origin}/auth/verify-email`,
          },
        })

        if (error) {
          if (error.message.includes('User already registered')) {
            throw new Error(
              'An account with this email already exists. Please try logging in instead.'
            )
          }
          throw error
        }

        if (!data.user) {
          throw new Error('Failed to create account. Please try again.')
        }

        console.log('Signup successful:', data)
      } catch (error) {
        console.error('Signup error:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const resendVerificationEmail = useCallback(async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          // TODO: Make sure this matches your actual development port
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      })

      if (error) {
        throw error
      }

      console.log('Verification email resent:', data)
    } catch (error) {
      console.error('Resend verification email error:', error)
      throw error
    }
  }, [])

  const verifyEmail = useCallback(async (token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup',
      })

      if (error) {
        throw error
      }

      console.log('Email verified:', data)
    } catch (error) {
      console.error('Email verification error:', error)
      throw error
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw error
      }

      console.log('Password reset email sent:', data)
    } catch (error) {
      console.error('Password reset error:', error)
      throw error
    }
  }, [])

  const updatePassword = useCallback(async (token: string, newPassword: string) => {
    try {
      console.log('Attempting to update password with token:', token)

      // Update the password directly since we already have a valid session
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        console.error('Password update error:', updateError)
        throw updateError
      }

      console.log('Password updated successfully:', updateData)
    } catch (error) {
      console.error('Password update process error:', error)
      throw error
    }
  }, [])

  const acceptInvitation = useCallback(
    async (
      token: string,
      userData: {
        email?: string
        password?: string
        organizationName?: string
        firstName?: string
        lastName?: string
      }
    ) => {
      setIsLoading(true)
      try {
        // Example: If invitation includes signup
        if (userData.email && userData.password) {
          await signup(
            userData.email,
            userData.password,
            userData.organizationName || '',
            userData.firstName || '',
            userData.lastName || ''
          )
        }
      } catch (error) {
        console.error('Accept invitation error:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [signup]
  )

  const checkUserExists = useCallback(async (email: string): Promise<boolean> => {
    try {
      console.log('🔍 Checking if user exists:', email)

      if (!email || typeof email !== 'string') {
        console.log('❌ Invalid email input')
        return false
      }

      const trimmedEmail = email.toLowerCase().trim()
      console.log('📧 Checking normalized email:', trimmedEmail)

      // Direct query to public.users table (bypass RPC function)
      const { data, error } = await supabase
        .from('users')
        .select('id, email')
        .limit(1)
        .eq('email', trimmedEmail)

      if (error) {
        console.error('Error querying users table:', error)
        return false
      }

      const exists = data && data.length > 0
      console.log('📊 Email exists result:', exists)

      if (exists) {
        console.log('👤 Found user:', data[0])
      }

      return exists
    } catch (error) {
      console.error('💥 Error in checkUserExists:', error)
      return false
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
      signup,
      verifyEmail,
      resendVerificationEmail,
      resetPassword,
      updatePassword,
      acceptInvitation,
      checkUserExists,
    }),
    [user, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
