import { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { LoginSignup } from './components/LoginSignup';
import { PassengerHome } from './components/PassengerHome';
import { DriverDashboard } from './components/DriverDashboard';
import { FareGuide } from './components/FareGuide';
import { FeedbackForm } from './components/FeedbackForm';
import { ProfileSettings } from './components/ProfileSettings';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './utils/supabase/info';

type Page = 'splash' | 'login' | 'passenger' | 'driver' | 'fare' | 'feedback' | 'profile';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('splash');
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'passenger' | 'driver'>('passenger');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        const role = session.user.user_metadata?.role || 'passenger';
        setUserRole(role);
        setCurrentPage(role === 'driver' ? 'driver' : 'passenger');
      } else {
        setCurrentPage('splash');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setCurrentPage('splash');
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleSplashComplete = () => {
    setCurrentPage('login');
  };

  const handleLoginSuccess = (userData: any, role: string) => {
    setUser(userData);
    setUserRole(role as 'passenger' | 'driver');
    setCurrentPage(role === 'driver' ? 'driver' : 'passenger');
  };

  const handleLogout = () => {
    setUser(null);
    setUserRole('passenger');
    setCurrentPage('login');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {currentPage === 'splash' && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}

      {currentPage === 'login' && (
        <LoginSignup onSuccess={handleLoginSuccess} />
      )}

      {currentPage === 'passenger' && (
        <PassengerHome onNavigate={handleNavigate} />
      )}

      {currentPage === 'driver' && (
        <DriverDashboard user={user} onNavigate={handleNavigate} />
      )}

      {currentPage === 'fare' && (
        <FareGuide onNavigate={handleNavigate} userRole={userRole} />
      )}

      {currentPage === 'feedback' && (
        <FeedbackForm onNavigate={handleNavigate} />
      )}

      {currentPage === 'profile' && (
        <ProfileSettings 
          user={user} 
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
