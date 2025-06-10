import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';
import { createPageUrl } from '../../utils';
import {
    Menu,
    X,
    ShoppingCart,
    User as UserIcon,
    LogOut,
    Home,
    Package,
    History
} from 'lucide-react';
import Logo from '../ui/logo';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function Navbar() {
    // A lógica de estado local que não é de autenticação permanece
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Obtendo o usuário e o estado de carregamento do AuthContext
    const { userProfile: currentUser, loading: isLoading } = useAuth();

    // Lógica para mostrar os modais, agora baseada no currentUser do contexto
    const [showTypeSelection, setShowTypeSelection] = useState(false);

    useEffect(() => {
        if (currentUser) {
            // Mostra a seleção de tipo se o usuário ainda não tiver um
            if (!currentUser.user_type) {
                setShowTypeSelection(true);
            }
        }
    }, [currentUser]);

    // Funções de ação simplificadas
    const handleLogin = () => {
        navigate('/login');
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const navigateToDashboard = () => {
        if (!currentUser) return;
        if (currentUser.user_type === 'admin') {
            navigate(createPageUrl('AdminDashboard'));
        } else if (currentUser.user_type === 'supplier') {
            navigate(createPageUrl('SupplierDashboard'));
        } else {
            navigate(createPageUrl('Home'));
        }
    };

    return (
        <>
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <Link to={createPageUrl("Home")}>
                            <Logo />
                        </Link>

                        <nav className="hidden md:flex items-center space-x-6">
                            {(!currentUser || currentUser.user_type === 'customer') && (
                                <Link to="/" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                                    Início
                                </Link>
                            )}

                            {(!currentUser || currentUser.user_type !== 'admin') && (
                                <Link to="/products" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                                    Produtos
                                </Link>
                            )}

                            {currentUser && currentUser.user_type === 'supplier' && (
                                <Link to="/supplier-dashboard" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                                    Painel do Fornecedor
                                </Link>
                            )}

                            {currentUser && currentUser.user_type === 'supplier' && (
                                <Link to="/vendas" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                                    Vendas
                                </Link>
                            )}

                            {currentUser && currentUser.user_type === 'admin' && (
                                <Link
                                    to={createPageUrl("AdminDashboard")}
                                    className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                                >
                                    Painel do Administrador
                                </Link>
                            )}

                            {currentUser && currentUser.user_type === 'customer' && (
                                <Link
                                    to={createPageUrl("MyOrders")}
                                    className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                                >
                                    Meus Pedidos
                                </Link>
                            )}
                        </nav>

                        {/* Cart and User Actions */}
                        <div className="hidden md:flex items-center space-x-4">
                            {(!currentUser || currentUser.user_type === 'customer') && (
                                <Link to={createPageUrl("Cart")} className="relative">
                                    <Button variant="ghost" size="icon" className="text-gray-700 hover:text-green-600">
                                        <ShoppingCart className="h-5 w-5" />
                                    </Button>
                                </Link>
                            )}

                            {!isLoading && (
                                currentUser ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="rounded-full overflow-hidden">
                                                {currentUser.avatar_url ? (
                                                    <img
                                                        src={currentUser.avatar_url}
                                                        alt="Perfil"
                                                        className="h-8 w-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <UserIcon className="h-5 w-5" />
                                                )}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuLabel>
                                                {currentUser.full_name}
                                                {currentUser.user_type && (
                                                    <span className="block text-xs text-gray-500">
                                                        {currentUser.user_type === 'admin' ? 'Administrador' :
                                                            currentUser.user_type === 'supplier' ? 'Fornecedor' :
                                                                'Cliente'}
                                                    </span>
                                                )}
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => navigate(createPageUrl("Profile"))}>
                                                <UserIcon className="mr-2 h-4 w-4" />
                                                <span>Perfil</span>
                                            </DropdownMenuItem>

                                            {currentUser.user_type === 'customer' && (
                                                <DropdownMenuItem onClick={() => navigate(createPageUrl("MyOrders"))}>
                                                    <Package className="mr-2 h-4 w-4" />
                                                    <span>Meus Pedidos</span>
                                                </DropdownMenuItem>
                                            )}

                                            {(currentUser.user_type === 'admin' || currentUser.user_type === 'supplier') && (
                                                <DropdownMenuItem onClick={navigateToDashboard}>
                                                    <Package className="mr-2 h-4 w-4" />
                                                    <span>{currentUser.user_type === 'admin' ? 'Painel do Admin' : 'Painel do Fornecedor'}</span>
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={handleLogout}>
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>Sair</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <Button
                                        onClick={handleLogin}
                                        variant="default"
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        Entrar
                                    </Button>
                                )
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </Button>
                    </div>

                    {/* Mobile menu */}
                    {isMenuOpen && (
                        <div className="md:hidden pt-4 pb-2">
                            <nav className="flex flex-col space-y-4">
                                <Link
                                    to={createPageUrl("Home")}
                                    className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Home className="h-5 w-5 mr-2" />
                                    Início
                                </Link>

                                {(!currentUser || currentUser.user_type !== 'admin') && (
                                    <Link
                                        to={createPageUrl("Products")}
                                        className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Package className="h-5 w-5 mr-2" />
                                        Produtos
                                    </Link>
                                )}

                                {currentUser && currentUser.user_type === 'supplier' && (
                                    <Link
                                        to={createPageUrl("SupplierDashboard")}
                                        className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Package className="h-5 w-5 mr-2" />
                                        Painel do Fornecedor
                                    </Link>
                                )}

                                {currentUser && currentUser.user_type === 'admin' && (
                                    <Link
                                        to={createPageUrl("AdminDashboard")}
                                        className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Package className="h-5 w-5 mr-2" />
                                        Painel do Administrador
                                    </Link>
                                )}

                                {currentUser && currentUser.user_type === 'customer' && (
                                    <Link
                                        to={createPageUrl("MyOrders")}
                                        className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <History className="h-5 w-5 mr-2" />
                                        Meus Pedidos
                                    </Link>
                                )}

                                {(!currentUser || currentUser.user_type === 'customer') && (
                                    <Link
                                        to={createPageUrl("Cart")}
                                        className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <ShoppingCart className="h-5 w-5 mr-2" />
                                        Carrinho
                                    </Link>
                                )}

                                {!isLoading && (
                                    currentUser ? (
                                        <>
                                            <Link
                                                to={createPageUrl("Profile")}
                                                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <UserIcon className="h-5 w-5 mr-2" />
                                                Perfil
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsMenuOpen(false);
                                                }}
                                                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md w-full text-left"
                                            >
                                                <LogOut className="h-5 w-5 mr-2" />
                                                Sair
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                handleLogin();
                                                setIsMenuOpen(false);
                                            }}
                                            className="flex items-center px-2 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md w-full text-left"
                                        >
                                            <UserIcon className="h-5 w-5 mr-2" />
                                            Entrar
                                        </button>
                                    )
                                )}
                            </nav>
                        </div>
                    )}
                </div>
            </header>
        </>
    );
}