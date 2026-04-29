import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { LobbySettings, DEFAULT_SETTINGS } from "@/types/lobby";
import type { MessageInstance } from "antd/es/message/interface";

export function useLobbySettings(lobbyCode: string, message: MessageInstance) {
  const apiService = useApi();
  const [settings, setSettings] = useState<LobbySettings>(DEFAULT_SETTINGS);
  const [spymasterTimerDisabled, setSpymasterTimerDisabled] = useState(true);
  const [spyTimerDisabled, setSpyTimerDisabled] = useState(true);
  const [roundsNumberDisabled, setRoundsNumberDisabled] = useState(true);
  const [spymasterTimerDraft, setSpymasterTimerDraft] = useState<number | null>(
    DEFAULT_SETTINGS.spymasterTimer
  );
  const [spyTimerDraft, setSpyTimerDraft] = useState<number | null>(null);

  const handleSave = async () => {
    try {
      await apiService.put(`/api/lobbies/${lobbyCode}`, {
        spymasterTimeLimit: settings.spymasterTimer ?? 0,
        spyTimeLimit: settings.spyTimer ?? 0,
        rounds: settings.roundsNumber ?? 1000,
      });
      message.success("Settings saved!");
    } catch {
      message.error("Failed to save settings!");
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setSpyTimerDisabled(true);
    setSpymasterTimerDisabled(true);
    setRoundsNumberDisabled(true);
    message.info("Reset to default.");
  };

  const handleSpymasterTimerDisabledChange = (checked: boolean) => {
    setSpymasterTimerDisabled(checked);
    setSettings((s) => ({
      ...s,
      spymasterTimer: checked ? null : DEFAULT_SETTINGS.spymasterTimer,
    }));
  };

  const handleSpyTimerDisabledChange = (checked: boolean) => {
    setSpyTimerDisabled(checked);
    setSettings((s) => ({
      ...s,
      spyTimer: checked ? null : DEFAULT_SETTINGS.spyTimer,
    }));
  };

  const handleRoundsNumberChange = (val: number | null) => {
    if (val == null) return;
    if (val < 1) { message.warning("Rounds must be at least 1."); return; }
    if (val > 100) { message.warning("Rounds cannot exceed 100."); return; }
    setSettings((s) => ({ ...s, roundsNumber: val }));
  };

  const handleRoundsLimitDisabledChange = (checked: boolean) => {
    setRoundsNumberDisabled(checked);
    setSettings((s) => ({
      ...s,
      roundsNumber: checked ? null : DEFAULT_SETTINGS.roundsNumber,
    }));
  };

  const validateAndCommitTimer = (
    val: number | null,
    label: string,
    onCommit: (v: number) => void
  ) => {
    if (val == null) return;
    if (val < 10) { message.warning(`${label} cannot be less than 10s.`); return; }
    if (val > 3600) { message.warning(`${label} cannot exceed 3600s.`); return; }
    onCommit(val);
  };

  return {
    settings, setSettings,
    spymasterTimerDisabled, spyTimerDisabled, roundsNumberDisabled,
    spymasterTimerDraft, spyTimerDraft,
    setSpymasterTimerDraft, setSpyTimerDraft,
    handleSave, handleReset,
    handleSpymasterTimerDisabledChange, handleSpyTimerDisabledChange,
    handleRoundsNumberChange, handleRoundsLimitDisabledChange,
    validateAndCommitTimer,
  };
}