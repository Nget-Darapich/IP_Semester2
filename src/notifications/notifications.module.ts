// import { forwardRef } from '@nestjs/common';
// import { OrdersModule } from '../orders/orders.module';
import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CoreModule } from '../core/core.module';

@Module({
  // imports: [OrdersModule], // now module graph is circular too
  // imports: [forwardRef(() => OrdersModule)],
  imports: [CoreModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
