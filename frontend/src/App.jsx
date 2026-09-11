import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LeftSidebar from './components/LeftSidebar';
import StudentDashboard from './pages/StudentDashboard';
import IndustryDashboard from './pages/IndustryDashboard';
import InstitutionDashboard from './pages/InstitutionDashboard';
import ProfileModal from './components/ProfileModal';
import AuthPage from './pages/AuthPage';
import { api } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentPortal, setCurrentPortal] = useState('student'); // 'student', 'industry', 'institution'
  const [activeTab, setActiveTab] = useState('jobs');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    const role = userData.role?.toLowerCase() || 'student';
    setCurrentPortal(role);
    setActiveSection('dashboard');
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setActiveSection('dashboard');
  };

  // Auth Gate: Landing on localhost shows Login/Register if not authenticated
  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentPortal={currentPortal}
        user={user}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar (visible in student portal) */}
        {currentPortal === 'student' && (
          <LeftSidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            onOpenCVModal={() => {}}
          />
        )}

        {/* Dynamic Portal Main Area */}
        <main className="flex-1 min-w-0 flex flex-col">
          {currentPortal === 'student' && (
            <StudentDashboard
              user={user}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          )}
          {currentPortal === 'industry' && <IndustryDashboard user={user} />}
          {currentPortal === 'institution' && <InstitutionDashboard user={user} />}
        </main>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onProfileUpdated={() => {
          api.getMe().then((me) => setUser((prev) => ({ ...prev, ...me })));
        }}
      />
    </div>
  );
}
