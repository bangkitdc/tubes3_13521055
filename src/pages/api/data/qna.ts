import { NextApiRequest, NextApiResponse } from "next";
import { connectToMongoDB } from "@/lib/mongodb";
import QnA from "@/models/qna";
import mongoose from "mongoose";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  connectToMongoDB().catch((err) => res.json(err));

  if (req.method === "POST") {
    if (!req.body) {
      return res.status(400).json({ error: "Data is missing" });
    }
    const { question, answer } = req.body;

    const messageExists = await QnA.findOne({ question });

    if (question.length < 1) {
    return res
        .status(409)
        .json({ error: "Question should be at least 1 characters long" });
    }
    try {
        if (messageExists) {
            messageExists.answer = answer;
            await messageExists.save();
            const message = messageExists;

            return res.status(200).json({
                success: true,
                message,
            });
        } else {
            const createdQnA = await QnA.create({
                question,
                answer
            });

            const message = {
                question: createdQnA.question,
                answer: createdQnA.answer,
                _id: createdQnA._id,
            };

            return res.status(201).json({
                success: true,
                message,
            });
        }
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
        const messages = await QnA.find();
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
  } else {
    res.status(405).json({ error: "Method's not allowed" });
  }
};

export default handler;