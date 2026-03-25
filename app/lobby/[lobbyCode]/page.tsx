"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "@/styles/page.module.css";
import { Button, message } from "antd";

export default function LobbyPage() {
  const { lobbyCode } = useParams();
  const [link, setLink] = useState("");

  useEffect(() => {
    setLink(`${window.location.origin}/lobby/${lobbyCode}`);
  }, [lobbyCode]);

  return (
    <div className={styles.page}>
      <div style={{position: "absolute", top: 20, right: 20, display: "flex", alignItems: "center", gap: "10px", background: "rgba(255, 255, 255, 0.2)", padding: "10px 14px", borderRadius: "8px"}}>
        <span style={{fontWeight: 600}}>{link}</span>
        <Button
          type="primary"
          onClick={() => {
            navigator.clipboard.writeText(link);
            message.success("Copied!");
          }}
        >
          Copy
        </Button>
      </div>
      <div style={{position: "absolute", top: 20, display: "flex", alignItems: "center", gap: "10px", background: "rgba(255, 255, 255, 0.2)", padding: "10px 14px", borderRadius: "8px"}}>
          <span style={{fontSize: "25px",fontWeight: 600}}>Code: {lobbyCode}</span>
      </div>
      <div>
        <h1 style={{marginTop: "100px", fontSize: "48px", fontWeight: "700"}}>Lobby</h1>
      </div>
    </div>
  );
}

