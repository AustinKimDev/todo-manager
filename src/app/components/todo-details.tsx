import React from "react";
import { TodoItem } from "../types"; // Relative path
import { formatDateKey, parseDateKey } from "../utils/date-helpers"; // Relative path

interface TodoDetailsProps {
  selectedDate: Date;
  todos: TodoItem[]; // Assume TodoItem now includes optional color?: string
  onToggleTodo: (todoId: string) => void;
  onDeleteTodo: (todo: TodoItem) => void; // Pass full todo for delete modal
}

// Helper to format date range string
const formatRange = (startKey: string, endKey: string): string => {
  try {
    const startDate = parseDateKey(startKey);
    const endDate = parseDateKey(endKey);
    // Simple MM/DD format
    const startStr = `${(startDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${startDate.getDate().toString().padStart(2, "0")}`;
    const endStr = `${(endDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${endDate.getDate().toString().padStart(2, "0")}`;
    // Include year if range spans across years? For simplicity, omit for now.
    if (startStr === endStr) return startStr; // If single day range show only one date
    return `${startStr} ~ ${endStr}`;
  } catch (e) {
    console.error("Error formatting date range:", e);
    return "Invalid Range";
  }
};

const TodoDetails: React.FC<TodoDetailsProps> = ({
  selectedDate,
  todos,
  onToggleTodo,
  onDeleteTodo,
}) => {
  const selectedDayKey = formatDateKey(selectedDate);
  const fallbackBorderColor = "rgba(107, 114, 128, 0.3)"; // gray-600/30

  return (
    <div className="p-4 sm:p-5 border border-gray-600/40 rounded-xl bg-gray-800/60 backdrop-blur-md shadow-lg min-h-[200px]">
      {" "}
      {/* Tailwind Semantic Colors */}
      <h2 className="text-lg sm:text-xl font-semibold text-white/90 mb-3 sm:mb-4 border-b border-gray-600/50 pb-2">
        {" "}
        {/* Tailwind Semantic Color */}
        Todos for:{" "}
        <span className="text-indigo-400">
          {" "}
          {/* Tailwind Semantic Color */}
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </h2>
      {/* Todo List */}
      <ul className="space-y-2.5 max-h-60 sm:max-h-80 overflow-y-auto pr-2 -mr-2 styled-scrollbar">
        {todos.length > 0 ? (
          todos.map((todo) => {
            const isRange = !!(todo.startDate && todo.endDate);
            const disableToggle = isRange && todo.startDate !== selectedDayKey;
            const rangeString = isRange
              ? formatRange(todo.startDate!, todo.endDate!)
              : "";
            // Use todo color for border, fallback to default gray
            const borderColor = todo.color || fallbackBorderColor;

            return (
              <li
                key={todo.id}
                className="flex items-center justify-between p-2.5 bg-gray-700/50 border rounded-lg hover:bg-gray-700/70 group transition-colors duration-150" // Use 'border' and set color via style
                style={{ borderColor: borderColor }} // Set border color dynamically
              >
                <div className="flex items-center space-x-3 flex-grow mr-2 min-w-0">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => !disableToggle && onToggleTodo(todo.id)}
                    disabled={disableToggle}
                    className={`flex-shrink-0 h-4 w-4 bg-gray-600 border-gray-500 rounded text-indigo-500 focus:ring-indigo-400 focus:ring-offset-gray-800 ${
                      disableToggle
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }`}
                    id={`todo-${todo.id}`}
                  />
                  <label
                    htmlFor={`todo-${todo.id}`}
                    className={`flex-grow text-sm ${
                      disableToggle ? "cursor-not-allowed" : "cursor-pointer"
                    } ${
                      todo.completed
                        ? "line-through text-gray-400" // Tailwind Semantic Color
                        : "text-gray-100" // Tailwind Semantic Color
                    }`} // Add italic for range todos
                    title={todo.text} // Keep full text in title
                  >
                    {/* Display Text and Range */}
                    <span className="truncate inline-block align-middle max-w-[calc(100%-5rem)]">
                      {" "}
                      {/* Truncate text part */}
                      {todo.text}
                    </span>
                    {isRange && (
                      <span className="ml-2 text-xs text-indigo-300 whitespace-nowrap inline-block align-middle">
                        {" "}
                        {/* Display range */}({rangeString})
                      </span>
                    )}
                  </label>
                </div>
                <button
                  onClick={() => onDeleteTodo(todo)}
                  className="flex-shrink-0 p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none rounded"
                  title="Delete todo"
                >
                  {/* Trash Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </li>
            );
          })
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            {" "}
            {/* Tailwind Semantic Color */}
            No todos for this date. Click the date number on the calendar to add
            one.
          </p>
        )}
      </ul>
    </div>
  );
};

export default TodoDetails;
