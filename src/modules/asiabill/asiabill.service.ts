import { ConfirmChargeDTO } from '@/modules/asiabill/dto/confirm-charge.dto'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { type Axios } from 'axios'
import crypto from 'node:crypto'

type SignHeader = {
  'gateway-no': string
  'request-id': string
  'request-time': string
  version?: string
}
type SignPath = Record<string, any>
type SignQuery = Record<string, any>
type SignBody = string

type SignOptions = {
  header: SignHeader
  path?: SignPath
  query?: SignQuery
  body?: SignBody
}

@Injectable()
export class AsiabillService {

  private readonly fetch: Axios

  constructor(
    private readonly config: ConfigService
  ) {
    this.fetch = axios.create({
      baseURL: this.config.get('ASIABILL_PAYMENT_API_URL', "https://testpay.asiabill.com")
    })
  }

  /**
   * 数据签名
   *
   * @param option 签名选项
   *
   * @see [官方工具](https://www.asiabill.com/developers/sign/check.html)
   * @see [签名过程](https://asiabill.gitbook.io/api-explorer/fu-lu/shu-ju-qian-ming-guo-cheng#id-6-qian-ming-dai-ma-shi-li)
   */
  private dataSign(options: SignOptions) {
    const signKey = this.config.get('ASIABILL_IN_SITE_TEST_SIGNKEY')

    const H = this.joinParams(options.header)
    const P = this.joinParams(options?.path ?? {})
    const Q = this.joinParams(options?.query ?? {})
    const B = options?.body ?? ''

    const joinStringArray = [H]

    if (P) joinStringArray.push(P)
    if (Q) joinStringArray.push(Q)
    if (B) joinStringArray.push(B)

    const joinString = joinStringArray.join('.')

    return crypto
      .createHmac('sha256', signKey)
      .update(joinString)
      .digest('hex')
  }

  private generateHeader() {
    const now = (+new Date()).toString()
    const header: SignHeader = {
      'gateway-no': this.config.get('ASIABILL_IN_SITE_TEST_GATEWAY_NO'),
      "request-id": now,
      "request-time": now
    }
    return header
  }

  private joinParams(object: Record<string, any>): string {
    return Object.entries(object)
      .sort((a, b) => a[0].charCodeAt(0) - b[0].charCodeAt(0))
      .map(v => `${v[1]}`)
      .join('')
  }

  public async generateSessionToken() {
    const header = this.generateHeader()
    const signInfo = this.dataSign({ header })
    console.log(
      { headers: { ...header, 'sign-info': signInfo } }
    )
    return this.fetch.post('/V2022-03/sessionToken', '', { headers: { ...header, 'sign-info': signInfo } })
      .then(data => data.data)
      .catch(err => {
        console.dir(err)
        return err.data
      })
  }

  public async confirmPayment(body: ConfirmChargeDTO) {
    const header = this.generateHeader()
    const data = JSON.stringify(body)

    const signInfo = this.dataSign({ header, body: data })

    return this.fetch.post('/V2022-03/confirmCharge', data, { headers: { ...header, 'sign-info': signInfo } })
      .then(data => data.data)
      .catch(err => {
        console.dir(err)
        return err.data
      })
  }
}
