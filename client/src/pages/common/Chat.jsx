import { useState, useRef, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LucideArrowLeft, SendHorizontalIcon, Paperclip, CheckIcon, LoaderIcon, RotateCcw, Download, Trash2, Edit3, X } from 'lucide-react';
import { getChats, getChatMessages, addMessage, updateMessage, removeMessage } from "../../api/chat";
import useAuthStore from "../../store/auth";
import { FileText, FileImage, FileVideo } from 'lucide-react';

function Chat() {
  const { state } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const storeId = searchParams.get('storeId');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedChat, setSelectedChat] = useState(() => {
    if (state?.seller) {
      return {
        _id: "temp-new-chat",
        otherPartyDetails: {
          _id: state.seller,
          name: state.name,
          img: state.img,
        },
      };
    }
    return null;
  });
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [skip, setSkip] = useState(0);
  const [sendingMessageId, setSendingMessageId] = useState(null);
  const [failedMessageId, setFailedMessageId] = useState(null);
  const [messageToEdit, setMessageToEdit] = useState(null);
  const [editMessage, setEditMessage] = useState("");
  const [disableTextbox, setDisabeTextbox] = useState(false);
  const [canEditMessage, setCanEditMessage] = useState(false);

  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  const { data: chatsList, isFetching: isFetchingChats } = useQuery({
    queryKey: ["chatsList"],
    queryFn: getChats,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { data: messagesData, fetchNextPage, hasNextPage, isFetchingNextPage } = useQuery({
    queryKey: ["chatMessages", selectedChat?._id],
    queryFn: () => getChatMessages(selectedChat._id, skip),
    enabled: !!selectedChat?._id && selectedChat._id !== "temp-new-chat",
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const chatMessages = messagesData?.data?.messages || [];

  useEffect(() => {
    if (state?.seller && chatsList?.data) {
      const existingChat = chatsList.data.find(chat => chat.otherPartyDetails?._id === state.seller);
      if (existingChat) {
        setSelectedChat(existingChat);
        setSearchParams(prev => {
          prev.delete('storeId');
          return prev;
        });
      } else {
        const tempChat = {
          _id: "temp-new-chat",
          otherPartyDetails: {
            _id: state.seller,
            name: state.name,
            img: state.img,
          },
        };
        setSelectedChat(tempChat);
        queryClient.setQueryData(["chatsList"], old => {
          const isChatPresent = old?.data?.some(chat => chat._id === tempChat._id || chat.otherPartyDetails?._id === tempChat.otherPartyDetails._id);
          if (isChatPresent) return old;
          return {
            ...old,
            data: [...(old?.data || []), tempChat],
          };
        });
      }
    }
  }, [state, chatsList, queryClient, setSearchParams]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages.length]);

  const scrollToBottom = () => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
  };

  const handleSend = async (isRetry = false) => {
    if (!selectedChat) return;
    if (!message.trim() && !file) return;

    if (messageToEdit) {
      await handleEdit();
      return;
    }

    let tempId;
    if (isRetry && failedMessageId) {
      tempId = failedMessageId;
      setFailedMessageId(null);
    } else {
      tempId = `temp-${Date.now()}`;
    }

    setSendingMessageId(tempId);

    const isExistingChat = !!selectedChat._id && selectedChat._id !== "temp-new-chat";
    const receiverId = selectedChat.otherPartyDetails._id;
    const chatIdToSend = isExistingChat ? selectedChat._id : null;

    const optimisticMessage = {
      _id: tempId,
      chatId: chatIdToSend,
      sender: user._id,
      receiver: receiverId,
      message: file ? file.name : message.trim(),
      type: file ? (file.type.startsWith("image/") ? "img" : file.type.startsWith("video/") ? "video" : "file") : "text",
      fileUrl: file ? { url: URL.createObjectURL(file), name: file.name, type: file.type } : null,
      createdAt: new Date().toISOString(),
      temp: true
    };

    const cacheKey = ["chatMessages", chatIdToSend || "new"];

    if (!isRetry) {
      queryClient.setQueryData(cacheKey, old => ({
        ...old,
        data: {
          messages: [...(old?.data?.messages || []), optimisticMessage],
        }
      }));
    }

    setMessage("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = null;

    try {
      const payload = {
        chatId: chatIdToSend,
        sender: user._id,
        receiver: receiverId,
        message,
      };

      if (!isExistingChat) {
        payload.storeId = storeId;
      }

      const result = await addMessage(file ? "file" : "message", file ? { file, ...payload } : payload);

      if (!isExistingChat) {
        const newChat = {
          _id: result.data.chatId,
          otherPartyDetails: selectedChat.otherPartyDetails,
        };
        setSelectedChat(newChat);
        queryClient.setQueryData(["chatsList"], old => ({
          ...old,
          data: (old?.data || []).map(chat => chat._id === "temp-new-chat" ? newChat : chat),
        }));
      }

      queryClient.setQueryData(cacheKey, old => ({
        ...old,
        data: {
          messages: (old?.data?.messages || []).map(c => (c._id === tempId ? result.data : c)),
        }
      }));

    } catch (err) {
      console.error(err);
      setFailedMessageId(tempId);
    } finally {
      setSendingMessageId(null);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage(selectedFile.name);
    }
  };

  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && hasNextPage) {
      fetchNextPage();
      setSkip(prev => prev + 30);
    }
  };

  const isSender = (chat) => chat.sender === user._id;

  const getFileIcon = (fileType) => {
    if (!fileType) return <FileText size={24} />;
    if (fileType.startsWith("image/")) {
      return <FileImage size={24} />;
    } else if (fileType.startsWith("video/")) {
      return <FileVideo size={24} />;
    } else {
      return <FileText size={24} />;
    }
  };

  const getChatImgSrc = (chat) => {
    return chat?.otherPartyDetails?.img?.url || chat?.otherPartyDetails?.avatar?.url || chat?.img?.url || chat?.avatar?.url || state?.img;
  };

  const getChatName = (chat) => {
    return chat?.otherPartyDetails?.name || chat?.name || state?.name;
  };

  const handleDoubleClick = (chat) => {
    if (isSender(chat)) {
      if (canEdit(chat) && chat.type === "text") {
        setCanEditMessage(true);
      } else {
        setCanEditMessage(false);
      }
      setMessageToEdit(chat._id);
      setEditMessage(chat.message);
      setDisabeTextbox(true);
    }
  };

  const handleClickOnEdit = () => {
    setDisabeTextbox(false);
    setMessage(editMessage);
  }

  const canEdit = (chat) => {
    if (chat.sender !== user._id || chat.type !== "text") return false;
    const createdAt = new Date(chat.createdAt);
    const now = new Date();
    const diffMinutes = (now - createdAt) / 1000 / 60;
    return diffMinutes <= 15;
  };

  const handleEdit = async () => {
    if (!messageToEdit || !message.trim()) return;

    try {
      const res = await updateMessage(messageToEdit, message);

      queryClient.setQueryData(
        ["chatMessages", selectedChat._id],
        (old) => ({
          ...old,
          data: {
            ...old?.data,
            messages: old?.data?.messages?.map((m) =>
              m._id === messageToEdit ? res.data : m
            ),
          },
        })
      );

      setMessage("");
      setMessageToEdit(null);
    } catch (err) {
      console.error("Error editing message:", err);
    }
  };

  const handleDelete = async () => {
    setDisabeTextbox(false);
    if (!messageToEdit) return;

    try {
      await removeMessage(messageToEdit);

      queryClient.setQueryData(
        ["chatMessages", selectedChat._id],
        (old) => ({
          ...old,
          data: {
            ...old?.data,
            messages: old?.data?.messages?.filter(
              (m) => m._id !== messageToEdit
            ),
          },
        })
      );

      setMessage("");
      setMessageToEdit(null);
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  return (
    <section className="h-screen w-full flex text-black dark:text-white bg-gray-100 dark:bg-neutral-950 pt-[78px] md:pt-[86px]">
      <div className={`h-full w-full md:w-1/3 border-r border-black dark:border-white ${selectedChat ? "hidden md:flex" : "flex"} flex-col`}>
        <div className="flex-1 overflow-y-auto">
          {isFetchingChats ? (
            <div className="p-4 flex justify-center items-center">Loading chats...</div>
          ) : (
            chatsList?.data?.length > 0 ? (
              chatsList.data.map(chat => (
                <div
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
                  className={`flex items-center gap-3 p-4 cursor-pointer border-b border-black dark:border-white ${selectedChat?._id === chat?._id ? "bg-white dark:bg-neutral-900" : "bg-gray-100 dark:bg-neutral-950"}`}
                >
                  {!getChatImgSrc(chat) ?
                    (
                      <span className="w-12 h-12 rounded-full bg-cyan-300 flex justify-center items-center">{getChatName(chat)?.slice(0, 1)}</span>
                    ) :
                    (
                      <img
                        className="w-12 h-12 rounded-full object-cover"
                        src={getChatImgSrc(chat)}
                        alt={getChatName(chat)}
                      />
                    )
                  }
                  <span>{getChatName(chat)}</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center">No chats yet. Start a new one!</div>
            )
          )}
        </div>
      </div>

      <div className={`h-full w-full md:border-l border-black dark:border-white md:w-2/3 ${selectedChat ? "flex" : "hidden md:flex"} flex-col`}>
        {selectedChat ? (
          <>
            <div className="p-4 flex items-center gap-3 border-b border-black dark:border-white bg-white dark:bg-neutral-900">
              <button className="text-sky-600 cursor-pointer text-xs md:text-sm" onClick={() => setSelectedChat(null)}>
                <LucideArrowLeft size={20} />
              </button>
              {!getChatImgSrc(selectedChat) ?
                (
                  <span className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-cyan-300 flex justify-center items-center">{getChatName(selectedChat)?.slice(0, 1)}</span>
                ) :
                (
                  <img
                    className="w-8 h-8 md:w-12 md:h-12 rounded-full object-cover"
                    src={getChatImgSrc(selectedChat)}
                    alt={getChatName(selectedChat)}
                  />
                )
              }
              <span className="font-medium text-sm md:text-base truncate">{getChatName(selectedChat)}</span>
              {messageToEdit && (
                <div className="flex items-center gap-5 ml-auto">
                  <button onClick={handleClickOnEdit} className="text-sky-600">
                    {canEditMessage ? (<Edit3 size={16} />) : (<></>)}
                  </button>
                  <button onClick={handleDelete} className="text-red-500">
                    <Trash2 size={16} />
                  </button>
                  <button onClick={() => {
                    setMessageToEdit(null)
                    setEditMessage("")
                    setMessage("")
                    setDisabeTextbox(false)
                  }} className="text-gray-500">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {isFetchingNextPage && <LoaderIcon className="animate-spin self-center mb-2" />}
              {chatMessages.map(chat => (
                <div key={chat._id} className={`flex ${isSender(chat) ? "justify-end" : "justify-start"} relative`}>
                  <div
                    onDoubleClick={() => handleDoubleClick(chat)}
                    className={`max-w-xs p-2 rounded break-words relative border border-black dark:border-white cursor-pointer transition-all duration-200
                      ${isSender(chat)
                        ? "bg-sky-600 text-white"
                        : "bg-white dark:bg-neutral-900 text-black dark:text-white"
                      }
                      ${messageToEdit === chat._id ? "bg-sky-950" : ""}
                      `}
                  >
                    {chat.type === "text" ? chat.message : (
                      <div className="flex flex-col">
                        {chat.type === "img" && chat.fileUrl?.url ? (
                          <img src={chat.fileUrl.url} className="max-w-full rounded" />
                        ) : chat.type === "video" && chat.fileUrl?.url ? (
                          <video src={chat.fileUrl.url} controls className="max-w-full rounded" />
                        ) : chat.fileUrl?.url ? (
                          <a href={chat.fileUrl.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 underline">
                            {getFileIcon(chat.fileUrl.type)}
                            <span>{chat.fileUrl.name || chat.fileUrl.url.split("/").pop()}</span>
                          </a>
                        ) : (
                          <span className="text-sm text-red-400">Error: File not found</span>
                        )}
                        {chat.fileUrl?.url && (
                          <a
                            href={chat.fileUrl.url}
                            download={chat.fileUrl.name || chat.fileUrl.url.split("/").pop()}
                            className="flex items-center gap-1 mt-2 text-xs text-white"
                          >
                            <Download size={12} />
                            Download
                          </a>
                        )}
                      </div>
                    )}

                    <div className="text-[10px] flex justify-end items-center mt-1">
                      {chat.edited && <div className="text-xs mr-1">edited</div>}
                      <span>{new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isSender(chat) && (
                        chat._id === sendingMessageId ? (
                          <LoaderIcon size={12} className="ml-1 animate-spin" />
                        ) : chat._id === failedMessageId ? (
                          <RotateCcw size={12} className="ml-1 text-red-500 cursor-pointer" onClick={() => handleSend(true)} />
                        ) : chat.seen ? (
                          <CheckIcon size={14} className="ml-1" />
                        ) : (
                          <CheckIcon size={14} className="ml-1 opacity-50" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {sendingMessageId && !chatMessages.find(c => c._id === sendingMessageId) && (
                <div className="flex justify-end">
                  <div className="p-2 rounded bg-sky-600 text-white max-w-xs flex items-center gap-2">
                    <LoaderIcon size={16} className="animate-spin" />
                    <span>Sending...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full p-4 border-t border-black dark:border-white flex gap-2 bg-white dark:bg-neutral-900">
              <textarea
                id="message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={"Type a message"}
                disabled={disableTextbox}
                rows={2.5}
                className="w-full resize-none hide-scrollbar border rounded px-3 py-2 bg-gray-100 dark:bg-neutral-950"
              />
              <div className="flex flex-col justify-between items-center gap-2">
                <label className="bg-gray-200 dark:bg-neutral-950 cursor-pointer flex items-center justify-center px-4 py-2 rounded border border-black dark:border-white">
                  <Paperclip size={16} />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.gif,.mp4,.mov,.pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
                <button onClick={() => handleSend(false)} className="bg-sky-600 flex justify-center items-center text-white px-4 py-2 rounded border border-black dark:border-white">
                  <SendHorizontalIcon size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            {isFetchingChats ? (
              <LoaderIcon className="animate-spin text-sky-600" size={32} />
            ) : chatsList?.data?.length === 0 ? (
              <span>No chats yet. Start a conversation!</span>
            ) : (
              <span>Select a chat to start a conversation.</span>
            )}
          </div>
        )}
      </div>

      {file && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">File Preview</h2>
            <div className="mb-4 flex items-center justify-center">
              {file.type.startsWith("image/") ? (
                <img src={URL.createObjectURL(file)} alt="File Preview" className="max-h-64 object-contain rounded" />
              ) : file.type.startsWith("video/") ? (
                <video src={URL.createObjectURL(file)} controls className="max-h-64 object-contain rounded" />
              ) : (
                <div className="flex flex-col items-center">
                  {getFileIcon(file.type)}
                  <span className="mt-2 text-center break-words">{file.name}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => { setFile(null); setMessage(""); }}
                className="px-4 py-2 bg-gray-300 dark:bg-neutral-700 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSend();
                  setFile(null);
                }}
                className="px-4 py-2 bg-sky-600 text-white rounded-md"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Chat;