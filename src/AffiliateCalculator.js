// src/AffiliateCalculator.js

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import './AffiliateCalculator.css';

const AffiliateCalculator = () => {
  // State variables
  const [currentRevenue, setCurrentRevenue] = useState('');
  const [currentCAC, setCurrentCAC] = useState('');
  const [affiliateCommission, setAffiliateCommission] = useState('');
  const [aov, setAOV] = useState('');
  const [cltv, setCLTV] = useState('');
  const [cogs, setCOGS] = useState('');
  const [projections, setProjections] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateProjections = () => {
    setLoading(true);

    setTimeout(() => {
      if (!currentRevenue || !currentCAC || !affiliateCommission || !aov || !cltv || !cogs) {
        setLoading(false);
        return;
      }

      // Parsing input values
      const revenue = parseFloat(currentRevenue);
      const commission = parseFloat(affiliateCommission) / 100;
      const averageOrderValue = parseFloat(aov);
      const customerLifetimeValue = parseFloat(cltv);
      const cogsPercentage = parseFloat(cogs) / 100;
      const agencyCommission = Math.min(commission * 1.5, 0.05);
      const fbAgencyFeePercent = 0.15;

      // Milestone percentages
      const milestones = { 3: 0.20, 6: 0.40, 9: 0.70, 12: 1.00 };

      // Function to determine the growth percentage for a given month
      const getTargetPercentageForMonth = (month) => {
        const previousMilestone = Object.entries(milestones)
          .filter(([m]) => parseInt(m) <= month)
          .reduce((acc, curr) => (acc[0] > curr[0] ? acc : curr), [0, 0]);
        
        const nextMilestone = Object.entries(milestones)
          .filter(([m]) => parseInt(m) > month)
          .reduce((acc, curr) => (acc[0] < curr[0] ? acc : curr), [12, 1]);
        
        const prevMonth = parseInt(previousMilestone[0]);
        const prevTarget = previousMilestone[1];
        const nextMonth = parseInt(nextMilestone[0]);
        const nextTarget = nextMilestone[1];

        const progress = (month - prevMonth) / (nextMonth - prevMonth);
        const smoothProgress = progress * progress * (3 - 2 * progress);
        return prevTarget + (nextTarget - prevTarget) * smoothProgress;
      };

      // Cumulative customers tracker
      let cumulativeCustomers = 0;

      const results = Array(12).fill(0).map((_, month) => {
        const monthNumber = month + 1;
        const targetPercentage = getTargetPercentageForMonth(monthNumber);
        const targetRevenue = revenue * targetPercentage;

        const startRevenue = monthNumber === 1 ? 5000 : 0;
        const newRevenue = startRevenue + (targetRevenue - startRevenue);

        const newCustomers = Math.round(newRevenue / averageOrderValue);
        cumulativeCustomers += newCustomers;

        const ltvRevenue = cumulativeCustomers * ((customerLifetimeValue - averageOrderValue) / 12);
        const totalMonthlyRevenue = newRevenue + ltvRevenue;

        const affiliateCost = newRevenue * commission;
        const agencyCost = Math.max(3500, newRevenue * agencyCommission);
        const totalPartnershipSpend = affiliateCost + agencyCost;
        const cogsTotal = totalMonthlyRevenue * cogsPercentage;

        const totalCustomers = totalMonthlyRevenue / averageOrderValue;
        const fbMediaSpend = totalCustomers * parseFloat(currentCAC);
        const fbAgencyFee = fbMediaSpend * fbAgencyFeePercent;
        const equivalentFacebookSpend = fbMediaSpend + fbAgencyFee;

        const profit = totalMonthlyRevenue - totalPartnershipSpend - cogsTotal;
        const rops = totalMonthlyRevenue / totalPartnershipSpend;
        const fbSpendDifference = equivalentFacebookSpend - totalPartnershipSpend;

        return {
          month: monthNumber,
          newRevenue: Math.round(newRevenue),
          ltvRevenue: Math.round(ltvRevenue),
          totalRevenue: Math.round(totalMonthlyRevenue),
          cogs: Math.round(cogsTotal),
          affiliateCost: Math.round(affiliateCost),
          agencyCost: Math.round(agencyCost),
          totalSpend: Math.round(totalPartnershipSpend),
          profit: Math.round(profit),
          rops: parseFloat(rops.toFixed(2)),
          fbSpendDifference: Math.round(fbSpendDifference),
          facebookComparison: Math.round(equivalentFacebookSpend),
          percentOfRevenue: parseFloat(((totalMonthlyRevenue / revenue) * 100).toFixed(1)),
          customers: newCustomers,
          totalCustomers: cumulativeCustomers,
          fbMediaSpend: Math.round(fbMediaSpend),
          fbAgencyFee: Math.round(fbAgencyFee),
          targetPercentage: Math.round(targetPercentage * 100),
        };
      });

      setProjections(results);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="affiliate-calculator">
      <h2>Affiliate Marketing ROI Calculator</h2>
      <p>Target Growth: 20% (3mo) → 40% (6mo) → 70% (9mo) → 100% (12mo)</p>

      <div className="inputs">
        <div>
          <label>Current Monthly Revenue ($)</label>
          <input
            type="number"
            value={currentRevenue}
            onChange={(e) => setCurrentRevenue(e.target.value)}
            placeholder="100000"
          />
        </div>
        <div>
          <label>Current Customer Acquisition Cost ($)</label>
          <input
            type="number"
            value={currentCAC}
            onChange={(e) => setCurrentCAC(e.target.value)}
            placeholder="50"
          />
        </div>
        <div>
          <label>Affiliate Commission Rate (%)</label>
          <input
            type="number"
            value={affiliateCommission}
            onChange={(e) => setAffiliateCommission(e.target.value)}
            placeholder="10"
          />
        </div>
        <div>
          <label>Average Order Value ($)</label>
          <input
            type="number"
            value={aov}
            onChange={(e) => setAOV(e.target.value)}
            placeholder="85"
          />
        </div>
        <div>
          <label>Customer Lifetime Value - 1 Year ($)</label>
          <input
            type="number"
            value={cltv}
            onChange={(e) => setCLTV(e.target.value)}
            placeholder="125"
          />
        </div>
        <div>
          <label>COGS (% of Revenue)</label>
          <input
            type="number"
            value={cogs}
            onChange={(e) => setCOGS(e.target.value)}
            placeholder="40"
          />
        </div>
      </div>

      <button onClick={calculateProjections} disabled={loading}>
        {loading ? <><Loader2 /> Calculating...</> : 'Calculate Projections'}
      </button>

      {projections && !loading && (
        <div className="charts">
          {/* Revenue & Profit Trends */}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={projections}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="totalRevenue" stroke="#8884d8" />
              <Line type="monotone" dataKey="profit" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AffiliateCalculator;
