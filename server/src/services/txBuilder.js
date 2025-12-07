import { ethers } from "ethers";

// Minimal ABIs
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
];

const ROUTER_ABI = [
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
];

// PancakeSwap V2 Router on BNB Chain
const PANCAKESWAP_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";

export const TxBuilder = {
  /**
   * Encode ERC20 transfer data
   */
  encodeTransfer: (to, amount) => {
    const iface = new ethers.Interface(ERC20_ABI);
    return iface.encodeFunctionData("transfer", [to, amount]);
  },

  /**
   * Encode ERC20 approve data
   */
  encodeApprove: (spender, amount) => {
    const iface = new ethers.Interface(ERC20_ABI);
    return iface.encodeFunctionData("approve", [spender, amount]);
  },

  /**
   * Encode Swap data (PancakeSwap V2 style)
   */
  encodeSwap: ({
    type = "tokensForTokens", // tokensForTokens, ethForTokens, tokensForEth
    amountIn,
    amountOutMin,
    path,
    to,
    deadline,
  }) => {
    const iface = new ethers.Interface(ROUTER_ABI);
    const dl = deadline || Math.floor(Date.now() / 1000) + 60 * 20; // 20 mins default

    if (type === "tokensForTokens") {
      return iface.encodeFunctionData("swapExactTokensForTokens", [
        amountIn,
        amountOutMin,
        path,
        to,
        dl,
      ]);
    } else if (type === "ethForTokens") {
      return iface.encodeFunctionData("swapExactETHForTokens", [
        amountOutMin,
        path,
        to,
        dl,
      ]);
    } else if (type === "tokensForEth") {
      return iface.encodeFunctionData("swapExactTokensForETH", [
        amountIn,
        amountOutMin,
        path,
        to,
        dl,
      ]);
    }
    throw new Error(`Unknown swap type: ${type}`);
  },

  getRouterAddress: () => PANCAKESWAP_ROUTER,

  /**
   * Encode Contract Deployment data
   */
  encodeDeploy: (bytecode, abi, args = []) => {
    if (!bytecode) throw new Error("Bytecode is required for deployment");

    // If we have ABI and args, we use ContractFactory to encode constructor args
    if (abi && args.length > 0) {
      const factory = new ethers.ContractFactory(abi, bytecode);
      return factory.getDeployTransaction(...args).data;
    }

    // If no args needed (or no ABI provided), return bytecode as-is
    // Ensure it starts with 0x
    return bytecode.startsWith("0x") ? bytecode : "0x" + bytecode;
  },
};
