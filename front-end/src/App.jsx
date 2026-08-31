import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import MinhaConta from "./pages/MinhaConta";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/minha-conta" element={<MinhaConta />} />

        <Route
          path="/painel-ja-privado-administrativo/login-admin"
          element={<AdminLogin />}
        />

        <Route
          path="/painel-ja-privado-administrativo"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
