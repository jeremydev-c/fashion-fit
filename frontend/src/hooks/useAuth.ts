import { useState, useEffect } from 'react';

// User type definition
export interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

// Custom hook to handle authentication state
// Took me a while to get token validation right - kept having issues with stale tokens
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have a token stored
    const storedToken = localStorage.getItem('fashionFitToken');
    
    if (storedToken) {
      setToken(storedToken);
      
      // Verify it's still valid with backend
      // This was causing bugs before - now verifying on every app load
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      fetch(`${apiUrl}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      })
      .then(res => {
        if (!res.ok) throw new Error('Auth check failed');
        return res.json();
      })
      .then(data => {
        if (data.valid && data.user) {
          setUser(data.user);
        } else {
          // Token expired or invalid - clean up
          // console.log('Token invalid, clearing...'); // debug line
          localStorage.removeItem('fashionFitToken');
          setToken(null);
          setUser(null);
        }
        setLoading(false);
      })
      .catch(error => {
        // Network error or invalid token
        console.error('Auth verification failed:', error);
        localStorage.removeItem('fashionFitToken');
        setToken(null);
        setUser(null);
        setLoading(false);
      });
    } else {
      // No token stored
      setLoading(false);
    }
  }, []); // Only run once on mount

  // Login function - stores token and verifies it
  const login = (newToken: string) => {
    localStorage.setItem('fashionFitToken', newToken);
    setToken(newToken);
    
    // Verify immediately to get user data
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${newToken}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.valid && data.user) {
        setUser(data.user);
      } else {
        // This shouldn't happen but handle it anyway
        console.warn('Login token verification failed');
        localStorage.removeItem('fashionFitToken');
        setToken(null);
      }
    })
    .catch(err => {
      console.error('Login verification error:', err);
      // Don't store invalid token
      localStorage.removeItem('fashionFitToken');
      setToken(null);
    });
  };

  // Logout - simple cleanup
  const logout = () => {
    localStorage.removeItem('fashionFitToken');
    setToken(null);
    setUser(null);
    // Could redirect here but letting components handle it
  };

  return {
    user,
    loading,
    token,
    login,
    logout,
    isAuthenticated: !!user
  };
};
