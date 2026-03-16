import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import UserCreate from "./pages/UserCreate";
import UserView from "./pages/UserView";
import UserEdit from "./pages/UserEdit";
import Subscriptions from "./pages/Subscriptions";
import SubscriptionView from "./pages/SubscriptionView";
import Invoices from "./pages/Invoices";
import Referrals from "./pages/Referrals";
import Marketplace from "./pages/Marketplace";
import MarketplaceCreate from "./pages/MarketplaceCreate";
import MarketplaceView from "./pages/MarketplaceView";
import MarketplaceEdit from "./pages/MarketplaceEdit";
import Partners from "./pages/Partners";
import PartnerCreate from "./pages/PartnerCreate";
import PartnerView from "./pages/PartnerView";
import PartnerEdit from "./pages/PartnerEdit";
import EmailTemplates from "./pages/EmailTemplates";
import TemplateCreate from "./pages/TemplateCreate";
import TemplateView from "./pages/TemplateView";
import TemplateEdit from "./pages/TemplateEdit";
import ReferralView from "./pages/ReferralView";
import Tiers from "./pages/Tiers";
import TierView from "./pages/TierView";
import Training from "./pages/Training";
import Profile from "./pages/Profile";

function App() {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("admin_token") : null;

  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/forgot-password" element={token ? <Navigate to="/" replace /> : <ForgotPassword />} />
        <Route path="/reset-password" element={token ? <Navigate to="/" replace /> : <ResetPassword />} />
        <Route path="/" element={token ? <AdminLayout /> : <Navigate to="/login" replace />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="change-password" element={<Navigate to="/profile?tab=password" replace />} />
          <Route path="users" element={<Users />} />
          <Route path="users/new" element={<UserCreate />} />
          <Route path="users/:id" element={<UserView />} />
          <Route path="users/:id/edit" element={<UserEdit />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="subscriptions/:id" element={<SubscriptionView />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="referrals" element={<Referrals />} />
          <Route path="referrals/:userId" element={<ReferralView />} />
          <Route path="tiers" element={<Tiers />} />
          <Route path="tiers/:id" element={<TierView />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="marketplace/new" element={<MarketplaceCreate />} />
          <Route path="marketplace/:id" element={<MarketplaceView />} />
          <Route path="marketplace/:id/edit" element={<MarketplaceEdit />} />
          <Route path="partners" element={<Partners />} />
          <Route path="partners/new" element={<PartnerCreate />} />
          <Route path="partners/:id" element={<PartnerView />} />
          <Route path="partners/:id/edit" element={<PartnerEdit />} />
          <Route path="templates" element={<EmailTemplates />} />
          <Route path="templates/new" element={<TemplateCreate />} />
          <Route path="templates/:id" element={<TemplateView />} />
          <Route path="templates/:id/edit" element={<TemplateEdit />} />
          <Route path="training" element={<Training />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
