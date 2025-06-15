
import { useState } from "react";
import { Send } from "lucide-react";
import { Card } from "@/components/ui/card";

const samplePrompts = [
  "What are my top-selling products this month?",
  "Are there any sales trends I should know about?",
  "Can you find anomalies in last quarter’s data?",
];

const ConversationalAI = () => {
  const [messages, setMessages] = useState([
    { isUser: false, text: "Hi! 👋 I’m your MnM Analyst assistant. What business question can I help you answer today?" },
  ]);
  const [input, setInput] = useState("");

  const addMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { isUser: true, text: input.trim() }]);
    setInput("");
  };

  return (
    <Card className="w-full h-full flex flex-col border-primary/25 shadow-none bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.isUser ? "justify-end" : ""}`}>
            <div
              className={`rounded-xl px-4 py-2 max-w-[80%] text-sm ${
                msg.isUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t flex flex-col gap-2 animate-fade-in">
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            placeholder="Type your business question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addMessage()}
          />
          <button
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            onClick={addMessage}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="text-xs text-muted-foreground">
          Try:{" "}
          <span className="inline-flex gap-1">
            {samplePrompts.map((ex, i) => (
              <button
                key={i}
                className="hover:underline text-primary hover:font-semibold px-1"
                onClick={() => setInput(ex)}
                type="button"
              >
                {ex}
              </button>
            ))}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ConversationalAI;
