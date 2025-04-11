import { Suspense, lazy, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Title from "../components/Title";
import { Toaster } from "react-hot-toast";

const SignupModal = lazy(() => import("../components/SignupModal"));
const LoginModal = lazy(() => import("../components/LoginModal"));

function Layout() {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSwitchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  const openLoginModal = () => {
    setShowLoginModal(true);
  };

  return (
    <div className="m-2">
      <Toaster />
      <Header onLoginClick={() => setShowLoginModal(true)} />
      <Title />
      <Outlet context={{ openLoginModal }} />
      {showSignupModal && (
        <Suspense fallback="Sign up...">
          <SignupModal
            onClose={() => setShowSignupModal(false)}
            onSwitchToLogin={handleSwitchToLogin}
          />
        </Suspense>
      )}
      {showLoginModal && (
        <Suspense fallback="Log in...">
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onSwitchToSignup={handleSwitchToSignup}
          />
        </Suspense>
      )}
    </div>
  );
}

export default Layout;
