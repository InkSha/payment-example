type OrderResponseLinks<R extends string, M extends string> = {
  href: string
  rel: R
  method: M
}

export type OrderResponse = {
  id: string
  status: string
  links: Array<
    | OrderResponseLinks<"self", "GET">
    | OrderResponseLinks<"approve", "GET">
    | OrderResponseLinks<"update", "PATCH">
    | OrderResponseLinks<"capture", "POST">
  >
}

export const OrderResponseExample: OrderResponse = {
  id: '订单号',
  status: '订单状态',
  links: [
    { href: '链接', method: 'GET', rel: 'self' },
    { href: '链接', method: 'GET', rel: 'approve' },
    { href: '链接', method: 'PATCH', rel: 'update' },
    { href: '链接', method: 'POST', rel: 'capture' },
  ]
}
