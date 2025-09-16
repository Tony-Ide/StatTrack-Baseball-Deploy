import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Layout from '@/components/Layout'

export default function VerifyPage() {
  const router = useRouter()
  const { token } = router.query
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  // Do NOT auto-verify on load to avoid link scanners auto-confirming accounts
  useEffect(() => {
    // If there's no token in the URL, show an error message
    if (!token) return
    if (typeof token !== 'string') return
    // Provide a friendly prompt to click the button
    setStatus('idle')
    setMessage('Click the button below to verify your email address.')
  }, [token])

  const verifyToken = async (token: string) => {
    try {
      setIsVerifying(true)
      setStatus('loading')
      const response = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Email verified successfully! You can now log in to your account.')
      } else {
        setStatus('error')
        setMessage(data.message || 'Verification failed. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred during verification. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const resendVerification = async () => {
    setIsResending(true)
    try {
      // For now, we'll show a message to check the console
      // In a real implementation, you'd need to get the user's email
      setMessage('Please check the server console for the verification URL, or contact support.')
    } catch (error) {
      setMessage('Failed to resend verification email. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'idle':
        return <CheckCircle className="h-12 w-12 text-blue-500 opacity-60" />
      case 'loading':
        return <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />
      case 'error':
        return <XCircle className="h-12 w-12 text-red-500" />
    }
  }

  const getStatusTitle = () => {
    switch (status) {
      case 'idle':
        return 'Verify your email'
      case 'loading':
        return 'Verifying your email...'
      case 'success':
        return 'Email verified successfully!'
      case 'error':
        return 'Verification failed'
    }
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {getStatusTitle()}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status !== 'success' && typeof token === 'string' && token && (
              <Button 
                onClick={() => verifyToken(token)}
                disabled={isVerifying}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
            )}

            {status === 'success' && (
              <Button 
                onClick={() => router.push('/login')}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Go to Login
              </Button>
            )}
            
            {status === 'error' && (
              <div className="space-y-3">
                <Button 
                  onClick={resendVerification}
                  disabled={isResending}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>
                <Button 
                  onClick={() => router.push('/login')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
