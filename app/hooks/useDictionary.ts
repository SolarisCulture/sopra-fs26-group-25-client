import { useState } from "react";

export function useDictionary(message: any) {
  const [dictionaryOpen, setDictionaryOpen] = useState(false);
  const [dictionarySearch, setDictionarySearch] = useState("");
  const [dictionaryResult, setDictionaryResult] = useState<{
    word: string; meanings: string[];
  } | null>(null);
  const [dictionaryResultOpen, setDictionaryResultOpen] = useState(false);
  const [dictionaryLoading, setDictionaryLoading] = useState(false);

  const handleSearch = async () => {
    if (!dictionarySearch.trim()) return;
    setDictionaryLoading(true);
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${dictionarySearch.trim()}`
      );
      if (!response.ok) { message.error("Word not found."); return; }
      const data = await response.json();
      const meanings = data[0].meanings.map(
        (m: { partOfSpeech: string; definitions: { definition: string }[] }) =>
          `${m.partOfSpeech}: ${m.definitions[0].definition}`
      );
      setDictionaryResult({ word: dictionarySearch.trim(), meanings });
      setDictionaryOpen(false);
      setDictionaryResultOpen(true);
    } catch {
      message.error("Failed to look up word.");
    } finally {
      setDictionaryLoading(false);
    }
  };

  const closeDictionary = () => {
    setDictionaryOpen(false);
    setDictionarySearch("");
  };

  const closeResult = () => {
    setDictionaryResultOpen(false);
    setDictionaryResult(null);
    setDictionarySearch("");
  };

  return {
    dictionaryOpen, setDictionaryOpen,
    dictionarySearch, setDictionarySearch,
    dictionaryResult, dictionaryResultOpen, dictionaryLoading,
    handleSearch, closeDictionary, closeResult,
  };
}