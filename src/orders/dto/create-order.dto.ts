import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  item!: string;

  @IsNumber()
  @Min(0)
  qty!: number;
}
