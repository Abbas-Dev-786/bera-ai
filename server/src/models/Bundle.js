import mongoose from "mongoose";

const bundleSchema = new mongoose.Schema(
  {
    artifactId: {
      type: String,
      required: false,
    },
    createdBy: {
      type: String,
      required: false,
    },
    bundleId: {
      type: String,
      required: true,
      unique: true,
    },
    preview: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ["awaiting_signature", "submitted", "executed", "failed"],
      default: "awaiting_signature",
    },
    txHash: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Bundle = mongoose.model("Bundle", bundleSchema);

