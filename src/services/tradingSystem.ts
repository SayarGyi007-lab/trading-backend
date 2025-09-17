import prisma from "../prisma/client"

export const processNewOrder = async (orderId: number) => {
  const newOrder = await prisma.orders.findUnique({
    where: { order_id: orderId },
    include: { order_type: true }
  })

  if (!newOrder) {
    throw new Error("No orders found")
  }

  const isBuy = newOrder.order_type.name === "BUY"
  const isSell = newOrder.order_type.name === "SELL"

  if (!isBuy && !isSell) {
    throw new Error("Invalid new order")
  }

  let remainingVolume = newOrder.volume

  if (isBuy) {
    const sellOrders = await prisma.orders.findMany({
      where: {
        product_id: newOrder.product_id,
        order_type: { name: "SELL" },
        price: { lt: newOrder.price },
        volume: { gt: 0 }
      },
      orderBy: [{ price: "asc" }, { timestamp: "asc" }]
    })

    for (const sell of sellOrders) {
      if (remainingVolume <= 0) break

    
      if (sell.user_id === newOrder.user_id) continue

      if (sell.unit !== newOrder.unit) continue

      const tradeVolume = Math.min(remainingVolume, sell.volume)

      await prisma.matching_table.create({
        data: {
          seller_user_id: sell.user_id,
          buyer_user_id: newOrder.user_id,
          product_id: newOrder.product_id,
          price: sell.price,
          buy_price: newOrder.price,
          volume: tradeVolume,
          unit:newOrder.unit
        }
      })

      await prisma.orders.update({
        where: { order_id: sell.order_id },
        data: { volume: sell.volume - tradeVolume }
      })

      remainingVolume -= tradeVolume
    }
  } else if (isSell) {
    const buyOrders = await prisma.orders.findMany({
      where: {
        product_id: newOrder.product_id,
        order_type: { name: "BUY" },
        price: { gt: newOrder.price },
        volume: { gt: 0 }
      },
      orderBy: [{ price: "desc" }, { timestamp: "asc" }]
    })

    for (const buy of buyOrders) {
      if (remainingVolume <= 0) break

      if (buy.user_id === newOrder.user_id) continue

      if (buy.unit !== newOrder.unit) continue

      const tradeVolume = Math.min(remainingVolume, buy.volume)

      await prisma.matching_table.create({
        data: {
          seller_user_id: newOrder.user_id,
          buyer_user_id: buy.user_id,
          product_id: newOrder.product_id,
          price: newOrder.price,
          buy_price: buy.price,
          volume: tradeVolume,
          unit: newOrder.unit
        }
      })

      await prisma.orders.update({
        where: { order_id: buy.order_id },
        data: { volume: buy.volume - tradeVolume }
      })

      remainingVolume -= tradeVolume
    }
  }

  // Update the new order volume after matching attempts
  await prisma.orders.update({
    where: { order_id: newOrder.order_id },
    data: { volume: remainingVolume }
  })

  return { message: "Order processed", remainingVolume }
}
