import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import {
  genAddressSeed,
  generateNonce,
  generateRandomness,
  getZkLoginSignature,
  jwtToAddress,
} from "@mysten/zklogin";
import { jwtDecode } from "jwt-decode";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";

const NETWORK = "devnet";
const MAX_EPOCH = 2;
const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";
const REDIRECT_URL = "https://t.me/YOUR_BOT_USERNAME"; // Replace with your Telegram bot's username
// const EMAIL_SERVICE = "YOUR_EMAIL_SERVICE"; // e.g., "gmail"
// const EMAIL_USER = "YOUR_EMAIL_ADDRESS";
// const EMAIL_PASS = "YOUR_EMAIL_PASSWORD";

const suiClient = new SuiClient({
  url: getFullnodeUrl(NETWORK),
});

export type OpenIdProvider = "Google";

export type SetupData = {
  provider: OpenIdProvider;
  maxEpoch: number;
  randomness: string;
  ephemeralPrivateKey: string;
  nonce: string;
};

export type AccountData = {
  provider: OpenIdProvider;
  userAddr: string;
  zkProofs: ZkProofs;
  ephemeralPrivateKey: string;
  userSalt: string;
  sub: string;
  aud: string;
  maxEpoch: number;
};

interface ZkProofs {
  proofPoints: {
    a: string[];
    b: string[][];
    c: string[];
  };
  issBase64Details: {
    value: string;
    indexMod4: number;
  };
  headerBase64: string;
}

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        openLink: (url: string) => void;
        MainButton: {
          setText: (text: string) => void;
        };
      };
    };
  }
}

export const beginZkLogin = async (
  provider: OpenIdProvider
): Promise<SetupData> => {
  const { epoch } = await suiClient.getLatestSuiSystemState();
  const maxEpoch = Number(epoch) + MAX_EPOCH;
  const ephemeralKeyPair = new Ed25519Keypair();
  const randomness = generateRandomness();
  const nonce = generateNonce(
    ephemeralKeyPair.getPublicKey(),
    maxEpoch,
    randomness
  );

  const setupData: SetupData = {
    provider,
    maxEpoch,
    randomness: randomness.toString(),
    ephemeralPrivateKey: ephemeralKeyPair.getSecretKey().toString(),
    nonce: nonce.toString(),
  };

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&response_type=id_token&redirect_uri=${REDIRECT_URL}&scope=openid%20email&nonce=${nonce}`;

  // Use the Utils component to open the Telegram link
  window.Telegram.WebApp.openLink(authUrl);

  return setupData;
};

export const completeZkLogin = async (
  jwt: string,
  setupData: SetupData
): Promise<AccountData> => {
  const jwtPayload = jwtDecode(jwt) as {
    sub?: string;
    aud?: string | string[];
    email?: string;
  };
  if (!jwtPayload.sub || !jwtPayload.aud || !jwtPayload.email) {
    throw new Error("Missing jwt.sub, jwt.aud, or jwt.email");
  }

  const userSalt = BigInt(
    Buffer.from(jwtPayload.email).reduce((acc, byte) => acc + byte, 0)
  );

  // Send salt via Telegram Mini App
  window.Telegram.WebApp.MainButton.setText(JSON.stringify({ salt: userSalt.toString() }));

  const userAddr = jwtToAddress(jwt, userSalt);

  const zkProofs = await getZkProof(jwt, setupData, userSalt);

  return {
    provider: setupData.provider,
    userAddr,
    zkProofs,
    ephemeralPrivateKey: setupData.ephemeralPrivateKey,
    userSalt: userSalt.toString(),
    sub: jwtPayload.sub,
    aud:
      typeof jwtPayload.aud === "string" ? jwtPayload.aud : jwtPayload.aud[0],
    maxEpoch: setupData.maxEpoch,
  };
};

export const sendTransaction = async (account: AccountData): Promise<void> => {
  const tx = new Transaction();
  tx.setSender(account.userAddr);

  const ephemeralKeyPair = keypairFromSecretKey(account.ephemeralPrivateKey);
  const { bytes, signature: userSignature } = await tx.sign({
    client: suiClient,
    signer: ephemeralKeyPair,
  });

  const addressSeed = genAddressSeed(
    BigInt(account.userSalt),
    "sub",
    account.sub,
    account.aud
  ).toString();

  const zkLoginSignature = getZkLoginSignature({
    inputs: {
      ...account.zkProofs,
      addressSeed,
    },
    maxEpoch: account.maxEpoch,
    userSignature,
  });

  await suiClient.executeTransactionBlock({
    transactionBlock: bytes,
    signature: zkLoginSignature,
    options: {
      showEffects: true,
    },
  });
};

function keypairFromSecretKey(privateKeyBase64: string): Ed25519Keypair {
  const keyPair = decodeSuiPrivateKey(privateKeyBase64);
  return Ed25519Keypair.fromSecretKey(keyPair.secretKey);
}

async function getZkProof(
  jwt: string,
  setupData: SetupData,
  userSalt: bigint
): Promise<ZkProofs> {
  const PROVER_URL = "https://prover-dev.mystenlabs.com/v1";
  const response = await fetch(PROVER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jwt,
      extendedEphemeralPublicKey: keypairFromSecretKey(
        setupData.ephemeralPrivateKey
      )
        .getPublicKey()
        .toBase64(),
      maxEpoch: setupData.maxEpoch.toString(),
      jwtRandomness: setupData.randomness,
      salt: userSalt.toString(),
      keyClaimName: "sub",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get ZK proof: ${response.statusText}`);
  }

  return await response.json();
}
