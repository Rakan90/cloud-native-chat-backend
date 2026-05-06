import { useState } from "react";
import axios from "axios";
import "./App.css";

const USER_API = import.meta.env.VITE_USER_SERVICE_URL;
const MESSAGE_API = import.meta.env.VITE_MESSAGE_SERVICE_URL;

function App() {
  const [username, setUsername] = useState("rakan");
  const [email, setEmail] = useState("rakan@example.com");
  const [password, setPassword] = useState("123456");
  const [token, setToken] = useState("");

  const [senderId, setSenderId] = useState("1");
  const [receiverId, setReceiverId] = useState("2");
  const [content, setContent] = useState("Hello");
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
    const res = await axios.get(`${MESSAGE_API}/messages/${senderId}/${receiverId}`);
    setMessages(res.data);
  };

  return (
    <div className="container">
      <h1>Cloud Chat App</h1>

      <section>
        <h2>User Service</h2>

        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />

        <button onClick={register}>Register</button>
        <button onClick={login}>Login</button>

        {token && <p><strong>JWT:</strong> {token}</p>}
      </section>

      <section>
        <h2>Message Service</h2>

        <input value={senderId} onChange={(e) => setSenderId(e.target.value)} placeholder="Sender ID" />
        <input value={receiverId} onChange={(e) => setReceiverId(e.target.value)} placeholder="Receiver ID" />
        <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Message" />

        <button onClick={sendMessage}>Send Message</button>
        <button onClick={getMessages}>Get Messages</button>

        <ul>
          {messages.map((msg) => (
            <li key={msg.id}>
              <strong>{msg.sender_id} → {msg.receiver_id}:</strong> {msg.content}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;