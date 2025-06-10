// src/products/dto/create-product.dto.ts
import { IsString, IsNumber, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    price: number;

    @IsString()
    @IsOptional()
    image_url?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsNumber()
    stock_quantity: number;

    @IsString()
    @IsOptional()
    unit?: string;

    @IsUUID()
    @IsNotEmpty()
    supplier_id: string;
}