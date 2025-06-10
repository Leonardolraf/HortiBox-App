import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

/**
 * Service responsável por operações relacionadas a pedidos (orders),
 * como criação, listagem por cliente e listagem geral.
 */
@Injectable()
export class OrdersService {
  private supabase;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!
    );
  }

  /**
   * Cria um novo pedido e seus respectivos itens.
   * @param body Dados do pedido recebidos do frontend
   * @returns Pedido criado
   */
  async createOrder(body: any) {
    const { customer_id, total_amount, shipping, items } = body;

    const { data: order, error } = await this.supabase
      .from('orders')
      .insert({
        customer_id,
        total_amount,
        ...shipping,
      })
      .select()
      .single();

    if (error) throw error;

    const itemsWithOrderId = items.map(item => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await this.supabase
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) throw itemsError;

    return order;
  }

  /**
   * Busca todos os pedidos realizados por um cliente específico.
   * @param customerId ID do cliente
   * @returns Lista de pedidos do cliente com seus itens e produtos
   */
  async getOrdersByCustomer(customerId: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`*, order_items(*, products(*))`)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Lista todos os pedidos do sistema, incluindo nome do cliente e detalhes dos itens.
   * @returns Lista de todos os pedidos
   */
  async listAllOrders() {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        profile:customer_id (
          full_name
        ),
        order_items(
          *,
          products(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}
