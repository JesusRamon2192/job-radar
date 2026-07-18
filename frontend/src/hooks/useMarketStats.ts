import { useState, useEffect } from 'react';
import type { MarketOverview, CompanyMarketSummary, CompanyMarketDetail } from '../types/market';
import { fetchMarketOverview, fetchMarketCompanies, fetchCompanyMarketStats } from '../api/market';

export const useMarketOverview = () => {
  const [data, setData] = useState<MarketOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const overview = await fetchMarketOverview();
        if (mounted) setData(overview);
      } catch (err: any) {
        if (mounted) setError(err.message || 'Error loading market overview');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return { data, loading, error };
};

export const useMarketCompanies = () => {
  const [data, setData] = useState<CompanyMarketSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const companies = await fetchMarketCompanies();
        if (mounted) setData(companies);
      } catch (err: any) {
        if (mounted) setError(err.message || 'Error loading companies');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return { data, loading, error };
};

export const useCompanyMarketStats = (companyId: string) => {
  const [data, setData] = useState<CompanyMarketDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) return;
    
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const stats = await fetchCompanyMarketStats(companyId);
        if (mounted) setData(stats);
      } catch (err: any) {
        if (mounted) setError(err.message || 'Error loading company stats');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [companyId]);

  return { data, loading, error };
};
