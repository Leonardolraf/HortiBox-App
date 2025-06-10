export class Product {

    id: string;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    category?: string;
    stock_quantity: number;
    unit?: string;
    supplier_id: string;
    created_at: Date;
    updated_at: Date;
    
    constructor(partial: Partial<Product>) {
        Object.assign(this, partial);
    }

}
