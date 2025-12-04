import mongoose from "mongoose";

const auditResultSchema = new mongoose.Schema(
  {
    artifactId: {
      type: String,
      required: false,
    },
    report: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    summary: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    score: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

export const AuditResult = mongoose.model("AuditResult", auditResultSchema);

