"use client";

import { useDocumentContext } from "@/app/context/DocumentContext";
import { LANGGRAPH_CONFIG } from "@/config"; // Import your config
import { useCoAgent } from "@copilotkit/react-core"; // Import the CoAgent hook
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";
import { Transition } from "@headlessui/react";
import { Fragment, MouseEvent, useEffect, useState } from "react";
import { ConfirmChangesModal } from "./ConfirmChangesModal";

export function CustomChatInterface(): JSX.Element {
  const { visibleMessages, appendMessage, stopGeneration, isLoading } =
    useDocumentContext();

  // Input state for user messages
  const [inputValue, setInputValue] = useState<string>("");
  // Modal state (if needed for confirmation)
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  // Initialize the LangGraph agent with additional configuration.
  const { agentState, sendAgentMessage } = useCoAgent({
    name: "langgraphAgent",
    initialState: { input: "" },
    config: {
      apiEndpoint: LANGGRAPH_CONFIG.apiEndpoint,
      headers: {
        Authorization: `Bearer ${LANGGRAPH_CONFIG.apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: LANGGRAPH_CONFIG.timeout,
    },
  });

  // When a user sends a message, forward it to the agent.
  const handleSend = (): void => {
    if (inputValue.trim() !== "") {
      appendMessage(new TextMessage({ content: inputValue, role: Role.User }));
      sendAgentMessage({ input: inputValue });
      setInputValue("");
    }
  };

  // Listen for the agent's final response.
  useEffect(() => {
    if (agentState && agentState.final_response) {
      appendMessage(
        new TextMessage({
          content: agentState.final_response,
          role: Role.Assistant,
        })
      );
      // Optionally, open a modal for confirmation
      setIsConfirmOpen(true);
    }
  }, [agentState, appendMessage]);

  // Stop generating (with event propagation stopped)
  const handleStopClick = (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    stopGeneration();
  };

  // Modal callbacks
  const handleCloseModal = (): void => setIsConfirmOpen(false);
  const handleConfirm = (): void => {
    // Apply AI changes to the document if necessary.
    setIsConfirmOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message List */}
      <div className="flex-grow overflow-y-auto mb-4 space-y-2">
        {visibleMessages.map((msg, index) => (
          <Transition
            as={Fragment}
            key={index}
            appear={true}
            show={true}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
          >
            <div
              className={`p-2 rounded-md max-w-[80%] break-words ${
                msg.role === Role.User
                  ? "bg-blue-100 self-end text-right"
                  : "bg-gray-100 self-start text-left"
              }`}
            >
              {msg.content}
            </div>
          </Transition>
        ))}

        {isLoading && (
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {isLoading && (
          <button
            onClick={handleStopClick}
            className="mt-2 flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <rect x="6" y="6" width="12" height="12" fill="currentColor" />
            </svg>
            Stop Generating
          </button>
        )}
      </div>

      {/* Confirm Changes Modal (Optional) */}
      <ConfirmChangesModal
        isOpen={isConfirmOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
      />

      {/* Input and Send/Stop Area */}
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-grow border border-gray-300 rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLoading) {
              handleSend();
            }
          }}
          disabled={isLoading}
        />
        {isLoading ? (
          <div className="w-16 h-10 flex items-center justify-center">
            <div className="animate-pulse">...</div>
          </div>
        ) : (
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 disabled:opacity-50"
            disabled={inputValue.trim() === ""}
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}
