import { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { Lobby } from "@/types/lobby";
import { User } from "@/types/user";

export function useLobby(lobbyCode: string, message: any) {
  const apiService = useApi();
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [players, setPlayers] = useState<User[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [userID, setUserID] = useState<number | null>(null);

  const fetchLobby = async () => {
    if (!lobbyCode || lobbyCode === "new") return;
    try {
      const data = await apiService.get<Lobby>(`/api/lobbies/${lobbyCode}`);
      setLobby(data);
      const sanitized = (data.players || []).map((p: User) => ({
        ...p,
        username: p.username?.replace(/^"|"$/g, "") || "",
      }));
      setPlayers(sanitized);

      const savedId = sessionStorage.getItem(`playerId_${lobbyCode}`);
      const me = sanitized.find(
        (p: User) => Number(p.id) === Number(savedId)
      );
      if (me) {
        setUserID(Number(me.id));
        setIsHost(!!me.isHost);
      }
      return data;
    } catch {
      message.error("Failed to fetch lobby data!");
    }
  };

  const handleAssignTeam = async (
    playerId: string | null,
    team: "RED" | "BLUE" | "UNASSIGNED"
  ) => {
    if (!playerId) return;
    try {
      if (team === "UNASSIGNED") {
        const player = players.find((p) => String(p.id) === String(playerId));
        if (player?.role === "SPYMASTER") {
          const next = players.find(
            (p) => p.team === player.team && String(p.id) !== String(playerId)
          );
          if (next?.id) {
            await apiService.put(
              `/api/lobbies/${lobbyCode}/player/${next.id}/role`,
              { role: "SPYMASTER" }
            );
          }
        }
      }
      await apiService.put(
        `/api/lobbies/${lobbyCode}/player/${playerId}/team`,
        { team }
      );
      const teamCount = players.filter((p) => p.team === team).length;
      const role =
        team === "UNASSIGNED" ? "NONE" : teamCount === 0 ? "SPYMASTER" : "SPY";
      await apiService.put(
        `/api/lobbies/${lobbyCode}/player/${playerId}/role`,
        { role }
      );
      await fetchLobby();
    } catch {
      message.error("Failed to assign team!");
    }
  };

  const handleAssignRole = async (
    playerId: string,
    role: "SPYMASTER" | "SPY"
  ) => {
    const player = players.find((p) => p.id === playerId);
    if (!player?.team) return;
    try {
      await apiService.put(
        `/api/lobbies/${lobbyCode}/player/${playerId}/role`,
        { role }
      );
      message.success(
        `${player.username} is now the ${role} for team ${player.team}.`
      );
      await fetchLobby();
    } catch {
      message.error("Failed to assign role!");
    }
  };

  const handleTransferHost = async (newHost: User) => {
    if (!userID) return;
    try {
      await apiService.put(`/api/lobbies/${lobbyCode}/host/transfer`, {
        currentHostId: userID,
        newHostId: newHost.id,
      });
      setIsHost(false);
      sessionStorage.removeItem(`isHost_${lobbyCode}`);
      message.success(`${newHost.username} is now the host.`);
      await fetchLobby();
    } catch {
      message.error("Failed to transfer host!");
    }
  };

  const handleLeave = async () => {
    if (!userID) return;
    try {
      await apiService.delete(
        `/api/lobbies/${lobbyCode}/players/${userID}`
      );
      sessionStorage.removeItem(`playerId_${lobbyCode}`);
      sessionStorage.removeItem(`isHost_${lobbyCode}`);
    } catch {
      message.error("Failed to leave lobby!");
    }
  };

  // Check if user already joined on mount
  useEffect(() => {
    const savedId = sessionStorage.getItem(`playerId_${lobbyCode}`);
    if (savedId) setUserID(Number(savedId));
  }, [lobbyCode]);

  // Fetch lobby when userID is set
  useEffect(() => {
    if (userID) fetchLobby();
  }, [userID]);

  return {
    lobby, players, isHost, userID, setUserID, setIsHost,
    fetchLobby, handleAssignTeam, handleAssignRole,
    handleTransferHost, handleLeave,
  };
}