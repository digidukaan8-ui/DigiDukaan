import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import Store from "../models/store.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.config.js";
import { getIO } from "../socket.js";

const handleFirstChat = async (userId, storeId, storeUserId) => {
  const existingChat = await Chat.findOne({ userId, storeId });
  if (existingChat) {
    return existingChat._id;
  }
  const newChat = await Chat.create({ userId, storeId, storeUserId });
  return newChat._id;
}

const addMessage = async (req, res) => {
  try {
    let { chatId, sender, receiver, message, storeId } = req.body;

    const senderExist = await User.findById(sender);
    const receiverExist = await User.findById(receiver);
    if (!senderExist || !receiverExist) {
      return res.status(404).json({ success: false, message: "User id not found" });
    }

    let type;
    let fileData = null;
    let finalMessage = "";

    if (req.file) {
      if (req.file.mimetype.startsWith("image/")) {
        type = "img";
      } else if (req.file.mimetype.startsWith("video/")) {
        type = "video";
      } else if (
        req.file.mimetype === "application/pdf" ||
        req.file.mimetype === "application/msword" ||
        req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        type = "file";
      } else {
        return res.status(400).json({ success: false, message: "Unsupported file type" });
      }

      const uploaded = await uploadToCloudinary(req.file.path);
      if (!uploaded) {
        return res.status(400).json({ success: false, message: "File upload failed" });
      }

      fileData = {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
      };
    } else if (message && typeof message === "string") {
      finalMessage = message.trim();
      type = "text";
    } else {
      return res.status(400).json({ success: false, message: "Message or file is required" });
    }

    if (storeId && !chatId) {
      if (sender === req.user._id.toString()) {
        chatId = await handleFirstChat(sender, storeId, receiver);
      }
    }

    const data = await Message.create({
      chatId,
      sender,
      receiver,
      message: finalMessage,
      type,
      fileUrl: fileData,
    });

    getIO().to(chatId).emit("message:new", data);

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data,
    });
  } catch (error) {
    console.error("Error in Add Message controller: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getChats = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const chats = await Chat.find({
      $or: [{ userId }, { storeUserId: userId }],
    }).lean();

    const processedChats = await Promise.all(
      chats.map(async (chat) => {
        let otherPartyDetails = null;
        if (chat.userId.toString() === userId) {
          const store = await Store.findById(chat.storeId.toString()).select("_id userId name img");
          if (store) {
            otherPartyDetails = {
              _id: store._id,
              userId: store.userId,
              name: store.name,
              img: store.img,
            };
          }
        } else {
          const user = await User.findById(chat.userId.toString()).select("_id name avatar");
          if (user) {
            otherPartyDetails = {
              _id: user._id,
              name: user.name,
              avatar: user.avatar,
            };
          }
        }
        return {
          _id: chat._id,
          otherPartyDetails,
        };
      })
    );

    return res.status(200).json({ success: true, message: "Chats fetched successfully", data: processedChats || [] });
  } catch (error) {
    console.error("Error in get chats controller: ", error);
    return res.status(500).json({ success: false, message: "Internal server error", });
  }
};

const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { skip = 0 } = req.query;

    if (!chatId) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    let messages = await Message.find({ chatId })
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(30)
      .lean();

    messages = messages.reverse();

    const totalMessages = await Message.countDocuments({ chatId });
    const more = skip + messages.length < totalMessages;

    return res.status(200).json({
      success: true,
      data: {
        messages,
        hasMore: more
      }
    });
  } catch (error) {
    console.error("Error in Chat Messages controller: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { messageId } = req.params;
    const userId = req.user._id;

    if (!messageId || !message) {
      return res.status(400).json({ success: false, message: 'Message ID and new text are required' });
    }

    if (typeof message !== 'string' || typeof messageId !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid input format' });
    }

    const messageExist = await Message.findById(messageId);
    if (!messageExist) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (messageExist.sender.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this message' });
    }

    if (messageExist.type !== "text") {
      return res.status(400).json({ success: false, message: 'Only text messages can be edited' });
    }

    messageExist.message = message.trim();
    messageExist.edited = true;

    await messageExist.save();
    getIO().to(messageExist.chatId.toString()).emit("message:update", messageExist);

    return res.status(200).json({ success: true, message: 'Message updated successfully', data: messageExist });
  } catch (error) {
    console.error("Error in Update Messages controller: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const removeMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    if (!messageId) {
      return res.status(400).json({ success: false, message: "Message ID is required" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this message" });
    }

    if (message.type !== "text" && message.fileUrl?.publicId) {
      try {
        await deleteFromCloudinary(message.fileUrl.publicId);
      } catch (error) {
        console.error("Cloudinary delete error:", error);
      }
    }

    await message.deleteOne();
    getIO().to(message.chatId.toString()).emit("message:delete", { messageId });

    return res.status(200).json({ success: true, message: "Message removed successfully" });
  } catch (error) {
    console.error("Error in Remove Message controller:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const markMessageSeen = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (message.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (!message.seen) {
      message.seen = true;
      await message.save();

      getIO().to(message.chatId.toString()).emit("message:seen", {
        messageId: message._id,
        chatId: message.chatId,
        seenBy: userId,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message marked as seen",
      data: message
    });
  } catch (error) {
    console.error("Error in markMessageSeen:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const markAllMessagesSeen = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    if (!chatId) {
      return res.status(400).json({ success: false, message: "Chat ID is required" });
    }

    const result = await Message.updateMany(
      {
        chatId,
        receiver: userId,
        seen: false
      },
      { $set: { seen: true } }
    );

    if (result.modifiedCount > 0) {
      getIO().to(chatId).emit("chat:seen-all", {
        chatId: chatId,
        seenBy: userId,
      });
    }

    return res.status(200).json({
      success: true,
      message: `${result.modifiedCount} messages marked as seen`,
    });
  } catch (error) {
    console.error("Error in markAllMessagesSeen:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { addMessage, getChats, getChatMessages, updateMessage, removeMessage, markMessageSeen, markAllMessagesSeen };