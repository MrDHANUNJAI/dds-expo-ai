import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, FreelancerProfile, SellerProfile, UserRole, ApiResponse } from '../types/auth';

interface AuthContextType {
  user: User | null;
  profile: FreelancerProfile | SellerProfile | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  login: (email: string, password: string, expectedRole?: UserRole) => Promise<User>;
  adminLogin: (email: string, password: string) => Promise<User>;
  registerFreelancer: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    termsAccepted?: boolean;
  }) => Promise<User>;
  registerSeller: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    accountType: 'INDIVIDUAL' | 'STARTUP' | 'BUSINESS' | 'COMPANY';
    businessName?: string;
    termsAccepted?: boolean;
  }) => Promise<User>;
  logout: () => Promise<void>;
  updateFreelancerProfile: (data: Partial<FreelancerProfile & { firstName?: string; lastName?: string; phone?: string }>) => Promise<FreelancerProfile>;
  updateSellerProfile: (data: Partial<SellerProfile & { firstName?: string; lastName?: string; phone?: string }>) => Promise<SellerProfile>;
  completeFreelancerOnboarding: (data: any) => Promise<FreelancerProfile>;
  completeSellerOnboarding: (data: any) => Promise<SellerProfile>;
  uploadAvatar: (file: File) => Promise<string>;
  deactivateAccount: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FreelancerProfile | SellerProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('worknova_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const authHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  // Restore session on mount
  const refreshSession = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('worknova_token');
      const headers: Record<string, string> = storedToken
        ? { Authorization: `Bearer ${storedToken}` }
        : {};

      const res = await fetch('/api/auth/me', {
        headers,
        credentials: 'include',
      });

      if (res.ok) {
        const json: ApiResponse<{ user: User; profile: any }> = await res.json();
        if (json.success && json.data) {
          setUser(json.data.user);
          setProfile(json.data.profile);
          if (storedToken) setToken(storedToken);
          setIsLoading(false);
          return;
        }
      }

      // If token expired, try refresh endpoint with cookie
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const refreshJson = await refreshRes.json();
        if (refreshJson.success && refreshJson.data) {
          setToken(refreshJson.data.accessToken);
          setUser(refreshJson.data.user);
          localStorage.setItem('worknova_token', refreshJson.data.accessToken);

          // Get profile
          const meRes = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${refreshJson.data.accessToken}` },
          });
          if (meRes.ok) {
            const meJson = await meRes.json();
            setProfile(meJson.data?.profile || null);
          }
          setIsLoading(false);
          return;
        }
      }

      // No active session
      setUser(null);
      setProfile(null);
      setToken(null);
      localStorage.removeItem('worknova_token');
    } catch (err) {
      console.error('Session refresh failed:', err);
      setUser(null);
      setProfile(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (email: string, password: string, expectedRole?: UserRole): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, expectedRole }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = json.message || 'Login failed. Please check your credentials.';
        setError(msg);
        throw new Error(msg);
      }

      const { user: loggedUser, profile: loggedProfile, accessToken } = json.data;
      setUser(loggedUser);
      setProfile(loggedProfile);
      setToken(accessToken);
      localStorage.setItem('worknova_token', accessToken);
      return loggedUser;
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string): Promise<User> => {
    return login(email, password, 'ADMIN');
  };

  const registerFreelancer = async (data: any): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/freelancer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = json.message || 'Freelancer registration failed.';
        setError(msg);
        throw new Error(msg);
      }

      const { user: regUser, profile: regProfile, accessToken } = json.data;
      setUser(regUser);
      setProfile(regProfile);
      setToken(accessToken);
      localStorage.setItem('worknova_token', accessToken);
      return regUser;
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const registerSeller = async (data: any): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/seller/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = json.message || 'Seller registration failed.';
        setError(msg);
        throw new Error(msg);
      }

      const { user: regUser, profile: regProfile, accessToken } = json.data;
      setUser(regUser);
      setProfile(regProfile);
      setToken(accessToken);
      localStorage.setItem('worknova_token', accessToken);
      return regUser;
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setToken(null);
      localStorage.removeItem('worknova_token');
    }
  };

  const updateFreelancerProfile = async (data: any): Promise<FreelancerProfile> => {
    const res = await fetch('/api/freelancers/me', {
      method: 'PUT',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update profile');
    }
    setProfile(json.data.profile);
    if (json.data.user && user) {
      setUser({ ...user, ...json.data.user });
    }
    return json.data.profile;
  };

  const updateSellerProfile = async (data: any): Promise<SellerProfile> => {
    const res = await fetch('/api/sellers/me', {
      method: 'PUT',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update seller profile');
    }
    setProfile(json.data.profile);
    if (json.data.user && user) {
      setUser({ ...user, ...json.data.user });
    }
    return json.data.profile;
  };

  const completeFreelancerOnboarding = async (data: any): Promise<FreelancerProfile> => {
    const res = await fetch('/api/freelancers/onboarding', {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to complete onboarding');
    }
    setProfile(json.data.profile);
    if (json.data.user && user) {
      setUser({ ...user, ...json.data.user });
    }
    return json.data.profile;
  };

  const completeSellerOnboarding = async (data: any): Promise<SellerProfile> => {
    const res = await fetch('/api/sellers/onboarding', {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to complete onboarding');
    }
    setProfile(json.data.profile);
    if (json.data.user && user) {
      setUser({ ...user, ...json.data.user });
    }
    return json.data.profile;
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const rolePath = user?.role === 'SELLER' ? 'sellers' : 'freelancers';
    const res = await fetch(`/api/${rolePath}/me/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: formData,
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Avatar upload failed');
    }

    const imgUrl = json.data.imageUrl;
    if (user) {
      setUser({ ...user, profileImage: imgUrl });
    }
    if (profile && json.data.profileCompletion) {
      setProfile({ ...profile, profileCompletion: json.data.profileCompletion });
    }
    return imgUrl;
  };

  const deactivateAccount = async () => {
    const res = await fetch('/api/auth/deactivate', {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || 'Failed to deactivate account');
    }
    await logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: user?.role || null,
        token,
        isAuthenticated: Boolean(user),
        isLoading,
        error,
        clearError,
        login,
        adminLogin,
        registerFreelancer,
        registerSeller,
        logout,
        updateFreelancerProfile,
        updateSellerProfile,
        completeFreelancerOnboarding,
        completeSellerOnboarding,
        uploadAvatar,
        deactivateAccount,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
