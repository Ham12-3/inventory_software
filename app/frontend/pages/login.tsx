import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || 'Login failed')
        setLoading(false)
        return
      }

      // Store the access token in localStorage and cookie
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user_id', data.user_id)
      localStorage.setItem('email', data.email)
      
      // Set token as cookie for server-side access
      document.cookie = `access_token=${data.access_token}; path=/; max-age=3600; SameSite=Lax`

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError('Network error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to StockFlow</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
          
          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <strong>Demo Login:</strong><br />
            Email: admin@test.com<br />
            Password: admin123
          </div>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="Enter your password"
            />
          </div>
          
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 