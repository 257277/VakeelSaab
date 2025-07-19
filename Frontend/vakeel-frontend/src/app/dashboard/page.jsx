'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { connectSocket } from '@/lib/socket';
import { API_BASE_URL } from '@/lib/constants';

export default function DashboardPage() {
    const router = useRouter();
    const [role, setRole] = useState('');
    const [username, setUsername] = useState('');
    const [lawyers, setLawyers] = useState([]);
    const [status, setStatus] = useState('');
    const [incomingCall, setIncomingCall] = useState(null);
    const [audioIncomingCall, setAudioIncomingCall] = useState(null);
    const wsRef = useRef(null);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const storedRole = sessionStorage.getItem('role');
        const storedUsername = sessionStorage.getItem('username');

        if (!token) {
            router.push('/login');
            return;
        }

        setRole(storedRole);
        setUsername(storedUsername);

        wsRef.current = connectSocket(token, handleSocketMessage);
        return () => wsRef.current?.close();
    }, []);

    function handleSocketMessage(msg) {
        if (msg.type === 'lawyer_list') {
            setLawyers(msg.data);
        } else if (msg.type === 'call-request' && sessionStorage.role === 'LAWYER') {
            console.log("call-request to lawyer", incomingCall)
            setIncomingCall({ from: msg.data.from });
            console.log("call-request to lawyer", incomingCall)
        } else if(msg.type === 'audio-call-request' && sessionStorage.role === 'LAWYER')
            {
            console.log("call-request to lawyer", audioIncomingCall)
            setAudioIncomingCall({ from: msg.data.from });
            console.log("call-request to lawyer", audioIncomingCall)
            }
        else if (msg.type === 'room-joined') {
            router.push(`/room/${msg.roomId}`);
        }else if(msg.type==="audio-room-joined")
        {
            router.push(`/audioRoom/${msg.roomId}`)
        }
    }

    const updateStatus = async (newStatus) => {
        try {
            const res = await fetch(`${API_BASE_URL}/lawyers/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setStatus(newStatus);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleCallRequest = (lawyerUsername) => {
        console.log("calling lawyer", lawyerUsername)
        wsRef.current.send(
            JSON.stringify({ type: 'call-request', to: lawyerUsername })
        );
    };
    const handleAudioCallRequest= (lawyerUsername) => {
        console.log("calling lawyer", lawyerUsername)
        wsRef.current.send(
            JSON.stringify({ type: 'audio-call-request', to: lawyerUsername })
        );
    };

    const handleCallAccept = () => {
        if (incomingCall) {
            console.log("incomming call", incomingCall);
            wsRef.current.send(
                JSON.stringify({
                    type: 'call-accept',
                    to: incomingCall.from,
                    data: { clientUsername: incomingCall.from }
                })
            );
            setIncomingCall(null);
        }
    };
    const handleAudioCallAccept=()=>
    {
        if (audioIncomingCall) {
            console.log("incomming call", audioIncomingCall);
            wsRef.current.send(
                JSON.stringify({
                    type: 'audio-call-accept',
                    to: audioIncomingCall.from,
                    data: { clientUsername: audioIncomingCall.from }
                })
            );
            setAudioIncomingCall(null);
        } 
    }

    const handleCallDecline = () => {
        setIncomingCall(null);
        setAudioIncomingCall(null);
    };

    if (!role) return <p>Loading...</p>;

    return (
        <main className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Dashboard ({role})</h1>

            {role === 'CLIENT' ? (
                <>
                    <h2 className="text-xl font-semibold mb-2">Available Lawyers</h2>
                    <ul className="space-y-2">
                        {lawyers.map((lawyer) => (
                            <li
                                key={lawyer.username}
                                className="p-2 border rounded flex justify-between items-center"
                            >
                                <span>{lawyer.username}</span>
                                <span
                                    className={`text-sm px-2 py-1 rounded ${lawyer.status === 'ONLINE'
                                            ? 'bg-green-200 text-green-800'
                                            : lawyer.status === 'BUSY'
                                                ? 'bg-yellow-200 text-yellow-800'
                                                : 'bg-gray-200 text-gray-800'
                                        }`}
                                >
                                    {lawyer.status}
                                </span>
                                {lawyer.status === 'ONLINE' && (
                                    <div className="ml-4 flex space-x-2">
                                        <button
                                            className="bg-blue-500 text-white px-3 py-1 rounded"
                                            onClick={() => handleCallRequest(lawyer.username)}
                                        >
                                            Call
                                        </button>
                                        <button
                                            className="bg-green-500 text-white px-3 py-1 rounded"
                                            onClick={() => handleAudioCallRequest(lawyer.username)}
                                        >
                                            Audio Call
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <>
                    <h2 className="text-xl font-semibold mb-2">Your Status</h2>
                    <div className="flex gap-4 items-center">
                        <button
                            className={`py-1 px-3 rounded ${status === 'ONLINE' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
                            onClick={() => updateStatus('ONLINE')}
                        >
                            ONLINE
                        </button>
                        <button
                            className={`py-1 px-3 rounded ${status === 'BUSY' ? 'bg-yellow-500 text-white' : 'bg-gray-300'}`}
                            onClick={() => updateStatus('BUSY')}
                        >
                            BUSY
                        </button>
                    </div>

                    {incomingCall && (
                        <div className="mt-6 p-4 border rounded bg-yellow-100">
                            <p className="mb-2 font-semibold">
                                Incoming call from <strong>{incomingCall.from}</strong>
                            </p>
                            <div className="flex gap-4">
                                <button
                                    className="bg-green-500 text-white px-3 py-1 rounded"
                                    onClick={handleCallAccept}
                                >
                                    Accept
                                </button>
                                <button
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                    onClick={handleCallDecline}
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    )}
                     {audioIncomingCall && (
                        <div className="mt-6 p-4 border rounded bg-yellow-100">
                            <p className="mb-2 font-semibold">
                                Incoming call from <strong>{audioIncomingCall.from}</strong>
                            </p>
                            <div className="flex gap-4">
                                <button
                                    className="bg-green-500 text-white px-3 py-1 rounded"
                                    onClick={handleAudioCallAccept}
                                >
                                    Accept
                                </button>
                                <button
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                    onClick={handleCallDecline}
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}
