import React, { createContext, useContext, useState, useEffect } from 'react'
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
  resetPassword: (email: string) => Promise<void>
  updatePassword: (token: string, newPassword: string) => Promise<void>
  acceptInvitation: (token: string, userData: any) => Promise<void>
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

  // Helper function to transform Supabase user to your User interface
  const transformUser = (supabaseUser: SupabaseUser, userMetadata?: any): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: userMetadata?.name || supabaseUser.user_metadata?.name || '',
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
          // You might want to fetch additional user data from your profiles table here
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
      console.log('Auth state changed:', event, session)

      if (session?.user) {
        // You might want to fetch additional user data from your profiles table here
        const transformedUser = transformUser(session.user)
        setUser(transformedUser)
      } else {
        setUser(null)
      }

      setIsLoading(false)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
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
  }

  const logout = async () => {
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
  }

  const signup = async (
    email: string,
    password: string,
    organizationName: string,
    firstName: string,
    lastName: string
  ): Promise<void> => {
    setIsLoading(true)
    try {
      // Check if user already exists before attempting signup
      const userExists = await checkUserExists(email)

      if (userExists) {
        throw new Error('An account with this email already exists. Please try logging in instead.')
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            organizationName,
            first_name: firstName,
            last_name: lastName,
            role: 'admin', // TODO: Required - maps to user_role enum - fix logic confirm with team
          },
        },
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const verifyEmail = async (token: string) => {
    try {
      // For email verification, you typically use the token from the URL
      // This is usually handled by Supabase automatically when user clicks the link
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      })

      if (error) {
        throw error
      }

      console.log('Email verified:', data)
    } catch (error) {
      console.error('Email verification error:', error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      console.log('Password reset email sent:', data)
    } catch (error) {
      console.error('Password reset error:', error)
      throw error
    }
  }

  const updatePassword = async (token: string, newPassword: string) => {
    try {
      // First verify the reset token
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery',
      })

      if (verifyError) {
        throw verifyError
      }

      // Then update the password
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        throw updateError
      }

      console.log('Password updated successfully:', updateData)
    } catch (error) {
      console.error('Password update error:', error)
      throw error
    }
  }

  const acceptInvitation = async (token: string, userData: any) => {
    setIsLoading(true)
    try {
      // This would typically involve verifying an invitation token
      // and then either signing up the user or updating their profile
      // The exact implementation depends on how you handle invitations

      // For now, this is a placeholder - you'll need to implement
      // your specific invitation logic here
      console.log('Accepting invitation with token:', token, 'and data:', userData)

      // Example: If invitation includes signup
      if (userData.email && userData.password) {
        await signup(userData.email, userData.password, userData.organizationName || '')
      }
    } catch (error) {
      console.error('Accept invitation error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const checkUserExists = async (email: string) => {
    try {
      console.log('🔍 Checking if user exists:', email)

      // Use the database function that bypasses RLS
      const { data, error } = await supabase.rpc('check_email_exists', {
        user_email: email,
      })

      if (error) {
        console.error('❌ Error checking user with RPC:', error)
        return false
      }

      console.log('📊 Email exists result:', data)
      return data === true
    } catch (error) {
      console.error('💥 Error checking user existence:', error)
      return false
    }
  }

  const value = {
    user,
    isLoading,
    login,
    logout,
    signup,
    verifyEmail,
    resetPassword,
    updatePassword,
    acceptInvitation,
    checkUserExists,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
