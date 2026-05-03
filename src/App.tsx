import { AuthPage } from '@/components/pages/AuthPage';
import { ChatPage } from '@/components/pages/ChatPage';
import { useAuth } from '@/hooks/useAuth';

function App() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // If no Supabase user exists, show the Authentication Page
  if (!user) {
    return <AuthPage />;
  }

  // Temporary: we still need to pass a sessionId to ChatPage until we fully integrate Chat History
  // We'll pass the user.id as the sessionId for now, or generate a temporary one if needed.
  return (
    <ChatPage
      userName={user.email?.split('@')[0] || 'User'}
      onLogout={signOut}
    />
  );
}

export default App;
