import { Routes, Route } from "react-router-dom";
import { DashBoard } from "./pages/DashBoard";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { Profile } from "./pages/Profile";
import { UserProfile } from "./pages/UserProfile";
import { NotFound } from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, AuthRedirect } from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/signin" element={
          <AuthRedirect>
            <SignIn />
          </AuthRedirect>
        } />
        <Route path="/signup" element={
          <AuthRedirect>
            <SignUp />
          </AuthRedirect>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <DashBoard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashBoard />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/user/:userId" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
