import { createContext, useContext, useState, ReactNode } from "react";

interface AgentLogsContextType {
  logsData: Object;
  setLogsData: React.Dispatch<React.SetStateAction<Object>>;
}

const AgentLogsContext = createContext<AgentLogsContextType | undefined>(undefined);

export const useAgentLogs = () => {
  const context = useContext(AgentLogsContext);
  if (!context) {
    throw new Error("useAgentLogs must be used within an AgentLogsProvider");
  }
  return context;
};

interface AgentLogsProviderProps {
  children: ReactNode;
}

export const AgentLogsProvider = ({ children }: AgentLogsProviderProps) => {
  const [logsData, setLogsData] = useState<Object>({});

  return (
    <AgentLogsContext.Provider value={{ logsData, setLogsData }}>
      {children}
    </AgentLogsContext.Provider>
  );
};
