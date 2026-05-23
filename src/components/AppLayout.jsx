import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'
import AuthPage from '../pages/AuthPage'
import BucketList from './BucketList'

export default function AppLayout() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('bucket-list')

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Sadie & Ben</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { id: 'bucket-list', label: '🎯 Bucket List' },
              { id: 'diary', label: '📔 Diary' },
              { id: 'letterbox', label: '📺 Letterbox' },
              { id: 'media', label: '🎬 Media' },
              { id: 'affection', label: '💕 Affection' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 font-medium text-sm border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'bucket-list' && <BucketList />}
        {activeTab === 'diary' && <div className="text-gray-600">Coming soon</div>}
        {activeTab === 'letterbox' && <div className="text-gray-600">Coming soon</div>}
        {activeTab === 'media' && <div className="text-gray-600">Coming soon</div>}
        {activeTab === 'affection' && <div className="text-gray-600">Coming soon</div>}
      </main>
    </div>
  )
}