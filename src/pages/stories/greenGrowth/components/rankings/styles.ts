import styled from "styled-components";

export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0 24px;
`;

export const MapCard = styled.div`
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
`;

export const TableCard = styled.div`
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
`;

export const TableEl = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem; /* 13px */
  thead th {
    text-align: left;
    padding: 10px 8px;
    border-bottom: 2px solid #333;
    position: sticky;
    top: 0;
    background: #ffffff;
    z-index: 1;
    font-size: 0.6875rem; /* 11px */
    line-height: 1.3;
    cursor: pointer;
    user-select: none;
    &:hover {
      background: #f5f5f5;
    }
  }
  tbody td {
    padding: 8px 8px;
    border-bottom: 1px solid #e7e7e7;
  }
  tbody tr:hover {
    background: #f5f5f5;
  }
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 6px;
`;

export const Controls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;
