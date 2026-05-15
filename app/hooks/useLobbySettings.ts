import { useCallback, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { BackendLobbySettings, LobbySettings, DEFAULT_SETTINGS } from "@/types/lobby";
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

  const applySettingsFromBackend = useCallback((backendSettings: BackendLobbySettings) => {
    const spymasterTimer = backendSettings.spymasterTimeLimit && backendSettings.spymasterTimeLimit > 0
      ? backendSettings.spymasterTimeLimit
      : null;
    const spyTimer = backendSettings.spyTimeLimit && backendSettings.spyTimeLimit > 0
      ? backendSettings.spyTimeLimit
      : null;
    const roundsNumber = backendSettings.rounds && backendSettings.rounds > 0
      ? backendSettings.rounds
      : null;

    setSettings((currentSettings) => ({
      ...currentSettings,
      spymasterTimer,
      spyTimer,
      roundsNumber,
      theme: backendSettings.topics && backendSettings.topics.length > 0
        ? backendSettings.topics.map(t => t.toLowerCase())
        : currentSettings.theme,
      customWordList: backendSettings.customWordList ?? currentSettings.customWordList,
    }));
    setSpymasterTimerDraft(spymasterTimer);
    setSpyTimerDraft(spyTimer);
    setSpymasterTimerDisabled(spymasterTimer == null);
    setSpyTimerDisabled(spyTimer == null);
    setRoundsNumberDisabled(roundsNumber == null);
  }, []);

  const handleSave = async () => {
    const selectedTopics = settings.theme.filter(t => t !== "customWordList");
    const normalizedTheme = settings.theme.length === 0 || selectedTopics.length === 0
      ? ["standard"]
      : settings.theme;
    const normalizedTopics = normalizedTheme
      .filter(t => t !== "customWordList")
      .map(t => t.toUpperCase());

    try {
      await apiService.put(`/api/lobbies/${lobbyCode}`, {
        spymasterTimeLimit: settings.spymasterTimer ?? 0,
        spyTimeLimit: settings.spyTimer ?? 0,
        rounds: settings.roundsNumber ?? 0,
        topics: normalizedTopics,
        customWordList: normalizedTheme.includes("customWordList") 
          ? settings.customWordList || null
          : null,
      });
      setSettings({
        ...settings,
        theme: normalizedTheme,
        customWordList: normalizedTheme.includes("customWordList") ? settings.customWordList : "",
      });
      message.success("Settings saved!");
      console.log("Saving settings:", settings.customWordList)
    } catch {
      message.error("Failed to save settings!");
    }
  };

  const handleReset = async () => {
    const resetSettings = {
      spymasterTimeLimit: null,
      spyTimeLimit: null,
      rounds: DEFAULT_SETTINGS.roundsNumber ?? 0,
      topics: ['STANDARD'],
    };

    try {
      await apiService.put(`/api/lobbies/${lobbyCode}`, {
        spymasterTimeLimit: resetSettings.spymasterTimeLimit ?? 0,
        spyTimeLimit: resetSettings.spyTimeLimit ?? 0,
        rounds: resetSettings.rounds,
        topics: resetSettings.topics,
      });
      applySettingsFromBackend(resetSettings);
      message.info("Reset to default.");
    } catch {
      message.error("Failed to reset settings!")
    }
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
    setSettings((s) => ({ ...s, roundsNumber: finalValue }));
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
    applySettingsFromBackend,
    handleSpymasterTimerDisabledChange, handleSpyTimerDisabledChange,
    handleRoundsNumberChange, handleRoundsLimitDisabledChange,
    validateAndCommitTimer,
  };
}
