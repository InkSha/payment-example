import { IsNotEmpty, IsString } from 'class-validator'

export class CaptureOrderDTO {
  /**
   * 订单 ID
   */
  @IsString()
  @IsNotEmpty()
  orderId: string
}
