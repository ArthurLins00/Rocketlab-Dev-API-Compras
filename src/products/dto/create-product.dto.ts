import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
export class CreateProductDto {
  @ApiProperty({
    description: 'Nome do produto',
    example: 'Foguete Modelo X',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Descrição detalhada do produto',
    example: 'Foguete para viagens interplanetárias com capacidade para 5 tripulantes',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Preço do produto em reais',
    example: 999.99,
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'Quantidade disponível em estoque',
    example: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  stock: number;

  @ApiProperty({
    description: 'URL da imagem do produto (opcional)',
    example: 'https://example.com/foguete-x.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}