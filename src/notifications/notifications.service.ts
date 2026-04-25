import { Injectable, Inject } from '@nestjs/common';
// import { forwardRef } from '@nestjs/common';
// import { OrdersService } from '../orders/orders.service';
import { EVENT_PUBLISHER } from '../core/tokens';

type EventPublisher = { publish: (event: string, payload: any) => void };

@Injectable()
export class NotificationsService {
  constructor(
    // constructor(private readonly ordersService: OrdersService) {} // creates a circle
    // @Inject(forwardRef(() => OrdersService)) // fix using forwardRef
    // private readonly ordersService: OrdersService,
    @Inject(EVENT_PUBLISHER)
    private readonly publisher: EventPublisher,
  ) {}

  notify(event: string, payload: any) {
    // console.log(`[NOTIFY] ${event}`, payload);
    // return { ok: true };
    this.publisher.publish(event, payload);
    return { ok: true };
  }
}
