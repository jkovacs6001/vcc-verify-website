export type Role =
  | "Developer"
  | "Marketer"
  | "Market Maker"
  | "Moderator"
  | "Web3 Worker";

export type VerificationStatus = "Verified" | "Pending";

export interface Professional {
  id: string;
  name: string;
  alias?: string;
  role: Role;
  status: VerificationStatus;
  twitter?: string;
  telegram?: string;
  website?: string;
  // wallet is now optional / nullable
  wallet?: string | null;
  region?: string;
  tags: string[];
  projects: { name: string; link?: string }[];
  verifiedAt?: string;
}

export const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: "soldev-001",
    name: "Astra Labs",
    alias: "astra_dev",
    role: "Developer",
    status: "Verified",
    twitter: "https://twitter.com/astra_dev",
    telegram: "https://t.me/astra_dev",
    website: "https://astra.dev",
    wallet: "9x5CLPb3SeYSBKvautqpJWPjX9TUCVcWTS12Xawapump",
    region: "EU",
    tags: ["Solana", "Token Contracts", "Bots"],
    projects: [
      { name: "Solar DEX" },
      { name: "Nebula NFT Launchpad" },
    ],
    verifiedAt: "2025-10-12",
  },
  {
    id: "mm-001",
    name: "Nova Flow MM",
    role: "Market Maker",
    status: "Verified",
    twitter: "https://twitter.com/novaflowmm",
    wallet: "8P3CLPb3SeYSBKvautqpJWPjX9TUCVcWTS12Xawa1111",
    region: "US",
    tags: ["Market Making", "Liquidity Strategy"],
    projects: [{ name: "VampCatCoin (VCC)" }, { name: "OrbitFi" }],
    verifiedAt: "2025-09-03",
  },
  {
    id: "marketer-001",
    name: "Luna Signal",
    role: "Marketer",
    status: "Pending",
    twitter: "https://twitter.com/lunasignal",
    telegram: "https://t.me/lunasignal",
    wallet: "5Z2CLPb3SeYSBKvautqpJWPjX9TUCVcWTS12Xawa2222",
    region: "Asia",
    tags: ["Influencer Campaigns", "Spaces Host"],
    projects: [{ name: "CometCoin" }],
  },
];
