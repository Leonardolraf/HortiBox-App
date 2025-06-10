import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { listAllProfiles, updateProfile } from '../services/profileService';
import { listProducts } from '../services/productService';
import { listAllOrders } from '../services/orderService';
import {
    Users, Package, ShoppingBag, DollarSign, Activity, Search, UserCog, CheckCheck, X, AlertCircle, Check, User as UserIcon
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Alert, AlertDescription } from '../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

export default function AdminDashboard() {
    const { userProfile, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [loadingData, setLoadingData] = useState(true);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState("overview");
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const loadAllData = useCallback(async () => {
        setLoadingData(true);
        try {
            const [usersData, productsData, ordersData] = await Promise.all([
                listAllProfiles(),
                listProducts(),
                listAllOrders()
            ]);
            setUsers(usersData || []);
            setProducts(productsData || []);
            setOrders(ordersData || []);
        } catch (error) {
            console.error("Error loading admin data:", error);
            setErrorMessage("Falha ao carregar os dados do painel.");
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading) {
            if (userProfile?.user_type === 'admin') {
                loadAllData();
            } else {
                navigate('/');
            }
        }
    }, [userProfile, authLoading, navigate, loadAllData]);

    const verifyUser = async (userId) => {
        try {
            // Usando o serviço de perfil para atualizar
            await updateProfile(userId, { is_verified: true });
            setIsUserDialogOpen(false);
            showSuccess('Usuário verificado com sucesso');
            await loadAllData(); // Recarrega todos os dados
        } catch (error) {
            console.error("Error verifying user:", error);
            setErrorMessage('Erro ao verificar usuário. Tente novamente.');
        }
    };

    const openUserDialog = (user) => { setSelectedUser(user); setIsUserDialogOpen(true); };
    const showSuccess = (message) => { setSuccessMessage(message); setTimeout(() => { setSuccessMessage(''); }, 3000); };
    const getVerificationStatus = (user) => {
        if (user.is_verified) {
            return <Badge className="bg-green-500 text-white">Verificado</Badge>;
        } else {
            return (
                <div className="flex items-center space-x-2">
                    <Badge className="bg-yellow-500 text-white">Pendente</Badge>
                    <Button variant="outline" size="icon" onClick={() => openUserDialog(user)}>
                        <Check />
                    </Button>
                </div>
            );
        }
    }
    const getUserTypeLabel = (type) => {
        switch (type) {
            case 'admin': return 'Admin';
            case 'supplier': return 'Fornecedor';
            case 'customer': return 'Cliente';
            default: return 'Desconhecido';
        }
    }
    const filteredUsers = users.filter(user => (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || user.email?.toLowerCase().includes(searchQuery.toLowerCase())));
    const getOrdersCount = () => orders.length;
    const getProductsCount = () => products.length;
    const getRevenueTotal = () => orders.reduce((total, order) => total + (order.total_amount || 0), 0);
    const getSuppliersCount = () => users.filter(user => user.user_type === 'supplier').length;
    const getCustomersCount = () => users.filter(user => user.user_type === 'customer').length;
    const getPendingVerifications = () => users.filter(user => user.user_type === 'supplier' && !user.is_verified).length;

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">Carregando...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Painel do Administrador</h1>
                    <p className="text-gray-500 mt-1">Gerencie usuários, produtos e pedidos da plataforma</p>
                </div>

                {loadingData ? (
                    <div className="grid gap-6 md:grid-cols-4">
                        {Array(4).fill(null).map((_, i) => (
                            <Card key={i}><CardHeader className="pb-2"><Skeleton className="h-4 w-28 mb-1" /><Skeleton className="h-8 w-32" /></CardHeader><CardContent><Skeleton className="h-4 w-full" /></CardContent></Card>
                        ))}
                    </div>
                ) : (
                    <>
                        {successMessage && (<Alert className="mb-6 bg-green-50 text-green-800 border-green-100"><Check className="h-4 w-4" /><AlertDescription>{successMessage}</AlertDescription></Alert>)}
                        {errorMessage && (<Alert className="mb-6" variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{errorMessage}</AlertDescription></Alert>)}

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Usuários Totais</CardTitle><div className="text-2xl font-bold">{users.length}</div></CardHeader><CardContent><div className="flex justify-between text-xs text-gray-500"><span><Users className="inline h-3 w-3 mr-1" />{getCustomersCount()} clientes</span><span><Package className="inline h-3 w-3 mr-1" />{getSuppliersCount()} fornecedores</span></div></CardContent></Card>
                            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Produtos Cadastrados</CardTitle><div className="text-2xl font-bold">{getProductsCount()}</div></CardHeader><CardContent><div className="text-xs text-gray-500"><Package className="inline h-3 w-3 mr-1" />Produtos disponíveis</div></CardContent></Card>
                            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Pedidos Realizados</CardTitle><div className="text-2xl font-bold">{getOrdersCount()}</div></CardHeader><CardContent><div className="text-xs text-gray-500"><ShoppingBag className="inline h-3 w-3 mr-1" />Pedidos totais</div></CardContent></Card>
                            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Faturamento Total</CardTitle><div className="text-2xl font-bold">R$ {getRevenueTotal().toFixed(2)}</div></CardHeader><CardContent><div className="text-xs text-gray-500"><DollarSign className="inline h-3 w-3 mr-1" />Valor total de vendas</div></CardContent></Card>
                        </div>

                        {getPendingVerifications() > 0 && (<Alert className="mb-6 bg-yellow-50 border-yellow-100"><Activity className="h-4 w-4 text-yellow-800" /><AlertDescription className="text-yellow-800">Existem {getPendingVerifications()} fornecedores aguardando verificação</AlertDescription><Button variant="outline" size="sm" className="ml-auto border-yellow-200 text-yellow-800 hover:bg-yellow-100" onClick={() => setActiveTab("users")}>Ver Agora</Button></Alert>)}

                        <Tabs defaultValue="overview" value={activeTab} className="mb-6" onValueChange={setActiveTab}>
                            <TabsList><TabsTrigger value="overview">Visão Geral</TabsTrigger><TabsTrigger value="users">Usuários</TabsTrigger><TabsTrigger value="orders">Pedidos</TabsTrigger><TabsTrigger value="products">Produtos</TabsTrigger></TabsList>
                        </Tabs>

                        {activeTab === "overview" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card><CardHeader><CardTitle>Usuários Recentes</CardTitle><CardDescription>Últimos usuários registrados na plataforma</CardDescription></CardHeader><CardContent><div className="space-y-4">{users.slice(0, 5).map(user => (<div key={user.id} className="flex items-center justify-between"><div className="flex items-center space-x-3"><div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center"><UserIcon className="h-5 w-5 text-gray-600" /></div><div><p className="font-medium">{user.full_name}</p><p className="text-sm text-gray-500">{user.email}</p></div></div><Badge>{getUserTypeLabel(user.user_type)}</Badge></div>))}<Button variant="ghost" className="w-full mt-4" onClick={() => setActiveTab("users")}>Ver todos os usuários</Button></div></CardContent></Card>
                                <Card><CardHeader><CardTitle>Pedidos Recentes</CardTitle><CardDescription>Últimos pedidos realizados na plataforma</CardDescription></CardHeader><CardContent><div className="space-y-4">{orders.slice(0, 5).map(order => (<div key={order.id} className="flex items-center justify-between"><div className="flex items-center space-x-3"><div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center"><ShoppingBag className="h-5 w-5 text-gray-600" /></div><div><p className="font-medium">Pedido #{order.id.substring(0, 6)}</p><p className="text-sm text-gray-500">R$ {order.total_amount?.toFixed(2)}</p></div></div><Badge className={order.status === 'delivered' ? 'bg-green-100 text-green-800' : order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>{order.status}</Badge></div>))}<Button variant="ghost" className="w-full mt-4" onClick={() => setActiveTab("orders")}>Ver todos os pedidos</Button></div></CardContent></Card>
                            </div>
                        )}
                        {activeTab === "users" && (
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <div className="p-6 border-b"><h2 className="text-xl font-bold">Usuários da Plataforma</h2></div>
                                {filteredUsers.length === 0 ? (<div className="p-8 text-center"><Users className="mx-auto h-12 w-12 text-gray-300 mb-3" /><h3 className="text-lg font-medium mb-2">Nenhum usuário encontrado</h3><p className="text-gray-500">Tente ajustar seus critérios de busca.</p></div>) : (<div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead>Tipo</TableHead><TableHead>Status</TableHead><TableHead>Registro</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader><TableBody>{filteredUsers.map(user => (<TableRow key={user.id} className="hover:bg-gray-50"><TableCell className="font-medium">{user.full_name}</TableCell><TableCell>{user.email}</TableCell><TableCell><Badge variant="outline">{getUserTypeLabel(user.user_type)}</Badge></TableCell><TableCell>{getVerificationStatus(user)}</TableCell><TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => openUserDialog(user)}><UserCog className="h-4 w-4 mr-1" />Gerenciar</Button></TableCell></TableRow>))}</TableBody></Table></div>)}
                            </div>
                        )}
                        {activeTab === "orders" && (
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <div className="p-6 border-b"><h2 className="text-xl font-bold">Pedidos Realizados</h2></div>
                                {orders.length === 0 ? (<div className="p-8 text-center"><ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-3" /><h3 className="text-lg font-medium mb-2">Nenhum pedido encontrado</h3><p className="text-gray-500">Ainda não há pedidos registrados.</p></div>) : (<div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>ID do Pedido</TableHead><TableHead>Cliente</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Data</TableHead></TableRow></TableHeader><TableBody>{orders.map(order => (<TableRow key={order.id} className="hover:bg-gray-50"><TableCell>#{order.id.substring(0, 6)}</TableCell><TableCell>{order.profile?.full_name || 'Cliente não encontrado'}</TableCell><TableCell>R$ {order.total_amount?.toFixed(2)}</TableCell><TableCell>{order.status}</TableCell><TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell></TableRow>))}</TableBody></Table></div>)}
                            </div>
                        )}
                        {activeTab === "products" && (
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <div className="p-6 border-b"><h2 className="text-xl font-bold">Produtos Cadastrados</h2></div>
                                {products.length === 0 ? (<div className="p-8 text-center"><Package className="mx-auto h-12 w-12 text-gray-300 mb-3" /><h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3><p className="text-gray-500">Ainda não há produtos cadastrados.</p></div>) : (<div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Nome do Produto</TableHead><TableHead>Categoria</TableHead><TableHead>Preço</TableHead><TableHead>Disponibilidade</TableHead></TableRow></TableHeader><TableBody>{products.map(product => (<TableRow key={product.id} className="hover:bg-gray-50"><TableCell>{product.name}</TableCell><TableCell>{product.category}</TableCell><TableCell>R$ {product.price?.toFixed(2)}</TableCell><TableCell>
                                    {product.stock_quantity > 0
                                        ? <Badge className="bg-green-100 text-green-800">Disponível</Badge>
                                        : <Badge variant="destructive">Indisponível</Badge>
                                    }
                                </TableCell></TableRow>))}</TableBody></Table></div>)}
                            </div>
                        )}
                    </>
                )}
            </div>
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader><DialogTitle>Gerenciar Usuário</DialogTitle><DialogDescription>Detalhes e ações para o usuário selecionado.</DialogDescription></DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-1"><h3 className="text-sm font-medium text-gray-500">Nome</h3><p>{selectedUser.full_name}</p></div>
                            <div className="space-y-1"><h3 className="text-sm font-medium text-gray-500">Email</h3><p>{selectedUser.email}</p></div>
                            <div className="space-y-1"><h3 className="text-sm font-medium text-gray-500">Tipo de Usuário</h3><p>{getUserTypeLabel(selectedUser.user_type)}</p></div>
                            {selectedUser.user_type === 'supplier' && (<div className="space-y-1"><h3 className="text-sm font-medium text-gray-500">Informações da Empresa</h3><p><strong>Nome:</strong> {selectedUser.company_name || 'Não informado'}</p><p><strong>CNPJ:</strong> {selectedUser.cnpj || 'Não informado'}</p></div>)}
                            <div className="space-y-1"><h3 className="text-sm font-medium text-gray-500">Status</h3><div className="flex items-center">{selectedUser.is_verified ? <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCheck className="mr-1 h-3 w-3" />Verificado</Badge> : <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendente de Verificação</Badge>}</div></div>
                        </div>
                    )}
                    <DialogFooter>
                        {selectedUser && selectedUser.user_type === 'supplier' && !selectedUser.is_verified && (
                            <Button className="bg-green-600 hover:bg-green-700" onClick={() => verifyUser(selectedUser.id)}><CheckCheck className="mr-2 h-4 w-4" />Verificar Fornecedor</Button>
                        )}
                        <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}><X className="mr-2 h-4 w-4" />Fechar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}