import { AuthProvider } from './lib/auth-context'
import AppLayout from './components/AppLayout'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  )
}

export default App
