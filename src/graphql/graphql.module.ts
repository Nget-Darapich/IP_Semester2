import { Module } from '@nestjs/common';

import { CategoryResolver } from './resolver/category.resolver';
import { ProductResolver } from './resolver/product.resolver';

// import { CategoryCodeFirstResolver } from './resolver/category.codefirst.resolver';
// import { ProductCodeFirstResolver } from './resolver/product.codefirst.resolver';

import { CategoryModule } from '../category/category.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [CategoryModule, ProductModule],
  providers: [CategoryResolver, ProductResolver],
  // providers: [CategoryCodeFirstResolver, ProductCodeFirstResolver],
})
export class GraphqlModule {}
