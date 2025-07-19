
# 🧑‍⚖️ VakeelSaab – Real-Time Legal Consultation Backend

This is the backend system for **VakeelSaab**, a real-time lawyer-client consultation platform. It supports features like registration, login, lawyer availability, WebSocket-powered real-time audio calls, chat, and room management.

---

## 🛠 Tech Stack

- **Node.js**
- **Express.js**
- **WebSocket (ws)**
- **bcrypt** (for password hashing)
- **JWT (jsonwebtoken)** (for auth)
- **JSON file storage** (users.json)

---

## 📁 Project Structure

```
project-root/
├── data/
│   └── users.json              # Stores registered users and their details
├── middleware/
│   └── authMiddleware.js       # Token verification middleware
├── routes/
│   ├── authRoutes.js           # Register & login APIs
│   └── lawyerRoutes.js         # Lawyer status update API
├── utils/
│   └── fileStore.js            # Load/save JSON user data
├── ws/
│   └── wsServer.js             # WebSocket server for real-time communication
├── index.js                    # Main Express and WebSocket server entry
└── README.md                   # You're here
```

---

## 🔐 Authentication

- JWT is used for authenticating REST and WebSocket connections.
- Token is returned on `/auth/login` and must be passed:
  - As `Authorization: Bearer <token>` for REST.
  - As a `token` query param in the WebSocket URL.

---

## 🚀 API Endpoints

### `POST /auth/register`

Registers a new user.

**Body:**
```json
{
  "username": "a",
  "password": "secret",
  "role": "CLIENT"  // or "LAWYER"
}
```

---

### `POST /auth/login`

Returns a JWT token upon valid credentials.

**Body:**
```json
{
  "username": "a",
  "password": "secret"
}
```

---

### `POST /lawyers/status`

Updates lawyer's availability.  
**Requires JWT token**

**Body:**
```json
{
  "status": "ONLINE"  // or "BUSY"
}
```

---

## 🌐 WebSocket Events

### Client connection:
Connect to WebSocket like this:

```
ws://localhost:8000?token=YOUR_JWT_TOKEN
```

### Supported message types:

#### 1. `call-request`
Client → Lawyer

#### 2. `call-accept`
Lawyer → Client

Creates a room and updates lawyer status to `BUSY`.

#### 3. `audio-call-request`
Client → Lawyer

#### 4. `audio-call-accept`
Lawyer → Client

#### 5. `chat-message`
```json
{
  "type": "chat-message",
  "data": {
    "roomId": "...",
    "message": "Hello!"
  }
}
```

#### 6. `audio-message`
For streaming or chunked audio data.

---

#### 7. WebRTC signaling messages

- `offer`
- `answer`
- `ice-candidate`

Used for WebRTC peer connection setup.

---

#### 8. `call-ended`

Ends a session and sets lawyer back to `ONLINE`.

---

## 🧠 State Management

- **Users** stored in `data/users.json`
- **WebSocket connections** tracked in a `Map` (username → socket)
- **Rooms** stored in memory (`roomId` → `{ lawyer, client }`)

---

## 📦 Installation & Running

```bash
# Install dependencies
npm install

# Start server
node index.js
npm run server
```

Server will be available at:  
🌐 `http://localhost:8000`  
🔌 WebSocket: `ws://localhost:8000?token=...`


## 👨‍💻 Author

**Rahul Sharma**


# 🧑‍💻 VakeelSaab – Real-Time Legal Consultation Frontend

This is the frontend for **VakeelSaab**, a real-time consultation platform connecting lawyers and clients via live chat and audio calls.

---

## 🛠 Tech Stack

- **Next.js (App Router)**
- **React**
- **Tailwind CSS**
- **WebSocket** for real-time interactions
- **WebRTC** for audio calls
- **JWT** for authentication

---

## 📁 Project Structure

```
project-root/
├── src/
│   ├── app/
│   │   ├── login/                # Login page
│   │   ├── register/             # Registration page
│   │   ├── room/[id]/            # Dynamic room page
│   │   └── layout.jsx            # App layout and navigation
│   ├── components/              # Reusable UI components
│   └── styles/                  # Tailwind and global styles
├── public/                      # Static assets
├── utils/                       # Token & WebSocket helpers
├── .env.local                   # Environment variables
└── README.md                    # You're here
```

---

## 🔐 Authentication

- JWT token is stored in `localStorage`
- Token is passed via query string during WebSocket connection:
  ```
  ws://localhost:8000?token=YOUR_JWT_TOKEN
  ```

---

## 🔌 WebSocket Integration

**WebSocket Events:**

- `call-request`
- `call-accept`
- `chat-message`
- `audio-call-request`
- `audio-call-accept`
- `audio-message`
- `call-ended`
- WebRTC: `offer`, `answer`, `ice-candidate`

---

## 🎥 Audio Call Setup

- Audio handled using **WebRTC**.
- Peer connection initialized on `call-accept`.
- `MediaStream` is added to audio tag for playback.

---

## 💬 Chat Support

- Real-time chat via WebSocket.
- Messages synced with room context.
- Chat component listens for `chat-message` type.

---

## 🧪 Sample `.env.local`

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

---

## 📦 Getting Started

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev

# Open in browser
http://localhost:3000
```

## 👨‍💻 Author

**Rahul Sharma**

