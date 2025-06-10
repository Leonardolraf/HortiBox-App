import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom';
import { listProducts } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Search, Filter, ShoppingCart, Package } from 'lucide-react';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart(); // Pega a função addToCart do contexto global
    const navigate = useNavigate();

    const handleAddToCart = (e) => {
        e.stopPropagation(); // Impede que o clique no botão ative o clique no card inteiro
        addToCart(product); // Adiciona o produto ao carrinho global
        toast.success(`${product.name} adicionado ao carrinho!`);
    };

    const viewProductDetails = () => {
        // Leva para a página de detalhes quando o card é clicado
        navigate(`/product/${product.id}`);
    };

    return (
        <Card onClick={viewProductDetails} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow flex flex-col">
            <div className="h-48 bg-gray-100 flex-shrink-0 flex items-center justify-center">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Package className="h-16 w-16 text-gray-300" />
                )}
            </div>
            <div className="flex flex-col flex-grow p-4">
                <CardHeader className="p-0 mb-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge variant="outline" className="mb-2">{product.category}</Badge>
                            <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
                        </div>
                        <div className="text-xl font-bold text-green-700">
                            R$ {Number(product.price).toFixed(2)}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-grow">
                    <CardDescription className="text-sm text-gray-600">
                        Estoque: {product.stock_quantity || 0}
                    </CardDescription>
                </CardContent>
                <div className="pt-4 mt-auto">
                    <Button onClick={handleAddToCart} className="w-full bg-green-600 hover:bg-green-700">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Adicionar ao Carrinho
                    </Button>
                </div>
            </div>
        </Card>
    );
};


export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('name-asc');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        }
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await listProducts();
                setProducts(data || []);
            } catch (error) {
                console.error("Erro ao buscar produtos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredAndSortedProducts = useMemo(() => {
        return products
            .filter(product => {
                const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
                const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesCategory && matchesSearch;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'price-asc': return a.price - b.price;
                    case 'price-desc': return b.price - a.price;
                    case 'name-desc': return b.name.localeCompare(a.name);
                    case 'name-asc': default: return a.name.localeCompare(b.name);
                }
            });
    }, [products, searchQuery, selectedCategory, sortBy]);


    if (loading) {
        return (
            <div className="container mx-auto p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array(8).fill(null).map((_, i) => (
                        <Card key={i}><CardHeader><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Nossos Produtos</h1>

            <div className="bg-white p-4 rounded-md shadow-sm mb-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input placeholder="Buscar por nome..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="text-gray-400 h-5 w-5" />
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas Categorias</SelectItem>
                                    <SelectItem value="frutas">Frutas</SelectItem>
                                    <SelectItem value="legumes">Legumes</SelectItem>
                                    <SelectItem value="verduras">Verduras</SelectItem>
                                    <SelectItem value="outros">Outros</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Ordenar por" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
                                    <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
                                    <SelectItem value="price-asc">Preço (Menor)</SelectItem>
                                    <SelectItem value="price-desc">Preço (Maior)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {filteredAndSortedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-600">Nenhum produto encontrado com os filtros selecionados.</p>
                </div>
            )}
        </div>
    );
}
