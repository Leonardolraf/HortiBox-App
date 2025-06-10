import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createPageUrl } from '../utils';
import {
    listBySupplier,
    listProducts,
    create as createProduct,
    update as updateProduct,
    deleteById as deleteProductService,
} from '../services/productService';
import { listAllOrders } from '../services/orderService';
import {
    Package,
    DollarSign,
    TrendingUp,
    List,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Check,
    AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription
} from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../components/ui/dialog";
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";

export default function SupplierDashboard() {
    const { userProfile, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [activeTab, setActiveTab] = useState("products");
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [formError, setFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [productForm, setProductForm] = useState({
        name: '', price: '', category: 'frutas', unit: 'kg', description: '', image_url: '', stock_quantity: ''
    });

    const fetchSupplierData = useCallback(async () => {
        if (userProfile?.id && (userProfile.user_type === 'supplier' || userProfile.user_type === 'admin')) {
            setLoadingData(true);
            try {
                console.log("1. Buscando produtos do fornecedor...");
                const supplierProducts = await listBySupplier(userProfile.id);
                console.log("2. Produtos do fornecedor encontrados:", supplierProducts);
                setProducts(supplierProducts || []);

                console.log("3. Buscando todos os pedidos...");
                const allOrders = await listAllOrders();
                console.log("4. Todos os pedidos encontrados:", allOrders);

                const supplierOrders = allOrders.filter(order =>
                    Array.isArray(order.order_items) &&
                    order.order_items.some(item =>
                        (supplierProducts || []).some(p => p.id === item.product_id)
                    )
                );
                setOrders(supplierOrders);
                console.log("5. Dados processados. Finalizando o carregamento.");

            } catch (error) {
                console.error("6. ERRO ao carregar dados do painel:", error);
            } finally {
                console.log("7. Bloco 'finally' executado. SetLoadingData para false.");
                setLoadingData(false);
            }
        }
    }, [userProfile]);

    useEffect(() => {
        if (userProfile) {
            fetchSupplierData();
        }
    }, [userProfile, authLoading, navigate, fetchSupplierData]);

    const openProductDialog = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            setProductForm({
                name: product.name || '',
                price: product.price || '',
                category: product.category || 'frutas',
                unit: product.unit || 'kg',
                description: product.description || '',
                image_url: product.image_url || '',
                stock_quantity: product.stock_quantity || ''
            });
        } else {
            setCurrentProduct(null);
            setProductForm({ name: '', price: '', category: 'frutas', unit: 'kg', description: '', image_url: '', stock_quantity: '' });
        }
        setFormError('');
        setIsProductDialogOpen(true);
    };

    const confirmDeleteProduct = (product) => {
        setCurrentProduct(product);
        setIsDeleteConfirmOpen(true);
    };

    const handleDeleteProduct = async () => {
        try {
            await deleteProductService(currentProduct.id);
            setIsDeleteConfirmOpen(false);
            showSuccess('Produto excluído com sucesso');
            fetchSupplierData();
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    const handleProductFormChange = (e) => {
        const { name, value } = e.target;
        setProductForm(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'stock_quantity' ? parseFloat(value) || '' : value // <-- corrigido
        }));
    };

    const handleProductFormSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!productForm.name || !productForm.price || productForm.stock_quantity === '') {
            setFormError('Por favor, preencha nome, preço e estoque.');
            return;
        }

        const productData = {
            name: productForm.name,
            price: Number(productForm.price),
            category: productForm.category,
            unit: productForm.unit,
            description: productForm.description,
            image_url: productForm.image_url,
            stock_quantity: Number(productForm.stock_quantity),
            supplier_id: userProfile.id
        };

        try {
            if (currentProduct) {
                await updateProduct(currentProduct.id, productData);
                showSuccess('Produto atualizado com sucesso');
            } else {
                await createProduct(productData);
                showSuccess('Produto criado com sucesso');
            }
            setIsProductDialogOpen(false);
            fetchSupplierData();
        } catch (error) {
            console.error("Error saving product:", error);
            setFormError('Erro ao salvar produto. Tente novamente.');
        }
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const getOrderTotal = () => {
        return orders.reduce((total, order) => total + Number(order.total_amount || 0), 0);
    };

    const getPendingOrders = () => {
        return orders.filter(order => ['pending_payment', 'processing'].includes(order.status));
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pendente': { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
            'confirmado': { label: 'Confirmado', className: 'bg-blue-100 text-blue-800 border-blue-200' },
            'em_entrega': { label: 'Em Entrega', className: 'bg-purple-100 text-purple-800 border-purple-200' },
            'entregue': { label: 'Entregue', className: 'bg-green-100 text-green-800 border-green-200' },
            'cancelado': { label: 'Cancelado', className: 'bg-red-100 text-red-800 border-red-200' }
        };

        const config = statusConfig[status] || statusConfig.pendente;

        return (
            <Badge variant="outline" className={`${config.className} border`}>
                {config.label}
            </Badge>
        );
    };

    if (authLoading || loadingData) {
        return (
            <div className="container mx-auto px-4 py-8">
                Carregando painel...
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Painel do Fornecedor</h1>
                    <p className="text-gray-500 mt-1">
                        Gerencie seus produtos e pedidos
                    </p>
                </div>

                {(authLoading || loadingData) ? (
                    <div className="grid gap-6 md:grid-cols-4">
                        {Array(4).fill(null).map((_, i) => (
                            <Card key={i}>
                                <CardHeader className="pb-2">
                                    <Skeleton className="h-4 w-28 mb-1" />
                                    <Skeleton className="h-8 w-32" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-4 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">
                                        Total de Produtos
                                    </CardTitle>
                                    <div className="text-2xl font-bold">
                                        {products.length}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-gray-500">
                                        <Package className="inline h-3 w-3 mr-1" />
                                        Produtos disponíveis
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">
                                        Pedidos Pendentes
                                    </CardTitle>
                                    <div className="text-2xl font-bold">
                                        {getPendingOrders().length}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-gray-500">
                                        <TrendingUp className="inline h-3 w-3 mr-1" />
                                        Aguardando processamento
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">
                                        Total de Pedidos
                                    </CardTitle>
                                    <div className="text-2xl font-bold">
                                        {orders.length}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-gray-500">
                                        <List className="inline h-3 w-3 mr-1" />
                                        Histórico completo
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">
                                        Faturamento Total
                                    </CardTitle>
                                    <div className="text-2xl font-bold">
                                        R$ {getOrderTotal().toFixed(2)}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-gray-500">
                                        <DollarSign className="inline h-3 w-3 mr-1" />
                                        Valor total de vendas
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {successMessage && (
                            <Alert className="mb-6 bg-green-50 text-green-800 border-green-100">
                                <Check className="h-4 w-4" />
                                <AlertDescription>{successMessage}</AlertDescription>
                            </Alert>
                        )}

                        {/* Tabs */}
                        <Tabs defaultValue="products" className="mb-6" onValueChange={setActiveTab}>
                            <div className="flex items-center justify-between">
                                <TabsList>
                                    <TabsTrigger value="products">Produtos</TabsTrigger>
                                    <TabsTrigger value="orders">Pedidos</TabsTrigger>
                                    <TabsTrigger value="profile">Dados da Empresa</TabsTrigger>
                                </TabsList>

                                {activeTab === "products" && (
                                    <Button
                                        onClick={() => openProductDialog()}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
                                    </Button>
                                )}
                            </div>
                        </Tabs>

                        {/* Products Tab */}
                        {activeTab === "products" && (
                            <div>
                                <div className="bg-white p-4 rounded-md shadow-sm mb-6">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <Input
                                                placeholder="Buscar produtos..."
                                                className="pl-10"
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Filter className="text-gray-400" />
                                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Categoria" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Todas Categorias</SelectItem>
                                                    <SelectItem value="frutas">Frutas</SelectItem>
                                                    <SelectItem value="legumes">Legumes</SelectItem>
                                                    <SelectItem value="verduras">Verduras</SelectItem>
                                                    <SelectItem value="outros">Outros</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {filteredProducts.length === 0 ? (
                                    <div className="bg-white rounded-lg p-8 text-center">
                                        <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                        <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
                                        <p className="text-gray-500 mb-6">
                                            {searchQuery || categoryFilter !== 'all'
                                                ? "Tente ajustar seus filtros de busca."
                                                : "Comece adicionando seu primeiro produto."}
                                        </p>
                                        <Button
                                            onClick={() => openProductDialog()}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredProducts.map(product => (
                                            <Card key={product.id} className="overflow-hidden">
                                                <div className="h-48 bg-gray-100">
                                                    <img
                                                        src={product.image_url || "https://images.unsplash.com/photo-1610348725531-843dff563e2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <CardHeader>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <Badge className="mb-2">{
                                                                product.category === 'frutas' ? 'Fruta' :
                                                                    product.category === 'legumes' ? 'Legume' :
                                                                        product.category === 'verduras' ? 'Verdura' : 'Outro'
                                                            }</Badge>
                                                            <CardTitle>{product.name}</CardTitle>
                                                            <CardDescription>Estoque: {product.stock_quantity || 0} {product.unit}</CardDescription>
                                                        </div>
                                                        <div className="text-xl font-bold text-green-700">
                                                            R$ {Number.parseFloat(product.price || 0).toFixed(2)}
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex justify-end gap-2 pt-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openProductDialog(product)}
                                                        >
                                                            <Edit className="h-4 w-4 mr-1" />
                                                            Editar
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => confirmDeleteProduct(product)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-1" />
                                                            Excluir
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === "orders" && (
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <div className="p-6 border-b">
                                    <h2 className="text-xl font-bold">Pedidos Recentes</h2>
                                </div>

                                {orders.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <List className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                        <h3 className="text-lg font-medium mb-2">Nenhum pedido encontrado</h3>
                                        <p className="text-gray-500">
                                            Você ainda não recebeu nenhum pedido.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Pedido
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Cliente
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Data
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Total
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Ações
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {orders.map((order) => (
                                                    <tr key={order.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            #{order.id.substring(0, 6)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {order.userProfile_email}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getStatusBadge(order.status)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            R$ {Number.parseFloat(order.total_amount || 0).toFixed(2)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                asChild
                                                            >
                                                                <Link to={`#order-details-${order.id}`}>
                                                                    Detalhes
                                                                </Link>
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Profile Tab */}
                        {activeTab === "profile" && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold">Dados da Empresa</h2>
                                    <p className="text-gray-500">
                                        Informações sobre sua empresa.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="company_name">Nome da Empresa</Label>
                                        <Input
                                            id="company_name"
                                            value={userProfile.company_name || ''}
                                            readOnly
                                            className="mt-1 bg-gray-50"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="cnpj">CNPJ</Label>
                                        <Input
                                            id="cnpj"
                                            value={userProfile.cnpj || ''}
                                            readOnly
                                            className="mt-1 bg-gray-50"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="phone">Telefone</Label>
                                        <Input
                                            id="phone"
                                            value={userProfile.phone || ''}
                                            readOnly
                                            className="mt-1 bg-gray-50"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            value={userProfile.email || ''}
                                            readOnly
                                            className="mt-1 bg-gray-50"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="address">Endereço</Label>
                                        <Textarea
                                            id="address"
                                            value={userProfile.address || ''}
                                            readOnly
                                            className="mt-1 bg-gray-50"
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Button asChild>
                                        <Link to={createPageUrl("Profile")}>
                                            Editar Perfil
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>


            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{currentProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
                        <DialogDescription>
                            {currentProduct
                                ? 'Atualize as informações do produto abaixo.'
                                : 'Preencha as informações do produto abaixo.'}
                        </DialogDescription>
                    </DialogHeader>

                    {formError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{formError}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleProductFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome do Produto *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={productForm.name}
                                    onChange={handleProductFormChange}
                                    placeholder="Nome do produto"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Preço (R$) *</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={productForm.price}
                                        onChange={handleProductFormChange}
                                        placeholder="0,00"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="stock">Estoque *</Label>
                                    <Input
                                        id="stock"
                                        name="stock_quantity"
                                        type="number"
                                        min="0"
                                        value={productForm.stock_quantity}
                                        onChange={handleProductFormChange}
                                        placeholder="Quantidade"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Categoria</Label>
                                    <Select
                                        name="category"
                                        value={productForm.category}
                                        onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="frutas">Frutas</SelectItem>
                                            <SelectItem value="legumes">Legumes</SelectItem>
                                            <SelectItem value="verduras">Verduras</SelectItem>
                                            <SelectItem value="outros">Outros</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unit">Unidade</Label>
                                    <Select
                                        name="unit"
                                        value={productForm.unit}
                                        onValueChange={(value) => setProductForm(prev => ({ ...prev, unit: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="kg">Quilograma (kg)</SelectItem>
                                            <SelectItem value="unidade">Unidade</SelectItem>
                                            <SelectItem value="pacote">Pacote</SelectItem>
                                            <SelectItem value="caixa">Caixa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image_url">URL da Imagem</Label>
                                <Input
                                    id="image_url"
                                    name="image_url"
                                    value={productForm.image_url}
                                    onChange={handleProductFormChange}
                                    placeholder="https://exemplo.com/imagem.jpg"
                                />
                                <p className="text-xs text-gray-500">
                                    Insira a URL da imagem do produto
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={productForm.description}
                                    onChange={handleProductFormChange}
                                    placeholder="Descreva seu produto"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                {currentProduct ? 'Atualizar' : 'Criar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirmar exclusão</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir o produto "{currentProduct?.name}"?
                            Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteConfirmOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteProduct}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}