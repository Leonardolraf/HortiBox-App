import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  @ApiOperation({ summary: 'Cria um novo pedido com seus itens' })
  @ApiBody({
    schema: {
      example: {
        customer_id: 'user-123',
        total_amount: 150.75,
        shipping: {
          shipping_address_line1: 'Rua Exemplo, 123',
          shipping_city: 'São Paulo',
          shipping_state: 'SP',
          shipping_postal_code: '01234-567',
          shipping_country: 'Brasil'
        },
        items: [
          {
            product_id: 'prod-456',
            quantity: 2,
            price_at_purchase: 75.375
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso' })
  @ApiResponse({ status: 500, description: 'Erro ao criar o pedido' })
  async create(@Body() body: any) {
    return this.ordersService.createOrder(body);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Lista todos os pedidos de um cliente específico' })
  @ApiParam({ name: 'customerId', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos do cliente retornada com sucesso' })
  async getByCustomer(@Param('customerId') customerId: string) {
    return this.ordersService.getOrdersByCustomer(customerId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os pedidos com seus itens e informações do cliente' })
  @ApiResponse({ status: 200, description: 'Lista de todos os pedidos retornada com sucesso' })
  async getAll() {
    return this.ordersService.listAllOrders();
  }
}
