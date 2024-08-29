import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { type Axios } from 'axios'
import { OrderResponse } from './dto/payment'

@Injectable()
export class PaypalService {

  private readonly fetch: Axios

  constructor(
    private readonly config: ConfigService
  ) {
    this.fetch = axios.create({
      baseURL: this.config.get('PAYPAL_URL', "https://api-m.sandbox.paypal.com")
    })
  }

  /**
   * 获取访问令牌
   *
   * **涉及订单请求的都需要先获取访问令牌**
   *
   * @returns access token
   */
  private async generateAccessToken() {
    const clientId = this.config.get("PAYPAL_SHOP_CLIENT_ID")
    const clientSecret = this.config.get("PAYPAL_SHOP_CLIENT_SECRET")
    const token = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    const data = new URLSearchParams({
      grant_type: "client_credentials",
    })

    return this.fetch.post("/v1/oauth2/token", data.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${token}`
      },
    })
      .then((data) => data.data)
      .then(data => data.access_token)
  }

  /**
   * 创建订单
   * @param cart 购物车内容
   * @returns 订单信息
   */
  public async createOrder(cart: Record<string, string | number>[]) {
    const accessToken = await this.generateAccessToken()

    return this.fetch.post('/v2/checkout/orders', {
      //
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            // 总金额
            value: cart.reduce(((prev, cur) => prev + ((cur.unit_amount as number) * (cur.quantity as number))), 0),
            description: "购买描述",
            // ! 商品列表 必须有商品数量和名字和价格
            items: cart,
          }
        },
      ]
    }, {
      headers: {
        'Content-Type': "application/json",
        Authorization: `Bearer ${accessToken}`
        // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
        // "PayPal-Mock-Response": '{"mock_application_codes": "MISSING_REQUIRED_PARAMETER"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "PERMISSION_DENIED"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
      }
    })
      .then(data => data.data as OrderResponse)
  }

  /**
   * 捕获订单 ID
   *
   * **需要用户执行付款操作后才能执行**
   *
   * @see [授权订单和捕获订单的区别](https://developer.paypal.com/docs/api/orders/v2/#orders_create!path=intent&t=request)
   *
   * @param orderId 捕获的订单 ID
   * @returns 订单信息
   */
  public async captureOrder(orderId: string) {
    const accessToken = await this.generateAccessToken()
    return this.fetch.post(`/v2/checkout/orders/${orderId}/capture`, {}, {
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        Authorization: `Bearer ${accessToken}`,
      }
      // "PayPal-Mock-Response": '{"mock_application_codes": "INSTRUMENT_DECLINED"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "TRANSACTION_REFUSED"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
    })
      .then(data => data.data)
      .catch(err => {
        console.dir({ err })
        return {
          err
        }
      })
  }
}
