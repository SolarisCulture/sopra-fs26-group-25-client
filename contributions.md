# Contributions

Every member has to complete at least 2 meaningful tasks per week, where a
single development task should have a granularity of 0.5-1 day. The completed
tasks have to be shown in the weekly TA meetings. You have one "Joker" to miss
one weekly TA meeting and another "Joker" to once skip continuous progress over
the remaining weeks of the course. Please note that you cannot make up for
"missed" continuous progress, but you can "work ahead" by completing twice the
amount of work in one week to skip progress on a subsequent week without using
your "Joker". Please communicate your planning **ahead of time**.

Note: If a team member fails to show continuous progress after using their
Joker, they will individually fail the overall course (unless there is a valid
reason).

**You MUST**:

- Have two meaningful contributions per week.

**You CAN**:

- Have more than one commit per contribution.
- Have more than two contributions per week.
- Link issues to contributions descriptions for better traceability.

**You CANNOT**:

- Link the same commit more than once.
- Use a commit authored by another GitHub user.

---

## Contributions Week 1 - [23.03.2026] to [29.03.2026]

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@serilia03]** | [25.03.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-client/commit/3cf02ec7c5dc730ea95e79c8e94cf9c5e76b0c35] | [Task: Implement starting page with "Create Lobby" button and wire it to POST/lobbies | [This contribution is relevant, because on the home page players can create / join lobbies - without it we couldn't set up any games.] |
|                    | [25.03.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-client/commit/b1b9d36bbb5c9a0213072e16ad69acd14b23d4fe] | [Task: Display sharable link containing the lobby code] | [This contribution is relevant, because we will need the lobby code later so other players can join.] |
|                    | [25.03.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-client/commit/2fe6d589a0f56fe812c1d02844e4e0b130535593] | [Task: Display unique lobby code on the lobby page] | [This contribution is relevant, because we will need the lobby link later to invite other players.] |
|                    | [26.03.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-client/commit/2dc25d7ed9c6a825b0930eec41d9e00c616d9381] | [Task: Display the lobby settings and allow the host to modify them] | [This contribution is relevant, because it adds the foundation to later be able to play the game with different settings.] |
|                    | [26.03.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-client/commit/07dfee82eb5f9fc7c590480e964308ec0eba2bdd] | [Task: Display "How to play" button in the lobby for everyone to see] | [This contribution is relevant, because the created pop-up will later display the game rules.] |
|                    | [26.03.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-client/commit/f3037c19761d16a2329725c45855483158041f00] | [Task: Show the player list of everybody currently in the lobby and not assigned to a team] | [This contribution is relevant, because it allows us to later move the players from this list to the two teams. It also will indicate who is not yet assigned a team and in general who is in the lobby.] |
|                    | [28.03.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-client/commit/6e4b3bb98b069046275eee8154ec587946c97345] | [Task: Show crown next to host in player list to indicate to everyone to who is the host] | [This contribution is relevant, because only the host can edit settings (& later start the game) --> players need to know who is in charge.] |
|                    | [28.03.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-client/commit/00c74164ce2d824c143d3443f55b10ce4c7ff1a1] | [Task: Implement "Leave Lobby" button that triggers reassignment of the host role if the host leaves] | [This contribution is relevant, because a player who decides they do nto want to play anymore should be allowed to do that (rather than having to create a new lobby or have them in a game they do not want to be in) but if they are a host we need to handle this and say what should happen in that case.] |
| **[@Kirusou]** | [25.03.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-server/commit/28ff82d8212c175d6abeef55211461e7abbbb0b5] | [Task: Implement PUT request handling for assigning team and for assigning role (+ Tests)] | [This is relevant, because it allows us to correctly handle any assignment requests sent by the front end.] |
|                    | [27.03.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-server/commit/814eaf60a9e58f34ce1a4190892149e0163925e0] | [Task: Implemented assignTeam, assignRole and canStartGame (+ Tests)] | [This is relevant, because it allows the host to change the players team/role which is necessary for a team vs team game.] |
|                    | [27.03.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-server/commit/132a0e94b5c8b907db01f7b6c82def699762c9a3] | [Task: Added Websocket support for team_update and role_update (+ Tests)] | [This is relevant, because it synchronises the lobby for each player.] |
|                    | [28.03.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-server/commit/7363da755ccd79c0f3bddb740efa71a69454d288] | [Task: Implemented findPlayersInLobby (+ Tests (Also for already implemented existsByLobbyCode))] | [This is relevant, because it allows us to easily retrieve a list of all the players in the lobby.] |
|                    | [29.03.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-server/commit/6fd912620263721ed3740f47076e7786bb91c1e5] | [Task: Implemented joinLobby and getPlayerList (Not whole Task done (missing the part about player connection loss handling))(+ Tests)] | [This is relevant, because it allows the existing lobby to fill up with players.] |
|                    | [29.03.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-server/commit/a6420af965b674e2a8434327c305363b779c1afd] | [Task: Added join POST request handling (+ Tests)] | [This is relevant, because it allows for frontend and backend communication.] |
| **[@Timmy-Ho]** | [24.03.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-server/commit/ad95da8e0b2b24ec3dd54d865e459af21a821f8b] | [Task: Create Lobby and Player entities] | [Basic requirement to get things running.] |
|                    | [24.03.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-server/commit/16b2972173ff4087d6ce9dd853738a2a05e9bfb6] | [Task: Add WebSocket structure for lobby events] | [Requirement for Frontend <-> Backend communication.] |
|                    | [28.03.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-server/commit/b6ffd2c1911ddcdeadcb43af2f0ecfaff629ce99] | [Task: Implement host transfer and leave lobby logic] | [Logic required for players leaving lobbies and host being able to be assigned when host leaves. Needed for lobby management] |
|                    | [28.03.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-server/commit/09c519b107a0ae88e7dc85905255b1022f7beb45] | [Task: Implemented lobby creation and retrieval endpoints] | [Necessary feature to communicate lobby creation with the clientside] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 2 - [Begin Date] to [End Date]

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 3 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 4 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 5 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 6 - [Begin Date] to [End Date]

_Continue with the same table format as above._
