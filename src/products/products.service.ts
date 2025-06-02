import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
        throw new Error(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: CreateProductDto): Promise<Product> {
    await this.productsRepository.update(id, updateProductDto);
    const updatedProduct = await this.productsRepository.findOne({ where: { id } });
    if (!updatedProduct) {
        throw new Error(`Product with ID ${id} not found after update`);
    }
    return updatedProduct;
  }

  async remove(id: number): Promise<void> {
    await this.productsRepository.delete(id);
  }
}