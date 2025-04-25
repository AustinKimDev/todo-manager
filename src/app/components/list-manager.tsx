import React, { useCallback, useEffect, useRef, useState } from "react";
import { ListItem } from "../types"; // Relative path

interface ListManagerProps {
  lists: ListItem[];
  selectedList: ListItem | undefined;
  isLoading: boolean;
  onSelectList: (id: string) => void;
  onCreateList: () => void;
  onRenameList: (id: string, newName: string) => void;
  onDeleteList: (id: string) => void;
}

const ListManager: React.FC<ListManagerProps> = ({
  lists,
  selectedList,
  isLoading,
  onSelectList,
  onCreateList,
  onRenameList,
  onDeleteList,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [renameValue, setRenameValue] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (isDropdownOpen) setIsRenaming(false); // Close rename input when closing dropdown
  };

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(".fixed.inset-0.z-50") // Ignore clicks inside modals
      ) {
        setIsDropdownOpen(false);
        setIsRenaming(false);
      }
    },
    [setIsDropdownOpen, setIsRenaming]
  );

  useEffect(() => {
    if (isDropdownOpen)
      document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen, handleClickOutside]);

  const handleSelectListLocal = (id: string) => {
    onSelectList(id);
    setIsDropdownOpen(false);
    setIsRenaming(false);
  };

  const handleRenameListClick = () => {
    if (selectedList) {
      setRenameValue(selectedList.name);
      setIsRenaming(true);
      // Dropdown might close automatically on some interactions, ensure rename input is focused
      setTimeout(() => {
        const input = dropdownRef.current?.querySelector(
          'input[type="text"]'
        ) as HTMLInputElement;
        input?.focus();
        input?.select();
      }, 50);
    }
  };

  const confirmRename = () => {
    const trimmedName = renameValue.trim();
    if (selectedList && trimmedName !== "") {
      onRenameList(selectedList.id, trimmedName);
      setIsRenaming(false);
      setIsDropdownOpen(false); // Close dropdown after rename
    } else if (trimmedName === "") {
      alert("List name cannot be empty.");
      // Optionally re-focus input
      const input = dropdownRef.current?.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      input?.focus();
    }
  };

  const handleDeleteListClick = () => {
    if (selectedList) {
      onDeleteList(selectedList.id); // Trigger modal opening in parent
      setIsDropdownOpen(false); // Close dropdown
    }
  };

  const handleCreateListClick = () => {
    onCreateList(); // Trigger modal opening in parent
    setIsDropdownOpen(false); // Close dropdown
  };

  // Helper to generate contrasting ring color
  const getRingColorClass = (hexColor?: string): string => {
    if (!hexColor) return "ring-indigo-400";
    try {
      const rgb = parseInt(hexColor.substring(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 125 ? "ring-black/50" : "ring-white/70";
    } catch {
      // Remove unused 'e' variable
      return "ring-indigo-400";
    }
  };

  return (
    <div className="relative mb-6 max-w-sm mx-auto" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        disabled={isLoading}
        className={`w-full bg-gray-700/60 backdrop-blur-md border border-gray-500/30 text-gray-200 rounded-lg shadow-md px-4 py-2.5 inline-flex justify-between items-center text-sm font-medium hover:bg-gray-600/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150
                    ${
                      selectedList
                        ? `${getRingColorClass(
                            selectedList?.color // Add optional chaining
                          )} ring-1 animate-pulse`
                        : "focus:ring-indigo-400"
                    }`}
        aria-haspopup="true"
        aria-expanded={isDropdownOpen}
        style={
          selectedList?.color // Add optional chaining
            ? ({
                "--tw-ring-color": selectedList?.color, // Add optional chaining
              } as React.CSSProperties)
            : {}
        }
      >
        <div className="flex items-center min-w-0">
          {selectedList?.color && ( // Add optional chaining
            <span
              className="w-2.5 h-2.5 rounded-full mr-2 flex-shrink-0"
              style={{ backgroundColor: selectedList?.color }} // Add optional chaining
              aria-hidden="true"
            ></span>
          )}
          <span className="truncate">
            {selectedList
              ? selectedList.name
              : lists.length > 0
              ? "Select a List"
              : "No lists available"}
          </span>
        </div>
        <svg
          className={`flex-shrink-0 -mr-1 ml-1 h-5 w-5 text-gray-400 transition-transform duration-200 ${
            isDropdownOpen ? "transform rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {/* Dropdown Menu (Styled) */}
      {isDropdownOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-full rounded-lg shadow-xl bg-gray-700/80 backdrop-blur-lg border border-gray-500/30 ring-1 ring-black ring-opacity-5 focus:outline-none z-20" // Tailwind Semantic Colors
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1 max-h-60 overflow-y-auto" role="none">
            {isRenaming && selectedList ? (
              <div className="px-4 py-2 flex items-center space-x-2 border-b border-gray-600/50">
                {" "}
                {/* Tailwind Semantic Color */}
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmRename();
                    if (e.key === "Escape") setIsRenaming(false);
                  }}
                  className="flex-grow px-2 py-1 bg-gray-600/70 border border-gray-500/50 rounded-md text-sm text-gray-100 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none" // Tailwind Semantic Colors
                  autoFocus
                  onBlur={() => {
                    // Optional: Cancel rename if input loses focus without Enter/Escape
                    // setTimeout(() => setIsRenaming(false), 100); // Delay to allow button clicks
                  }}
                />
                <button
                  onClick={confirmRename}
                  className="p-1 text-green-400 hover:text-green-300 focus:outline-none rounded" // Tailwind Semantic Colors
                  title="Confirm Rename"
                >
                  {/* Check Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setIsRenaming(false)}
                  className="p-1 text-red-400 hover:text-red-300 focus:outline-none rounded" // Tailwind Semantic Colors
                  title="Cancel Rename"
                >
                  {/* X Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                {lists.length > 0 ? (
                  lists.map((list) => {
                    const isSelected = list.id === selectedList?.id;
                    // Remove unused ringColorClass variable
                    // const ringColorClass = getRingColorClass(list?.color);

                    return (
                      <button
                        key={list.id}
                        onClick={() => handleSelectListLocal(list.id)}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-600/60 rounded mx-1 my-0.5 transition-all duration-100 flex items-center group ${
                          isSelected
                            ? "bg-indigo-600/40 text-white ring-1 animate-pulse"
                            : "text-gray-200"
                        }`}
                        role="menuitem"
                        title={list.name}
                        style={
                          isSelected && list?.color // Add optional chaining
                            ? ({
                                "--tw-ring-color": list?.color, // Add optional chaining
                              } as React.CSSProperties)
                            : {}
                        }
                      >
                        {list?.color && ( // Add optional chaining
                          <span
                            className="w-2.5 h-2.5 rounded-full mr-2 flex-shrink-0"
                            style={{ backgroundColor: list?.color }} // Add optional chaining
                            aria-hidden="true"
                          ></span>
                        )}
                        <span className="truncate">{list.name}</span>
                      </button>
                    );
                  })
                ) : (
                  <span className="block px-4 py-2 text-sm text-gray-400 italic">
                    {" "}
                    {/* Tailwind Semantic Color */}
                    No lists yet.
                  </span>
                )}
                {/* Separator */}
                {(lists.length > 0 || selectedList) && (
                  <div className="border-t border-gray-600/50 my-1 mx-1"></div> // Tailwind Semantic Color
                )}
                {/* Actions */}
                <button
                  onClick={handleCreateListClick}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600/60 rounded mx-1 my-0.5" // Tailwind Semantic Colors
                  role="menuitem"
                >
                  Create New List...
                </button>
                {selectedList && (
                  <>
                    <button
                      onClick={handleRenameListClick}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600/60 rounded mx-1 my-0.5" // Tailwind Semantic Colors
                      role="menuitem"
                    >
                      Rename List...
                    </button>
                    <button
                      onClick={handleDeleteListClick}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-600/40 hover:text-red-200 rounded mx-1 my-0.5" // Tailwind Semantic Colors
                      role="menuitem"
                    >
                      Delete List...
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListManager;
