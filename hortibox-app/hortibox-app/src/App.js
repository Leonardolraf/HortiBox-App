import { Routes, Route } from 'react-router-dom';
import Layout from './Layout'; // 1. Re-importando o Layout
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
import Vendas from './pages/Vendas';
import ProtectedRoute from './components/ProtectedRoute';
import SupplierDashboard from './pages/SupplierDashboard';
import { Toaster } from 'react-hot-toast';

import './App.css';

function App() {
  return (
    // Adicionando o Layout de volta para envolver as rotas
    <Layout>
      <div>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          {/* --- Rotas Públicas (acessíveis por todos) --- */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* --- Rotas Protegidas (para QUALQUER usuário logado) --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/myorders" element={<MyOrders />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Cart />} />
          </Route>

          {/* --- Rotas Específicas para Fornecedores --- */}
          <Route element={<ProtectedRoute role="supplier" />}>
            <Route path="/supplier-dashboard" element={<SupplierDashboard />} />
            <Route path="/vendas" element={<Vendas />} />
          </Route>

          {/* --- Rotas Específicas para Admins --- */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admindashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </div>
    </Layout>
  );
}

export default App;