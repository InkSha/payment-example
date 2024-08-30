import { IsIP, IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator'

export class ConfirmChargeDTO {
  @IsNotEmpty()
  @IsIP('4')
  customerIp: string

  @IsNumber()
  @IsNotEmpty()
  orderAmount: number

  @IsString()
  @IsNotEmpty()
  orderCurrency: string

  @IsString()
  @IsNotEmpty()
  orderNo: string

  @IsUrl()
  @IsNotEmpty()
  returnUrl: string

  @IsUrl()
  @IsNotEmpty()
  webSite: string
}
