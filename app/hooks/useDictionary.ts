import { useState } from "react";
import type { MessageInstance } from "antd/es/message/interface";

interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: string[];
}

interface DictionaryResult {
  word: string;
  phonetic?: string;
  meanings: DictionaryMeaning[];
}

export function useDictionary(message: MessageInstance) {
  const [dictionaryOpen, setDictionaryOpen] = useState(false);
  const [dictionarySearch, setDictionarySearch] = useState("");
  const [dictionaryResult, setDictionaryResult] = useState<DictionaryResult | null>(null);
  const [dictionaryResultOpen, setDictionaryResultOpen] = useState(false);
  const [dictionaryLoading, setDictionaryLoading] = useState(false);

  const fetchWiktionary = async (word: string): Promise<DictionaryResult | null> => {
    try {
      const response = await fetch(
        `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`
      );
      if (!response.ok) return null;
      const data = await response.json();

      const meaningMap = new Map<string, Set<string>>();

      for (const [pos, entries] of Object.entries(data.en || {})) {
        if (!Array.isArray(entries)) continue;
        const cleanPos = pos.toLowerCase();
        if (!meaningMap.has(cleanPos)) {
          meaningMap.set(cleanPos, new Set());
        }
        for (const entry of entries as { definitions: { definition: string }[] }[]) {
          for (const def of entry.definitions || []) {
            const clean = def.definition
              .replace(/<[^>]*>/g, "")
              .replace(/&nbsp;/g, " ")
              .replace(/&amp;/g, "&")
              .trim();
            if (clean.length > 0 && clean.length < 200) {
              meaningMap.get(cleanPos)!.add(clean);
            }
          }
        }
      }

      if (meaningMap.size === 0) return null;

      const meanings: DictionaryMeaning[] = Array.from(meaningMap.entries()).map(
        ([partOfSpeech, defs]) => ({
          partOfSpeech,
          definitions: Array.from(defs).slice(0, 3),
        })
      );

      return { word, meanings };
    } catch {
      return null;
    }
  };

  const fetchFreeDictionary = async (word: string): Promise<DictionaryResult | null> => {
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      if (!response.ok) return null;
      const data = await response.json();

      const meaningMap = new Map<string, Set<string>>();

      for (const entry of data) {
        for (const m of entry.meanings) {
          const pos = m.partOfSpeech;
          if (!meaningMap.has(pos)) {
            meaningMap.set(pos, new Set());
          }
          for (const d of m.definitions) {
            meaningMap.get(pos)!.add(d.definition);
          }
        }
      }

      if (meaningMap.size === 0) return null;

      const meanings: DictionaryMeaning[] = Array.from(meaningMap.entries()).map(
        ([partOfSpeech, defs]) => ({
          partOfSpeech,
          definitions: Array.from(defs).slice(0, 3),
        })
      );

      const phonetic = data[0]?.phonetic
        || data[0]?.phonetics?.find((p: { text?: string }) => p.text)?.text
        || undefined;

      return { word, phonetic, meanings };
    } catch {
      return null;
    }
  };

  const handleSearch = async () => {
    if (!dictionarySearch.trim()) return;
    setDictionaryLoading(true);
    try {
      const word = dictionarySearch.trim().toLowerCase();

      const wiktResult = await fetchWiktionary(word);
      if (wiktResult) {
        setDictionaryResult(wiktResult);
        setDictionaryOpen(false);
        setDictionaryResultOpen(true);
        return;
      }

      const freeResult = await fetchFreeDictionary(word);
      if (freeResult) {
        setDictionaryResult(freeResult);
        setDictionaryOpen(false);
        setDictionaryResultOpen(true);
        return;
      }

      message.error("Word not found.");
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