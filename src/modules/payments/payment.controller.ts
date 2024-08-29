import { Body, Controller, Post } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { CreateOrderDTO } from './dto/create-order.dto'
import { CaptureOrderDTO } from './dto/capture-order.dto'
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import { OrderResponseExample } from './dto/payment'

@ApiTags('支付')
@Controller("payment")
export class PaymentController {
  constructor(
    private readonly service: PaymentService
  ) {}

  @ApiBody({
    description: '创建订单',
    type: CreateOrderDTO,
    examples: {
      example: {
        value: {
          cart: [
            {
              name: 'test items',
              quantity: 1,
              unit_amount: 1
            }
          ]
        }
      }
    }
  })
  @ApiCreatedResponse({
    description: '创建订单成功',
    content: {
      'application/json': {
        example: OrderResponseExample,
      }
    }
  })
  @Post("create/order")
  public async createOrder(@Body() body: CreateOrderDTO) {
    return this.service.createOrder(body.cart)
  }

  @ApiBody({
    description: "捕获订单",
    type: CaptureOrderDTO
  })
  @Post("capture/order")
  public async captureOrder(@Body() body: CaptureOrderDTO) {
    return this.service.captureOrder(body.orderId)
  }
}
