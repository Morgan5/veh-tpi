import { ApolloProvider } from '@apollo/client';
import { Toaster } from 'react-hot-toast';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { client } from './graphql/client';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ScenarioEditor from './pages/ScenarioEditor';
import Settings from './pages/Settings';
import { useAuthStore } from './store/authStore';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <ApolloProvider client={client}>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login />
                )
              }
            />

            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/scenario/new" element={<ScenarioEditor />} />
              <Route path="/scenario/:id/edit" element={<ScenarioEditor />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
