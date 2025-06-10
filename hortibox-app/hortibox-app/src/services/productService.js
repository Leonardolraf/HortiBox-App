// src/services/productService.js
const API_URL = 'http://localhost:3000';

/**
 * Busca todos os produtos da sua API Nest.JS.
 * Corresponde a um endpoint: GET /products
 */
export const listProducts = async () => {
    // Ao juntar, vira /products/products
    const response = await fetch(`${API_URL}/products`);

    if (!response.ok) {
        throw new Error('Falha ao buscar produtos da sua API');
    }
    const data = await response.json();
    return data;
};

/**
 * Busca um único produto pelo seu ID.
 * Corresponde a um endpoint: GET /products/:id
 */
export const getProductById = async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) {
        throw new Error('Falha ao buscar produto por ID.');
    }
    return await response.json();
};

/**
 * Lista todos os produtos de um fornecedor específico.
 * Corresponde a um endpoint: GET /products/supplier/:supplierId
 */
export const listBySupplier = async (supplierId) => {
    const response = await fetch(`${API_URL}/products/supplier/${supplierId}`);
    if (!response.ok) {
        throw new Error('Falha ao listar produtos por fornecedor.');
    }
    return await response.json();
};

/**
 * Cria um novo produto no banco de dados através da sua API.
 * Corresponde a um endpoint: POST /products
 */
export const create = async (productData) => {
    const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
    });
    if (!response.ok) {
        throw new Error('Falha ao criar produto.');
    }
    return await response.json();
};

/**
 * Atualiza um produto existente.
 * Corresponde a um endpoint: PATCH /products/:id
 */
export const update = async (id, updateData) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
    });
    if (!response.ok) {
        throw new Error('Falha ao atualizar produto.');
    }
    return await response.json();
};

/**
 * Deleta um produto pelo seu ID.
 * Corresponde a um endpoint: DELETE /products/:id
 */
export const deleteById = async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Falha ao deletar produto.');
    }
    // A resposta de um DELETE bem-sucedido geralmente não tem corpo.
    return response.ok;
};