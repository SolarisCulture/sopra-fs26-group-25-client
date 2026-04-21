import { Input, Alert, Button, InputRef } from "antd";
import { RefObject } from "react";

interface ScriptProps {
  open: boolean;
  usernameInput: string;
  usernameError: string;
  joiningLobby: boolean;
  inputRef: RefObject<InputRef | null>;
  onChange: (val: string) => void;
  onJoin: () => void;
}

export default function UsernameModal(
    {
        usernameInput,
        usernameError,
        joiningLobby,
        inputRef,
        onChange,
        onJoin
    }: ScriptProps
) {
    return (
        <div style={{display: "flex", flexDirection: "column", gap: 12, padding: "8px 0",}}>
        <Input
            ref={inputRef}
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
