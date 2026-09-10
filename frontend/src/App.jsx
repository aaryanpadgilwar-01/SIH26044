import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LeftSidebar from './components/LeftSidebar';
import StudentDashboard from './pages/StudentDashboard';
import IndustryDashboard from './pages/IndustryDashboard';
import InstitutionDashboard from './pages/InstitutionDashboard';
import ProfileModal from './components/ProfileModal';
import { api } from './services/api';
import { Sparkles, Shield, User, Building, GraduationCap, ArrowRight } from 'lucide-react';

export default function App() {
  const [currentPortal, setCurrentPortal] = useState('student'); // 'student', 'industry', 'institution'
  const [activeTab, setActiveTab] = useState('jobs');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Auto-login into default demo account on mount
  useEffect(() => {
    switchUserForPortal(currentPortal);
  }, [currentPortal]);

  const switchUserForPortal = async (portal) => {
    setAuthLoading(true);
    try {
      let email = 'pavitra@skillmatrix.edu';
      if (portal === 'industry') {
        email = 'recruiter@google.com';
      } else if (portal === 'institution') {
        email = 'dean@mit.edu';
      }
      const data = await api.login(email, 'password123');
      setUser(data);
    } catch (err) {
      console.error('Auto login failed:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentPortal={currentPortal}
        setPortal={setCurrentPortal}
        user={user}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar (visible in student portal or can adapt) */}
        {currentPortal === 'student' && (
          <LeftSidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            onOpenCVModal={() => {}}
          />
        )}

        {/* Dynamic Portal Main Area */}
        <main className="flex-1 min-w-0 flex flex-col">
          {currentPortal === 'student' && <StudentDashboard user={user} />}
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
          api.getMe().then((me) => setUser(me));
        }}
      />
    </div>
  );
}
