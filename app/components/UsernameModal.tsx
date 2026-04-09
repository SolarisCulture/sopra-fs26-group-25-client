import { Input, Alert, Button } from "antd";

interface ScriptProps {
  open: boolean;
  usernameInput: string;
  usernameError: string;
  joiningLobby: boolean;
  onChange: (val: string) => void;
  onJoin: () => void;
}

export default function UsernameModal(
    {
        usernameInput,
        usernameError,
        joiningLobby,
        onChange,
        onJoin
    }: ScriptProps
) {
    return (
        <div style={{display: "flex", flexDirection: "column", gap: 12, padding: "8px 0",}}>
        <Input
            placeholder="Username (must be between 1 and 50 characters)"
            value={usernameInput}
            maxLength={50}
            status={usernameError ? "error" : ""}
            onChange={e => onChange(e.target.value)}
            onPressEnter={onJoin}
        />
        {usernameError &&
            <Alert
            title={usernameError}
            type="error"
            showIcon />}
            <Button
            type="primary"
            loading={joiningLobby}
            onClick={onJoin}
            block
            >
            Join Lobby
        </Button>
        </div>
    )
}