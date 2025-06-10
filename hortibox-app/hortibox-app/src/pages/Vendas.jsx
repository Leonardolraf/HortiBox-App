// src/pages/Vendas.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { listBySupplier } from '../services/productService';
import { listAllOrders } from '../services/orderService';
import { subMonths, isAfter } from 'date-fns';

export default function Vendas() {
    const { userProfile, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [loadingData, setLoadingData] = useState(true);
    const [stats, setStats] = useState({ revenueLastMonth: 0, pendingPayment: 0, completedSales: 0 });

    const calculateStats = useCallback((products, orders) => {
        const oneMonthAgo = subMonths(new Date(), 1);
        let revenue = 0;
        let pending = 0;
        let completed = 0;

        const supplierProductIds = products.map(p => p.id);

        orders.forEach(order => {
            const items = order.order_items || []; // garante que seja um array válido

            const containsSupplierProduct = items.some(item =>
                supplierProductIds.includes(item.product_id)
            );

            if (containsSupplierProduct) {
                if (order.status === 'delivered') {
                    completed++;

                    const orderRevenue = items
                        .filter(item => supplierProductIds.includes(item.product_id))
                        .reduce((sum, item) => sum + (item.price_at_purchase * item.quantity), 0);

                    if (isAfter(new Date(order.created_at), oneMonthAgo)) {
                        revenue += orderRevenue;
                    }
                }

                if (order.status === 'pending_payment') {
                    pending++;
                }
            }
        });

        setStats({ revenueLastMonth: revenue, pendingPayment: pending, completedSales: completed });
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (userProfile?.id && userProfile.user_type === 'supplier') {
                setLoadingData(true);
                try {
                    const supplierProducts = await listBySupplier(userProfile.id);
                    const allOrders = await listAllOrders();
                    calculateStats(supplierProducts || [], allOrders || []);
                } catch (error) {
                    console.error("Falha ao carregar dados de vendas:", error);
                } finally {
                    setLoadingData(false);
                }
            }
        };
        if (!authLoading) {
            if (userProfile?.user_type !== 'supplier') navigate('/');
            else fetchData();
        }
    }, [userProfile, authLoading, navigate, calculateStats]);

    if (authLoading || loadingData) {
        return <div className="container mx-auto p-4">Carregando dados de vendas...</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8">Relatório de Vendas</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500">Renda (Últimos 30 dias)</h3>
                    <p className="text-3xl font-bold">R$ {stats.revenueLastMonth.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500">Vendas Concluídas</h3>
                    <p className="text-3xl font-bold">{stats.completedSales}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500">Aguardando Pagamento</h3>
                    <p className="text-3xl font-bold">{stats.pendingPayment}</p>
                </div>
            </div>
            {/* Você pode adicionar uma tabela com os pedidos aqui depois */}
        </div>
    );
}