import { useState } from "react";
import axios from "axios";
import noranImage from "./assets/noran.webp";

const USER_API = import.meta.env.VITE_USER_SERVICE_URL;
const MESSAGE_API = import.meta.env.VITE_MESSAGE_SERVICE_URL;

function App() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  const [senderId, setSenderId] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState([]);

  const register = async () => {
    const res = await axios.post(`${USER_API}/users/register`, {
      username,
      email,
      password,
    });
    alert(`Registered user ID: ${res.data.id}`);
  };

  const login = async () => {
    const res = await axios.post(`${USER_API}/users/login`, {
      email,
      password,
    });
    setToken(res.data.token);
    alert("Login successful");
  };

  const sendMessage = async () => {
    await axios.post(`${MESSAGE_API}/messages`, {
      sender_id: Number(senderId),
      receiver_id: Number(receiverId),
      content,
    });
    alert("Message sent");
  };

  const getMessages = async () => {
    const res = await axios.get(
      `${MESSAGE_API}/messages/${senderId}/${receiverId}`
    );
    setMessages(res.data);
  };

  const COLORS = {
    bg: "#0f0f0f",
    white: "#ffffff",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.white,
        fontFamily: "Inter, sans-serif",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            border: `1px solid ${COLORS.white}`,
            borderRadius: "24px",
            padding: "32px",
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            background: COLORS.bg,
          }}
        >
          <img
            src={noranImage}
            alt="Chat"
            style={{
              width: "90px",
              height: "90px",
              objectFit: "cover",
              borderRadius: "20px",
              border: `1px solid ${COLORS.white}`,
              padding: "8px",
            }}
          />

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "38px",
                fontWeight: "700",
              }}
            >
              Cloud Chat
            </h1>

          </div>
        </div>

        {/* CONTENT */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
            gap: "24px",
          }}
        >
          {/* USER SERVICE */}
          <div style={cardStyle(COLORS)}>
            <h2 style={titleStyle}>User Service</h2>

            <input
              style={inputStyle(COLORS)}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />

            <input
              style={inputStyle(COLORS)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />

            <input
              style={inputStyle(COLORS)}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
            />

            <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
              <button style={buttonStyle(COLORS)} onClick={register}>
                Register
              </button>

              <button style={buttonStyle(COLORS)} onClick={login}>
                Login
              </button>
            </div>

            {token && (
              <div
                style={{
                  marginTop: "22px",
                  border: `1px solid ${COLORS.white}`,
                  borderRadius: "16px",
                  padding: "16px",
                  overflowWrap: "break-word",
                }}
              >
                <strong>JWT Token</strong>

                <p
                  style={{
                    marginTop: "10px",
                    opacity: 0.75,
                    fontSize: "13px",
                  }}
                >
                  {token}
                </p>
              </div>
            )}
          </div>

          {/* MESSAGE SERVICE */}
          <div style={cardStyle(COLORS)}>
            <h2 style={titleStyle}>Message Service</h2>

            <input
              style={inputStyle(COLORS)}
              value={senderId}
              onChange={(e) => setSenderId(e.target.value)}
              placeholder="Sender ID"
            />

            <input
              style={inputStyle(COLORS)}
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              placeholder="Receiver ID"
            />

            <input
              style={inputStyle(COLORS)}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Message"
            />

            <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
              <button style={buttonStyle(COLORS)} onClick={sendMessage}>
                Send
              </button>

              <button style={buttonStyle(COLORS)} onClick={getMessages}>
                Messages
              </button>
            </div>

            <div style={{ marginTop: "24px" }}>
              <h3
                style={{
                  marginBottom: "14px",
                  fontWeight: "600",
                }}
              >
                Conversation
              </h3>

              {messages.length === 0 ? (
                <div
                  style={{
                    border: `1px solid ${COLORS.white}`,
                    borderRadius: "16px",
                    padding: "18px",
                    opacity: 0.6,
                  }}
                >
                  No messages
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        border: `1px solid ${COLORS.white}`,
                        borderRadius: "16px",
                        padding: "16px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          opacity: 0.6,
                          marginBottom: "8px",
                        }}
                      >
                        {msg.sender_id} → {msg.receiver_id}
                      </div>

                      <div
                        style={{
                          fontSize: "15px",
                          lineHeight: 1.5,
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const cardStyle = (COLORS) => ({
  border: `1px solid ${COLORS.white}`,
  borderRadius: "24px",
  padding: "28px",
  background: COLORS.bg,
});

const titleStyle = {
  marginTop: 0,
  marginBottom: "24px",
  fontSize: "28px",
  fontWeight: "700",
};

const inputStyle = (COLORS) => ({
  width: "100%",
  background: "transparent",
  border: `1px solid ${COLORS.white}`,
  color: COLORS.white,
  padding: "14px",
  borderRadius: "14px",
  marginBottom: "14px",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
});

const buttonStyle = (COLORS) => ({
  background: "transparent",
  color: COLORS.white,
  border: `1px solid ${COLORS.white}`,
  padding: "12px 18px",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: "600",
  transition: "0.2s",
});

export default App;