import { NextApiRequest, NextApiResponse } from "next";
import { connectToMongoDB } from "@/lib/mongodb";
import Message from "@/models/message";
import mongoose from "mongoose";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  connectToMongoDB().catch((err) => res.json(err));

  if (req.method === "POST") {
    if (!req.body) {
      return res.status(400).json({ error: "Data is missing" });
    }
    const { sender, room, role, text } = req.body;

    try {
      const createdMessage = await Message.create({
        sender,
        room,
        role,
        text
      });

      const message = {
        sender: createdMessage.sender,
        room: createdMessage.room,
        role: createdMessage.role,
        text: createdMessage.text,
        timestamps: createdMessage.timestamps,
        _id: createdMessage._id,
      };

      return res.status(201).json({
        success: true,
        message,
      });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        for (let field in error.errors) {
          const msg = error.errors[field].message;

          return res.status(409).json({ error: msg });
        }
      }

      return res.status(500).json({ error: error });
    }
  } else if (req.method === "GET") {
    try {
        const senderId = req.query.senderId;
        const roomNumber = req.query.roomNumber;

        let messages;
        if (roomNumber) {
          messages = await Message.find({ sender: senderId, room: roomNumber });
        } else {
          messages = await Message.find({ sender: senderId });
        }

        return res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
          for (let field in error.errors) {
            const msg = error.errors[field].message;

            return res.status(409).json({ error: msg });
          }
        }
        return res.status(500).json({ error: error });
    }
  } else if (req.method === "DELETE") {
    try {
      const senderId = req.query.senderId;
      const roomNumber = req.query.roomNumber;
      const messages = await Message.find({ sender: senderId, room: roomNumber });

      if (messages) {
        await Message.deleteMany({ sender: senderId, room: roomNumber });
      }

      return res.status(200).json({
        success: true,
        messages
      })
    } catch (error) {
      
    }
  } else {
    res.status(405).json({ error: "Method's not allowed" });
  }
};

export default handler;