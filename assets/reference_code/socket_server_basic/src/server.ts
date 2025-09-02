import { Hono } from "hono";
import { cors } from "hono/cors";
import { authenticator } from "./authenticator";
import { authorizer } from "./authorizer";
import { pusherServer } from "./pusher-server";
import { pusherClient } from "./pusher-client";

const app = new Hono();

app.use(cors());

const server = pusherServer();
const client = pusherClient(process.env.AUTH_TOKEN);

app.post("/pusher/user-auth", async (c) => {
	const body = await c.req.parseBody();
	const { socket_id } = body as any;
	const token = c.req.header("Authorization")?.replace("Bearer ", "") || "";
	const user = await authenticator({ token });
	const auth = server.authenticateUser(socket_id, {
		id: user.user_id,
		user_info: user,
	});
	console.log(auth);
	return c.json(auth, 200);
});

let socketId: string | undefined;

app.post("/pusher/auth", async (c) => {
	const body = await c.req.parseBody();
	const { socket_id, channel_name } = body as any;
	socketId = socket_id;
	console.log("Socket ID:", socketId);
	const token = c.req.header("Authorization")?.replace("Bearer ", "") || "";
	await authorizer({ token, channel_name });
	const auth = server.authorizeChannel(socket_id, channel_name);
	console.log(channel_name, auth);
	return c.json(auth, 200);
});

export default {
	port: 8080,
	fetch: app.fetch,
};

await new Promise((resolve) => setTimeout(resolve, 3000));

setInterval(async () => {
	console.log("Triggering public channel event...");

	await server
		.trigger(
			"public-channel",
			"client-data",
			JSON.stringify({ message: "Hello from Pusher server!" }),
		)
		.then(() => {
			console.log("Event triggered successfully on public channel.");
		})
		.catch((error) => {
			console.error("Error triggering public channel event:", error);
		});
}, 5000);
setInterval(async () => {
	console.log("Triggering private-encrypted-admin channel event...", socketId);
	await server.trigger("private-encrypted-admin", "some-event", {
		message: "Hello from Pusher server!",
	});
}, 3000);

client.connection.bind("error", (error: any) => {
	console.error("Pusher error:", error);
});

client.connection.bind("state_change", (states: any) => {
	console.log("Connection state changed:", states);
});

client.connection.bind("connected", () => {
	console.log("Pusher client on server connected successfully!");
});

client.subscribe("public-channel").bind("client-data", (data: any) => {
	console.log("Received data from public-channel on server:", data);
});

const peadmin = client
	.subscribe("private-encrypted-admin")
	.bind("some-event", (data: any) => {
		console.log(
			"Received data from private-encrypted-admin channel on server:",
			data,
		);
	});

peadmin.bind("pusher:subscription_succeeded", (data: any) => {
	console.log(
		"Successfully subscribed to private-encrypted-admin channel on server",
		data,
	);
});
peadmin.bind("pusher:subscription_error", (error: any) => {
	console.error(
		"Subscription error for private-encrypted-admin channel on server:",
		error,
	);
});
