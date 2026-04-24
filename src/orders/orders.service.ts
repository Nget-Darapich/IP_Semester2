import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('ORDERS_SERVICE') private client: ClientProxy,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notifications: NotificationsService,
  ) {}

  createOrder(orderDto: CreateOrderDto) {
    this.client.emit('order_created', {
      order: orderDto,
      createdAt: new Date().toISOString(),
    });

    this.notifications.notify('order_created', {
      order: orderDto,
    });

    return { status: 'Order accepted', order: orderDto };
  }
}
