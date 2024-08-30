// @ts-check

const formID = 'payment-form'

/**
 * 表单样式
 */
const formStyle = {
  frameMaxHeight: 200, //  iframe高度
  input: {
    FontSize: '16', // 输入框字体大小
    FontFamily: 'Arial', // 输入框字体类型
    FontWeight: '400', // 输入框字体粗细
    BorderRadius: '10px', // 输入框圆角
    Color: '#333', // 输入框字体颜色
    ContainerBorder: '1px solid #d9d9d9', // 输入框边框
    ContainerPadding: '20px 10px', // 输入框内边距
    ContainerBg: '#fff', // 输入框背景色
    ContainerSh: 'none' // 输入框阴影
  },
  // 需要展示背景区域时，自定义的样式
  background: {
    FontSize: '14', // 背景区域字体大小
    FontFamily: 'Arial', // 背景字体类型
    FontWeight: '600', // 背景字体粗细
    Color: '#333', // 背景字体颜色
    BgColor: '#fff', // 背景颜色
    Width: '100%', // 背景宽度
    Height: 'auto', // 背景高度
    BgPadding: '20px', // 背景内边距
    BorderRadius: '10px', // 背景圆角
    TextIndent: '10px', // 背景文本缩进
    LineHeight: '24px', // 背景文本行高
    BoxShadow: 'none' // 背景阴影
  }
}

/**
 * 表单配置
 */
const formConfig = {
  formId: formID, // 页面表单id
  formWrapperId: 'ab-card-element', // 表单内层id
  frameId: 'PrivateFrame', // 生成的IframeId
  customerId: '<当前支付流程的客户Id>',
  lang: 'zh-CN', // 表单校验信息国际化参数，目前支持ar(阿拉伯语),ja(日语),ko(韩语),en(英语),zh-CN(简体中文)；不传时如果当前浏器语言为日语、韩语、英语和简体中文中的一种，则会显示该种语言；否则默认展示英语
  needCardList: true,
  autoValidate: true, // 是否自动展示校验错误信息， 目前支持在表单提交事件或提交按钮点击事件中触发信息校验，false时监听`getErrorMessage`事件获取错误信息
  supportedCards: ['visa', 'jcb', 'unionPay', 'ae', 'master', 'discover'], // 传入时，显示商户支持的卡种类型logo
  layout: {
    pageMode: 'block', // 页面风格模式  inner | block
    style: formStyle
  }
}

/**
 * 支付对象
 */
const paymentObject = {
  billingDetail: {
    address: {
      city: 'sz',
      country: 'CN',
      line1: 'BaoAnQu',
      lin2: "XinHuJieDao",
      postalCode: "518000",
      state: "state"
    },
    email: "test@example.com",
    firstName: "CL",
    lastName: "BRW1",
    phone: "13249432555"
  },
  // https://asiabill.gitbook.io/docs/zhi-fu/zai-xian-zhi-fu/zhan-nei-zhi-fu#id-3.-chuang-jian-zhi-fu-fang-shi-web
  // customerID: "<当前支付用户 ID>"
}

/**
 * 初始化 asiabill
 * @param { string } sessionToken 会话 token 用于初始化 asiabill 表单
 * @returns asiabill 实例
 */
function initAb(sessionToken = '') {
  const ab = AsiabillPay(sessionToken)
  ab.elementInit('payment_steps', formConfig)
    .then(res => {
      // 其他操作
      console.log({ res })
    })

  ab.updateStyle(formStyle).then(res => {
    // 动态更新样式
  })
  return ab
}

/**
 * 获取会话 token
 * @returns 会话 token
 */
async function getSessionToken() {
  return fetch('/api/v1/asiabill/session', {
    method: 'POST'
  })
    .then(response => response.json())
    .then(data => data.data.sessionToken)
    .catch(err => {
      console.dir(err)
    })
}


/**
 * 提交订单
 * @param { Object } ab ab 实例
 * @param { string } sessionToken 会话 token
 * @returns 提交订单回调
 */
function generateSubmitOrder(ab, sessionToken) {

  /**
   * 提交表单
   * @param { SubmitEvent } e 提交对象
   */
  return function submitOrder(e) {
    e.preventDefault()

    const firstName = document.getElementById('firstName').value
    const lastName = document.getElementById('lastName').value

    paymentObject.billingDetail.firstName = firstName
    paymentObject.billingDetail.lastName = lastName

    ab.confirmPaymentMethod({
      apikey: sessionToken,
      trnxDetail: paymentObject
    })
      .then(res => {
        fetch('/api/v1/asiabill/confirm')
      })
  }
}

window.onload = async () => {
  const sessionToken = await getSessionToken()
  const ab = initAb(sessionToken)

  document.getElementById(formID).addEventListener('submit', generateSubmitOrder(ab, sessionToken))
}
