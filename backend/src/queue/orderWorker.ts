import { connectRabbitMQ } from "../config/rabbitmq";
import { matchOrder } from "./orderMatching";

async function startWorker() {
  const channel = await connectRabbitMQ();

  await channel.assertQueue("orders", { durable: true });

  channel.prefetch(1);

  channel.consume("orders", async (msg) => {
    if (!msg) return;

    try {
      const { orderId } = JSON.parse(msg.content.toString());

      console.log(`Worker processing order ${orderId}`);

      await matchOrder(orderId);

      channel.ack(msg);
    } catch (error) {
      console.error("Worker error:", error);

      channel.nack(msg, false, true);
    }
  });

  console.log("Worker is listening for orders...");
}

startWorker();
