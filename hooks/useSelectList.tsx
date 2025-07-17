import { useCallback, useState } from 'react';

const useSelectList = () => {
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const handleSelect = useCallback((id: string) => {
        setSelected((prevSelected) => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(id)) {
                newSelected.delete(id); // Deselect the item
            } else {
                newSelected.add(id); // Select the item
            }
            return newSelected;
        });
    }, []);

    const clearSelection = useCallback(() => {
        setSelected(new Set());
    }, []);

    return {
        selected: Array.from(selected), // Convert Set to Array for easier use
        handleSelect,
        clearSelection,
        setSelected: (ids: string[]) => setSelected(new Set(ids))
    };
};

export default useSelectList;
