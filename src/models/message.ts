import mongoose, { Schema, model, models } from "mongoose";

const MessageSchema = new Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Sender is required"]
    },
    room: {
        type: Number,
        required: [true, "Room is required"]
    },
    role: {
        type: String,
        required: [true, "Role is required"]
    },
    text : {
        type: String,
        required: [true, "Text is required"]
    }
}, {timestamps: true});

const Message = models.Message || model("Message", MessageSchema);

export default Message;