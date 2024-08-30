import { AsiabillService } from '@/modules/asiabill/asiabill.service'
import { ConfirmChargeDTO } from '@/modules/asiabill/dto/confirm-charge.dto'
import { Body, Controller, Post } from '@nestjs/common'
import { ApiBody, ApiTags } from '@nestjs/swagger'

@ApiTags('支付', 'asiabill')
@Controller('asiabill')
export class AsiabillController {
  constructor(
    private readonly service: AsiabillService
  ) {}

  @ApiBody({
    description: '生成 session token',
    required: false
  })
  @Post('session')
  public async getSessionToken() {
    return this.service.generateSessionToken()
  }

  @ApiBody({
    description: '请求扣款',
    type: ConfirmChargeDTO
  })
  @Post('confirm')
  public async confirmCharge(@Body() data: ConfirmChargeDTO) {
    return this.service.confirmPayment(data)
  }
}
