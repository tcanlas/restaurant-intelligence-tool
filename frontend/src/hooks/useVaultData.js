import { useState, useEffect, useCallback } from 'react';
import summaryData from '../summaryData.json';
import salesTrendData from '../salesTrendData.json';
import { calculateLaborPercentage } from '../utils/analytics';

const useVaultData = () => {
  const [status, setStatus] = useState('Connecting...');
  const [summary, setSummary] = useState(summaryData);
  const [loading, setLoading] = useState(false);
  
  // Initialize with local JSON data and calculate labor percentage immediately
  const [chartData, setChartData] = useState(salesTrendData.map(d => ({
    ...d,
    labor_pct: calculateLaborPercentage(d.labor_cost, d.net_sales)
  })));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Check backend health
      const healthRes = await fetch('/api/health');
      const healthData = await healthRes.json();
      setStatus(healthData.message);

      // Fetch summary
      const summaryRes = await fetch('/api/sales-summary');
      if (!summaryRes.ok) throw new Error('Data file missing');
      const summaryJson = await summaryRes.json();
      setSummary(summaryJson);

      // Fetch raw sales for the chart
      const salesRes = await fetch('/api/sales');
      const salesJson = await salesRes.json();
      if (salesJson && salesJson.length > 0) {
        const processedData = salesJson.map(d => ({
          ...d,
          labor_pct: calculateLaborPercentage(d.labor_cost, d.net_sales)
        }));
        setChartData(processedData);
      }
      
      setStatus('Connected & Synced');
    } catch (err) {
      console.error('Error fetching data:', err);
      setStatus('Sync Error');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCommit = async (data) => {
    try {
      const response = await fetch('/api/vault', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: data.date,
          totalCovers: data.totalCovers,
          reservations: data.reservations,
          eventIntensity: data.eventIntensity,
          netSales: data.netSales,
          laborCost: data.laborCost
        }),
      });

      if (response.ok) {
        alert(`Operational data for ${data.date} committed successfully.`);
        fetchData();
        return true;
      } else {
        const err = await response.json();
        alert(`Vault Error: ${err.error || 'Failed to save entry.'}`);
        return false;
      }
    } catch (err) {
      console.error('Commit Failure:', err);
      alert('Network Error: Vault is unreachable.');
      return false;
    }
  };

  return { summary, chartData, loading, status, fetchData, handleCommit };
};

export default useVaultData;