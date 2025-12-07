import mongoose from "mongoose";

const queryLogSchema = new mongoose.Schema(
    {
        query: {
            type: String,
            required: true,
        },
        tone: {
            type: String,
            default: "beginner",
        },
        response: {
            type: mongoose.Schema.Types.Mixed,
            required: false,
        },
        status: {
            type: String,
            enum: ["success", "failed"],
            default: "success",
        },
    },
    {
        timestamps: true,
    }
);

export const QueryLog = mongoose.model("QueryLog", queryLogSchema);
