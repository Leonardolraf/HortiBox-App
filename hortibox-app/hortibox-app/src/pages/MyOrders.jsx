import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as orderService from '../services/orderService';
import {
    PackageX,
    ShoppingCart,
    ChevronDown,
    ChevronRight,
    Clock,
    MapPin,
    CreditCard
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../components/ui/collapsible";
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { format } from 'date-fns';

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [pageLoading, setPageLoading] = useState(true); // Renomeado para não confundir
    const navigate = useNavigate();

    // Obtém o perfil do usuário e o status de carregamento da autenticação do nosso contexto
    const { userProfile, loading: authLoading } = useAuth();

    useEffect(() => {
        // Apenas executa a lógica se a verificação inicial de autenticação terminou
        if (!authLoading) {
            if (userProfile) {
                // Se temos um usuário, buscamos seus pedidos
                orderService.getOrdersByCustomer(userProfile.id)
                    .then(data => {
                        setOrders(data || []);
                    })
                    .catch(error => {
                        console.error("Erro ao carregar pedidos:", error);
                        setOrders([]);
                    })
                    .finally(() => {
                        setPageLoading(false);
                    });
            } else {
                // Se não há usuário, não há o que carregar
                setPageLoading(false);
                // Opcional: redirecionar para a página de login se esta for uma rota protegida
                // navigate('/login'); 
            }
        }
    }, [userProfile, authLoading]); // Roda o efeito sempre que o estado de autenticação mudar

    const getStatusBadge = (status) => {
        // Mapeando para os status que definimos no nosso ENUM do banco de dados
        const statusConfig = {
            'pending_payment': { label: 'Pagamento Pendente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
            'processing': { label: 'Em Processamento', className: 'bg-blue-100 text-blue-800 border-blue-200' },
            'shipped': { label: 'Enviado', className: 'bg-purple-100 text-purple-800 border-purple-200' },
            'delivered': { label: 'Entregue', className: 'bg-green-100 text-green-800 border-green-200' },
            'cancelled': { label: 'Cancelado', className: 'bg-red-100 text-red-800 border-red-200' },
            'refunded': { label: 'Reembolsado', className: 'bg-red-100 text-red-800 border-red-200' }
        };
        const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };
        return <Badge variant="outline" className={`${config.className} border`}>{config.label}</Badge>;
    };

    const getPaymentMethodLabel = (method) => {
        // NOTA: A coluna 'payment_method' não foi adicionada à nossa tabela 'orders'.
        // Você precisará adicioná-la no Supabase se quiser usar esta função.
        const methods = { 'pix': 'PIX', 'cartao': 'Cartão', 'dinheiro': 'Dinheiro' };
        return methods[method] || method;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8">Meus Pedidos</h1>

                {pageLoading ? (
                    <div className="space-y-6">
                        {Array(3).fill().map((_, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                    <div>
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-4 w-48 mt-2" />
                                    </div>
                                    <Skeleton className="h-8 w-24" />
                                </div>
                                <Skeleton className="h-24 w-full" />
                            </div>
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <PackageX className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-bold mb-2">Você ainda não fez nenhum pedido</h2>
                        <p className="text-gray-500 mb-6">Explore nossos produtos e faça seu primeiro pedido</p>
                        <Button className="bg-green-600 hover:bg-green-700" asChild>
                            <Link to="/products">
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Explorar Produtos
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <Collapsible>
                                    <div className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-bold text-lg">
                                                        Pedido #{order.id.substring(0, 6)}
                                                    </h3>
                                                    {getStatusBadge(order.status)}
                                                </div>
                                                <p className="text-gray-500 text-sm">
                                                    Realizado em {format(new Date(order.created_at), 'dd/MM/yyyy')} às {format(new Date(order.created_at), 'HH:mm')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="outline" className="flex items-center gap-1">
                                                        Detalhes <ChevronDown className="h-4 w-4" />
                                                    </Button>
                                                </CollapsibleTrigger>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap md:flex-nowrap gap-4 mt-4">
                                            {/* ... (outros detalhes como status e pagamento) ... */}
                                            <div className="flex items-start gap-2 w-full md:w-auto">
                                                <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium">Endereço</p>
                                                    <p className="text-sm text-gray-600 truncate max-w-xs">
                                                        {/* Construindo o endereço a partir das colunas da tabela */}
                                                        {`${order.shipping_address_line1}, ${order.shipping_city} - ${order.shipping_state}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 ml-auto">
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">Total</p>
                                                    <p className="text-sm font-bold text-green-700">
                                                        R$ {order.total_amount?.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <CollapsibleContent>
                                        <div className="px-6 pt-2 pb-6 bg-gray-50 border-t">
                                            <h4 className="font-medium mb-3">Itens do Pedido</h4>
                                            <div className="space-y-3">
                                                {order.order_items?.map((item) => (
                                                    <div key={item.id} className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                                            <span>
                                                                {item.quantity}x {item.products?.name || 'Produto indisponível'}
                                                            </span>
                                                        </div>
                                                        <span className="font-medium">
                                                            R$ {(item.quantity * item.price_at_purchase).toFixed(2)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* NOTA: A coluna 'notes' não foi adicionada à nossa tabela 'orders'.
                                                Você precisará adicioná-la no Supabase se quiser usar esta seção.
                                            order.notes && (
                                                <div className="mt-4 pt-4 border-t">
                                                    <h4 className="font-medium mb-2">Observações</h4>
                                                    <p className="text-sm text-gray-600">{order.notes}</p>
                                                </div>
                                            ) */}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}