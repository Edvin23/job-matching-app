import React from 'react';
import './App.css';
import HomePage from './unAuth/HomePage';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUpPage from './unAuth/SignUpPage';
import Dashboard from './Auth/Dashboard';
import { AuthProvider, useAuth } from './AuthContext';
import './firebase';
import { Helmet } from 'react-helmet';

const PrivateRoute = ({children}) => {
  const{ currentUser, loading } = useAuth();
  if(loading){
    return <div>Loading...</div>;
  }
  return currentUser ? children : <Navigate to='/'/>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage/>}/>
          <Route path="/signUpPage" element={<SignUpPage/>}/>
          <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard/>
            </PrivateRoute>
          }
          />
          <Route path="*" element={<Navigate to="/"/>}/>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
