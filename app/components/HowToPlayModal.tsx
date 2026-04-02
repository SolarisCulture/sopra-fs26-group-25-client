import { Modal } from "antd";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function HowToPlayModal({ open, onClose }: Props) {
  return (
    <Modal
    title={<h3 style={{color: "#000"}}>Game Rules</h3>}
    open={open}
    onCancel={onClose}
    footer={null}
    width={700}
    >
        <h3 style={{color: "#A02A6C"}}>SETUP</h3>
        <p>Players split up into two teams of similar 
            size and skill. You need at least four 
            players (two teams of two) to play a game.</p>
        <p>Each team chooses one player to be their spymaster.</p>
        <br />
        <hr />
        <br />
        <h3 style={{color: "#A02A6C"}}>SETTINGS</h3>
        <p>The host can make changes to the settings.</p>
        <br />
        <p><strong>Theme:</strong> One of several given themes can be chosen.
            The default theme is Standard.
            Own themes and custom word lists can also be added.
            The own word list must be a .txt or.csv file.
        </p>
        <br />
        <p><strong>Difficulty:</strong> There are three different difficulty levels - Easy, Normal, Hard.
            Normal is the default setting.
        </p>
        <br />
        <p><strong>Timer:</strong> A time limit can be chosen both for how long the spymaster has to
            come up with a clue and for how long the spies have to guess their team&apos;s words.
            The default settings are 90 seconds for the spymaster and no timer for the spies.
        </p>
        <br />
        <p><strong>Rounds limit:</strong> While originally there is no limit to how many rounds can be played,
            as the game finishes when one team has won, in this version a limit can be set.
            If this limit is reached before one of the teams has won, the game terminates ant
            the players are redirected to the post-game screen with the statistics.
            In the default settings the limit is off.
        </p>
        <br />
        <hr />
        <br />
        <h3 style={{color: "#A02A6C"}}>THE KEY</h3>
        <p>Each game has one key that reveals the secret identities of the cards
            (which belong to <span style={{color: "#1B9FD8", fontWeight: "bold"}}>Team Blue </span>
            and which to <span style={{color: "#E8401C", fontWeight: "bold"}}>Team Red</span>).
            It must be kept a secret from the spies.
        </p>
        <br />
        <p>The key correspons to the word-grid on the screen (visible to everyone).
            Blue squares correspond to words that <span style={{color: "#1B9FD8", fontWeight: "bold"}}>Team Blue </span>
            must guess (blue agents). Red suqares correspond to words that <span style={{color: "#E8401C", fontWeight: "bold"}}>Team Red </span>
            must guess (red agents). Pale squares are innocent bystanders, and the black square is an assassion who
            should never be contacted at all (the team who does, looses the game)!
        </p>
        <br />
        <p>The four light around the edge of the key card indicate which team starts.
            The starting team has 9 words to guess, the other team 8. The starting team will
            give the first clue of the game.
        </p>
        <br />
        <hr />
        <br />
        <h3 style={{color: "#A02A6C"}}>AGENT CARDS</h3>
        <p><span style={{color: "#E8401C", fontWeight: "bold"}}>Red Agents</span> belong to team red and 
        <span style={{color: "#1B9FD8", fontWeight: "bold"}}> Blue Agents </span> belong to team blue.
        They indicate which word-cards have already been guessed correctly.
        The <span style={{color: "#C4B49A", fontWeight: "bold"}}> Innocent Bystanders </span> indicates that the guessed word-card belongs to no team.
        The <span style={{color: "#000", fontWeight: "bold"}}> Assassin </span> terminates the game (the team who picked
        the assassin looses).
        </p>
        <br />
        <hr />
        <br />
        <h3 style={{color: "#A02A6C"}}>GAME OVERVIEW</h3>
        <p>Spymasters know the secret identities of 25 agents. Their teammates know the agents only by their codenames.</p>
        <p>Spymasters take turns giving one-word clues. A clue may relate to multiple words on the table. 
            The spies try to guess which words their spymaster meant. When a spie touches a word, its secret identity
            is revealed. If the spie guess correctly, they may continue guessing, until they run out of ideas for the given 
            clue or until they hit a wrong person. Then it is the other team&apos;s turn to give a clue and guess. 
            The first team to contact all their agents wins the game.</p>
        <br />
        <hr />
        <br />
        <h3 style={{color: "#A02A6C"}}>GAMEPLAY</h3>
        <p style={{color: "#A02A6C", fontWeight: "bold"}}>GIVING A CLUE</p>
        <p>If you are the spymaster, you are trying to think of a one-word clue that relates to some of the words 
            your team is trying to guess. When you think you have a good clue, you say it. You also say one 
            number, which tells your teammates how many codenames are related to your clue.
            You are allowed to give a clue for only one word.
            Your clue must be only one word. You are <strong>not</strong> allowed to give extra hints.
            Your clue cannot be any of the codenames visible on the table. On later turns, some codenames will 
            be covered up, so a clue that is not legal now might be legal later.
        </p>
        <br />
        <p style={{color: "#A02A6C", fontWeight: "bold"}}>MAKING CONTACT</p>

        <p>The spies discuss and touch a codename to make their guess.</p>
        <br />
        <ul>
            <li>Correct guess → word is covered with their team&apos;s agent card → they may keep guessing</li>
            <li>Innocent bystander → covered with bystander card → turn ends</li>
            <li>Other team&apos;s word → covered with other team&apos;s agent card → turn ends (and helps the other team!)</li>
            <li>Assassin → game over → that team loses</li>
        </ul>
        <br />
        <p>The spies must make at least one guess. They may guess up to one more than the number the spymaster said. 
            They can stop guessing at any time. You are allowed one extra guess beyond the 
            number the spymaster said</p>
        <br />
        <p><strong>Ending the game:</strong> The first team to contact all their agents wins. 
        The game also ends immediately if a spie contacts the Assassin
         — that team loses. When playing with round limits it also ends when that limit is up.</p>

        <br />
        <p style={{color: "#A02A6C", fontWeight: "bold"}}>GAME FLOW</p>
        <p>Spymasters take turns giving clues. After 
            a spymaster gives a clue, his or her team starts 
            guessing. Their turn ends when they guess 
            wrong, when they decide to stop, or when they 
            have made the maximum number of guesses 
            for that clue. Then it is the other team&apos;s turn.
        </p>
        <br />
        <p style={{color: "#A02A6C", fontWeight: "bold"}}>PENALTY FOR INVALID CLUES</p>
        <p>If a spymaster gives an invalid clue, the 
            team&apos;s turn ends immediately. As an additional 
            penalty, the other team&apos;s spymaster may cover 
            one of his or her words with an agent card 
            before giving the next clue.
            But if no one notices that a clue is invalid, it 
            counts as valid.
        </p>
        <br />
        <hr />
        <br />
        <h3 style={{color: "#A02A6C"}}>VALID CLUES</h3>
        <p style={{color: "#A02A6C", fontWeight: "bold"}}>FIRM RULES</p>
        <p>Some clues are invalid because they violate the spirit of the game.</p>
        <br />
        <ul>
            <li>Your clue must be about the meaning of the 
                words. You can&apos;t use your clue to talk about 
                the letters in a word or its position on the table.
            </li>
            <li>Letters and numbers are valid clues, as long as they refer to meanings.</li>
            <li>The number you say after your clue can&apos;t be used as a clue.</li>
            <li>You must play in English. A foreign word is 
                allowed only if the players in your group would 
                use it in an English sentence.
            </li>
            <li>You can&apos;t say any form of a visible word on the table.</li>
            <li>You can&apos;t say part of a compound word on the table.</li>
        </ul>
        <br />
        <p style={{color: "#A02A6C", fontWeight: "bold"}}>HOMONYMS & SPELLING</p>
        <ul>
            <li>Same-sounding words with different 
                meanings and different spellings are 
                considered different words.
            </li>
            <li>Words that are spelled the same are 
                considered the same even though they might 
                have different pronunciations and meanings.
            </li>
            <li>You are allowed to spell out your clue.</li>
            <li>You must play in English. A foreign word is 
                allowed only if the players in your group would 
                use it in an English sentence.
            </li>
            <li>You should spell out your clue if someone 
                asks. If you aren&apos;t that strong on spelling, ask 
                the opposing spymaster for help.
            </li>
        </ul>
        <br />
        <p style={{color: "#A02A6C", fontWeight: "bold"}}>DON&apos;T BE TOO STRICT</p>
        <p>If the opposing spymaster allows it, the clue is valid. If you aren&apos;t sure, ask your opponent. (Quietly, 
            so the others can&apos;t hear.)
        </p>
        <br />
        <p style={{color: "#A02A6C", fontWeight: "bold"}}>FLEXIBLE RULES</p>
        <p>Different groups may prefer to play the game differently. Here are some common variations:</p>
        <br />
        <ul>
            <li><strong>Compound words:</strong> Technically only single words are valid clues. You can decide to allow any compound words, 
                however no player should be allowed to invent compound words.
            </li>
            <li><strong>Proper names:</strong> Proper names are always valid clues if they follow the other rules. 
                Your group can agree to count proper names as one word, allowing titles and place names like New York.
            </li>
            <li><strong>Acronyms and abbreviations:</strong> Technically CIA is not one word, 
                but you can decide to allow common abbreviations like UK, lol, and PhD.
            </li>
            <li><strong>Homonyms:</strong> Same-sounding words with different meanings and different spellings are 
                considered different words. You can however allow a more liberal use of homonyms if 
                that makes the game more fun.
            </li>
            <li><strong>Rhymes:</strong> Rhymes are valid when they refer to meanings. 
                You can also decide to allow any kind of rhyming clue.
            </li>
        </ul>
        <br />
        <p style={{color: "#A02A6C", fontWeight: "bold"}}>EXPERT CLUE: ZERO</p>
        <p>You are allowed to use 0 as the number part of your clue.</p>
        <p>If 0 is the number, the usual limit on guesses 
            does not apply. Spies can guess 
            as many words as they want. They still must 
            guess at least one word.
        </p>
        <p style={{color: "#A02A6C", fontWeight: "bold"}}>EXPERT CLUE: UNLIMITED</p>
        <p>Sometimes you may have multiple unguessed 
            words related to clues from the previous 
            rounds. If you want your team to guess more 
            than one of them, you may say unlimited 
            instead of a number.
        </p>
        <p>The disadvantage is that the spies 
            do not know how many words are related to 
            the new clue. The advantage is that they may 
            guess as many words as they want
        </p>
        <br />
        <a href="/codenames-rules-en.pdf" target="_blank" rel="noopener noreferrer">
        View full rules (PDF)
        </a>
    </Modal>
  );
}