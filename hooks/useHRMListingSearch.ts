import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Keyboard } from "react-native";

// Keep the input immediate; query keys change only after typing pauses.
export function useHRMListingSearch(onSearch: (value: string) => void) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const listRef = useRef<FlatList>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchValue.trim());
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, onSearch]);
  const closeSearch = useCallback(() => {
    setSearchValue("");
    onSearch("");
    setShowSearch(false);
    Keyboard.dismiss();
  }, [onSearch]);
  const toggleSearch = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    if (showSearch) closeSearch();
    else setShowSearch(true);
  };
  return { showSearch, searchValue, setSearchValue, closeSearch, toggleSearch, listRef };
}
