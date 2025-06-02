import { Controller, Get, Post, Param, Delete } from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':userId')
  getCart(@Param('userId') userId: string): Promise<Cart> {
    return this.cartService.getCart(+userId);
  }

  @Post(':userId/add/:productId/:quantity')
  addItem(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
    @Param('quantity') quantity: string,
  ): Promise<Cart> {
    return this.cartService.addItem(+userId, +productId, +quantity);
  }

  @Delete(':userId/remove/:productId')
  removeItem(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ): Promise<Cart> {
    return this.cartService.removeItem(+userId, +productId);
  }

  @Post(':userId/checkout')
  checkout(@Param('userId') userId: string): Promise<{ cart: Cart; message: string }> {
    return this.cartService.checkout(+userId);
  }
}