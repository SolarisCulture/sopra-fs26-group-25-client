import { Button, Checkbox, Input, InputNumber, Modal, Select, Upload} from "antd";
import { LobbySettings } from "@/types/lobby";

interface ScriptProps {
  open: boolean;
  onClose: () => void;
  isHost: boolean;

  settings: LobbySettings;
  setSettings: (s: LobbySettings) => void;

  spymasterTimerDisabled: boolean;
  spyTimerDisabled: boolean;

  spymasterTimerDraft: number | null;
  spyTimerDraft: number | null;

  setSpymasterTimerDraft: (v: number | null) => void;
  setSpyTimerDraft: (v: number | null) => void;

  roundsNumberDisabled: boolean;

  onSpymasterTimerDisabledChange: (checked: boolean) => void;
  onSpyTimerDisabledChange: (checked: boolean) => void;
  onRoundsLimitDisabledChange: (checked: boolean) => void;

  onRoundsNumberChange: (val: number | null) => void;

  validateAndCommitTimer: (
    val: number | null,
    label: string,
    onCommit: (v: number) => void
  ) => void;

  onReset: () => void;
  onSave: () => void;
}

export default function SettingsModal({
  open,
  onClose,
  isHost,
  settings,
  setSettings,

  spymasterTimerDisabled,
  spyTimerDisabled,

  spymasterTimerDraft,
  spyTimerDraft,

  setSpymasterTimerDraft,
  setSpyTimerDraft,

  roundsNumberDisabled,

  onSpymasterTimerDisabledChange,
  onSpyTimerDisabledChange,
  onRoundsLimitDisabledChange,

  onRoundsNumberChange,

  validateAndCommitTimer,

  onReset,
  onSave
}: ScriptProps) {

  // Clean up customTheme & customWordList
  const handleThemeChange = (val: string) => {
    setSettings({
      ...settings,
      theme: val,
      customTheme: "",
      customWordList: ""
    });
  };

  return (
    <Modal
      title={<div style={{ color: "#000", textAlign: "center" }}>Settings</div>}
      width={"400px"}
      open={open}
      onCancel={onClose}
      footer={null}
    >

      <div style={{display: "flex", flexDirection: "column", width: 200, margin: "auto"}}>

        {/* THEME SELECT */}
        <label>Select a theme:</label>

        <Select
          style={{ width: 200 }}
          value={settings.theme}
          disabled={!isHost}
          onChange={handleThemeChange}
          options={[
            { value: "", label: "Select..." },
            { value: "standard", label: "Standard" },
            { value: "customTheme", label: "Custom Theme" },
            { value: "customWordList", label: "Custom Word List" }
          ]}
        />

        {/* CUSTOM THEME NAME */}
        {settings.theme == "customTheme" && (
          <>
            <label>Enter custom theme name:</label>
            <Input
              style={{ width: 200 }}
              value={settings.customTheme}
              disabled={!isHost}
              placeholder="Custom theme name"
              onChange={(event) => setSettings({...settings, customTheme: event.target.value})
              }
            />
          </>
        )}

        {/* CUSTOM WORD LIST UPLOAD */}
        {settings.theme == "customWordList" && (
          <>
            <label>Upload a custom word list:</label>
            <Upload
              disabled={!isHost}
              maxCount={1}
              accept=".txt,.csv"
              beforeUpload={(file) => {
                setSettings({...settings, customWordList: file.name});
                return false;
              }}
              onRemove={() => setSettings({...settings, customWordList: ""})}
            >
              <Button
                disabled={!isHost}
                style={{ width: 200 }}
              >
                Click to upload (.txt, .csv)
              </Button>
            </Upload>
          </>
        )}

        {/* DIFFICULTY */}
        <label>Difficulty:</label>
        <Select
          style={{ width: 200 }}
          value={settings.difficulty}
          disabled={!isHost}
          onChange={(val) => setSettings({...settings, difficulty: val as LobbySettings["difficulty"]})}
          options={[
            { value: "easy", label: "Easy" },
            { value: "medium", label: "Medium" },
            { value: "hard", label: "Hard" },
            { value: "all", label: "All" }
          ]}
        />

        {/* SPYMASTER TIMER */}
        <label>Spymaster timer (seconds):</label>
        <InputNumber
          style={{ width: 200 }}
          value={settings.spymasterTimer}
          disabled={!isHost || spymasterTimerDisabled}
          onChange={(val) => setSpymasterTimerDraft(val)}
          onBlur={() =>
            validateAndCommitTimer(spymasterTimerDraft, "Spymaster timer", (v) =>
                setSettings({...settings, spymasterTimer: v})
            )
          }
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              validateAndCommitTimer(spymasterTimerDraft, "Spymaster timer", (v) =>
                  setSettings({...settings, spymasterTimer: v})
              );
            }
          }}
          onStep={(val) =>
            validateAndCommitTimer(val, "Spymaster timer", (v) => {
                setSpymasterTimerDraft(v);
                setSettings({ ...settings, spymasterTimer: v});
              }
            )
          }
        />
        <Checkbox
          disabled={!isHost}
          checked={spymasterTimerDisabled}
          onChange={(event) => onSpymasterTimerDisabledChange(event.target.checked)}
        >
          No timer
        </Checkbox>

        {/* SPY TIMER */}
        <label>Spy timer (seconds):</label>
        <InputNumber
          style={{ width: 200 }}
          value={settings.spyTimer}
          disabled={!isHost || spyTimerDisabled}
          onChange={(val) => setSpyTimerDraft(val)}
          onBlur={() =>
            validateAndCommitTimer(spyTimerDraft, "Spy timer", (v) =>
                setSettings({...settings, spyTimer: v})
            )
          }
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              validateAndCommitTimer(spyTimerDraft, "Spy timer", (v) => 
                setSettings({...settings, spyTimer: v})
              );
            }
          }}
          onStep={(val) =>
            validateAndCommitTimer(val, "Spy timer", (v) => {
                setSpyTimerDraft(v);
                setSettings({...settings, spyTimer: v});
              }
            )
          }
        />
        <Checkbox
          disabled={!isHost}
          checked={spyTimerDisabled}
          onChange={(event) => onSpyTimerDisabledChange(event.target.checked)}
        >
          No timer
        </Checkbox>

        {/* ROUNDS LIMIT */}
        <label>Rounds limit:</label>
        <InputNumber
          style={{ width: 200 }}
          min={1}
          max={1000}
          value={settings.roundsNumber}
          disabled={!isHost || roundsNumberDisabled}
          onChange={onRoundsNumberChange}
        />
        <Checkbox
          disabled={!isHost}
          checked={roundsNumberDisabled}
          onChange={(event) => onRoundsLimitDisabledChange(event.target.checked)}>
          No limit
        </Checkbox>

        {/* ACTION BUTTONS */}
        {isHost && (
          <div style={{display: "flex", justifyContent: "center", gap: 10}}>
            <Button onClick={onReset}>
              Reset to default
            </Button>

            <Button
              type="primary"
              onClick={onSave}
            >
              Save Settings
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}