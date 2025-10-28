import React, { createContext, useContext, type ReactNode } from 'react';
import dataFetch from '../services/apiService';
import { type ResponseType } from 'axios';

interface ApiContextType {
  dataFetch: <T>(
    endpoint: string,
    method: string,
    data?: unknown,
    responseType?: ResponseType
  ) => Promise<T>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ApiContext.Provider value={{ dataFetch }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};