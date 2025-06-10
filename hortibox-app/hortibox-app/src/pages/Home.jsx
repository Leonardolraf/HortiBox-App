
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import * as profileService from '../services/profileService';
import * as productService from '../services/productService';
import {
    ArrowRight,
    Truck,
    Clock,
    ShieldCheck,
    Leaf
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';

export default function Home() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const handleLogin = () => {
        Navigate('/login');
    }

    return (
        <div className="min-h-screen">
            <section
                className="relative py-20 md:py-28 bg-cover bg-center text-white"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')" }}
            >
                <div className="absolute inset-0 bg-black opacity-50"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            {currentUser?.user_type === 'supplier' ?
                                'Venda seus produtos para milhares de clientes' :
                                'Produtos frescos do campo para sua casa'}
                        </h1>
                        <p className="text-xl mb-8 text-gray-200">
                            {currentUser?.user_type === 'supplier' ?
                                'Conecte-se diretamente com consumidores e expanda seu negócio.' :
                                'Descubra uma nova maneira de comprar frutas, legumes e verduras frescos com entrega rápida e qualidade garantida.'}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button
                                size="lg"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                asChild
                            >
                                <Link to={createPageUrl(currentUser?.user_type === 'supplier' ? "SupplierDashboard" : "Products")}>
                                    {currentUser?.user_type === 'supplier' ? 'Gerenciar Produtos' : 'Comprar Agora'}
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="bg-white/10 text-white border-white hover:bg-white/20"
                                onClick={currentUser ? undefined : handleLogin}
                                asChild={currentUser ? true : false}
                            >
                                {currentUser ? (
                                    <Link to={createPageUrl("Profile")}>
                                        Minha Conta
                                    </Link>
                                ) : (
                                    "Entrar"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="flex flex-col items-center text-center p-6 rounded-lg hover:shadow-md transition-shadow">
                            <div className="bg-green-100 p-3 rounded-full mb-4">
                                <Leaf className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">100% Orgânicos</h3>
                            <p className="text-gray-600">Produtos frescos cultivados sem agrotóxicos e pesticidas.</p>
                        </div>

                        <div className="flex flex-col items-center text-center p-6 rounded-lg hover:shadow-md transition-shadow">
                            <div className="bg-blue-100 p-3 rounded-full mb-4">
                                <Truck className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Entrega Rápida</h3>
                            <p className="text-gray-600">Receba seus produtos em até 24 horas após o pedido.</p>
                        </div>

                        <div className="flex flex-col items-center text-center p-6 rounded-lg hover:shadow-md transition-shadow">
                            <div className="bg-amber-100 p-3 rounded-full mb-4">
                                <ShieldCheck className="h-8 w-8 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Qualidade Garantida</h3>
                            <p className="text-gray-600">Satisfação garantida ou devolvemos seu dinheiro.</p>
                        </div>

                        <div className="flex flex-col items-center text-center p-6 rounded-lg hover:shadow-md transition-shadow">
                            <div className="bg-purple-100 p-3 rounded-full mb-4">
                                <Clock className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Horta Atualizada</h3>
                            <p className="text-gray-600">Produtos colhidos no mesmo dia da entrega.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold">Produtos em Destaque</h2>
                        <Link
                            to={createPageUrl("Products")}
                            className="text-green-600 font-medium flex items-center hover:underline"
                        >
                            Ver Todos
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            Array(4).fill().map((_, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    <Skeleton className="h-48 w-full" />
                                    <div className="p-4">
                                        <Skeleton className="h-6 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-1/2 mb-4" />
                                        <Skeleton className="h-8 w-full" />
                                    </div>
                                </div>
                            ))
                        ) : featuredProducts.length > 0 ? (
                            featuredProducts.map((product) => (
                                <Link
                                    key={product.id}
                                    to={createPageUrl("ProductDetail") + `?id=${product.id}`}
                                    className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform hover:shadow-md hover:-translate-y-1"
                                >
                                    <div className="h-48 overflow-hidden">
                                        <img
                                            src={product.image_url || "https://images.unsplash.com/photo-1610348725531-843dff563e2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                                        <p className="text-gray-500 text-sm mb-2">
                                            {product.category === 'frutas' ? 'Fruta' :
                                                product.category === 'legumes' ? 'Legume' :
                                                    product.category === 'verduras' ? 'Verdura' : 'Outros'}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xl font-bold text-green-700">
                                                R$ {product.price?.toFixed(2)}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                por {product.unit}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10">
                                <p className="text-gray-500">Nenhum produto disponível no momento.</p>
                                <Button
                                    className="mt-4 bg-green-600 hover:bg-green-700"
                                    asChild
                                >
                                    <Link to={createPageUrl("Products")}>
                                        Explorar Produtos
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-green-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Comece a comprar produtos frescos hoje</h2>
                    <p className="text-xl max-w-2xl mx-auto mb-8 text-green-100">
                        Junte-se a milhares de clientes satisfeitos que recebem produtos frescos diretamente em suas casas.
                    </p>
                    <Button
                        size="lg"
                        className="bg-white text-green-700 hover:bg-green-50"
                        onClick={currentUser ? () => window.location.href = createPageUrl("Products") : handleLogin}
                    >
                        {currentUser ? "Explorar Produtos" : "Criar Conta Grátis"}
                    </Button>
                </div>
            </section>
        </div>
    );
}
