// src/services/orderService.js
export const getOrdersByCustomer = async (customerId) => {
    const response = await fetch(`http://localhost:3000/orders/customer/${customerId}`);
    if (!response.ok) throw new Error('Erro ao buscar pedidos do cliente');
    return await response.json();
};

export const listAllOrders = async () => {
    const response = await fetch(`http://localhost:3000/orders`);
    if (!response.ok) throw new Error('Erro ao listar pedidos');
    return await response.json();
};

export const createOrder = async (customerId, itemsData, shipping, totalAmount) => {
    const response = await fetch('http://localhost:3000/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            customer_id: customerId,
            total_amount: totalAmount,
            shipping,
            items: itemsData,
        }),
    });

    if (!response.ok) throw new Error('Erro ao criar pedido');
    return await response.json();
};