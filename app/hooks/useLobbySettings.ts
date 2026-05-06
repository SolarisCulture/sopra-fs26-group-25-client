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
    const MIN = 1;
    const MAX = 100;

    if (val == null) {
      setSettings((s) => ({ ...s, roundsNumber: MIN }));
      return;
    }

    let finalValue = val;

    if (val < MIN) {
      message.warning(`Rounds must be at least ${MIN}.`);
      finalValue = MIN;
    }
    else if (val > MAX) {
      message.warning(`Rounds cannot exceed ${MAX}.`);
      finalValue = MAX;
    }
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
    const MIN = 10;
    const MAX = 3600;

    if (val == null || val == undefined) {
      onCommit(MIN);
      return;
    }

    let finalValue = val;

    if (val < MIN) {
      message.warning(`${label} cannot be less than ${MIN}s.`);
      finalValue = MIN;
    }

    else if (val > MAX) {
      message.warning(`${label} cannot exceed ${MAX}s.`);
      finalValue = MAX;
    }
    onCommit(finalValue);
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