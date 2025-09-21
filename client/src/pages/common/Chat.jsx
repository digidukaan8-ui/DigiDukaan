import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { LucideArrowLeft, SendHorizontalIcon, Paperclip } from 'lucide-react';

function Chat() {
  const { state } = useLocation();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(state || null);

  useEffect(() => {
    const load = async () => {
      const data = [];
      if ((!data || data.length === 0) && !state) {
        setChats([]);
        return;
      }
      let updated = data || [];
      if (state) {
        updated = [state, ...updated.filter((c) => c.id !== state.id)];
      }
      setChats(updated);
    };
    load();
  }, [state]);

  return (
    <section className="h-screen w-full flex text-black dark:text-white bg-gray-100 dark:bg-neutral-950 pt-[78px] md:pt-[86px]">
      <div
        className={`h-full w-full md:w-1/3 border-r dark:border-neutral-800 ${selectedChat ? "hidden md:flex" : "flex"
          } flex-col`}
      >
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <span>No chats available</span>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.seller}
                onClick={() => setSelectedChat(chat)}
                className={`flex items-center gap-3 p-4 bg-white dark:bg-neutral-900 hover:bg-white dark:hover:bg-neutral-950 cursor-pointer border-y border-black dark:border-white ${selectedChat?.seller === chat.seller ? "bg-gray-100 dark:bg-neutral-950" : ""
                  }`}
              >
                <img
                  className="w-12 h-12 rounded-full object-cover"
                  src={chat.img}
                  alt={chat.name}
                />
                <span className="text-black dark:text-white">{chat.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div
        className={`h-full w-full  md:border-l border-black dark:border-white md:w-2/3 ${selectedChat ? "flex" : "hidden md:flex"
          } flex-col`}
      >
        {selectedChat ? (
          <>
            <div className="p-4 flex items-center gap-3 border-y border-black dark:border-white bg-white dark:bg-neutral-900">
              <button
                className="text-sky-600 cursor-pointer text-xs md:text-sm"
                onClick={() => setSelectedChat(null)}
              >
                <LucideArrowLeft />
              </button>
              <img
                className="w-8 h-8 md:w-12 md:h-12 rounded-full object-cover"
                src={selectedChat.img}
                alt={selectedChat.name}
              />
              <span className="font-medium text-sm md:text-base text-black dark:text-white">
                {selectedChat.name}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
            </div>

            <div className="w-full p-4 border-t border-black dark:border-white flex gap-2 bg-white dark:bg-neutral-900">
              <textarea
                type="text"
                name="message"
                autoComplete="off"
                placeholder="Type a message"
                rows={2.5}
                className="w-full resize-none hide-scrollbar border rounded px-3 py-2 bg-gray-100 dark:bg-neutral-950"
              />
              <div className="flex flex-col justify-between items-center gap-2">
                <label className="bg-gray-200 dark:bg-neutral-950 cursor-pointer flex items-center justify-center px-4 py-2 rounded border border-black dark:border-white">
                  <Paperclip size={16} />
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.gif,.mp4,.mov,.pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                    }}
                  />
                </label>
                <button className="bg-sky-600 cursor-pointer flex justify-center items-center text-white px-4 py-2 rounded border border-black dark:border-white">
                  <SendHorizontalIcon size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            No chat selected
          </div>
        )}
      </div>
    </section>
  );
}

export default Chat;