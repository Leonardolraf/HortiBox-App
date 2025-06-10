import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom'; // useParams para pegar o ID da URL
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { getProductById } from '../services/productService';
import {
    ChevronLeft, Minus, Plus, ShoppingCart, Truck, CheckCircle, Star, StarHalf
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { getImageUrl } from "C:/Users/Leo/Downloads/teste base44/hortibox-app/src/utils/getImageUrl.js"; 


export default function ProductDetail() {
    const { id: productId } = useParams(); // Pega o ID do produto da URL (ex: /product/uuid-do-produto)
    const { userProfile } = useAuth(); // Pega o usuário do contexto para saber se está logado
    const { addToCart } = useCart();   // Pega a função de adicionar ao carrinho do contexto

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loadProduct = async () => {
            if (!productId) {
                console.error("Nenhum ID de produto fornecido na URL.");
                navigate("/products");
                return;
            }

            try {
                setLoading(true);
                // Busca um único produto diretamente do Supabase usando o ID
                const productData = await getProductById(productId);
                console.log("Produto carregado:", productData);
                // Verifica se o produto foi encontrado
                if (productData) {
                    setProduct(productData);
                } else {
                    console.error("Produto não encontrado.");
                    navigate("/products"); // Redireciona se o produto não existir
                }
            } catch (error) {
                console.error("Erro ao carregar produto:", error);
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [productId, navigate]);

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const increaseQuantity = () => {
        // Usa a coluna correta 'stock_quantity'
        if (quantity < (product?.stock_quantity || 10)) {
            setQuantity(quantity + 1);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;

        // Se o usuário não estiver logado, redireciona para o login
        if (!userProfile) {
            navigate('/login');
            return;
        }

        setAdding(true);
        addToCart(product, quantity); // Adiciona o produto e a quantidade ao carrinho global

        // Simula um pequeno delay para o feedback visual e depois navega para o carrinho
        setTimeout(() => {
            setAdding(false);
            navigate('/cart');
        }, 500);
    };

    const getCategoryLabel = (category) => {
        const categoryMap = { 'frutas': 'Frutas', 'legumes': 'Legumes', 'verduras': 'Verduras', 'outros': 'Outros' };
        return categoryMap[category] || category;
    };

    const renderStars = () => { // Função de exemplo para renderizar as estrelas
        return (<div className="flex text-yellow-400"><Star className="fill-current h-4 w-4" /><Star className="fill-current h-4 w-4" /><Star className="fill-current h-4 w-4" /><Star className="fill-current h-4 w-4" /><StarHalf className="fill-current h-4 w-4" /></div>);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-10">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Skeleton className="h-[400px] w-full rounded-lg" />
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-3/4" /><Skeleton className="h-6 w-1/3" /><Skeleton className="h-24 w-full" /><Skeleton className="h-8 w-1/2" /><Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-10 text-center">
                <p className="text-gray-500 mb-4">Produto não encontrado.</p>
                <Button onClick={() => navigate("/products")}>Ver Todos os Produtos</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto px-4">
                <div className="mb-6">
                    <Button variant="ghost" className="flex items-center mb-4" onClick={() => navigate("/products")}>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Voltar para Produtos
                    </Button>
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                            <div className="rounded-lg overflow-hidden">
                                <img src={product.image_url || "https://placehold.co/400x300?text=Sem+Imagem"} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-6 flex flex-col">
                                <div>
                                    <Badge className="mb-2">{getCategoryLabel(product.category)}</Badge>
                                    <h1 className="text-3xl font-bold">{product.name}</h1>
                                    <div className="flex items-center mt-2">
                                        {renderStars()}
                                        <span className="text-gray-500 text-sm ml-2">4.5/5 (de 23 avaliações)</span>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-green-700">
                                    R$ {Number(product.price).toFixed(2)}
                                    <span className="text-sm text-gray-500 font-normal ml-1">por {product.unit}</span>
                                </div>
                                <p className="text-gray-700 flex-grow">{product.description || 'Produto fresco e de alta qualidade.'}</p>
                                <div className="flex items-center space-x-2 text-sm text-gray-700">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span>Em estoque: {product.stock_quantity || 'Disponível'}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-700">
                                    <Truck className="h-4 w-4 text-green-600" />
                                    <span>Entrega disponível para sua região</span>
                                </div>
                                <Separator />
                                <div className="flex flex-col space-y-4">
                                    <div className="flex items-center">
                                        <span className="font-medium mr-4">Quantidade:</span>
                                        <div className="flex items-center border rounded-md">
                                            <Button variant="ghost" size="icon" className="rounded-none" onClick={decreaseQuantity} disabled={quantity <= 1}><Minus className="h-4 w-4" /></Button>
                                            <span className="w-10 text-center">{quantity}</span>
                                            <Button variant="ghost" size="icon" className="rounded-none" onClick={increaseQuantity} disabled={quantity >= (product.stock_quantity || 10)}><Plus className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                    <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center" size="lg" onClick={handleAddToCart} disabled={adding}>
                                        {adding ? 'Adicionando...' : <><ShoppingCart className="mr-2 h-5 w-5" /> Adicionar ao Carrinho</>}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}