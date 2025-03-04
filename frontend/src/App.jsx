import { Routes, Route } from "react-router-dom";
import { DashBoard } from "./pages/Dashboard";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { Profile } from "./pages/Profile";
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
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
