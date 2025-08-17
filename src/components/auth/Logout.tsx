import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const Logout = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Sign out the user
        logout()

        // Redirect to login page
        navigate('/auth/login', { replace: true })
      } catch (error) {
        console.error('Logout error:', error)
        // Even if there's an error, redirect to login
        navigate('/auth/login', { replace: true })
      }
    }

    // Perform logout immediately when component mounts
    performLogout()
  }, [logout, navigate])

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='text-center'>
        <LoadingSpinner />
        <p className='mt-4 text-gray-600'>Logging you out...</p>
      </div>
    </div>
  )
}

export default Logout
