import { Controller, Get, Render } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('页面')
@Controller()
export class AppController {

  constructor(
    private readonly config: ConfigService
  ) {}

  @Get('paypal')
  @Render('paypal')
  paypal() {

    /**
     * 除了第三方脚本外
     *
     * # **paypal 也提供了 npm 包**
     *
     * @see [访问文档获取详情](https://developer.paypal.com/sdk/js/configuration/)
     */
    const script = `https://www.paypal.com/sdk/js?client-id=${this.config.get("PAYPAL_SHOP_CLIENT_ID")}&buyer-country=US&currency=USD&components=buttons&enable-funding=venmo`

    return { script }
  }

  @Get('asiabill')
  @Render('asiabill')
  asiabill() {

    /**
     * 引入 js sdk
     */
    const script = `${this.config.get('ASIABILL_PAYMENT_API_URL')}/static/v3/js/AsiabillPayment.min.js`

    return {
      script
    }
  }
}
