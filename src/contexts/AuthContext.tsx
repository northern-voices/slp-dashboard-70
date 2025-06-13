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
  }

  const updatePassword = async (token: string, newPassword: string) => {
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

  // Replace your checkUserExists function with this version
  const checkUserExists = async (email: string): Promise<boolean> => {
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
        .eq('email', trimmedEmail)
        .limit(1)

      console.log('🔧 Direct query result - data:', data)
      console.log('🔧 Direct query result - error:', error)

      if (error) {
        console.error('❌ Error querying users table:', error)
        // If we can't query the table, return false to allow signup
        // Supabase will handle duplicate prevention at the auth level
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
      // In case of any error, return false to allow signup attempt
      return false
    }
  }

  // Alternative version with even more explicit debugging
  const checkUserExistsVerbose = async (email: string): Promise<boolean> => {
    console.log('=== START checkUserExists ===')
    console.log('Input email:', email)

    try {
      if (!email) {
        console.log('No email provided, returning false')
        return false
      }

      const normalizedEmail = String(email).toLowerCase().trim()
      console.log('Normalized email:', normalizedEmail)

      // Method 1: Count query
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('email', normalizedEmail)

      console.log('Count query - count:', count)
      console.log('Count query - error:', countError)

      if (!countError) {
        const exists = (count || 0) > 0
        console.log('Count method result:', exists)
        console.log('=== END checkUserExists ===')
        return exists
      }

      // Method 2: Fallback to select query
      console.log('Count method failed, trying select method...')
      const { data, error } = await supabase.from('users').select('id').eq('email', normalizedEmail)

      console.log('Select query - data:', data)
      console.log('Select query - error:', error)

      if (error) {
        console.error('Select method also failed:', error)
        console.log('=== END checkUserExists (error) ===')
        return false
      }

      const exists = Array.isArray(data) && data.length > 0
      console.log('Select method result:', exists)
      console.log('=== END checkUserExists ===')
      return exists
    } catch (error) {
      console.error('Exception in checkUserExists:', error)
      console.log('=== END checkUserExists (exception) ===')
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
