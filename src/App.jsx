import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import PortfolioPage from "./pages/PortfolioPage.jsx";
import ShopPage from "./pages/ShopPage.jsx";
import ConsultationsPage from "./pages/ConsultationsPage.jsx";
import InspectionsPage from "./pages/InspectionsPage.jsx";
import AdvisoryPage from "./pages/AdvisoryPage.jsx";
import ClassesPage from "./pages/ClassesPage.jsx";
import ConsultationRequestPage from "./pages/ConsultationRequestPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import FaqPage from "./pages/FaqPage.jsx";
import TestimonialsPage from "./pages/TestimonialsPage.jsx";
import ProcessPage from "./pages/ProcessPage.jsx";
import PressPage from "./pages/PressPage.jsx";
import CareersPage from "./pages/CareersPage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ConfirmEmailPage from "./pages/ConfirmEmailPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import PrivacyPage from "./pages/PrivacyPage.jsx";
import RefundsPage from "./pages/RefundsPage.jsx";
import ShippingPage from "./pages/ShippingPage.jsx";
import ProjectDetailPage from "./pages/ProjectDetailPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import RequireAuth from "./components/RequireAuth.jsx";

const Motion = motion;

function App() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Home />
            </Motion.div>
          }
        />
        <Route
          path="/portfolio"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <PortfolioPage />
            </Motion.div>
          }
        />
        <Route
          path="/portfolio/:projectId"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <ProjectDetailPage />
            </Motion.div>
          }
        />
        <Route
          path="/shop"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <ShopPage />
            </Motion.div>
          }
        />
        <Route
          path="/shop/:productId"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <ProductDetailPage />
            </Motion.div>
          }
        />
        <Route
          path="/cart"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <CartPage />
            </Motion.div>
          }
        />
        <Route
          path="/checkout"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <CheckoutPage />
            </Motion.div>
          }
        />
        <Route
          path="/consultations"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <ConsultationsPage />
            </Motion.div>
          }
        />
        <Route
          path="/classes"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <ClassesPage />
            </Motion.div>
          }
        />
        <Route
          path="/classes/:optionId"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <ConsultationRequestPage type="class" />
            </Motion.div>
          }
        />
        <Route
          path="/inspections"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <InspectionsPage />
            </Motion.div>
          }
        />
        <Route
          path="/inspections/:optionId"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <ConsultationRequestPage type="inspection" />
            </Motion.div>
          }
        />
        <Route
          path="/advisory"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <AdvisoryPage />
            </Motion.div>
          }
        />
        <Route
          path="/advisory/:optionId"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <ConsultationRequestPage type="consultation" />
            </Motion.div>
          }
        />
        <Route
          path="/about"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <AboutPage />
            </Motion.div>
          }
        />
        <Route
          path="/faq"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <FaqPage />
            </Motion.div>
          }
        />
        <Route
          path="/testimonials"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <TestimonialsPage />
            </Motion.div>
          }
        />
        <Route
          path="/process"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <ProcessPage />
            </Motion.div>
          }
        />
        <Route
          path="/press"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <PressPage />
            </Motion.div>
          }
        />
        <Route
          path="/careers"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <CareersPage />
            </Motion.div>
          }
        />
        <Route
          path="/journal"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <BlogPage />
            </Motion.div>
          }
        />
        <Route
          path="/contact"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <ContactPage />
            </Motion.div>
          }
        />
        <Route
          path="/login"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <LoginPage />
            </Motion.div>
          }
        />
        <Route
          path="/signup"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <SignupPage />
            </Motion.div>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <ForgotPasswordPage />
            </Motion.div>
          }
        />
        <Route
          path="/confirm-email"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <ConfirmEmailPage />
            </Motion.div>
          }
        />
        <Route
          path="/account"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <RequireAuth disallowedEmails={["uthmanajanaku@gmail.com"]}>
                <AccountPage />
              </RequireAuth>
            </Motion.div>
          }
        />
        <Route
          path="/orders"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <RequireAuth disallowedEmails={["uthmanajanaku@gmail.com"]}>
                <OrdersPage />
              </RequireAuth>
            </Motion.div>
          }
        />
        <Route
          path="/admin"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <RequireAuth allowedEmails={["uthmanajanaku@gmail.com"]}>
                <AdminDashboardPage />
              </RequireAuth>
            </Motion.div>
          }
        />
        <Route
          path="/terms"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <TermsPage />
            </Motion.div>
          }
        />
        <Route
          path="/privacy"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <PrivacyPage />
            </Motion.div>
          }
        />
        <Route
          path="/refunds"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <RefundsPage />
            </Motion.div>
          }
        />
        <Route
          path="/shipping"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <ShippingPage />
            </Motion.div>
          }
        />
        <Route
          path="*"
          element={
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <NotFoundPage />
            </Motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
