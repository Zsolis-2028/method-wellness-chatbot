import { useState, useRef, useEffect } from "react";

const WELCOME = {
  role: "assistant",
  content: "Hi there! 👋 I'm Method, your virtual front-desk assistant at Method Wellness PT in San Antonio. I can help with our services, booking an appointment, what to expect on your first visit, and more. What can I help you with today?",
};

const QUICK_REPLIES = [
  "What services do you offer?",
  "Book an appointment",
  "First visit — what should I expect?",
  "Directions & parking",
  "Pricing & insurance",
];

const TEAL = "#2A7F7F";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  async function sendMessage(text) {
    const userText = text || input.trim();
    if (!userText || loading) return;

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong! Please call our front desk at 210-526-2428. 😊" },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', 'Segoe UI', sans-serif; background: #f0f4f4; min-height: 100vh; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        input:focus { border-color: ${TEAL} !important; outline: none; }
        .qbtn:hover { background: ${TEAL} !important; color: white !important; }
        .bubble:hover { transform: scale(1.08); }
      `}</style>

      {/* Page background text */}
      <div style={{ textAlign: "center", color: "#2A7F7F", opacity: 0.1, fontSize: 48, fontWeight: 900, paddingTop: 120, userSelect: "none" }}>
        METHOD WELLNESS PT
      </div>

      {/* Floating Bubble */}
      {!open && (
        <button className="bubble" onClick={() => setOpen(true)} style={styles.bubble}>
          <img
            src="https://images.squarespace-cdn.com/content/v1/65ce90e557234b70b68751a3/c45bfdd4-a73a-4c0b-be63-0f2fc81d80ed/Original+Method+Icon.png?format=300w"
            alt="M"
            style={styles.bubbleLogo}
            onError={(e) => { e.target.style.display = "none"; }}
          />
          {unread > 0 && <span style={styles.badge}>{unread}</span>}
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div style={styles.window}>
          <div style={styles.header}>
            <img
              src="https://images.squarespace-cdn.com/content/v1/65ce90e557234b70b68751a3/c45bfdd4-a73a-4c0b-be63-0f2fc81d80ed/Original+Method+Icon.png?format=300w"
              alt="Method Wellness"
              style={styles.headerLogo}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div style={{ flex: 1 }}>
              <div style={styles.headerName}>Method Wellness PT</div>
              <div style={styles.headerSub}>
                <span style={styles.greenDot} /> San Antonio, TX · Online now
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={styles.closeBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div style={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                {msg.role === "assistant" && <div style={styles.botAvatar}>M</div>}
                <div style={msg.role === "user" ? styles.userBubble : styles.botBubble}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
                <div style={styles.botAvatar}>M</div>
                <div style={{ ...styles.botBubble, gap: 5 }}>
                  <span style={styles.dot} />
                  <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
                  <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
                </div>
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div style={styles.quickReplies}>
                {QUICK_REPLIES.map((q) => (
                  <button key={q} className="qbtn" style={styles.quickBtn} onClick={() => sendMessage(q)}>{q}</button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div style={styles.inputRow}>
            <input
              ref={inputRef}
              style={styles.input}
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              style={{ ...styles.sendBtn, opacity: !input.trim() || loading ? 0.4 : 1 }}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          <div style={styles.footer}>
            Method Wellness PT · <a href="tel:2105262428" style={{ color: TEAL, textDecoration: "none" }}>210-526-2428</a>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  bubble: { position: "fixed", bottom: 28, right: 28, width: 64, height: 64, borderRadius: "50%", background: TEAL, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(42,127,127,0.45)", zIndex: 9999, transition: "transform 0.2s" },
  bubbleLogo: { width: 40, height: 40, objectFit: "contain", borderRadius: "50%", background: "white", padding: 4 },
  badge: { position: "absolute", top: -4, right: -4, width: 20, height: 20, borderRadius: "50%", background: "#E05555", color: "white", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white", fontFamily: "sans-serif" },
  window: { position: "fixed", bottom: 28, right: 28, width: 370, height: 560, borderRadius: 20, background: "#F7FAFA", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 9999, fontFamily: "'Inter','Segoe UI',sans-serif", animation: "popIn 0.25s ease" },
  header: { background: TEAL, color: "white", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  headerLogo: { width: 38, height: 38, borderRadius: "50%", objectFit: "contain", background: "rgba(255,255,255,0.15)", padding: 3, border: "2px solid rgba(255,255,255,0.3)", flexShrink: 0 },
  headerName: { fontWeight: 700, fontSize: 14.5, letterSpacing: "-0.01em" },
  headerSub: { fontSize: 11.5, opacity: 0.85, display: "flex", alignItems: "center", gap: 5, marginTop: 2 },
  greenDot: { width: 7, height: 7, borderRadius: "50%", background: "#7EE8A2", display: "inline-block", flexShrink: 0 },
  closeBtn: { background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  messages: { flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column" },
  botAvatar: { width: 28, height: 28, borderRadius: "50%", background: TEAL, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0, marginRight: 7, alignSelf: "flex-end" },
  botBubble: { background: "white", color: "#1A2E2E", borderRadius: "16px 16px 16px 4px", padding: "10px 13px", maxWidth: "80%", fontSize: 13.5, lineHeight: 1.55, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", animation: "fadeIn 0.2s ease", display: "flex", alignItems: "center", gap: 4 },
  userBubble: { background: TEAL, color: "white", borderRadius: "16px 16px 4px 16px", padding: "10px 13px", maxWidth: "80%", fontSize: 13.5, lineHeight: 1.55, boxShadow: "0 1px 4px rgba(42,127,127,0.25)", animation: "fadeIn 0.2s ease" },
  dot: { display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: TEAL, animation: "bounce 1.2s infinite" },
  quickReplies: { display: "flex", flexWrap: "wrap", gap: 7, marginTop: 4, paddingLeft: 35 },
  quickBtn: { background: "white", border: `1.5px solid ${TEAL}`, color: TEAL, borderRadius: 20, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 500, transition: "all 0.15s" },
  inputRow: { display: "flex", gap: 8, padding: "10px 12px", background: "white", borderTop: "1px solid #E0ECEC", alignItems: "center", flexShrink: 0 },
  input: { flex: 1, border: "1.5px solid #C8DEDE", borderRadius: 20, padding: "9px 14px", fontSize: 13.5, background: "#F7FAFA", color: "#1A2E2E", fontFamily: "inherit", transition: "border 0.15s" },
  sendBtn: { width: 38, height: 38, borderRadius: "50%", background: TEAL, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "opacity 0.15s" },
  footer: { textAlign: "center", fontSize: 11, color: "#888", padding: "6px 0 8px", background: "white", flexShrink: 0 },
};
