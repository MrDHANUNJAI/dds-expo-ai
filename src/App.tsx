import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { FindWorkPage } from './pages/public/FindWorkPage';
import { ProjectDetailsPage } from './pages/public/ProjectDetailsPage';
import { FindFreelancersPage } from './pages/public/FindFreelancersPage';
import { FreelancerProfilePage } from './pages/public/FreelancerProfilePage';
import { SellerProfilePage } from './pages/public/SellerProfilePage';
import { CategoriesPage } from './pages/public/CategoriesPage';
import { CategoryDetailsPage } from './pages/public/CategoryDetailsPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { FreelancerLoginPage } from './pages/auth/FreelancerLoginPage';
import { SellerLoginPage } from './pages/auth/SellerLoginPage';
import { RegisterChoicePage } from './pages/auth/RegisterChoicePage';
import { FreelancerRegisterPage } from './pages/auth/FreelancerRegisterPage';
import { SellerRegisterPage } from './pages/auth/SellerRegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';

// Onboarding Pages
import { FreelancerOnboardingPage } from './pages/freelancer/FreelancerOnboardingPage';
import { SellerOnboardingPage } from './pages/seller/SellerOnboardingPage';

// Dashboard Pages
import { FreelancerDashboardPage } from './pages/freelancer/FreelancerDashboardPage';
import { SellerDashboardPage } from './pages/seller/SellerDashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

// Settings Pages
import { FreelancerSettingsPage } from './pages/freelancer/FreelancerSettingsPage';
import { SellerSettingsPage } from './pages/seller/SellerSettingsPage';

import { SocketProvider } from './context/SocketContext';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Website Flow */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/find-work" element={<FindWorkPage />} />
            <Route path="/find-freelancers" element={<FindFreelancersPage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />
            <Route path="/freelancer/:id" element={<FreelancerProfilePage />} />
            <Route path="/seller/:id" element={<SellerProfilePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/:slug" element={<CategoryDetailsPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Auth Public Pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/freelancer/login" element={<FreelancerLoginPage />} />
            <Route path="/seller/login" element={<SellerLoginPage />} />
            <Route path="/register" element={<RegisterChoicePage />} />
            <Route path="/freelancer/register" element={<FreelancerRegisterPage />} />
            <Route path="/seller/register" element={<SellerRegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
          </Route>

          {/* Protected Freelancer Flow */}
          <Route
            path="/freelancer/onboarding"
            element={
              <ProtectedRoute allowedRoles={['FREELANCER']}>
                <FreelancerOnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['FREELANCER']}>
                <FreelancerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer/settings"
            element={
              <ProtectedRoute allowedRoles={['FREELANCER']}>
                <FreelancerSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Seller Flow */}
          <Route
            path="/seller/onboarding"
            element={
              <ProtectedRoute allowedRoles={['SELLER']}>
                <SellerOnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute allowedRoles={['SELLER']}>
                <SellerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/settings"
            element={
              <ProtectedRoute allowedRoles={['SELLER']}>
                <SellerSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Flow */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect to marketplace homepage */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  </AuthProvider>
);
}
