"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Copy, Check, ExternalLink } from "lucide-react";
import { BrowserWallet, useWallet } from "@meshsdk/react";
import { BlockfrostProvider } from "@meshsdk/core";

// Initialize Blockfrost provider (you would use your own API key in production)
const blockfrostApiKey =
  process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || "preview_api_key";
const blockfrostProvider = new BlockfrostProvider(blockfrostApiKey);

export function WalletConnector() {
  const { wallet, connected, connecting, disconnect, connect } = useWallet();
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [network, setNetwork] = useState<string | null>(null);

  useEffect(() => {
    if (connected && wallet) {
      const fetchWalletInfo = async () => {
        try {
          const addresses = await wallet.getRewardAddresses();
          setAddress(addresses[0] || null);

          // Get balance
          const utxos = await wallet.getUtxos();
          let totalLovelace = 0;
          utxos.forEach((utxo) => {
            utxo.output.amount.forEach((asset) => {
              if (asset.unit === "lovelace") {
                totalLovelace += parseInt(asset.quantity);
              }
            });
          });
          setBalance((totalLovelace / 1000000).toFixed(2)); // Convert lovelace to ADA

          // Get network ID
          const networkId = await wallet.getNetworkId();
          setNetwork(networkId === 0 ? "Testnet" : "Mainnet");
        } catch (error) {
          console.error("Error fetching wallet info:", error);
        }
      };

      fetchWalletInfo();
    }
  }, [connected, wallet]);

  const handleConnect = async (walletName: string) => {
    try {
      await connect(walletName);
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const viewOnExplorer = () => {
    if (address) {
      const baseUrl =
        network === "Mainnet"
          ? "https://cardanoscan.io/address/"
          : "https://preview.cardanoscan.io/address/";
      window.open(`${baseUrl}${address}`, "_blank");
    }
  };

  if (connected) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Connected Wallet
          </CardTitle>
          <CardDescription>
            Manage your Cardano wallet connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Network</p>
              <Badge variant="secondary" className="mt-1">
                {network || "Unknown"}
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={disconnect}>
              Disconnect
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Wallet Address</p>
            <div className="flex gap-2">
              <code className="flex-1 bg-secondary p-2 rounded text-xs font-mono break-all">
                {address
                  ? `${address.substring(0, 12)}...${address.substring(
                      address.length - 8
                    )}`
                  : "Loading..."}
              </code>
              <Button variant="outline" size="sm" onClick={copyAddress}>
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={viewOnExplorer}>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Balance</p>
            <p className="text-2xl font-bold mt-1">
              {balance ? `${balance} ADA` : "Loading..."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Connect Wallet
        </CardTitle>
        <CardDescription>
          Connect your Cardano wallet to interact with the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Supported wallets:</p>
          <div className="grid grid-cols-2 gap-3">
            <BrowserWallet.Card
              walletName="eternl"
              onConnect={() => handleConnect("eternl")}
              disabled={connecting}
            />
            <BrowserWallet.Card
              walletName="flint"
              onConnect={() => handleConnect("flint")}
              disabled={connecting}
            />
            <BrowserWallet.Card
              walletName="nami"
              onConnect={() => handleConnect("nami")}
              disabled={connecting}
            />
            <BrowserWallet.Card
              walletName="typhon"
              onConnect={() => handleConnect("typhon")}
              disabled={connecting}
            />
          </div>
        </div>

        {connecting && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Connecting to wallet...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
