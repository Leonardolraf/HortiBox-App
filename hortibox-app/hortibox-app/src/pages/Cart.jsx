import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import * as orderService from '../services/orderService';
import {
    Trash2,
    ChevronLeft,
    ShoppingBag,
    CreditCard,
    Truck,
    CheckCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';

export default function Cart() {
    // 2. Obtendo os itens e as funções do Contexto Global
    const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
    const { userProfile } = useAuth();
    const navigate = useNavigate();

    // 3. Os estados locais agora são apenas para o formulário e controle da UI
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('pix');
    const [notes, setNotes] = useState('');
    const [orderStep, setOrderStep] = useState('cart');
    const [processingOrder, setProcessingOrder] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');

    useEffect(() => {
        // 4. Removemos a lógica de carregar mock data.
        // Apenas preenchemos o endereço se o usuário já tiver um no perfil.
        if (userProfile?.address) {
            setAddress(userProfile.address);
        }
    }, [userProfile]);

    // Funções de cálculo agora usam 'cartItems' do contexto
    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    };
    const calculateDeliveryFee = () => {
        return calculateSubtotal() > 50 ? 0 : 10;
    };
    const calculateTotal = () => {
        return calculateSubtotal() + calculateDeliveryFee();
    };

    const proceedToCheckout = () => {
        if (cartItems.length === 0) return;
        if (!userProfile) {
            alert("Você precisa fazer login para finalizar a compra.");
            navigate('/login');
            return;
        }
        window.scrollTo(0, 0);
        setOrderStep('checkout');
    };

    const placeOrder = async () => {
        if (!address) {
            alert('Por favor, informe seu endereço de entrega.');
            return;
        }
        setProcessingOrder(true);
        try {
            const customerId = userProfile.id;
            const totalAmount = calculateTotal();
            const shippingDetails = {
                shipping_address_line1: address,
                shipping_city: 'Cidade Exemplo',
                shipping_state: 'Estado Exemplo',
                shipping_postal_code: '00000-000',
                shipping_country: 'Brasil',
            };
            const itemsForDb = cartItems.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity,
                price_at_purchase: item.product.price
            }));

            const createdOrder = await orderService.createOrder(customerId, itemsForDb, shippingDetails, totalAmount);

            setOrderNumber(`#${createdOrder.id.substring(0, 6)}`);
            clearCart(); // Limpa o carrinho global após o sucesso
            window.scrollTo(0, 0);
            setOrderStep('success');
        } catch (error) {
            console.error("Erro ao processar pedido:", error);
            alert('Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.');
        } finally {
            setProcessingOrder(false);
        }
    };

    // O seu JSX para renderizar as visualizações do carrinho e do checkout está ótimo
    // A única mudança é nos botões de remover/atualizar quantidade
    const renderStepContent = () => {
        if (orderStep === 'success') {
            // ... seu JSX para a tela de sucesso ...
        }

        if (orderStep === 'checkout') {
            return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold mb-4">Endereço de Entrega</h2>
                            <Textarea
                                placeholder="Informe seu endereço completo"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />

                            <h2 className="text-xl font-bold mt-6 mb-4">Forma de Pagamento</h2>
                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="pix" id="pix" />
                                    <Label htmlFor="pix">PIX</Label>
                                </div>
                                <div className="flex items-center space-x-2 mt-2">
                                    <RadioGroupItem value="credito" id="credito" />
                                    <Label htmlFor="credito">Cartão de Crédito</Label>
                                </div>
                                <div className="flex items-center space-x-2 mt-2">
                                    <RadioGroupItem value="boleto" id="boleto" />
                                    <Label htmlFor="boleto">Boleto Bancário</Label>
                                </div>
                            </RadioGroup>

                            <h2 className="text-xl font-bold mt-6 mb-4">Observações</h2>
                            <Textarea
                                placeholder="Alguma instrução para o entregador?"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />

                            <Button
                                className="mt-6 w-full bg-green-600 hover:bg-green-700"
                                onClick={placeOrder}
                                disabled={processingOrder}
                            >
                                <CreditCard className="mr-2 h-5 w-5" />
                                {processingOrder ? 'Finalizando...' : 'Finalizar Pedido'}
                            </Button>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                            <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>R$ {calculateSubtotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Taxa de Entrega</span>
                                    <span>{calculateDeliveryFee() === 0 ? <span className="text-green-600">Grátis</span> : `R$ ${calculateDeliveryFee().toFixed(2)}`}</span>
                                </div>
                            </div>
                            <div className="border-t border-b my-4 py-4">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>R$ {calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );

}
// Visão Padrão: Carrinho
return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Carrinho de Compras</h2>
                    <span className="text-gray-500">{cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}</span>
                </div>
                {cartItems.length === 0 ? (
                    <div className="text-center py-10">
                        {/* ... seu JSX de carrinho vazio ... */}
                    </div>
                ) : (
                    <div className="divide-y">
                        {cartItems.map(item => (
                            <div key={item.product.id} className="py-4 flex flex-col sm:flex-row gap-4">
                                <div className="w-24 h-24 flex-shrink-0 rounded overflow-hidden">
                                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    {/* ... */}
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center border rounded-md">
                                            {/* 5. Conectando os botões às funções do contexto */}
                                            <Button variant="ghost" size="icon" className="rounded-none h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</Button>
                                            <span className="w-10 text-center">{item.quantity}</span>
                                            <Button variant="ghost" size="icon" className="rounded-none h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</Button>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800 hover:bg-red-50" onClick={() => removeFromCart(item.product.id)}>
                                            <Trash2 className="h-4 w-4 mr-1" />Remover
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>R$ {calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Taxa de Entrega</span>
                        <span>{calculateDeliveryFee() === 0 ? <span className="text-green-600">Grátis</span> : `R$ ${calculateDeliveryFee().toFixed(2)}`}</span>
                    </div>
                    {calculateDeliveryFee() > 0 && <div className="text-xs text-green-600 mt-1">Faltam R$ {(50 - calculateSubtotal()).toFixed(2)} para frete grátis</div>}
                </div>
                <div className="border-t border-b my-4 py-4">
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>R$ {calculateTotal().toFixed(2)}</span>
                    </div>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700" size="lg" onClick={proceedToCheckout} disabled={cartItems.length === 0}>
                    <Truck className="mr-2 h-5 w-5" />
                    Continuar para Entrega
                </Button>
                <Button variant="outline" className="w-full mt-2" asChild>
                    <Link to="/products"><ChevronLeft className="mr-1 h-4 w-4" />Continuar Comprando</Link>
                </Button>
            </div>
        </div>
    </div>
);
    };

return (
    <div className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-8">
                {orderStep === 'checkout' ? 'Finalizar Pedido' : orderStep === 'success' ? 'Pedido Confirmado' : 'Carrinho de Compras'}
            </h1>
            {renderStepContent()}
        </div>
    </div>
);
}