import Pusher from "pusher";

export const pusherServer = () =>
	new Pusher({
		appId: process.env.SOKETI_SERVICE_USER || "",
		key: process.env.SOKETI_SERVICE_KEY || "",
		secret: process.env.SOKETI_SERVICE_SECRET || "",
		cluster: "", // Use the appropriate cluster for your Soketi instance
		useTLS: true,
		host: process.env.SOKETI_HOST || "ws.phytertek.com",
		// port: process.env.SOKETI_PORT || "6001",
		encryptionMasterKeyBase64: process.env.SOKET_ENCRYPTION_MASTER_KEY_BASE64,
	});
