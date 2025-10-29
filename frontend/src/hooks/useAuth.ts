import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('fashionFitToken');
    if (storedToken) {
      setToken(storedToken);
      // Verify token with backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      fetch(`${apiUrl}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.valid && data.user) {
          setUser(data.user);
        } else {
          // Token is invalid, remove it
          localStorage.removeItem('fashionFitToken');
          setToken(null);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('fashionFitToken');
        setToken(null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('fashionFitToken', newToken);
    setToken(newToken);
    // Verify the new token
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
      }
    });
  };

  const logout = () => {
    localStorage.removeItem('fashionFitToken');
    setToken(null);
    setUser(null);
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
