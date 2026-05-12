// components/game/GameChat.tsx
import { useEffect, useRef, useState } from "react";
import { Button, Input } from "antd";
import { ChatMessage } from "@/types/chatMessage";
import styles from "@/styles/game/gameChat.module.css";

interface Props {
  messages: ChatMessage[]
  currentUsername: string
  onSend: (text: string) => void
}

export default function GameChat({
  messages,
  currentUsername,
  onSend,
}: Props) {
  const [text, setText] = useState("")
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages.length])

  const handleSend = () => {
    const trimmed = text.trim();

    if (!trimmed) return;

    onSend(trimmed);
    setText("");
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Chat</h3>

      <div ref={listRef} className={styles.messageList}>
        {messages.map((message) => {
          const isOwnMessage = message.username === currentUsername

          return (
            <div
              key={message.id}
              className={`${styles.messageCard} ${
                isOwnMessage ? styles.ownMessage : ""
              }`}
              style={{
                borderLeftColor:
                  message.team === "red"
                    ? "#ff4d4f"
                    : message.team === "blue"
                      ? "#1890ff"
                      : "rgba(255, 255, 255, 0.3)",
              }}
            >
              <span className={styles.messageAuthor}>
                {message.username}
              </span>
              <span className={styles.messageText}>
                {message.text}
              </span>
            </div>
          )
        })}
      </div>

      <div className={styles.inputRow}>
        <Input
          value={text}
          maxLength={250}
          placeholder="Type message..."
          onChange={(event) => setText(event.target.value)}
          onPressEnter={handleSend}
        />
        <Button type="primary" onClick={handleSend}>
          Send
        </Button>
      </div>
    </div>
  )
}
