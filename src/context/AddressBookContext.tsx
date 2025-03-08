
import React, { createContext, useContext, useState, useEffect } from "react";
import { useStudentAuth } from "@/hooks/useStudentAuth";

type Address = {
  address: string;
};

type AddressBookContextType = {
  addresses: Address[];
  addAddress: (address: string) => void;
  removeAddress: (index: number) => void;
};

const AddressBookContext = createContext<AddressBookContextType | undefined>(undefined);

export const AddressBookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const { studentId } = useStudentAuth();

  // Load addresses from localStorage when the component mounts
  useEffect(() => {
    if (studentId) {
      const savedAddresses = localStorage.getItem(`student-addresses-${studentId}`);
      if (savedAddresses) {
        try {
          setAddresses(JSON.parse(savedAddresses));
        } catch (e) {
          console.error("Error parsing saved addresses", e);
          localStorage.removeItem(`student-addresses-${studentId}`);
        }
      }
    }
  }, [studentId]);

  // Save addresses to localStorage whenever they change
  useEffect(() => {
    if (studentId && addresses.length > 0) {
      localStorage.setItem(`student-addresses-${studentId}`, JSON.stringify(addresses));
    }
  }, [addresses, studentId]);

  const addAddress = (address: string) => {
    setAddresses([...addresses, { address }]);
  };

  const removeAddress = (index: number) => {
    const newAddresses = [...addresses];
    newAddresses.splice(index, 1);
    setAddresses(newAddresses);
    
    // Update localStorage
    if (studentId) {
      if (newAddresses.length > 0) {
        localStorage.setItem(`student-addresses-${studentId}`, JSON.stringify(newAddresses));
      } else {
        localStorage.removeItem(`student-addresses-${studentId}`);
      }
    }
  };

  return (
    <AddressBookContext.Provider value={{
      addresses,
      addAddress,
      removeAddress
    }}>
      {children}
    </AddressBookContext.Provider>
  );
};

export const useAddressBook = () => {
  const context = useContext(AddressBookContext);
  if (context === undefined) {
    throw new Error("useAddressBook must be used within an AddressBookProvider");
  }
  return context;
};
