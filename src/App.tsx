import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setLoading, setError } from "./slices/chatSlice";
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// TODO: Replace `RootState` with the actual type of your Redux store
// Example: import type { RootState } from "./store";
type RootState = {
  chat: {
    chatHistory: { role: string; content: string }[];
    loading: boolean;
  };
};

function App() {
  const [input, setInput] = useState("");
  const dispatch = useDispatch();

  // Typed ref: This fixes "Property 'scrollIntoView' does not exist on type 'never'"
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const { chatHistory, loading } = useSelector(
    (state: RootState) => state.chat
  );

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!backendURL) {
      console.error("Backend URL is missing! Check .env or VITE_BACKEND_URL");
    }
    const userMessage: ChatMessage = { role: "user", content: input };
    dispatch(addMessage(userMessage));
    dispatch(setLoading(true));
    setInput("");

    try {
      const res = await fetch(`${backendURL}/ask_llm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await res.json();
      const botText =
        data?.response?.choices?.[0]?.message?.content?.trim() ||
        "No response text.";
      const botMessage: ChatMessage = { role: "assistant", content: botText };
      dispatch(addMessage(botMessage));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      dispatch(setError(err.message));
      dispatch(
        addMessage({ role: "assistant", content: `Error: ${err.message}` })
      );
    }

    dispatch(setLoading(false));
  };

  return (
    <div
      className="App"
      style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}
    >
      <h2>Chat with Tithi</h2>

      <div
        style={{
          height: "400px",
          overflowY: "auto",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "1rem",
          backgroundColor: "#fafafa",
          marginBottom: "1rem",
        }}
      >
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              marginBottom: "0.75rem",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "0.6rem",
                borderRadius: "1rem",
                backgroundColor: msg.role === "user" ? "#dcf8c6" : "#f0f0f0",
                maxWidth: "80%",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <textarea
        rows={3}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        style={{ padding: "0.5rem 1rem" }}
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
export default App;
