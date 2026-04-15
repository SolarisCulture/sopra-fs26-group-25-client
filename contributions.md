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

## Contributions Week 1 - [23.03.2026] to [01.04.2026]

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
|**[@PhlipperCH]**| [29.03.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-client/commit/44850ea4c5691eea6f98f29670e54325799ac804] | [Task: Add a "Code" field to the homepage and a "Join Lobby" button. Also handles when a player joins] | [This contribution is relevent, so players can join a lobby using the code, without having to use a link.] |
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
| **[@SolarisCulture]** | [29.03.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-server/commit/0687ec7e15d38fb99a45386b4361485ab6316db7] | [User Story #12: When the host starts a game, the server picks 25 unique words from a word pool (based on difficulty/topics/custom lists), builds a 5×5 board, and generates a key card with the standard Codenames distribution (9 red, 8 blue, 7 civilian, 1 assassin). The Game entity gets persisted and linked to the lobby. The board endpoint filters by role — spymasters see card types and the key card, operatives only see the words. A GAME_STARTED WebSocket event broadcasts the board to all players so everyone enters the game at the same time.] | [Every other feature (clues, guessing, scoring, win conditions) depends on having a properly initialized board. Role-based filtering is critical because the whole game breaks if operatives can see what only spymasters should see. The WebSocket broadcast gives the real-time experience the course requires instead of players having to refresh manually. The configurable word pool through WordService also ties into our external API usage and keeps the game replayable across sessions.] |


---

## Contributions Week 2 - [01.04.2026] to [15.04.2026]

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@serilia03]** | [01.04.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-client/commit/d95d953f1e94ac4e20ba62240bb9da6862ca5dc8, https://github.com/SolarisCulture/sopra-fs26-group-25-client/commit/81c5648b5670abf3077d8c8a26a376d9f8ba9343] | [Task: After entering a username and a valid code, the user can join the lobby #68, Task: Navigating with a join link should join the lobby and prompt the user to create a username #67, Task: Add a "Code" field to the homepage and a "Join Lobby" button. Clicking "Join Lobby" with a valid code should redirect the user to a valid lobby. #64k] | [This contribution is relevant, because it got rid of /lobby, making the navigation through the pages more intuitive and cleaner. Also, it fixed some things from #64 and it allows users now to join /create a lobby. Also, most importantly, users must now provide a unique username before entering the lobby, which is crucial, because otherwise it would be hard to distinguish them later on and know who's turn it is. It also allows for personalisation, which makes the over all user experience better.] |
|                    | [02.04.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-client/commit/4491f35296a16c149f3aa31d808d0542031fa22e, https://github.com/SolarisCulture/sopra-fs26-group-25-client/commit/a8f0701abfd8adcf6da9e6508a4358dd983ca3bc] | [Task: add rules instructions in page pop up after clicking on button #225] | [This contribution is relevant, because the game cannot be played if the instructions are unclear / a player doesn't know how to play. The second commit also will make it a lot easier for us now to navigate through the code since I extracted some parts out of the /[lobbyCode] page and created separate files.] |
|                    | [02.04.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-client/commit/0541e0f7740d5bbc47411f3ecdd8ae63e15bfb59] | [Task: Show team red and team blue and which players are assigned to which team #63, Task: Add the functionality to drag and drop the players to assign them the roles #70] | [This contribution is relevant, because without it the game cannot start, as we first must have groups. It also allows for some flexibility, sicne the host can assign & unassign players, which makes the overal user experience better.] |
| **[@Kirusou]** | [04.04.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-server/commit/ae94ce4aa97683055f74820101defe115c7d0063] [https://github.com/SolarisCulture/sopra-fs26-group-25-server/commit/04daad77c63934ff9404d9845d17b230f617d13e] | [Task: Implemented WebSocket support for connection loss + link parser (+ Tests)] | [This is relevant, because it removes players who have for example closen their browser instead of pressing the quit button. (Link parser was in the tasks but it seems that it isnt necessary anymore --> realized it too late and already implemented it)] |
|                    | [05.04.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-server/commit/65b43c4238b05ce2b4ea7770e27cec9f1c9f645a] [https://github.com/SolarisCulture/sopra-fs26-group-25-server/commit/619e9d2024fbbebbc021906ee29d1a7fd50ca214] | [Task: Implemented calculateGameStatistics, getGameStatistics, restartGame and backToLobby with their endpoints (+ Tests)] | [This is relevant, because it allows for different end of game functions such as restarting the game after it finished without having to create a new lobby.] |
| **[@Timmy-Ho]** | [WORK AHEAD]   | [-] | [Using work ahead buffer from previous week] | [Completed 4 tasks in Week 1 (2x requirement). Using work ahead buffer to skip Week 2 as permitted by course rules. (PR fixes and reviews made but not claimed as tasks.)] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@PhlipperCH]** | [12.04.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-client/commit/3dd531a54bb50ebc8a59551bd0f98a8278d260b8] | [Display the synchronized 5x5 word-card grid with correct team colors as background based on the team's turn
#75] | [This contribution is relevant, so players can see the board and play the game] |
|                    | [14.04.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-client/issues/85] | [The current turn is clearly indicated #85] | [This contribution is relevant, so players see who's turn it is.] |
| **[@SolarisCulture]** | [03.04.2026]   | - | [Set Up Docker] | [Be able to run project on any machine] |
|                    | [04.04.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-server/pull/234/changes/0494b65637a10e6c809b3021e245f611e05bab7f] | [Create Turn entity with fields: currentTeamColor, phase, guessesRemaining, startTime, clue, guesses] | [Created the Turn entity which is the core of the game loop. Each turn tracks which team is playing, what phase the turn is in (spymaster giving clue vs spies guessing), the clue given, and all guesses made.] |
|                    | [05.04.2026]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-server/pull/234/changes/fb38ca0f4b84eb3d97268c1054fed38cb59278b8] | [Implemented turn management service and enriched the game state response so the frontend has all the information needed to display the game — teams, roles, turn phase, clue and real-time updates via WebSocket.] | [This connects the game entities to actual player actions, turning a static board into a playable game where spymasters can submit clues and all players receive live updates.] |
---

## Contributions Week 3 - [15.04.2026] to [24.04.2026]

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@serilia03]** | [13.04.2026 --> worked ahead for week 3]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-client/commit/9b34da638922d0fabc694ae1f614a96f1e3666d5, https://github.com/SolarisCulture/sopra-fs26-group-25-client/commit/5e748e473b919ad99d2b2217f51f0c425551a1d7] | [Task: Display "Make Host" button next to each player in the player list to transfer the host role. These buttons are only seen by the host #60, Task: Add a function that checks if the player was assigned by the host #69, Task: Add a button that starts the game but only when all the players are assigned and the needed roles are also assigned #71] | [This contribution is relevant, because it makes the host role transferable for when somebody would like to not be host anymore or has to leave the lobbs (automatic transfer not yet implemented). It also sets the stepping stones for playing the game by making sure everybody has a role and by adding a button to start the game.] |
|                    | [14.04.2026 --> worked ahead for week 3]   | [https://github.com/SolarisCulture/sopra-fs26-group-25-client/commit/f2244da1dd4cdfb4ffd63ff1504168c4514d34f2, https://github.com/SolarisCulture/sopra-fs26-group-25-client/commit/9abb533c3092e76a9d6ba2d2dfeacc2d5bfadac0] | [Task: Add a input field for the hint and the number of cards #91, Task: Add a button that sends the content of the input fields to the server #92, Task: Receive the history from the backend and display it #93] | [This contribution is relevant, because now a spymaster can publish hints and they get saved in the history - both crucial aspects of the game.] |

---

## Contributions Week 4 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 5 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 6 - [Begin Date] to [End Date]

_Continue with the same table format as above._
