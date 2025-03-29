"use client";

import { useCopilotChat } from "@copilotkit/react-core";
import { Message, TextMessage } from "@copilotkit/runtime-client-gql";
import { createContext, ReactNode, useContext, useState } from "react";

interface DocumentContextValue {
  // Document text management
  documentText: string;
  setDocumentText: (text: string) => void;

  visibleMessages: Message[];
  appendMessage: (message: TextMessage) => void;
  setMessages: (messages: TextMessage[]) => void;
  deleteMessage: (id: string) => void;
  reloadMessages: () => void;
  stopGeneration: () => void;
  isLoading: boolean;
}

const DocumentContext = createContext<DocumentContextValue | null>(null);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const {
    visibleMessages,
    appendMessage,
    setMessages,
    deleteMessage,
    reloadMessages,
    stopGeneration,
    isLoading,
  } = useCopilotChat();

  const [documentText, setDocumentText] = useState("");

  const value: DocumentContextValue = {
    documentText,
    setDocumentText,
    visibleMessages,
    appendMessage,
    setMessages,
    deleteMessage,
    reloadMessages,
    stopGeneration,
    isLoading,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

// Custom hook for using the context
export function useDocumentContext() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error(
      "useDocumentContext must be used within a DocumentProvider"
    );
  }
  return context;
}
