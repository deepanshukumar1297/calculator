import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import './AffiliateCalculator.css';


function AffiliateCalculator() {
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

      const revenue = parseFloat(currentRevenue);
      const commission = parseFloat(affiliateCommission) / 100;
      const averageOrderValue = parseFloat(aov);
      const customerLifetimeValue = parseFloat(cltv);
      const cogsPercentage = parseFloat(cogs) / 100;
      const agencyCommission = Math.min(commission * 1.5, 0.05);
      const fbAgencyFeePercent = 0.15;

      const milestones = {
        3: 0.20,
        6: 0.40,
        9: 0.70,
        12: 1.00
      };

      const getTargetPercentageForMonth = (month) => {
        const previousMilestone = Object.entries(milestones)
  .filter(([m]) => parseInt(m) <= month)
  .reduce((acc, curr) => {
    const accMonth = parseInt(acc[0]);
    const currMonth = parseInt(curr[0]);
    return accMonth > currMonth ? acc : curr;
  }, ['0', 0]);

const nextMilestone = Object.entries(milestones)
  .filter(([m]) => parseInt(m) > month)
  .reduce((acc, curr) => {
    const accMonth = parseInt(acc[0]);
    const currMonth = parseInt(curr[0]);
    return accMonth < currMonth ? acc : curr;
  }, ['12', 1]);
        
        const prevMonth = parseInt(previousMilestone[0]);
        const prevTarget = previousMilestone[1];
        const nextMonth = parseInt(nextMilestone[0]);
        const nextTarget = nextMilestone[1];
        
        const progress = (month - prevMonth) / (nextMonth - prevMonth);
        const smoothProgress = progress * progress * (3 - 2 * progress);
        return prevTarget + (nextTarget - prevTarget) * smoothProgress;
      };
      
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
          targetPercentage: Math.round(targetPercentage * 100)
        };
      });

      setProjections(results);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-white shadow-lg rounded-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-center mb-2">Affiliate Marketing ROI Calculator</h2>
        <p className="text-center text-gray-600 mb-6">
          Target Growth: 20% (3mo) → 40% (6mo) → 70% (9mo) → 100% (12mo)
        </p>

        <div className="grid gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 p-6 rounded-lg shadow-sm">
            {[
              { 
                label: 'Current Monthly Revenue ($)', 
                value: currentRevenue, 
                setter: setCurrentRevenue, 
                placeholder: '100000' 
              },
              { 
                label: 'Current Customer Acquisition Cost ($)', 
                value: currentCAC, 
                setter: setCurrentCAC, 
                placeholder: '50' 
              },
              { 
                label: 'Affiliate Commission Rate (%)', 
                value: affiliateCommission, 
                setter: setAffiliateCommission, 
                placeholder: '10' 
              },
              { 
                label: 'Average Order Value ($)', 
                value: aov, 
                setter: setAOV, 
                placeholder: '85' 
              },
              { 
                label: 'Customer Lifetime Value - 1 Year ($)', 
                value: cltv, 
                setter: setCLTV, 
                placeholder: '125' 
              },
              { 
                label: 'COGS (% of Revenue)', 
                value: cogs, 
                setter: setCOGS, 
                placeholder: '40' 
              }
            ].map(({ label, value, setter, placeholder }, index) => (
              <div key={index} className="grid gap-2">
                <label htmlFor={`input-${index}`} className="font-medium">{label}</label>
                <input
                  id={`input-${index}`}
                  type="number"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  className="bg-white border rounded-md px-3 py-2 w-full"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={calculateProjections}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-medium flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                'Calculate Projections'
              )}
            </button>
          </div>

          {projections && !loading && (
            <div className="grid gap-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Revenue & Profit Trends</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={projections}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="totalRevenue" name="Total Revenue" stroke="#2563eb" strokeWidth={2} />
                      <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#16a34a" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Cost Comparison</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={projections}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="totalSpend" name="Partnership Cost" stroke="#6366f1" strokeWidth={2} />
                      <Line type="monotone" dataKey="facebookComparison" name="Facebook Cost" stroke="#f43f5e" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        'Month', 'New Rev', 'LTV Rev', 'Total Rev', 'Target %', 
                        'COGS', 'Partner Cost', 'Agency Fee', 'Total Spend', 
                        'Net Profit', 'ROPS', 'FB Total', 'Savings'
                      ].map((header) => (
                        <th key={header} className="p-3 border-b text-right font-semibold">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {projections.map((row) => (
                      <tr key={row.month} className="hover:bg-gray-50">
                        <td className="p-3">{row.month}</td>
                        <td className="p-3 text-right">${row.newRevenue.toLocaleString()}</td>
                        <td className="p-3 text-right">${row.ltvRevenue.toLocaleString()}</td>
                        <td className="p-3 text-right">${row.totalRevenue.toLocaleString()}</td>
                        <td className="p-3 text-right">{row.targetPercentage}%</td>
                        <td className="p-3 text-right">${row.cogs.toLocaleString()}</td>
                        <td className="p-3 text-right">${row.affiliateCost.toLocaleString()}</td>
                        <td className="p-3 text-right">${row.agencyCost.toLocaleString()}</td>
                        <td className="p-3 text-right">${row.totalSpend.toLocaleString()}</td>
                        <td className={`p-3 text-right font-bold ${row.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${row.profit.toLocaleString()}
                        </td>
                        <td className="p-3 text-right">{row.rops}x</td>
                        <td className="p-3 text-right">${row.facebookComparison.toLocaleString()}</td>
                        <td className={`p-3 text-right font-bold ${row.fbSpendDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${row.fbSpendDifference.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AffiliateCalculator;






// import React, { useState } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { Loader2 } from 'lucide-react';
// import './AffiliateCalculator.css';

// function AffiliateCalculator() {
//     const [currentRevenue, setCurrentRevenue] = useState('');
//     const [currentCAC, setCurrentCAC] = useState('');
//     const [affiliateCommission, setAffiliateCommission] = useState('');
//     const [aov, setAOV] = useState('');
//     const [cltv, setCLTV] = useState('');
//     const [cogs, setCOGS] = useState('');
//     const [projections, setProjections] = useState(null);
//     const [loading, setLoading] = useState(false);

//     const calculateProjections = () => {
//         setLoading(true);
//         setTimeout(() => {
//             // Calculation logic (same as before)
//             setLoading(false);
//         }, 1500);
//     };

//     return (
//         <div className="w-full max-w-7xl mx-auto bg-white shadow-lg rounded-lg">
//             <div className="p-6">
//                 <h2 className="text-2xl font-bold text-center mb-2">Affiliate Marketing ROI Calculator</h2>
//                 <p className="text-center text-gray-600 mb-6">
//                     Target Growth: 20% (3mo) → 40% (6mo) → 70% (9mo) → 100% (12mo)
//                 </p>

//                 <div className="grid gap-8">
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 p-6 rounded-lg shadow-sm">
//                         {[
//                             {
//                                 label: 'Current Monthly Revenue ($)',
//                                 value: currentRevenue,
//                                 setter: setCurrentRevenue,
//                                 placeholder: '100000',
//                             },
//                             {
//                                 label: 'Current Customer Acquisition Cost ($)',
//                                 value: currentCAC,
//                                 setter: setCurrentCAC,
//                                 placeholder: '50',
//                             },
//                             {
//                                 label: 'Affiliate Commission Rate (%)',
//                                 value: affiliateCommission,
//                                 setter: setAffiliateCommission,
//                                 placeholder: '10',
//                             },
//                             {
//                                 label: 'Average Order Value ($)',
//                                 value: aov,
//                                 setter: setAOV,
//                                 placeholder: '85',
//                             },
//                             {
//                                 label: 'Customer Lifetime Value - 1 Year ($)',
//                                 value: cltv,
//                                 setter: setCLTV,
//                                 placeholder: '125',
//                             },
//                             {
//                                 label: 'COGS (% of Revenue)',
//                                 value: cogs,
//                                 setter: setCOGS,
//                                 placeholder: '40',
//                             },
//                         ].map(({ label, value, setter, placeholder }, index) => (
//                             <div key={index} className="grid gap-2">
//                                 <label htmlFor={`input-${index}`} className="font-medium">
//                                     {label}
//                                 </label>
//                                 <input
//                                     id={`input-${index}`}
//                                     type="number"
//                                     value={value}
//                                     onChange={(e) => setter(e.target.value)}
//                                     placeholder={placeholder}
//                                     className="bg-white border rounded-md px-3 py-2 w-full input-field"
//                                 />
//                             </div>
//                         ))}
//                     </div>

//                     <div className="flex justify-center">
//                         <button
//                             onClick={calculateProjections}
//                             disabled={loading}
//                             className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-medium flex items-center"
//                         >
//                             {loading ? (
//                                 <>
//                                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                                     Calculating...
//                                 </>
//                             ) : (
//                                 'Calculate Projections'
//                             )}
//                         </button>
//                     </div>

//                     {projections && !loading && (
//                         <div className="grid gap-6">
//                             <div className="overflow-x-auto bg-white rounded-lg shadow table-container">
//                                 <table className="w-full border-collapse text-sm">
//                                     <thead className="bg-gray-50">
//                                         <tr>
//                                             {[
//                                                 'Month',
//                                                 'New Rev',
//                                                 'LTV Rev',
//                                                 'Total Rev',
//                                                 'Target %',
//                                                 'COGS',
//                                                 'Partner Cost',
//                                                 'Agency Fee',
//                                                 'Total Spend',
//                                                 'Net Profit',
//                                                 'ROPS',
//                                                 'FB Total',
//                                                 'Savings',
//                                             ].map((header) => (
//                                                 <th key={header} className="p-3 border-b text-right font-semibold">
//                                                     {header}
//                                                 </th>
//                                             ))}
//                                         </tr>
//                                     </thead>
//                                     <tbody className="divide-y divide-gray-200">
//                                         {projections.map((row) => (
//                                             <tr key={row.month} className="hover:bg-gray-50">
//                                                 <td className="p-3">{row.month}</td>
//                                                 <td className="p-3 text-right">${row.newRevenue.toLocaleString()}</td>
//                                                 <td className="p-3 text-right">${row.ltvRevenue.toLocaleString()}</td>
//                                                 <td className="p-3 text-right">${row.totalRevenue.toLocaleString()}</td>
//                                                 <td className="p-3 text-right">{row.targetPercentage}%</td>
//                                                 <td className="p-3 text-right">${row.cogs.toLocaleString()}</td>
//                                                 <td className="p-3 text-right">${row.affiliateCost.toLocaleString()}</td>
//                                                 <td className="p-3 text-right">${row.agencyCost.toLocaleString()}</td>
//                                                 <td className="p-3 text-right">${row.totalSpend.toLocaleString()}</td>
//                                                 <td
//                                                     className={`p-3 text-right font-bold ${
//                                                         row.profit >= 0 ? 'text-green-600' : 'text-red-600'
//                                                     }`}
//                                                 >
//                                                     ${row.profit.toLocaleString()}
//                                                 </td>
//                                                 <td className="p-3 text-right">{row.rops}x</td>
//                                                 <td className="p-3 text-right">${row.facebookComparison.toLocaleString()}</td>
//                                                 <td
//                                                     className={`p-3 text-right font-bold ${
//                                                         row.fbSpendDifference >= 0 ? 'text-green-600' : 'text-red-600'
//                                                     }`}
//                                                 >
//                                                     ${row.fbSpendDifference.toLocaleString()}
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//             <style>
//                 {`
//                 .input-field {
//                     border: 1px solid #ccc;
//                     transition: border-color 0.3s ease;
//                 }
//                 .input-field:focus {
//                     border-color: #2563eb;
//                     outline: none;
//                 }
//                 .table-container {
//                     border: 1px solid #ddd;
//                     border-radius: 6px;
//                 }
//                 .table-container table {
//                     text-align: left;
//                 }
//                 `}
//             </style>
//         </div>
//     );
// }

// export default AffiliateCalculator;
