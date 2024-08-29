# Payment-Example

支付接入示例。

## PayPal

需要获取沙盒账号登录。

### 登录 [PayPal 开发者仪表盘](https://developer.paypal.com/dashboard/)

需要开启 **沙盒模式**!。

![PayPal 开发者仪表盘](/docs/image/paypal-developer.png)

在这里可以进行：

- [API 凭证（密钥这些）查看获取](https://developer.paypal.com/dashboard/applications/sandbox)
- [获取和创建沙盒账号](https://developer.paypal.com/dashboard/accounts)
- [查看 API 的调用](https://developer.paypal.com/dashboard/dashboard/sandbox)
- [查看开发文档](https://developer.paypal.com/docs/online/)
- [Webhook 事件](https://developer.paypal.com/dashboard/webhooks/sandbox)
- [Webhook 模拟](https://developer.paypal.com/dashboard/webhooksSimulator)
- [信用卡的测试](https://developer.paypal.com/api/rest/sandbox/card-testing/#link-creditcardgeneratorfortesting)

如果没有特别说明，默认账号均为沙盒环境的沙盒账号。

#### **后台的 client_id 和 client_secret 必须是商家的。**

```sh
client_id = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
client_secret = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

#### **前台需要通过商家的 client_id 引入 paypal 脚本。**

### 登录 [沙盒地址](https://www.sandbox.paypal.com)

商家账号以 `@business.example.com` 结尾。

用户账号以 `@personal.example.com` 结尾。

### 接入

#### 前端

需要先引入 `PayPal` 提供的第三方脚本。

除了第三方脚本外, **paypal 也提供了 npm 包**

[访问文档获取详情](https://developer.paypal.com/sdk/js/configuration/)

```ts
// 使用第三方脚本
// paypal 提供的第三方脚本会在全局注册一个名为 paypal 的变量

/**
 * 订单数据
 */
type OrderData = Object

/**
 * 订单操作
 */
type OrderAction = Object

window.paypal.Buttons({
  style: {
    // 样式设置
  },
  message: {
    // 一些支付信息
  },
  /**
   * 创建订单
   * @returns 订单 ID
   */
  async createOrder(): string {},
  /**
   * 核准订单
   * @param data 订单数据
   * @param action 订单操作 比如 action.restart() 就是重试订单
   */
  async onApprove(data: OrderData, action: OrderAction): void {}
})
```

#### 后端

沙盒请求地址:

```sh
https://api-m.sandbox.paypal.com
```

##### 访问令牌

需要先获取商家 `client_id` 和 `client_secret`。

以 `id:secret` 格式组合转换为 `base64` 格式字符串。

然后请求 `/v1/oauth2/token`。

```ts
const token = Buffer.from(`${clientId}:${clientSerect}`).toString('base64')
const baseUrl = 'https://api-m.sandbox.paypal.com'
```

```ts
fetch(
  baseUrl + '/v1/oauth2/token',
  {
    method: 'POST'
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${token}`
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }).toString(),
  }
)
.then(response => response.json())
// 返回访问令牌
.then(data => data.access_token)
```

##### 创建订单

```ts
fetch(
  baseUrl + '/v2/checkout/orders',
  {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            // 总金额
            value: cart.reduce(((prev, cur) => prev + ((cur.unit_amount as number) * (cur.quantity as number))), 0),
            description: "购买描述",
            // 商品列表 必须有商品数量 (quantity) 和名字 (name)  和价格 (unit_amount) 字段
            items: cart,
          }
        },
      ]
    }
  }
)
// 转换为 JSON
.then(response => response.json())
// 订单数据
.then(order => order)
```

##### 捕获订单

[关于捕获订单和授权订单的区别。](https://developer.paypal.com/docs/api/orders/v2/#orders_create!path=intent&t=request)

需要用户在前端执行付款操作才可执行！

```ts
const orderId = '订单 ID'
fetch(
  baseUrl + `/v2/checkout/orders/${orderId}/capture`,
  {
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      Authorization: `Bearer ${accessToken}`,
    }
  }
)
.then(response => response.json())
```
