import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import SignInPage from './pages/SignInPage';
import JobsPage from './pages/JobsPage';
import PostJobPage from './pages/PostJobPage';
import PublicInfoPage from './pages/PublicInfoPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/companies" element={<PublicInfoPage type="companies" />} />
        <Route path="/profiles" element={<PublicInfoPage type="profiles" />} />
        <Route path="/pricing" element={<PublicInfoPage type="pricing" />} />
        <Route path="/blog" element={<PublicInfoPage type="blog" />} />
        <Route path="/post-a-job" element={<PostJobPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
