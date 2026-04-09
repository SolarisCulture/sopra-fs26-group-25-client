export interface User {
  id: string | null;
  username: string | null;
  token: string | null;
  role: "spy" | "spymaster" | null;
}
