import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './lib/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import NormList from './components/NormList';
import ControlList from './components/ControlList';
import DocumentRegister from './components/DocumentRegister';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<NormList />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/norms/:normId" element={<ControlList />} />
            <Route path="/documents" element={<DocumentRegister />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}
