import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // ✅ NEW STATE (welcome tooltip)
  const [showWelcome, setShowWelcome] = useState(true);

  // ✅ NEW STATE (typing indicator)
  const [isTyping, setIsTyping] = useState(false);

  const chatRef = useRef(null);
  const chatEndRef = useRef(null);

  // ✅ Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ✅ Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // ✅ Auto hide welcome
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);

    const currentInput = input;
    setInput("");

    // ✅ SHOW TYPING
    setIsTyping(true);

    const response = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: currentInput }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let botText = "";

    setMessages(prev => [...prev, { role: "bot", text: "" }]);

    let firstChunk = true;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // ✅ Stop typing when response starts
      if (firstChunk) {
        setIsTyping(false);
        firstChunk = false;
      }

      const chunk = decoder.decode(value);
      botText += chunk;

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "bot", text: botText };
        return updated;
      });
    }

    setIsTyping(false);
  };

  return (
    <>
      {/* Welcome Tooltip */}
      {!isOpen && showWelcome && (
        <div className="chat-welcome">
          Hi! I'm <b>Ana</b>, your Axis Bank assistant.<br />
          Need help with banking, cards or loans?
          <span
            className="close-tooltip"
            onClick={() => setShowWelcome(false)}
          >
            ×
          </span>
        </div>
      )}

      {/* Floating Icon */}
      {!isOpen && (
        <div
          className="chat-icon"
          onClick={() => {
            setIsOpen(true);
            setShowWelcome(false);
          }}
        >
          <MessageCircle size={26} />
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <motion.div
          ref={chatRef}
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="chat-container"
        >
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <img
                src="/assets/Intelezen.png"
                alt="Intelezen Logo"
                className="chat-logo"
              />
              <span className="chat-title"></span>
            </div>

            <X size={18} onClick={() => setIsOpen(false)} />
          </div>

          {/* Messages */}
          <div className="chat-box">
            {messages.map((m, i) => (
              <div className={`message ${m.role}`} key={i}>
                {m.text.split("\n").map((line, i) => (
                  <div key={i} style={{ marginBottom: "6px" }}>
                    {line.split(/(https?:\/\/[^\s]+)/g).map((part, j) => {
                      if (part.match(/https?:\/\/[^\s]+/)) {
                        return (
                          <a
                            key={j}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#8c1d40",
                              textDecoration: "underline",
                              wordBreak: "break-all"
                            }}
                          >
                            {part}
                          </a>
                        );
                      }

                      if (line.trim().startsWith("•")) {
                        return (
                          <span key={j} style={{ display: "block", marginLeft: "10px" }}>
                            {part}
                          </span>
                        );
                      }

                      return part;
                    })}
                  </div>
                ))}
              </div>
            ))}

            {/* ✅ TYPING INDICATOR */}
            {isTyping && (
              <div className="message bot typing">
                <span></span><span></span><span></span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="input-box">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </motion.div>
      )}
    </>
  );
}