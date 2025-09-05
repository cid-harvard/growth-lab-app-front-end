import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type SelectionType = "product" | "cluster" | "supplyChain";

export interface SelectionPayload {
  type: SelectionType;
  // At least one identifier should be provided depending on type
  productId?: number;
  clusterId?: number | string; // may be a composite key in some viz
  supplyChainId?: number;
  // Optional metadata for nicer titles
  title?: string;
  // Context for progressive reveal and source-specific behavior
  source?:
    | "circle-pack"
    | "cluster-tree"
    | "product-scatter"
    | "product-radar"
    | "other";
  detailLevel?: "basic" | "full";
}

interface SelectionModalState {
  isOpen: boolean;
  payload: SelectionPayload | null;
}

interface SelectionDataModalContextType {
  state: SelectionModalState;
  openSelectionModal: (payload: SelectionPayload) => void;
  closeSelectionModal: () => void;
}

const SelectionDataModalContext = createContext<
  SelectionDataModalContextType | undefined
>(undefined);

export const SelectionDataModalProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [state, setState] = useState<SelectionModalState>({
    isOpen: false,
    payload: null,
  });

  const openSelectionModal = useCallback((payload: SelectionPayload) => {
    setState({ isOpen: true, payload });
  }, []);

  const closeSelectionModal = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const value = useMemo(
    () => ({ state, openSelectionModal, closeSelectionModal }),
    [state, openSelectionModal, closeSelectionModal],
  );

  return (
    <SelectionDataModalContext.Provider value={value}>
      {children}
    </SelectionDataModalContext.Provider>
  );
};

export const useSelectionDataModal = (): SelectionDataModalContextType => {
  const ctx = useContext(SelectionDataModalContext);
  if (!ctx) {
    throw new Error(
      "useSelectionDataModal must be used within a SelectionDataModalProvider",
    );
  }
  return ctx;
};
