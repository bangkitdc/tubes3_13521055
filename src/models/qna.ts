import { Schema, model, models } from "mongoose";

const QnASchema = new Schema({
    question: {
        type: String,
        unique: true,
        required: [true, "Question is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    },
});

const QnA = models.QnA || model("QnA", QnASchema);

export default QnA;