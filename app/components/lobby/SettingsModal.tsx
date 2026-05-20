import { Button, Checkbox, InputNumber, message, Modal, Select, Tooltip, Upload } from "antd";
import { LobbySettings } from "@/types/lobby";
import styles from "@/styles/lobby/settings.module.css"

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
  const handleThemeChange = (val: string[]) => {
    setSettings({
      ...settings,
      theme: val,
      customWordList: ""
    });
  };

  return (
    <Modal
      title={<div style={{ color: "#000", textAlign: "center" }}>Settings</div>}
      width={"500px"}
      open={open}
      onCancel={onClose}
      footer={null}
    >

      <div style={{ display: "flex", flexDirection: "column", width: 300, margin: "auto" }}>

        {/* THEME SELECT */}
        <label>Select a theme:</label>

        <Select
          mode="multiple"
          style={{ width: 300 }}
          value={settings.theme}
          disabled={!isHost}
          onChange={handleThemeChange}
          optionRender={(option) => (
              <Tooltip title={(option.data as { tooltip?: string }).tooltip} mouseEnterDelay={0.5}>
              <div>{option.label}</div>
            </Tooltip>
          )}
          options={[
            {
              label: "Custom",
              options: [
                { value: "standard", label: "Standard", tooltip: "General Mix of Topics" },
                { value: "customWordList", label: "Custom Word List", tooltip: "Upload your own .txt or .csv file" }
              ]
            },
            {
              label: "Knowledge & Academics",
              options: [
                { value: "science", label: "Science", tooltip: "Physics, Chemistry, Math, Anatomy, Medicine" },
                { value: "history", label: "History", tooltip: "Historical figures, Places, Events, Medieval" },
                { value: "geography", label: "Geography", tooltip: "Countries, Cities, Oceans, Rivers, Mountains, Landmarks" },
                { value: "space_astronomy", label: "Space & Astronomy", tooltip: "Planets, Stars, Galaxies, Space Travel" },
                { value: "language", label: "Language", tooltip: "Foreign languages, grammar, Idioms, Sayings" },
                { value: "literature", label: "Literature", tooltip: "Titles, Authors, Literary Characters" },
                { value: "politics", label: "Politics", tooltip: "Politicians, Parties, Forms of Government" },
              ]
            },
            {
              label: "Arts & Culture",
              options: [
                { value: "architecture", label: "Architecture", tooltip: "Buildings, Architects, Styles" },
                { value: "art_stage", label: "Art & Stage", tooltip: "Classical music, Theatre, Paintings, Sculptures" },
                { value: "tradition_beliefs", label: "Tradition & Beliefs", tooltip: "Religion, Mythology, Customs, Legends, Astrology" },
                { value: "fantasy", label: "Fantasy", tooltip: "Magic, Quests, Mythical Creatures, World-building" },
                { value: "design", label: "Design", tooltip: "Fashion, Furniture, Interiors, Designers, Logos" },
                { value: "society", label: "Society", tooltip: "Organisations, institutions, legislation, Relationships" }
              ]
            },
            {
              label: "Entertainment & Media",
              options: [
                { value: "film", label: "Film", tooltip: "Actors, Directors, Titles, Film Quotes, Disney" },
                { value: "disney", label: "Disney", tooltip: "Characters, Movies, Pixar, Magic, Heroes & Villains" },
                { value: "television", label: "Television", tooltip: "Programmes, Series, Roles, Hosts" },
                { value: "music", label: "Music", tooltip: "Artists, Albums, Songs, Lyrics" },
                { value: "celebrities", label: "Celebrities", tooltip: "Musicians, actors, sports people, media stars" },
                { value: "crime_mystery", label: "Crime & Mystery", tooltip: "True Crime, Detectives, Noir" }
              ]
            },
            {
              label: "Lifestyle & Tech",
              options: [
                { value: "nature", label: "Nature", tooltip: "Animals, Plants, geology, Environment" },
                { value: "food_drink", label: "Food & Drink", tooltip: "Gastronomy, Chefs, Restaurants, Cookbooks" },
                { value: "household", label: "Household", tooltip: "Appliances, Tools, Furniture, Everyday Items" },
                { value: "sport", label: "Sport", tooltip: "Athletes, Disciplines, Events, Records" },
                { value: "business", label: "Business", tooltip: "Companies, Businesspeople, Products, Professions" },
                { value: "technology_games", label: "Technology & Games", tooltip: "IT, Inventions, Gaming, Programming, Algorithms" }
              ]
            },
          ]}
        />

        {/* CUSTOM WORD LIST UPLOAD */}
        {settings.theme.includes("customWordList") && (
          <>
            <label>Upload a custom word list:  <Tooltip
                                                  title="seperated by line in the .txt file"><span>&#9432;</span></Tooltip></label>
            <Upload
              disabled={!isHost}
              maxCount={1}
              accept=".txt,.csv"
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const content = e.target?.result as string;
                  let words: string[];

                  if (file.name.endsWith(".csv")) {
                    words = content.split(/[,;\n\r]+/).map(w => w.trim()).filter(w => w.length > 0);
                  } else {
                    words = content.split(/[\n\r]+/).map(w => w.trim()).filter(w => w.length > 0);
                  }

                  if (words.length < 25) {
                    message.error(`Need at least 25 words. Found: ${words.length}`);
                    return;
                  }

                  setSettings({
                    ...settings,
                    customWordList: JSON.stringify(words),
                  });
                  message.success(`Loaded ${words.length} words from ${file.name}`);
                };
                reader.readAsText(file);
                return false;
              }}
              onRemove={() => setSettings({ ...settings, customWordList: "" })}
            >
              <Button
                disabled={!isHost}
                style={{ width: 300 }}
              >
                Click to upload (.txt, .csv)
              </Button>
            </Upload>
          </>
        )}

        {/* SPYMASTER TIMER */}
        <label>Spymaster timer (seconds):</label>
        <InputNumber
          style={{ width: 300 }}
          value={settings.spymasterTimer}
          disabled={!isHost || spymasterTimerDisabled}
          onChange={(val) => setSpymasterTimerDraft(val)}
          onBlur={() =>
            validateAndCommitTimer(spymasterTimerDraft, "Spymaster timer", (v) => {
                setSpymasterTimerDraft(v);
                setSettings({ ...settings, spymasterTimer: v })
              }
            )
          }
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              validateAndCommitTimer(spymasterTimerDraft, "Spymaster timer", (v) => {
                  setSpymasterTimerDraft(v);
                  setSettings({ ...settings, spymasterTimer: v })
                }
              );
            }
          }}
          onStep={(val) =>
            validateAndCommitTimer(val, "Spymaster timer", (v) => {
              setSpymasterTimerDraft(v);
              setSettings({ ...settings, spymasterTimer: v });
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
          style={{ width: 300 }}
          value={settings.spyTimer}
          disabled={!isHost || spyTimerDisabled}
          onChange={(val) => setSpyTimerDraft(val)}
          onBlur={() =>
            validateAndCommitTimer(spyTimerDraft, "Spy timer", (v) => {
                setSpyTimerDraft(v);
                setSettings({ ...settings, spyTimer: v })
              }
            )
          }
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              validateAndCommitTimer(spyTimerDraft, "Spy timer", (v) => {
                  setSpyTimerDraft(v);
                  setSettings({ ...settings, spyTimer: v })
                }
              );
            }
          }}
          onStep={(val) =>
            validateAndCommitTimer(val, "Spy timer", (v) => {
              setSpyTimerDraft(v);
              setSettings({ ...settings, spyTimer: v });
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
          style={{ width: 300 }}
          min={1}
          max={100}
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
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
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
