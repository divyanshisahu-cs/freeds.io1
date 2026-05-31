import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import SignInPage from './pages/SignInPage';
import JobsPage from './pages/JobsPage';
import PostJobPage from './pages/PostJobPage';
import PublicInfoPage from './pages/PublicInfoPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import VerifyMobilePage from './pages/VerifyMobilePage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - No Login Required */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Routes - No Login Required */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin-signup" element={<SignupPage />} />
        <Route path="/signin" element={<SignInPage />} />
        
        {/* Verification Routes - No Login Required */}
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="/verify-mobile" element={<VerifyMobilePage />} />

        {/* Error / Status Routes */}
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        
        {/* Protected Routes - Require Login + Email Verification */}
        <Route 
          path="/jobs" 
          element={
            <ProtectedRoute requireVerification={true}>
              <JobsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/companies" 
          element={
            <ProtectedRoute requireVerification={true}>
              <PublicInfoPage type="companies" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profiles" 
          element={
            <ProtectedRoute requireVerification={true}>
              <PublicInfoPage type="profiles" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/pricing" 
          element={
            <ProtectedRoute requireVerification={true}>
              <PublicInfoPage type="pricing" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/blog" 
          element={
            <ProtectedRoute requireVerification={true}>
              <PublicInfoPage type="blog" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute requireVerification={true}>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/post-a-job" 
          element={
            <ProtectedRoute requireVerification={true}>
              <PostJobPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireVerification={true} requireAdmin={true}>
              <AdminPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
