import axios from 'axios';
import type { MarketOverview, CompanyMarketSummary, CompanyMarketDetail } from '../types/market';

const API_URL = import.meta.env.VITE_API_URL || '';

export const fetchMarketOverview = async (): Promise<MarketOverview> => {
  const response = await axios.get(`${API_URL}/api/market/overview`);
  return response.data;
};

export const fetchMarketCompanies = async (): Promise<CompanyMarketSummary[]> => {
  const response = await axios.get(`${API_URL}/api/market/companies`);
  return response.data;
};

export const fetchCompanyMarketStats = async (companyId: string): Promise<CompanyMarketDetail> => {
  const response = await axios.get(`${API_URL}/api/market/companies/${companyId}`);
  return response.data;
};
