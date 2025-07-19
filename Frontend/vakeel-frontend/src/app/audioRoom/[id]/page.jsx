'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { connectSocket } from '@/lib/socket';

export default function AudioRoomPage() {
    const { id: roomId } = useParams();
    const router = useRouter();

    const localAudioRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const peerRef = useRef(null);
    const wsRef = useRef(null);

    const [username, setUsername] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const username = sessionStorage.getItem('username');
        if (!token || !username) {
            router.push('/login');
            return;
        }

        setToken(token);
        setUsername(username);

        // connect to socket
        wsRef.current = connectSocket(token, handleSocketMessage);

        // initialize media and peer connection
        initAudio();

        return () => {
            wsRef.current?.close();
            peerRef.current?.close();
        };
    }, []);

    const handleSocketMessage = async (msg) => {
        if (msg.type === 'offer') {
            await peerRef.current.setRemoteDescription(new RTCSessionDescription(msg.data));
            const answer = await peerRef.current.createAnswer();
            await peerRef.current.setLocalDescription(answer);
            sendMessage('answer', msg.from, answer);
        } else if (msg.type === 'answer') {
            await peerRef.current.setRemoteDescription(new RTCSessionDescription(msg.data));
        } else if (msg.type === 'ice-candidate') {
            try {
                await peerRef.current.addIceCandidate(new RTCIceCandidate(msg.data));
            } catch (err) {
                console.error('Error adding ICE candidate:', err);
            }
        } else if (msg.type === 'call-ended') {
            alert('Call ended');
            router.push('/dashboard');
        }
    };

    const sendMessage = (type, to, data) => {
        wsRef.current.send(JSON.stringify({ type, to, data }));
    };

    const initAudio = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            localAudioRef.current.srcObject = stream;

            const peer = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            peerRef.current = peer;

            stream.getTracks().forEach((track) => peer.addTrack(track, stream));

            peer.onicecandidate = (e) => {
                if (e.candidate) {
                    const target = findRoomParticipant();
                    if (target) sendMessage('ice-candidate', target, e.candidate);
                }
            };

            peer.ontrack = (e) => {
                remoteAudioRef.current.srcObject = e.streams[0];
            };

            // Create offer if you're the initiator
            const isInitiator = roomId.includes(username);
            if (isInitiator) {
                const offer = await peer.createOffer();
                await peer.setLocalDescription(offer);

                const target = findRoomParticipant();
                if (target) sendMessage('offer', target, offer);
            }
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone');
            router.push('/dashboard');
        }
    };

    const findRoomParticipant = () => {
        const parts = roomId.split('-');
        const usernames = parts.slice(2, 4);
        return usernames.find((u) => u !== username);
    };

    const endCall = () => {
        const target = findRoomParticipant();
        wsRef.current.send(JSON.stringify({ type: 'call-ended', to: target }));
        router.push('/dashboard');
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Audio Room</h2>
            <div className="space-y-4">
                <div>
                    <p className="font-medium">You</p>
                    <audio ref={localAudioRef} autoPlay muted controls />
                </div>
                <div>
                    <p className="font-medium">Partner</p>
                    <audio ref={remoteAudioRef} autoPlay controls className="w-full mb-4" />
                </div>
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
