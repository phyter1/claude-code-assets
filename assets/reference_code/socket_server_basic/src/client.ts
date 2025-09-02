import { pusherClient } from "./pusher-client";
const client = pusherClient(process.env.AUTH_TOKEN);
client.connection.bind("error", (error: any) => {
	console.error("Pusher error:", error);
});

client.connection.bind("state_change", (states: any) => {
	console.log("Connection state changed:", states);
});

client.connection.bind("connected", () => {
	console.log("Pusher connected successfully!");
});

const client_public_channel = client.subscribe("public-channel");
client_public_channel.bind("data", (data: any) => {
	console.log("Received data from public-channel:", data);
});
client_public_channel.bind("client-data", (data: any) => {
	console.log("Received data from public-channel (client-data event):", data);
});
client_public_channel.bind("pusher:subscription_succeeded", () => {
	console.log("Successfully subscribed to public-channel");
});

setInterval(() => {
	client_public_channel.trigger("client-data", {
		message: "Hello from Pusher on the client side!",
	});
}, 3500);

const private_channel = client.subscribe("private-encrypted-admin");
private_channel.bind("some-event", (data: any) => {
	console.log("Received private encrypted admin channel data:", data);
});
private_channel.bind("pusher:subscription_succeeded", (data: any) => {
	console.log(
		"Successfully subscribed to private-encrypted-admin channel",
		data,
	);
});
private_channel.bind("pusher:subscription_error", (error: any) => {
	console.error(
		"Subscription error for private-encrypted-admin channel:",
		error,
	);
});

client.connection.bind("pusher:connection_established", (data: any) => {
	console.log("Pusher connection established:", data);
});

client.connection.bind("disconnected", (foo: any) => {
	console.log("Pusher disconnected.", foo);
});

const client2 = pusherClient(process.env.AUTH_TOKEN);
client2.connection.bind("connected", () => {
	console.log("Pusher client 2 connected successfully!");
});

const client2_private_channel = client2.subscribe("private-encrypted-admin");
client2_private_channel.bind("some-event", (data: any) => {
	console.log(
		"Received private encrypted admin channel data from client 2:",
		data,
	);
});
client2_private_channel.bind("pusher:subscription_succeeded", (data: any) => {
	console.log(
		"Successfully subscribed to private-encrypted-admin channel from client 2",
		data,
	);
});
client2_private_channel.bind("pusher:subscription_error", (error: any) => {
	console.error(
		"Subscription error for private-encrypted-admin channel from client 2:",
		error,
	);
});
