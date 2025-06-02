import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    private productsService: ProductsService,
  ) {}

  async createCart(userId: number): Promise<Cart> {
    const cart = this.cartRepository.create({ userId });
    return this.cartRepository.save(cart);
  }

  async getCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = await this.createCart(userId);
    }

    return cart;
  }

  async addItem(userId: number, productId: number, quantity: number): Promise<Cart> {
    const cart = await this.getCart(userId);
    const product = await this.productsService.findOne(productId);

    if (product.stock < quantity) {
      throw new HttpException(
        `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}`,
        HttpStatus.BAD_REQUEST
      );
    }

    let item = cart.items.find((item) => item.product.id === productId);

    if (item) {
      item.quantity += quantity;
    } else {
      item = this.cartItemRepository.create({
        product,
        quantity,
        cart,
      });
      cart.items.push(item);
    }

    await this.cartItemRepository.save(item);
    await this.updateCartTotal(cart);

    return this.getCart(userId);
  }

async removeItem(userId: number, productId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      throw new HttpException(
        `Carrinho do usuário ${userId} não encontrado`,
        HttpStatus.NOT_FOUND
      );
    }

    const itemIndex = cart.items.findIndex(item => item.product.id === productId);
    if (itemIndex === -1) {
      throw new HttpException(
        `Item com productId ${productId} não encontrado no carrinho`,
        HttpStatus.NOT_FOUND
      );
    }

    const [removedItem] = cart.items.splice(itemIndex, 1);
    await this.cartItemRepository.remove(removedItem);

    cart.total = cart.items.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    );

    await this.cartRepository.save(cart);

    return this.getCart(userId);
  }

  async updateCartTotal(cart: Cart): Promise<void> {
    cart.total = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    await this.cartRepository.save(cart);
  }

  async checkout(userId: number): Promise<{ cart: Cart; message: string }> {
    const cart = await this.getCart(userId);

    if (cart.items.length === 0) {
      throw new HttpException(
        'Não é possível finalizar a compra com o carrinho vazio.',
        HttpStatus.BAD_REQUEST
      );
    }

    for (const item of cart.items) {
      const product = await this.productsService.findOne(item.product.id);
      if (product.stock < item.quantity) {
        throw new HttpException(
          `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}`,
          HttpStatus.BAD_REQUEST
        );
      }
    }

    for (const item of cart.items) {
      const product = await this.productsService.findOne(item.product.id);
      product.stock -= item.quantity;
      await this.productsService.update(product.id, product);
    }

    await this.cartItemRepository.remove(cart.items);
    cart.items = [];
    cart.total = 0;
    await this.cartRepository.save(cart);

    return { 
      cart, 
      message: "Compra finalizada com sucesso!" 
    };
  }
}