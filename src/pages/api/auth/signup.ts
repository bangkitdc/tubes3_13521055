import { NextApiRequest, NextApiResponse } from "next";
import { connectToMongoDB } from "@/lib/mongodb";
import { hash } from "bcryptjs";
import User from "@/models/user";
import mongoose from "mongoose";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  connectToMongoDB().catch((err) => res.json(err));

  if (req.method === "POST") {
    if (!req.body) {
      return res.status(400).json({ error: "Data is missing" });
    }
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(409).json({ error: "User already exists" });
    } else {
      if (password.length < 8) {
        return res
          .status(409)
          .json({ error: "Password should be at least 8 characters long" });
      }

      const hashedPassword = await hash(password, 12);

      try {
        const createdUser = await User.create({
          name,
          email,
          password: hashedPassword,
        });

        const user = {
          email: createdUser.email,
          name: createdUser.name,
          _id: createdUser._id,
        };

        return res.status(201).json({
          success: true,
          user,
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
    }
  } else {
    res.status(405).json({ error: "Method's not allowed" });
  }
};

export default handler;