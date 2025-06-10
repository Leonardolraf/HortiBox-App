// src/components/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

// Este componente recebe a 'role' necessário para acessar as rotas filhas
const ProtectedRoute = ({ role }) => {
    const { userProfile, loading } = useAuth();

    // Enquanto a autenticação estiver carregando, mostramos uma mensagem
    if (loading) {
        return <div>Verificando autenticação...</div>;
    }

    // Se não houver perfil (usuário não logado), redireciona para o login
    if (!userProfile) {
        return <Navigate to="/login" replace />;
    }

    // Se uma 'role' específica é necessária e o usuário não a tem, redireciona para a home
    if (role && userProfile.user_type !== role) {
        return <Navigate to="/" replace />;
    }

    // Se todas as verificações passarem, renderiza a página solicitada 
    return <Outlet />;
};

export default ProtectedRoute;