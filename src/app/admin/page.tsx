"use client";

import { useState, useEffect } from "react";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "ok" | "err" } | null>(null);

  const flash = (text: string, type: "ok" | "err" = "ok") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const loadUsers = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      setUsers(await res.json());
    } else {
      flash("無法載入用戶", "err");
    }
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail, name: newName, password: newPassword, role: newRole }),
    });
    const data = await res.json();
    if (res.ok) {
      flash(`✅ 用戶 ${newName} 已建立！`);
      setNewEmail(""); setNewName(""); setNewPassword(""); setShowCreate(false);
      loadUsers();
    } else {
      flash(data.error || "建立失敗", "err");
    }
    setCreating(false);
  };

  const toggleActive = async (userId: string, isActive: boolean) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "toggleActive", value: !isActive }),
    });
    loadUsers();
  };

  const resetPwd = async (userId: string, name: string) => {
    const pwd = prompt(`為 ${name} 設定新密碼：`);
    if (!pwd) return;
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "resetPassword", value: pwd }),
    });
    flash(res.ok ? `✅ ${name} 密碼已重設` : "重設失敗", res.ok ? "ok" : "err");
  };

  const deleteUser = async (userId: string, name: string) => {
    if (!confirm(`確定刪除用戶 ${name}？呢個動作無法還原！`)) return;
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "delete" }),
    });
    flash(res.ok ? `🗑️ ${name} 已刪除` : "刪除失敗", res.ok ? "ok" : "err");
    loadUsers();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-indigo-600 font-medium text-sm">← 返回首頁</a>
          <h1 className="text-base font-bold text-gray-800">👑 用戶管理</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Message */}
        {msg && (
          <div className={`px-4 py-3 rounded-2xl text-sm font-medium ${msg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
            {msg.text}
          </div>
        )}

        {/* Create button */}
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-md active:scale-[0.98] transition-all"
        >
          {showCreate ? "取消" : "➕ 建立新用戶"}
        </button>

        {/* Create form */}
        {showCreate && (
          <form onSubmit={createUser} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <input
              type="text"
              placeholder="名稱"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <input
              type="password"
              placeholder="密碼"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="user">一般用戶</option>
              <option value="admin">管理員</option>
            </select>
            <button
              type="submit"
              disabled={creating}
              className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-medium disabled:opacity-60"
            >
              {creating ? "⏳ 建立中..." : "建立"}
            </button>
          </form>
        )}

        {/* User list */}
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{u.name}</span>
                    {u.role === "admin" && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Admin</span>}
                    {!u.isActive && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">已停用</span>}
                  </div>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => resetPwd(u.id, u.name)}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-xs font-medium hover:bg-amber-100"
                  >
                    🔑 改密碼
                  </button>
                  <button
                    onClick={() => toggleActive(u.id, u.isActive)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${u.isActive ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                  >
                    {u.isActive ? "🚫 停用" : "✅ 啟用"}
                  </button>
                  {u.role !== "admin" && (
                    <button
                      onClick={() => deleteUser(u.id, u.name)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs hover:bg-red-100"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-4 text-xs text-gray-300">
                <span>建立: {new Date(u.createdAt).toLocaleDateString("zh-HK")}</span>
                {u.lastLoginAt && <span>最後登入: {new Date(u.lastLoginAt).toLocaleDateString("zh-HK")}</span>}
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center text-gray-300 py-12">
            <p className="text-4xl mb-3">👻</p>
            <p className="text-sm">冇用戶</p>
          </div>
        )}
      </div>
    </div>
  );
}
