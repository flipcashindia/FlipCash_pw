import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface CityContextType {
  selectedCity: string | null;
  selectedState: string | null;
  setSelectedCity: (city: string | null) => void;
  setSelectedState: (state: string | null) => void;
  openCityModal: () => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const openCityModal = () => {
    // Implement modal logic
    console.log('Open city modal');
  };

  return (
    <CityContext.Provider value={{ 
      selectedCity, 
      selectedState, 
      setSelectedCity, 
      setSelectedState,
      openCityModal 
    }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCityContext = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCityContext must be used within CityProvider');
  }
  return context;
};