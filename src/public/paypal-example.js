// @ts-check

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

/**
 * 创建 PayPal 订单
 * @returns 订单信息
 */
const createPayPalOrder = () => {
  return fetch("/api/v1/paypal/create/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    // 发送购物车内容
    // 具体传参需要和后台约定
    body: JSON.stringify({ cart })
  })
}

/**
 * 核准订单信息
 * @returns 核准信息
 */
const capturePayPalOrder = () => {
  return fetch(`/api/v1/paypal/capture/order`, {
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
}

const qs = (queryString = '') => queryString ? Object.fromEntries(queryString.slice(1).split('&').map(p => p.split('='))) : null

window.onload = () => {
  const text = document.getElementById('text')

  const outPayPalButton = document.getElementById('out-paypal')

  function setText(message = '') {
    text.innerText = message
  }

  const params = qs(window.location.search)
  if (params) {
    setText([
      `订单号: ${params.order}`,
      `总价: ${params.total}`,
      `支付状态: ${params.status}`
    ].join('\n'))
  }

  outPayPalButton.addEventListener('click', () => {
    setText('外部跳转')
    createPayPalOrder()
      .then(response => response.json())
      .then(order => order.links[1].href)
      .then(link => {
        setText('开始跳转')
        window.location.href = link
      })
      .catch(() => setText('跳转失败'))
  })

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

      setText('创建订单')

      return createPayPalOrder()
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

      setText('核准订单')

      return capturePayPalOrder()
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
            setText('没有购物车数据')
            throw new Error(JSON.stringify(error))
          } else {
            console.log({ order })
            setText('订单完成:\n' + JSON.stringify(order))
          }
        })
    }
  })
    .render('#paypal-button-container')
}
