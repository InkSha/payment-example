import { IsObject } from 'class-validator'

export class CreateOrderDTO {
  /**
   * 购物车内容
   */
  @IsObject({ each: true })
  cart: Record<string, string>[]
}
