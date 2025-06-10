// src/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // Lógica para CRIAR um novo produto
  create(createProductDto: CreateProductDto) {
    return this.prisma.products.create({
      data: createProductDto,
    });
  }

  // Lógica para BUSCAR TODOS os produtos
  findAllBySupplier(supplierId: string) {
    return this.prisma.products.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  // Lógica para BUSCAR UM ÚNICO produto pelo seu ID
  async findOne(id: string) {
    const product = await this.prisma.products.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Produto com o ID ${id} não encontrado.`);
    }
    return product;
  }

  // Lógica para ATUALIZAR um produto
  update(id: string, updateProductDto: UpdateProductDto) {
    return this.prisma.products.update({
      where: { id },
      data: updateProductDto,
    });
  }

  // Lógica para REMOVER um produto
  remove(id: string) {
    return this.prisma.products.delete({
      where: { id },
    });
  }
}