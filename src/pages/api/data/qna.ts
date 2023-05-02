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
        const qnas = await QnA.find();

        /*
          {
            "success": true,
            "messages": [
                {
                    "_id": "644ea2d391a4f18cd687d143",
                    "question": "Hello",
                    "answer": "Hello, how can I help you today?",
                    "__v": 0
                },
                {
                    "_id": "644ea37c91a4f18cd687d148",
                    "question": "Who are you?",
                    "answer": "I am boleeehhh, an AI model chatbot that can assist you in generating human-like responses to their question and provide information.",
                    "__v": 0
                }
            ]
        }

        qnas kayak gini ngaksesnya brarti qnas.messages (ini return array of object)
        */

        // ALGORITMA DISINI NANTI RETURN YANG DI BAWAH DIGANTI YA
        // misal res = hasilnya nah tapi kalo bisa si messagesnya yg di return
        // kek messages[0] gitu
        // tapi kalo misal mau banyak kek yang milih terdekat juga gapapa
        // bikin aja yang penting returnya object
        // contoh
        /*
        res = {
          string="ITB adalah ...."; itu qnas yang dibawah diganti
        }

        sama coba cari cara biar dia bisa newline gitu gatau kalo string naro "\n" bisa apa gak

        */
        return res.status(200).json({
            success: true,
            qnas // ini diganti ya
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