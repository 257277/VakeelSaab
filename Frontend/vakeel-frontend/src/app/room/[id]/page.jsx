'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams,useRouter } from 'next/navigation';

export default function RoomPage() {
    const router = useRouter();
    const { id: roomId } = useParams();
    const [username, setUsername] = useState('');
    const [token, setToken] = useState('');
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const wsRef = useRef(null);

    useEffect(() => {
        const storedUsername = sessionStorage.getItem('username');
        const storedToken = sessionStorage.getItem('token');

        if (!storedUsername || !storedToken) {
            return;
        }

        setUsername(storedUsername);
        setToken(storedToken);
    }, []);

    useEffect(() => {
        if (!token) return;

        const ws = new WebSocket(`ws://localhost:8000/?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connected in Room page');
        };

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            console.log("WS message:", msg);

            if (msg.type === 'chat-message' && msg.message?.trim()) {
                setMessages((prev) => [...prev, { from: msg.from, text: msg.message }]);
            }
            if (msg.type === 'call-ended') {
                alert('Call has ended.');
                router.push('/dashboard');
            }
        };

        return () => {
            ws.close();
        };
    }, [token]);

     const findRoomParticipant = () => {
        const parts = roomId.split('-');
        const usernames = parts.slice(1, 3);
        console.log(usernames)
        return usernames.find((u) => u !== username);
    };
    const endCall = () => {
        const target = findRoomParticipant();
        wsRef.current.send(JSON.stringify({ type: 'call-ended', to: target }));
        router.push('/dashboard');
    };
    const sendMessage = () => {
        if (!input.trim()) return;
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'chat-message',
                data: { roomId, message: input }
            }));
            setMessages((prev) => [...prev, { from: username, text: input }]);
            setInput('');
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl mb-4">Room: {roomId}</h1>
            <div className="h-150 overflow-y-auto border p-2 mb-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`mb-2 ${msg.from === username ? 'text-right' : 'text-left'}`}>
                        <span className="inline-block bg-gray-200 p-2 rounded text-black">
                            {msg.from}: {msg.text}
                        </span>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="border px-2 py-1 flex-1"
                />
                <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-1 rounded">
                    Send
                </button>
                <button
                    onClick={endCall}
                    className="bg-red-500 text-white px-4 py-2 rounded mt-4"
                >
                    End Call
                </button>
            </div>
        </div>
    );
}
