"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import { useRouter } from "next/navigation";
import { Button, Form, Input, Alert } from "antd";
import styles from "@/styles/page.module.css";
import { useApi } from "./hooks/useApi";
import { Lobby } from "./types/lobby";
import { ApplicationError } from "@/types/error";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const apiService = useApi();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreateLobby = async () => {
    try {
      const lobby = await apiService.post<Lobby>("/api/lobbies", {});
      localStorage.setItem("hostedLobby", lobby.lobbyCode); // needed to identify the host
      router.push(`/${lobby.lobbyCode}`);
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  const handleJoin = async (values: {code: string}) => {
    setErrorMessage(null);
    const code = values.code.trim();
    try{
      await apiService.get<Lobby>(`/api/lobby/${code}`);
      router.push(`/${code}`)
    }
    catch (error) {
      console.log(error);
      const appError = error as ApplicationError;
      if (appError.status === 404) {
        setErrorMessage("Lobby code not found.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    }
  };
  
  return (
    <div className={styles.page}>
      {errorMessage && (
        <div style={{position: "fixed", top: "15%"}} >
          <Alert
            title={errorMessage}
            type="error"
            showIcon
          />
        </div>
      )}

      <main className={styles.main}>
        <h1 style={{fontSize: "48px", fontWeight: "700", marginBottom: "-15px", display: "flex", flexDirection: "column", alignItems: "center", color:"#fff"}}>CODENAMES</h1>
        <p style={{fontSize: "30px", fontWeight: "500", display: "flex", flexDirection: "column", alignItems: "center", color:"#fff"}}>SoPra Project Group 25 FS26</p>

        <div className={styles.ctas} style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
          <Button
            type="primary"
            variant="solid"
            style={{width:250, height: "40px"}}
            onClick={handleCreateLobby}
          >
            Create Lobby
          </Button>
          
          <div className="join-container" >
            <Form
              variant="outlined"
              validateTrigger="onSubmit"
              onFinish={handleJoin}
              style={{display: "flex", flexDirection: "row"}}
            >
              <Form.Item
                name="code"
                rules={[{required: true}]}
                style={{marginBottom: 0, marginRight: 0}}
              >
              <Input
                placeholder="Enter Lobby Code"
                onChange={() => setErrorMessage(null)}
                styles={{
                  input: {backgroundColor: "white", color: "black", width: 150, borderRadius: "8px 0 0 8px", height: "40px"}
                }}
              />
              </Form.Item>
              <Button
                type="primary"
                variant="solid"
                htmlType="submit"
                style={{width: 100, borderRadius: "0 8px 8px 0", height: "40"}}
                >
                Join Lobby
              </Button>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
}
