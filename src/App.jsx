import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, Pencil, Check, X, ListChecks } from "lucide-react";

/**
 * Simple Todo List — single-file React component
 * - Add / complete / edit / delete
 * - Filters: All | Active | Completed
 * - Persist to localStorage
 * - Clean Tailwind UI + subtle animations
 */
export default function TodoListApp() {
  const [todos, setTodos] = useState(() => {
    try {
      const raw = localStorage.getItem("todos-v1");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | done
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("todos-v1", JSON.stringify(todos));
  }, [todos]);

  const remaining = useMemo(() => todos.filter(t => !t.done).length, [todos]);

  const filtered = useMemo(() => {
    if (filter === "active") return todos.filter(t => !t.done);
    if (filter === "done") return todos.filter(t => t.done);
    return todos;
  }, [todos, filter]);

  function addTodo() {
    const value = text.trim();
    if (!value) return;
    setTodos(prev => [
      { id: crypto.randomUUID(), text: value, done: false, createdAt: Date.now() },
      ...prev,
    ]);
    setText("");
    inputRef.current?.focus();
  }

  function toggleTodo(id) {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function removeTodo(id) {
    setTodos(prev => prev.filter(t => t.id !== id));
  }

  function beginEdit(t) {
    setEditingId(t.id);
    setEditingText(t.text);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingText("");
  }

  function saveEdit() {
    const value = editingText.trim();
    if (!value) {
      cancelEdit();
      return;
    }
    setTodos(prev => prev.map(t => (t.id === editingId ? { ...t, text: value } : t)));
    cancelEdit();
  }

  function clearCompleted() {
    setTodos(prev => prev.filter(t => !t.done));
  }

  function toggleAll() {
    const allDone = todos.length && todos.every(t => t.done);
    setTodos(prev => prev.map(t => ({ ...t, done: !allDone })));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      <div className="max-w-xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-2xl bg-slate-900 text-white">
            <ListChecks className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Todo List</h1>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          {/* Add bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleAll}
                title="Toggle all"
                className="shrink-0 rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
              >
                Toggle all
              </button>

              <input
                ref={inputRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") addTodo();
                }}
                placeholder="Nhập việc cần làm và nhấn Enter…"
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
              />

              <button
                onClick={addTodo}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm text-white hover:opacity-95 disabled:opacity-40"
                disabled={!text.trim()}
              >
                <Plus className="w-4 h-4" />
                Thêm
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">{remaining} việc chưa xong</p>
          </div>

          {/* Filters */}
          <div className="px-4 sm:px-5 py-3 flex items-center justify-between border-b border-slate-100">
            <div className="flex gap-1">
              {[
                { key: "all", label: "Tất cả" },
                { key: "active", label: "Đang làm" },
                { key: "done", label: "Đã xong" },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`rounded-xl px-3 py-1.5 text-sm border ${
                    filter === f.key
                      ? "bg-slate-900 text-white border-slate-900"
                      : "border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button
              onClick={clearCompleted}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Xóa việc đã xong
            </button>
          </div>

          {/* List */}
          <ul className="divide-y divide-slate-100">
            <AnimatePresence initial={false}>
              {filtered.map(t => (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="p-4 sm:p-5"
                >
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() => toggleTodo(t.id)}
                        className="h-5 w-5 rounded-md border-slate-300"
                      />
                      <span
                        className={`text-sm sm:text-base ${
                          t.done ? "line-through text-slate-400" : ""
                        }`}
                      >
                        {editingId === t.id ? (
                          <input
                            autoFocus
                            value={editingText}
                            onChange={e => setEditingText(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === "Enter") saveEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                            onBlur={saveEdit}
                            className="rounded-md border border-slate-300 px-2 py-1"
                          />
                        ) : (
                          t.text
                        )}
                      </span>
                    </label>

                    <div className="ml-auto flex items-center gap-1">
                      {editingId === t.id ? (
                        <>
                          <button
                            onClick={saveEdit}
                            title="Lưu"
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50"
                          >
                            <Check className="w-4 h-4" /> Lưu
                          </button>
                          <button
                            onClick={cancelEdit}
                            title="Hủy"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                          >
                            <X className="w-4 h-4" /> Hủy
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => beginEdit(t)}
                            title="Sửa"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                          >
                            <Pencil className="w-4 h-4" /> Sửa
                          </button>
                          <button
                            onClick={() => removeTodo(t.id)}
                            title="Xóa"
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" /> Xóa
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <li className="p-8 text-center text-sm text-slate-500">
                Không có việc nào trong danh sách này.
              </li>
            )}
          </ul>
        </div>

        {/* Footer tip */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Gợi ý: nhấn <kbd className="px-1 py-0.5 rounded border">Enter</kbd> để thêm,
          nhấn đôi vào nội dung để sửa, hoặc bật/tắt chọn tất cả bằng nút “Toggle all”.
        </p>
      </div>
    </div>
  );
}
