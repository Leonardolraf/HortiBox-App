// src/utils/index.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import MyOrders from "../pages/MyOrders";
import AdminDashboard from "../pages/AdminDashboard";

// Função 'cn' necessária para os componentes de UI (shadcn/ui style)
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Mantenha suas outras funções utilitárias aqui e exporte-as também.
// Por exemplo, sua função createPageUrl:
export function createPageUrl(page) {
  // A sua lógica para criar a URL vai aqui...
  // Exemplo simples:
  const paths = {
    Home: '/',
    Products: '/products',
    MyOrders: '/myorders',
    ProductDetail: '/productdetail',
    Cart: '/cart',
    Profile: '/profile',
    Checkout: '/checkout',
    AdminDashboard: '/admindashboard',
    // ... adicione outras páginas
  };
  return paths[page] || '/';
}