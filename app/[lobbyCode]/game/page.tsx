"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { createGameSocket } from "@/utils/gameWebsocket";

interface GameEvent<T = unknown> {
  type: string;
  lobbyCode: string;
  board?: T;
}

export default function GamePage() {
  const apiService = useApi();
  const {lobbyCode} = useParams();

  const [role, setRole] = useState<User["role"] | null>(null);
  const [board, setBoard] = useState<unknown>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  // fetch user role
  useEffect(() => {
    if (!lobbyCode) return;

    const fetchRole = async () => {
      try {
        const storedPlayerId = localStorage.getItem(`playerId_${lobbyCode}`);

        if (!storedPlayerId) {
          console.error("No player ID found in localStorage");
          setLoadingRole(false);
          return;
        }

        const players = await apiService.get<User[]>(`/lobbies/${lobbyCode}/players`);

        const currentPlayer = players.find(
          (player) => String(player.id) === String(storedPlayerId)
        );

        if (!currentPlayer) {
          console.error("Current player not found in lobby");
          setLoadingRole(false);
          return;
        }

        setRole(currentPlayer.role);
      } catch (error) {
        console.error("Failed to fetch role:", error);
      } finally {
        setLoadingRole(false);
      }
    };

    fetchRole();
  }, [apiService, lobbyCode]);

  // subscribe to correct websocket
  useEffect(() => {
  if (!lobbyCode || !role) return;

  const socket = createGameSocket(String(lobbyCode), role, (event) => {
    console.log("Game event received:", event);

    if (event.type === "GAME_STARTED" && event.board != null) {
      setBoard(event.board);
    }
  });

  socket.connect();

  return () => {
    socket.disconnect();
  };
}, [lobbyCode, role]);

  if (loadingRole) {
    return <div>Loading role...</div>;
  }

  if (!role) {
    return <div>Could not determine player role.</div>;
  }

  return (
    <div>
    <h1>Hello World!</h1>
    </div>
  );
}
