import mongoose from "mongoose";

const contractArtifactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: "generated_contract",
    },
    spec: {
      type: String,
      required: true,
    },
    solidity: {
      type: String,
      required: true,
    },
    abi: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    bytecode: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const ContractArtifact = mongoose.model(
  "ContractArtifact",
  contractArtifactSchema
);

