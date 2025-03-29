import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import { ReactNode } from "react";
import { DocumentProvider } from "./context/DocumentContext";
import "./globals.css";
export default function RootLayout({ children }: { children: ReactNode }) {
  const apiUrl = process.env.NEXT_PUBLIC_COPILOT_KIT_API;
  return (
    <html lang="en">
      <body>
        <CopilotKit publicApiKey={apiUrl}>
          <DocumentProvider>{children}</DocumentProvider>
        </CopilotKit>
      </body>
    </html>
  );
}
