// @ts-check

window.onload = () => {
  const cart = [
    {
      "name": "test items1",
      "quantity": 1,
      "unit_amount": 1
    },
    {
      "name": "test items2",
      "quantity": 1,
      "unit_amount": 2
    },
    {
      "name": "test items3",
      "quantity": 1,
      "unit_amount": 3
    }
  ]

  window.paypal.Buttons({
    style: {
      shape: 'rect',
      layout: 'vertical',
      color: 'gold',
      label: 'pay'
    },
    message: {
      amount: cart.reduce(((prev, cur) => prev + (cur.unit_amount * cur.quantity)), 0)
    },
    /**
     * 创建订单
     * @returns 订单 id
     */
    async createOrder() {
      return fetch("/api/v1/payment/create/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        // 发送购物车内容
        // 具体传参需要和后台约定
        body: JSON.stringify({ cart })
      })
        .then(response => response.json())
        .then(order => order.id)
    },
    /**
     * 核准订单
     * @param { Object } data 订单数据
     * @param { Object } action 操作对象
     * @returns
     */
    async onApprove(data, action) {
      return fetch(`/api/v1/payment/capture/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        // 传递订单 ID
        // 具体传参需要和后台约定
        body: JSON.stringify({
          orderId: data.orderID
        })
      })
        .then(response => response.json())
        .then(order => {
          // 被拒绝 需要重试
          const error = order?.details?.[0]
          if (error?.issue === 'INSTRUMENT_DECLINED') {
            return action.restart()
          }
          // 错误发生
          else if (error) {
            throw new Error(`${error?.description} ${error?.debug_id}`)
          }
          // 没有购物车数据
          else if (!order?.purchase_units) {
            throw new Error(JSON.stringify(error))
          } else {
            console.log({ order })
          }
        })
    }
  })
    .render('#paypal-button-container')
}
