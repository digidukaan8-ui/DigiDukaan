import { useState, useRef, useEffect } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { LucideArrowLeft, SendHorizontalIcon, Paperclip, CheckIcon, LoaderIcon, RotateCcw, Download, Trash2, Edit3, X } from 'lucide-react';
import { getChats, getChatMessages, addMessage, updateMessage, removeMessage, markAllMessagesSeen } from "../../api/chat";
import useAuthStore from "../../store/auth";
import { FileText, FileImage, FileVideo } from 'lucide-react';
import socket from "../../utils/socket";
import { toast } from "react-hot-toast";

function Chat() {
  const { state } = useLocation();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const storeId = searchParams.get('storeId');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  if (!user) {
    toast.error('Login First');
    navigate('/login', { replace: true });
  }

  if (user.role === 'buyer' && location.pathname.startsWith('/seller')) {
    navigate('/buyer/chat', { replace: true });
  }

  if (user.role === 'seller' && location.pathname.startsWith('/buyer')) {
    navigate('/seller/chat', { replace: true });
  }

  const [selectedChat, setSelectedChat] = useState(() => {
    if (state?.seller) {
      return {
        _id: "temp-new-chat",
        otherPartyDetails: {
          _id: state.seller,
          name: state.name,
          img: state.img,
          userId: state.seller
        },
      };
    }
    return null;
  });
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [sendingMessageId, setSendingMessageId] = useState(null);
  const [failedMessageId, setFailedMessageId] = useState(null);
  const [messageToEdit, setMessageToEdit] = useState(null);
  const [editMessage, setEditMessage] = useState("");
  const [disableTextbox, setDisabeTextbox] = useState(false);
  const [canEditMessage, setCanEditMessage] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [typingUser, setTypingUser] = useState(null);

  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingSentRef = useRef(0);

  const { data: chatsList, isFetching: isFetchingChats } = useQuery({
    queryKey: ["chatsList"],
    queryFn: getChats,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const chatQueryKey = ["chatMessages", selectedChat?._id];

  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: chatQueryKey,
    queryFn: ({ queryKey, pageParam = 0 }) => getChatMessages(queryKey[1], pageParam),
    enabled: !!selectedChat?._id && selectedChat._id !== "temp-new-chat",
    getNextPageParam: (lastPage, allPages) => lastPage?.nextSkip ?? undefined,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    keepPreviousData: true,
  });

  const chatMessages = messagesData?.pages?.flatMap(p => p.data.messages) || [];

  useEffect(() => {
    if (state?.seller && chatsList?.data) {
      const existingChat = chatsList.data.find(chat => chat.otherPartyDetails?._id === state.seller || chat.otherPartyDetails?.userId === state.seller);
      if (existingChat) {
        setSelectedChat(existingChat);
      } else {
        const tempChat = {
          _id: "temp-new-chat",
          otherPartyDetails: {
            _id: state.seller,
            name: state.name,
            img: state.img,
            userId: state.seller
          },
        };
        setSelectedChat(tempChat);
        queryClient.setQueryData(["chatsList"], old => {
          const isChatPresent = old?.data?.some(
            chat => chat._id === tempChat._id ||
              (chat.otherPartyDetails?._id === tempChat.otherPartyDetails._id && chat._id !== "temp-new-chat")
          );
          if (isChatPresent) return old;

          return {
            ...old,
            data: [tempChat, ...(old?.data?.filter(chat => chat._id !== "temp-new-chat") || [])],
          };
        });
      }
    }
  }, [state, chatsList, queryClient, setSearchParams]);

  useEffect(() => {
    const isInitialLoadOrPageFetch = isFetchingNextPage || chatMessages.length === 0;
    scrollToBottom(isInitialLoadOrPageFetch ? "auto" : "smooth");
  }, [chatMessages.length, isFetchingNextPage]);

  const scrollToBottom = (behavior = "smooth") => {
    const container = containerRef.current;
    if (container) {
      const shouldScroll = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
      if (behavior === "auto" || shouldScroll) {
        container.scrollTo({ top: container.scrollHeight, behavior });
      }
    }
  };


  const handleSend = async (isRetry = false) => {
    if (!selectedChat) return;
    const trimmedMessage = message.trim();
    if (!trimmedMessage && !file) return;

    if (messageToEdit) {
      await handleEdit();
      return;
    }

    const tempId = `temp-${Date.now()}`;
    setSendingMessageId(tempId);
    if (!isRetry) setFailedMessageId(null);

    const isExistingChat = !!selectedChat._id && selectedChat._id !== "temp-new-chat";
    const receiverId = selectedChat.otherPartyDetails?.userId || selectedChat.otherPartyDetails?._id;
    const chatIdToSend = isExistingChat ? selectedChat._id : null;
    const currentChatKey = ["chatMessages", chatIdToSend || "temp-new-chat"];

    const fileDetails = file ? { url: URL.createObjectURL(file), name: file.name, type: file.type } : null;
    const optimisticMessage = {
      _id: tempId,
      chatId: chatIdToSend,
      sender: user._id,
      receiver: receiverId,
      message: file ? file.name : trimmedMessage,
      type: file ? (file.type.startsWith("image/") ? "img" : file.type.startsWith("video/") ? "video" : "file") : "text",
      fileUrl: fileDetails,
      createdAt: new Date().toISOString(),
      temp: true,
      seen: false
    };

    if (!isRetry) {
      queryClient.setQueryData(currentChatKey, old => {
        const firstPage = old?.pages?.[0];
        if (!firstPage) {
          return {
            pages: [{ nextSkip: 0, data: { messages: [optimisticMessage] } }],
            pageParams: [undefined]
          };
        }

        const updatedMessages = [...(firstPage.data.messages || []), optimisticMessage];

        return {
          ...old,
          pages: [
            { ...firstPage, data: { ...firstPage.data, messages: updatedMessages } },
            ...(old.pages.slice(1) || [])
          ],
        };
      });
    }

    if (selectedChat?._id && selectedChat._id !== "temp-new-chat") {
      socket.emit("stop-typing", { chatId: selectedChat._id, userId: user._id });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setTypingUser(null);

    setMessage("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = null;

    try {
      const payload = {
        chatId: chatIdToSend,
        sender: user._id,
        receiver: receiverId,
        message: trimmedMessage,
        tempId: optimisticMessage._id
      };

      if (!isExistingChat) {
        payload.storeId = storeId;
      }

      const result = await addMessage(file ? "file" : "message", file ? { file, ...payload } : payload);
      const serverMessage = result.data;
      const newChatId = result.data.chatId;


      if (!isExistingChat) {
        const newChat = {
          _id: newChatId,
          otherPartyDetails: selectedChat.otherPartyDetails,
          lastMessage: serverMessage,
        };
        setSelectedChat(newChat);

        queryClient.setQueryData(["chatsList"], old => ({
          ...old,
          data: (old?.data || []).map(chat => chat._id === "temp-new-chat" ? newChat : chat),
        }));

        queryClient.removeQueries({ queryKey: ["chatMessages", "temp-new-chat"] });
        queryClient.setQueryData(["chatMessages", newChatId], old => {
          const firstPage = old?.pages?.[0];
          if (!firstPage) return old;

          const updatedMessages = (firstPage.data.messages || []).map(c => (c._id === optimisticMessage._id ? serverMessage : c));

          return {
            ...old,
            pages: [{ ...firstPage, data: { ...firstPage.data, messages: updatedMessages } }, ...old.pages.slice(1)],
          };
        });

      } else {
        queryClient.setQueryData(currentChatKey, old => {
          const firstPage = old?.pages?.[0];
          if (!firstPage) return old;

          const updatedMessages = (firstPage.data.messages || []).map(c => (c._id === optimisticMessage._id ? serverMessage : c));

          return {
            ...old,
            pages: [{ ...firstPage, data: { ...firstPage.data, messages: updatedMessages } }, ...old.pages.slice(1)],
          };
        });
      }

      queryClient.setQueryData(["chatsList"], old => {
        if (!old?.data) return old;
        const targetChatId = chatIdToSend || newChatId;
        const updatedChats = old.data.map(chat => chat._id === targetChatId ? { ...chat, lastMessage: serverMessage } : chat);

        const chatToMove = updatedChats.find(chat => chat._id === targetChatId);
        const otherChats = updatedChats.filter(chat => chat._id !== targetChatId);

        return { ...old, data: [chatToMove, ...otherChats] };
      });

    } catch (err) {
      console.error(err);
      setFailedMessageId(optimisticMessage._id);
      if (file && optimisticMessage.fileUrl?.url) {
        URL.revokeObjectURL(optimisticMessage.fileUrl.url);
      }
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
    if (e.target.scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
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

  const getOtherPartyId = (chat) => {
    return chat?.otherPartyDetails?.userId || chat?.otherPartyDetails?._id;
  }

  const handleDoubleClick = (chat) => {
    if (isSender(chat)) {
      const canEditMsg = canEdit(chat) && chat.type === "text";
      setCanEditMessage(canEditMsg);

      setMessageToEdit(chat._id);
      setEditMessage(chat.message);
      setDisabeTextbox(true);
      if (!canEditMsg) {
        setMessage("");
        setDisabeTextbox(true);
      }
    }
  };

  const handleClickOnEdit = () => {
    setDisabeTextbox(false);
    setMessage(editMessage);
  }

  const canEdit = (chat) => {
    if (chat.sender !== user._id || chat.type !== "text" || chat.temp) return false;
    const createdAt = new Date(chat.createdAt);
    const now = new Date();
    const diffMinutes = (now - createdAt) / 1000 / 60;
    return diffMinutes <= 15;
  };

  const handleEdit = async () => {
    if (!messageToEdit || !message.trim()) return;

    const originalMessage = chatMessages.find(m => m._id === messageToEdit);
    if (!originalMessage) return;

    const editedMessageText = message.trim();
    const cacheKey = ["chatMessages", selectedChat._id];

    const optimisticUpdate = { ...originalMessage, message: editedMessageText, edited: true };
    queryClient.setQueryData(cacheKey, old => {
      if (!old) return old;
      const pages = old.pages.map(page => ({
        ...page,
        data: {
          ...page.data,
          messages: page.data.messages.map(m =>
            m._id === messageToEdit ? optimisticUpdate : m
          ),
        },
      }));
      return { ...old, pages };
    });

    setMessage("");
    setMessageToEdit(null);
    setDisabeTextbox(false);
    setEditMessage("");


    try {
      const res = await updateMessage(messageToEdit, editedMessageText);

      queryClient.setQueryData(cacheKey, old => {
        if (!old) return old;
        const pages = old.pages.map(page => ({
          ...page,
          data: {
            ...page.data,
            messages: page.data.messages.map(m =>
              m._id === messageToEdit ? res.data : m
            ),
          },
        }));
        return { ...old, pages };
      });

    } catch (err) {
      console.error("Error editing message:", err);
      queryClient.setQueryData(cacheKey, old => {
        if (!old) return old;
        const pages = old.pages.map(page => ({
          ...page,
          data: {
            ...page.data,
            messages: page.data.messages.map(m =>
              m._id === messageToEdit ? originalMessage : m
            ),
          },
        }));
        return { ...old, pages };
      });
    }
  };

  const handleDelete = async () => {
    setDisabeTextbox(false);
    if (!messageToEdit) return;

    const messageToDeleteId = messageToEdit;
    const cacheKey = ["chatMessages", selectedChat._id];

    queryClient.setQueryData(cacheKey, old => {
      if (!old) return old;
      const pages = old.pages.map(page => ({
        ...page,
        data: {
          ...page.data,
          messages: page.data.messages.filter(
            (m) => m._id !== messageToDeleteId
          ),
        },
      }));
      return { ...old, pages };
    });

    setMessage("");
    setMessageToEdit(null);
    setEditMessage("");

    try {
      await removeMessage(messageToDeleteId);

    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  useEffect(() => {
    const receiverId = user._id;
    if (!selectedChat?._id || selectedChat._id === "temp-new-chat") return;

    const hasUnseen = chatMessages.some(msg => !msg.seen && msg.receiver === receiverId);

    if (hasUnseen) {
      queryClient.setQueryData(chatQueryKey, old => {
        if (!old) return old;
        const pages = old.pages.map(page => ({
          ...page,
          data: {
            ...page.data,
            messages: page.data.messages.map(m =>
              m.receiver === receiverId && !m.seen ? { ...m, seen: true } : m
            )
          }
        }));
        return { ...old, pages };
      });

      markAllMessagesSeen(selectedChat._id)
        .then(() => {
          socket.emit("message:seen", { chatId: selectedChat._id, userId: receiverId });
        })
        .catch(error => {
          console.error("Error marking messages as seen:", error);
        });
    }
  }, [selectedChat?._id, user._id, chatMessages.length, queryClient]);


  const handleTyping = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (!selectedChat?._id || selectedChat._id === "temp-new-chat" || disableTextbox) return;

    const now = Date.now();
    const isTyping = value.trim().length > 0;

    if (isTyping && now - lastTypingSentRef.current > 300) {
      socket.emit("typing", { chatId: selectedChat._id, userId: user._id });
      lastTypingSentRef.current = now;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { chatId: selectedChat._id, userId: user._id });
      typingTimeoutRef.current = null;
    }, 1000);
  };

  useEffect(() => {
    if (!containerRef.current || !selectedChat?._id || selectedChat._id === "temp-new-chat") return;

    const chatId = selectedChat._id;
    const receiverId = user._id;

    const unseenMessageIds = chatMessages
      .filter(msg => msg.receiver === receiverId && !msg.seen)
      .map(msg => msg._id);

    if (unseenMessageIds.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      const messagesToMark = [];
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.dataset.unseen === 'true') {
          messagesToMark.push(entry.target.id.replace("msg-", ""));
        }
      });

      if (messagesToMark.length > 0) {
        queryClient.setQueryData(["chatMessages", chatId], old => {
          if (!old) return old;
          const pages = old.pages.map(page => ({
            ...page,
            data: {
              ...page.data,
              messages: page.data.messages.map(m =>
                messagesToMark.includes(m._id) ? { ...m, seen: true } : m
              )
            }
          }));
          return { ...old, pages };
        });

        markAllMessagesSeen(chatId);
        socket.emit("message:seen", { chatId, userId: receiverId });
      }
    }, {
      root: containerRef.current,
      threshold: 0.1
    });

    const elements = unseenMessageIds
      .map(id => document.getElementById(`msg-${id}`))
      .filter(Boolean);

    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [chatMessages.length, selectedChat?._id, user._id, queryClient]);

  useEffect(() => {
    if (!selectedChat?._id || selectedChat._id === "temp-new-chat") return;

    const chatId = selectedChat._id;

    socket.emit("chat:join", { chatId, userId: user._id });

    const handleNewMessage = (msg) => {
      if (msg.chatId !== chatId) return;

      if (msg.sender === user._id) {
        return;
      }

      queryClient.setQueryData(["chatMessages", chatId], old => {
        if (!old) return old;

        const pages = old.pages.map((page, index) => {
          let messages = page.data.messages || [];

          if (messages.some(m => m._id === msg._id)) return page;

          if (index === 0) {
            messages = [...messages, msg];
          }

          return { ...page, data: { ...page.data, messages } };
        });

        queryClient.setQueryData(["chatsList"], oldList => {
          if (!oldList) return oldList;
          const updatedChats = oldList.data.map(chat => chat._id === chatId ? { ...chat, lastMessage: msg } : chat);
          const chatToMove = updatedChats.find(chat => chat._id === chatId);
          const otherChats = updatedChats.filter(chat => chat._id !== chatId);
          if (!chatToMove) return oldList;
          return { ...oldList, data: [chatToMove, ...otherChats] };
        });

        return { ...old, pages };
      });
    };

    const handleUpdateMessage = (updatedMsg) => {
      if (updatedMsg.chatId !== chatId) return;

      queryClient.setQueryData(["chatMessages", chatId], old => {
        if (!old) return old;
        const pages = old.pages.map(page => ({
          ...page,
          data: {
            ...page.data,
            messages: (page.data.messages || []).map(m => m._id === updatedMsg._id ? updatedMsg : m)
          }
        }));
        return { ...old, pages };
      });
    };

    const handleDeleteMessage = ({ messageId }) => {
      queryClient.setQueryData(["chatMessages", chatId], old => {
        if (!old) return old;
        const pages = old.pages.map(page => ({
          ...page,
          data: {
            ...page.data,
            messages: (page.data.messages || []).filter(m => m._id !== messageId)
          }
        }));
        return { ...old, pages };
      });
    };

    const handleTypingEvent = ({ chatId: cId, userId }) => {
      if (cId === chatId && userId !== user._id) setTypingUser(userId);
    };

    const handleStopTypingEvent = ({ chatId: cId, userId }) => {
      if (cId === chatId && userId !== user._id) setTypingUser(null);
    };

    const handleMessageSeen = ({ chatId: cId }) => {
      if (cId !== chatId) return;
      queryClient.setQueryData(["chatMessages", chatId], old => {
        if (!old) return old;
        const pages = old.pages.map(page => ({
          ...page,
          data: {
            ...page.data,
            messages: (page.data.messages || []).map(m => m.sender === user._id ? { ...m, seen: true } : m)
          }
        }));
        return { ...old, pages };
      });
    };

    const handleUserJoin = ({ userId, chatId: cId }) => {
      if (cId === chatId && userId !== user._id) {
        setOnlineUsers(prev => ({ ...prev, [userId]: true }));
      }
    };

    const handleUserLeave = ({ userId, chatId: cId }) => {
      if (cId === chatId && userId !== user._id) {
        setOnlineUsers(prev => ({ ...prev, [userId]: false }));
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:update", handleUpdateMessage);
    socket.on("message:delete", handleDeleteMessage);
    socket.on("typing", handleTypingEvent);
    socket.on("stop-typing", handleStopTypingEvent);
    socket.on("message:seen", handleMessageSeen);
    socket.on("user:join", handleUserJoin);
    socket.on("user:leave", handleUserLeave);

    return () => {
      socket.emit("chat:leave", { chatId, userId: user._id });

      socket.off("message:new", handleNewMessage);
      socket.off("message:update", handleUpdateMessage);
      socket.off("message:delete", handleDeleteMessage);
      socket.off("typing", handleTypingEvent);
      socket.off("stop-typing", handleStopTypingEvent);
      socket.off("message:seen", handleMessageSeen);
      socket.off("user:join", handleUserJoin);
      socket.off("user:leave", handleUserLeave);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [selectedChat?._id, user._id, queryClient]);

  useEffect(() => {
    socket.emit("user:join-global", { userId: user._id });

    return () => {
      socket.emit("user:leave-global", { userId: user._id });
    };
  }, [user._id]);

  useEffect(() => {
    socket.on("users:online", (userIds) => {
      const onlineObj = {};
      userIds.forEach(id => onlineObj[id] = true);
      setOnlineUsers(onlineObj);
    });

    return () => {
      socket.off("users:online");
    };
  }, []);

  useEffect(() => {
    if (!selectedChat) return;

    const timeout = setTimeout(() => {
      scrollToBottom("auto");
    }, 100);
    return () => clearTimeout(timeout);
  }, [selectedChat?._id, chatMessages.length]);


  return (
    <section className="h-screen w-full flex text-black dark:text-white bg-gray-100 dark:bg-neutral-950 pt-[80px]">
      <div className={`h-full w-full md:w-1/3 border-r border-black dark:border-white ${selectedChat ? "hidden md:flex" : "flex"} flex-col bg-white dark:bg-neutral-900`}>
        <div className="flex-1 overflow-y-auto">
          {isFetchingChats ? (
            <div className="p-4 flex justify-center items-center text-gray-500 dark:text-gray-400">Loading chats...</div>
          ) : (
            chatsList?.data?.length > 0 ? (
              chatsList.data.map(chat => (
                <div
                  key={chat._id}
                  onClick={() => {
                    setSelectedChat(chat);
                    setTypingUser(null);
                  }}
                  className={`flex items-center gap-3 p-4 cursor-pointer border-b border-black dark:border-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors ${selectedChat?._id === chat?._id ? "bg-gray-100 dark:bg-neutral-950" : "bg-gray-50 dark:bg-neutral-800"}`}
                >
                  <div className="relative">
                    {!getChatImgSrc(chat) ?
                      (
                        <span className="w-12 h-12 rounded-full bg-sky-500 dark:bg-sky-600 flex justify-center items-center text-white font-semibold">{getChatName(chat)?.slice(0, 1)}</span>
                      ) :
                      (
                        <img
                          className="w-12 h-12 rounded-full object-cover"
                          src={getChatImgSrc(chat)}
                          alt={getChatName(chat)}
                        />
                      )
                    }
                    {onlineUsers[getOtherPartyId(chat)] && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900"></span>}
                  </div>
                  <span className="font-medium truncate">{getChatName(chat)}</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">No chats yet. Start a new one!</div>
            )
          )}
        </div>
      </div>

      <div className={`h-full w-full md:w-2/3 ${selectedChat ? "flex" : "hidden md:flex"} flex-col bg-gray-100 dark:bg-neutral-950`}>
        {selectedChat ? (
          <>
            <div className="p-4 flex items-center gap-3 border-b border-black dark:border-white bg-white dark:bg-neutral-900 shadow-sm">
              <button className="text-sky-600 dark:text-sky-400 cursor-pointer hover:text-sky-700 dark:hover:text-sky-300 transition-colors" onClick={() => setSelectedChat(null)}>
                <LucideArrowLeft size={20} />
              </button>
              <div className="relative">
                {!getChatImgSrc(selectedChat) ?
                  (
                    <span className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-sky-500 dark:bg-sky-600 flex justify-center items-center text-white font-semibold">{getChatName(selectedChat)?.slice(0, 1)}</span>
                  ) :
                  (
                    <img
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                      src={getChatImgSrc(selectedChat)}
                      alt={getChatName(selectedChat)}
                    />
                  )
                }
                {onlineUsers[getOtherPartyId(selectedChat)] && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900"></span>}
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-semibold text-sm md:text-base truncate">{getChatName(selectedChat)}</span>
                {onlineUsers[getOtherPartyId(selectedChat)] && <span className="text-xs text-green-500">Online</span>}
              </div>
              {messageToEdit && (
                <div className="flex items-center gap-3 ml-auto">
                  {canEditMessage && (
                    <button onClick={handleClickOnEdit} className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800">
                      <Edit3 size={16} />
                    </button>
                  )}
                  <button onClick={handleDelete} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800">
                    <Trash2 size={16} />
                  </button>
                  <button onClick={() => {
                    setMessageToEdit(null)
                    setEditMessage("")
                    setMessage("")
                    setDisabeTextbox(false)
                    setCanEditMessage(false)
                  }} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 hide-scrollbar bg-gray-100 dark:bg-neutral-950">
              {isFetchingNextPage && <LoaderIcon className="animate-spin self-center mb-2 text-sky-600" />}
              {chatMessages.map(chat => (
                <div key={chat._id} className={`flex ${isSender(chat) ? "justify-end" : "justify-start"} relative`}>
                  <div
                    id={`msg-${chat._id}`}
                    data-unseen={!isSender(chat) && !chat.seen ? 'true' : 'false'}
                    onDoubleClick={() => handleDoubleClick(chat)}
                    className={`max-w-xs md:max-w-md p-3 rounded-2xl break-words relative cursor-pointer transition-all duration-200 shadow-sm border border-black dark:border-white
                      ${isSender(chat)
                        ? "bg-sky-600 dark:bg-sky-700 text-white rounded-br-sm"
                        : "bg-white dark:bg-neutral-900 text-black dark:text-white rounded-bl-sm"
                      }
                      ${messageToEdit === chat._id ? "ring-2 ring-black dark:ring-white scale-[1.02]" : ""}
                      hover:shadow-md
                      `}
                  >
                    {chat.type === "text" ? (
                      <p className="whitespace-pre-wrap">{chat.message}</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {chat.type === "img" && chat.fileUrl?.url ? (
                          <img src={chat.fileUrl.url} className="max-w-full rounded-lg" alt="Shared image" />
                        ) : chat.type === "video" && chat.fileUrl?.url ? (
                          <video src={chat.fileUrl.url} controls className="max-w-full rounded-lg" />
                        ) : chat.fileUrl?.url ? (
                          <a href={chat.fileUrl.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 underline hover:no-underline">
                            {getFileIcon(chat.fileUrl.type)}
                            <span className="truncate">{chat.fileUrl.name || chat.fileUrl.url.split("/").pop()}</span>
                          </a>
                        ) : (
                          <span className="text-sm text-red-400">Error: File not found</span>
                        )}
                        {chat.fileUrl?.url && (
                          <a
                            href={chat.fileUrl.url}
                            download={chat.fileUrl.name || chat.fileUrl.url.split("/").pop()}
                            className={`flex items-center gap-1 text-xs ${isSender(chat) ? "text-white" : "text-sky-600 dark:text-sky-400"} hover:underline`}
                          >
                            <Download size={12} />
                            Download
                          </a>
                        )}
                      </div>
                    )}

                    <div className={`text-[10px] flex justify-end items-center mt-1 ${isSender(chat) ? "text-white/80" : "text-gray-500 dark:text-gray-400"}`}>
                      {chat.edited && <div className="text-xs mr-1 italic">edited</div>}
                      <span>{new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isSender(chat) && (
                        chat._id === sendingMessageId || chat.temp ? (
                          <LoaderIcon size={12} className="ml-1 animate-spin" />
                        ) : chat._id === failedMessageId ? (
                          <RotateCcw size={12} className="ml-1 text-red-300 cursor-pointer hover:text-red-200" onClick={() => handleSend(true)} />
                        ) : chat.seen ? (
                          <span className="flex">
                            <CheckIcon size={14} className="ml-1 text-green-300" />
                            <CheckIcon size={14} className="text-green-300 -ml-2" />
                          </span>
                        ) : (
                          <CheckIcon size={14} className="ml-1 opacity-50" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {typingUser && typingUser === getOtherPartyId(selectedChat) && (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-950">
                <span className="italic">{getChatName(selectedChat)} is typing...</span>
              </div>
            )}

            <div className="w-full p-4 border-t border-black dark:border-white flex gap-3 bg-white dark:bg-neutral-900 ">
              <textarea
                id="message"
                value={message}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(false);
                  }
                }}
                onChange={handleTyping}
                placeholder={messageToEdit ? "Edit message" : "Type a message"}
                disabled={disableTextbox}
                rows={2.5}
                className="flex-1 resize-none hide-scrollbar border border-black dark:border-white rounded-xl px-4 py-3 bg-gray-100 dark:bg-neutral-950 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-600 transition-all"
              />
              <div className="flex flex-col justify-between items-center gap-2">
                <label className="bg-gray-100 dark:bg-neutral-950 hover:bg-gray-200 dark:hover:bg-neutral-800 cursor-pointer flex items-center justify-center px-4 py-2 rounded-xl border border-black dark:border-white transition-colors">
                  <Paperclip size={18} className="text-gray-600 dark:text-gray-400" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.gif,.mp4,.mov,.pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={disableTextbox || !!messageToEdit}
                  />
                </label>
                <button onClick={() => handleSend(false)} className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600 flex justify-center items-center text-white px-4 py-2 rounded-xl transition-colors shadow-sm hover:shadow-md border border-black dark:border-white cursor-pointer">
                  <SendHorizontalIcon size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-neutral-950">
            {isFetchingChats ? (
              <LoaderIcon className="animate-spin text-sky-600" size={32} />
            ) : (
              <span className="text-gray-500 dark:text-gray-400">Select a chat to start a conversation.</span>
            )}
          </div>
        )}
      </div>

      {file && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-2xl max-w-lg w-full mx-4 border border-black dark:border-white">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">File Preview</h2>
            <div className="mb-4 flex items-center justify-center bg-gray-100 dark:bg-neutral-950 rounded-xl p-4 border border-black dark:border-white">
              {file.type.startsWith("image/") ? (
                <img src={URL.createObjectURL(file)} alt="File Preview" className="max-h-64 object-contain rounded-lg" />
              ) : file.type.startsWith("video/") ? (
                <video src={URL.createObjectURL(file)} controls className="max-h-64 object-contain rounded-lg" />
              ) : (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="text-gray-600 dark:text-gray-400">
                    {getFileIcon(file.type)}
                  </div>
                  <span className="mt-2 text-center break-words text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setFile(null); setMessage(""); }}
                className="px-5 py-2.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-xl text-black dark:text-white transition-colors border border-black dark:border-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSend();
                  setFile(null);
                }}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600 text-white rounded-xl transition-colors shadow-sm hover:shadow-md border border-black dark:border-white cursor-pointer"
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