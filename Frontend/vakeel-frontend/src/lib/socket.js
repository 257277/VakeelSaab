export function connectSocket(token, onMessage) {
    const socket = new WebSocket(`ws://localhost:8000?token=${token}`);

    socket.onopen = () => {
        console.log("✅ WebSocket connected");
    };

    socket.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            console.log("📨 WebSocket received:", msg); // for debugging
            onMessage(msg); // ✅ call the message handler passed from DashboardPage
        } catch (err) {
            console.error("❌ Error parsing WebSocket message:", err);
        }
    };

    socket.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
    };

    socket.onclose = () => {
        console.warn("⚠️ WebSocket closed");
    };

    return socket;
}
