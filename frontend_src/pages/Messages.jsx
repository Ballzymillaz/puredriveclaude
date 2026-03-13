import { useState } from "react";
import { Card, PageHeader, Badge, Avatar } from "../components/ui";

const CONVERSATIONS = [
  { initials: "CM", name: "Carlos Mendes", preview: "O teu empréstimo...", unread: 2, online: true, active: true },
  { initials: "MP", name: "Miguel Pinto", preview: "Obrigado!", unread: 0, online: false },
  { initials: "SR", name: "Sofia Rodrigues", preview: "Quando é o próximo...", unread: 1, online: false },
];

const GROUPS = [
  { icon: "👥", name: "Frota Lisboa", sub: "48 membros" },
];

const INITIAL_MESSAGES = [
  { from: "recv", text: "Bom dia! Queria saber sobre o pagamento desta semana.", time: "09:14" },
  { from: "sent", text: "Olá Carlos! O pagamento desta semana será processado sexta-feira como habitual.", time: "09:22" },
  { from: "recv", text: "Perfeito, obrigado. Também queria pedir informação sobre o estado do meu empréstimo.", time: "09:25" },
  { from: "sent", text: "O teu empréstimo está em análise, deves receber resposta amanhã.", time: "09:30" },
];

export default function Messages() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [activeConv, setActiveConv] = useState("Carlos Mendes");

  const sendMessage = () => {
    if (!draft.trim()) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    setMessages([...messages, { from: "sent", text: draft, time }]);
    setDraft("");
  };

  return (
    <div className="page active">
      <PageHeader
        title="Mensagens"
        subtitle="Comunicação interna PureDrive"
      />

      <div className="grid-6-4" style={{ height: 500 }}>
        {/* Chat thread */}
        <Card style={{ padding: 0, display: "flex", flexDirection: "column" }}>
          {/* Chat header */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700 }}>{activeConv}</span>
            <Badge variant="green" dot>Online</Badge>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.from}`}>
                <div className="chat-bubble">{m.text}</div>
                <div className="chat-time">{m.time}</div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="chat-input-wrap">
            <input
              className="chat-input"
              placeholder="Escrever mensagem..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button className="btn btn-primary btn-sm" onClick={sendMessage}>Enviar</button>
          </div>
        </Card>

        {/* Conversation list */}
        <Card style={{ padding: 12 }}>
          <div className="card-title">CONVERSAS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {CONVERSATIONS.map((c) => (
              <div
                key={c.name}
                className="conv-item"
                style={{ background: c.active ? "var(--accent-dim)" : undefined }}
                onClick={() => setActiveConv(c.name)}
              >
                <div style={{ position: "relative" }}>
                  <Avatar initials={c.initials} />
                  {c.online && (
                    <div style={{
                      position: "absolute", bottom: 0, right: 0,
                      width: 8, height: 8,
                      background: "var(--accent)", borderRadius: "50%",
                      border: "1.5px solid var(--bg)",
                    }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{c.preview}</div>
                </div>
                {c.unread > 0 && <span className="nav-badge">{c.unread}</span>}
              </div>
            ))}

            <div style={{ height: 1, background: "var(--border)", margin: "6px 0" }} />
            <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono)", padding: "0 8px", marginBottom: 4, letterSpacing: 1 }}>
              GRUPOS
            </div>
            {GROUPS.map((g) => (
              <div key={g.name} className="conv-item">
                <div className="avatar" style={{ background: "var(--surface3)", fontSize: 14 }}>{g.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{g.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{g.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
