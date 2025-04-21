"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUserRole } from "@/context/UserRoleContext";

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

interface Message {
  id: string;
  chat_id: string;
  role: string;
  content: string;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  first_name?: string;
  last_name?: string;
}

export default function AdminChatHistory() {
  const { role, loadingRole } = useUserRole();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (role === "admin" && !loadingRole) {
      // Only select columns that exist: user_id, first_name, last_name
      supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .then(({ data }) => setUsers(data || []));
    }
  }, [role, loadingRole]);

  useEffect(() => {
    if (selectedUserId) {
      setLoading(true);
      supabase
        .from("chats")
        .select("id, title, created_at")
        .eq("user_id", selectedUserId)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setChats(data || []);
          setLoading(false);
        });
    } else {
      setChats([]);
      setSelectedChatId("");
      setMessages([]);
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (selectedChatId) {
      setLoadingMessages(true);
      supabase
        .from("messages")
        .select("id, chat_id, role, content, created_at")
        .eq("chat_id", selectedChatId)
        .order("created_at", { ascending: true })
        .then(({ data }) => {
          setMessages(data || []);
          setLoadingMessages(false);
        });
    } else {
      setMessages([]);
    }
  }, [selectedChatId]);

  if (loadingRole || role !== "admin") return null;

  return (
    <div>
      <select
        className="mb-4 p-2 border rounded"
        value={selectedUserId}
        onChange={(e) => {
          setSelectedUserId(e.target.value);
          setSelectedChatId("");
        }}
      >
        <option value="">-- Select a user --</option>
        {users.map((user) => {
          const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.user_id;
          return (
            <option key={user.user_id} value={user.user_id}>
              {name}
            </option>
          );
        })}
      </select>
      {loading && <div>Loading chats...</div>}
      {!selectedChatId && (
        <ul className="space-y-2">
          {chats.map((chat) => (
            <li
              key={chat.id}
              className="p-2 border rounded cursor-pointer hover:bg-gray-100"
              onClick={() => setSelectedChatId(chat.id)}
            >
              <div className="font-semibold">{chat.title || chat.id}</div>
              <div className="text-xs text-gray-500">{new Date(chat.created_at).toLocaleString()}</div>
            </li>
          ))}
          {!loading && chats.length === 0 && selectedUserId && (
            <li>No chats found for this user.</li>
          )}
        </ul>
      )}
      {selectedChatId && (
        <div className="mt-4">
          <button className="mb-2 text-blue-600 underline" onClick={() => setSelectedChatId("")}>Back to Threads</button>
          <div className="font-bold mb-2">Chat Messages</div>
          {loadingMessages ? (
            <div>Loading messages...</div>
          ) : messages.length === 0 ? (
            <div>No messages found for this chat.</div>
          ) : (
            <ul className="space-y-2">
              {messages.map((msg) => (
                <li key={msg.id} className="p-2 border rounded">
                  <div className="text-xs text-gray-500">{msg.role} • {new Date(msg.created_at).toLocaleString()}</div>
                  <div>{msg.content}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
