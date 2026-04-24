import amqp from "amqplib";

let channel: amqp.Channel;

export async function connectRabbitMQ() {
  const connection = await amqp.connect(
    process.env.RABBITMQ_URL || "amqp://rabbitmq",
  );

  channel = await connection.createChannel();

  await channel.assertQueue("orders", {
    durable: true,
  });

  return channel;
}

export function getChannel() {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }

  return channel;
}
