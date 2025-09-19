import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const addMessage = async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

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
    }
    else if (message && typeof message === "string") {
      finalMessage = message.trim();
      type = "text";
    }
    else {
      return res.status(400).json({ success: false, message: "Message or file is required" });
    }

    const data = await Chat.create({
      sender,
      receiver,
      message: finalMessage,
      type,
      fileUrl: fileData,
    });

    return res.status(201).json({
      success: true,
      message: "Chat sent successfully",
      data,
    });
  } catch (error) {
    console.error("Error in Add Message controller: ", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { addMessage };