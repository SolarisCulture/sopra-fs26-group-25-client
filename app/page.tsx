"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import { useRouter } from "next/navigation";
import { Button } from "antd";
import styles from "@/styles/page.module.css";
import { useApi } from "./hooks/useApi";
import { Lobby } from "./types/lobby";

export default function Home() {
  const router = useRouter();
  const apiService = useApi();

  const handleCreateLobby = async () => {
    const lobby = await apiService.post<Lobby>("/api/lobbies", {});
    localStorage.setItem("hostedLobby", lobby.lobbyCode); // needed to identify the host
    router.push(`/lobby/${lobby.lobbyCode}`);
  };
  
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 style={{fontSize: "48px", fontWeight: "700", marginBottom: "-15px", display: "flex", flexDirection: "column", alignItems: "center"}}>CODENAMES</h1>
        <p style={{fontSize: "30px", fontWeight: "500", display: "flex", flexDirection: "column", alignItems: "center"}}>SoPra Project Group 25 FS26</p>

        <div className={styles.ctas} style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
          <Button
            type="primary"
            variant="solid"
            style={{width:200}}
            onClick={handleCreateLobby}
          >
            Create Lobby
          </Button>
          <Button
            type="primary"
            variant="solid"
            style={{width:200}}
            onClick={() => router.push("/lobby")}
          >
            Join Lobby
          </Button>
        </div>
      </main>
    </div>
  );
}
