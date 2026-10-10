import { BrowserRouter, Route, Routes  } from "react-router-dom";
import { Toaster } from 'sonner'
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Budgets from "./pages/Budgets";
import Categories from "./pages/Categories";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes >
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            }
          />

          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <Expenses />
              </ProtectedRoute>
            }
          />

           <Route
            path="/budgets"
            element={
              <ProtectedRoute>
                <Budgets />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
       <Toaster
        position="top-center"
        richColors
        toastOptions={{ style: { fontFamily: 'inherit' } }}
      />
    </AuthProvider>
  );
};
export default App;
