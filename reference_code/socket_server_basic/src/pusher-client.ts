import Pusher from "pusher-js";

export const pusherClient = (token = process.env.AUTH_TOKEN) =>
	new Pusher(process.env.SOKETI_SERVICE_KEY || "", {
		wsHost: process.env.SOKETI_HOST || "localhost",
		wsPort: Number.parseInt(process.env.SOKETI_PORT ?? "6001", 10),
		disableHostPrefix: true,
		forceTLS: true,
		disableStats: true,
		enabledTransports: ["ws", "wss"],
		cluster: "",
		userAuthentication: {
			endpoint: "http://localhost:8080/pusher/user-auth",
			transport: "ajax",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
		channelAuthorization: {
			endpoint: "http://localhost:8080/pusher/auth",
			transport: "ajax",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
		encryptionMasterKeyBase64: process.env.SOKET_ENCRYPTION_MASTER_KEY_BASE64,
	} as any);
