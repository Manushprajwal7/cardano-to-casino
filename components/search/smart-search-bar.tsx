"use client";

import { useState } from "react";
import { Search, Sparkles, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";import { Card } from "@/components/ui/card";

interface SearchSuggestion {
  query: string;
  type: "session" | "transaction" | "audit" | "settlement";
  description: string;
}

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp?: number;
  amount?: number;
}

export function SmartSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions] = useState<SearchSuggestion[]>([
    {
      query: "show me all wins over 100 ADA yesterday",
      type: "session",
      description: "Natural language filter for high-value wins",
    },
    {
      query: "transactions from addr1qx2...",
      type: "transaction",
      description: "Search by wallet address",
    },
    {
      query: "failed settlements in last 24 hours",
      type: "settlement",
      description: "Filter by status and time range",
    },
    {
      query: "audit proofs for session SES-001",
      type: "audit",
      description: "Direct session lookup",
    },
  ]);

  const parseQuery = (searchQuery: string): SearchResult[] => {
    const lowerQuery = searchQuery.toLowerCase();
    const mockResults: SearchResult[] = [];

    // Simple pattern matching for demo
    if (lowerQuery.includes("win") && lowerQuery.includes("ada")) {
      mockResults.push({
        id: "SES-2024-145",
        type: "Win Session",
        title: "₳245.50 Win",
        description: "Player addr1qx2...3f7g won ₳245.50 in Blackjack",
        timestamp: Date.now() - 86400000,
        amount: 245.5,
      });
      mockResults.push({
        id: "SES-2024-178",
        type: "Win Session",
        title: "₳180.25 Win",
        description: "Player addr1qy8...9h2j won ₳180.25 in Roulette",
        timestamp: Date.now() - 72000000,
        amount: 180.25,
      });
    }

    if (lowerQuery.includes("settlement") || lowerQuery.includes("failed")) {
      mockResults.push({
        id: "SETT-2024-032",
        type: "Failed Settlement",
        title: "Settlement SETT-2024-032",
        description: "Failed due to insufficient UTXOs",
        timestamp: Date.now() - 3600000,
      });
    }

    if (lowerQuery.includes("audit") || lowerQuery.includes("proof")) {
      mockResults.push({
        id: "AUDIT-2024-067",
        type: "Audit Proof",
        title: "Merkle Proof Verified",
        description: "Session SES-001 proof successfully verified on-chain",
        timestamp: Date.now() - 7200000,
      });
    }

    return mockResults;
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.length > 3) {
      const parsedResults = parseQuery(searchQuery);
      setResults(parsedResults);
    } else {
      setResults([]);
    }
  };

  const getTypeColor = (type: string) => {
    if (type.includes("Win")) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (type.includes("Failed")) return "bg-red-500/20 text-red-400 border-red-500/30";
    if (type.includes("Audit")) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    return "bg-purple-500/20 text-purple-400 border-purple-500/30";
  };

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Sparkles className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 neon-green animate-pulse" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Ask anything... e.g., 'show me all wins over 100 ADA yesterday'"
          className="pl-12 pr-12 py-6 text-lg glass-card border-green-500/30 focus:border-green-500/60 transition-all"
        />
      </div>

      {/* Suggestions */}
      {query.length === 0 && (
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>Try these queries:</span>
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(suggestion.query)}
                className="w-full text-left p-3 rounded-lg glass hover:bg-green-500/10 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium group-hover:text-primary transition-colors">
                      {suggestion.query}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {suggestion.description}
                    </div>
                  </div>
                  <Badge className={getTypeColor(suggestion.type)}>{suggestion.type}</Badge>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Card className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 neon-green" />
              <span className="text-sm font-medium">
                Found {results.length} result{results.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                className="p-4 rounded-lg glass hover:bg-green-500/10 transition-all duration-200 cursor-pointer animate-fade-in-up"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(result.type)}>{result.type}</Badge>
                      <span className="font-mono text-sm text-muted-foreground">{result.id}</span>
                    </div>
                    <div className="font-semibold text-lg">{result.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{result.description}</div>
                  </div>
                  {result.timestamp && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{Math.floor((Date.now() - result.timestamp) / 3600000)}h ago</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
