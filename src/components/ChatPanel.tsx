import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { gatewayClient } from "../gateway/client";
import "./ChatPanel.css";

type Message = { role: string; content: string; runId?: string };

const SESSION_KEY = "main";

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await gatewayClient.chatHistory(SESSION_KEY);
      const list = (res as { messages?: Message[] }).messages ?? [];
      setMessages(list);
    } catch (_) {
      setMessages([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    gatewayClient.setListener({
      onChat: (payload) => {
        const p = payload as { role?: string; content?: string; runId?: string };
        if (p?.content !== undefined) {
          setMessages((prev) => [
            ...prev,
            { role: p.role ?? "assistant", content: p.content ?? "", runId: p.runId },
          ]);
        }
      },
    });
    return () => {
      gatewayClient.setListener({});
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    try {
      await gatewayClient.chatSend({
        sessionKey: SESSION_KEY,
        content: text,
        idempotencyKey: `ui_${Date.now()}`,
      });
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${e instanceof Error ? e.message : String(e)}` },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const abort = useCallback(() => {
    gatewayClient.chatAbort(SESSION_KEY).catch(() => {});
  }, []);

  if (loadingHistory) {
    return (
      <div className="chat-panel loading">
        <p>Loading history…</p>
      </div>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p>No messages yet. Send a message to start.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-message chat-message--${m.role}`}>
            <span className="chat-message-role">{m.role}</span>
            <div className="chat-message-body">
              {m.role === "assistant" ? (
                <ReactMarkdown>{m.content}</ReactMarkdown>
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-row">
        <textarea
          className="chat-input"
          placeholder="Message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
        />
        {loading ? (
          <button type="button" className="btn btn-secondary" onClick={abort}>
            Stop
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={send} disabled={!input.trim()}>
            Send
          </button>
        )}
      </div>
    </div>
  );
}
