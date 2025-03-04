import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import SignupModal from "../components/SignupModal";
import LoginModal from "../components/LoginModal";
import Title from "../components/Title";

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
      <Header onLoginClick={() => setShowLoginModal(true)} />
      <Title/>
      <Outlet context={{ openLoginModal }} />
      {showSignupModal && (
        <SignupModal
          onClose={() => setShowSignupModal(false)}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignup={handleSwitchToSignup}
        />
      )}
    </div>
  );
}

export default Layout;
