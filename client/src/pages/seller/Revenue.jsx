import { useState, useEffect, useMemo } from 'react';
import { IndianRupee, BarChart, TrendingDown, Clock, Pocket, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { fetchSellerIncome, requestWithdrawal } from '../../api/payment';
import useStore from '../../store/store';

const Revenue = () => {
    const navigate = useNavigate();
    const [incomeData, setIncomeData] = useState(null);
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const { store } = useStore();

    const summary = incomeData?.summary || {};
    const monthlyEarnings = incomeData?.monthlyEarnings || [];

    const netIncome = useMemo(() => {
        return summary.netIncome || 0;
    }, [summary.netIncome]);

    const availableBalance = useMemo(() => {
        return summary.availableBalance || 0;
    }, [summary.availableBalance]);


    const loadIncomeData = async () => {
        try {
            const result = await fetchSellerIncome(store?._id);
            if (result.success) {
                setIncomeData(result.data);
            } else {
                toast.error(result.message || "Failed to load income data.");
            }
        } catch (error) {
            toast.error(error.message || "Error loading income data.");
        }
    };

    useEffect(() => {
        loadIncomeData();
    }, []);

    const handleWithdrawal = async (e) => {
        e.preventDefault();
        const amount = parseFloat(withdrawalAmount);

        if (isNaN(amount) || amount <= 0) {
            return toast.error("Please enter a valid amount.");
        }
        if (amount > availableBalance) {
            return toast.error(`Withdrawal amount exceeds available balance (₹${availableBalance.toFixed(2)})`);
        }

        setIsProcessing(true);

        try {
            const result = await requestWithdrawal(store?._id, amount);

            if (result.success) {
                toast.success( `Withdrawal request of ₹${amount.toFixed(2)} successful!`);
                setWithdrawalAmount('');
                await loadIncomeData();
            } else {
                toast.error(result.message || "Withdrawal failed. Try again.");
            }
        } catch (error) {
            toast.error(error.message || "Withdrawal failed. Try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const Card = ({ title, value, icon: Icon, colorClass }) => (
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-lg shadow border border-gray-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    ₹{value.toFixed(2)}
                </h3>
            </div>
            <div className={`p-3 rounded-full ${colorClass} text-white`}>
                <Icon size={24} />
            </div>
        </div>
    );

    const AvailableBalanceCard = ({ value }) => (
        <div className="p-5 rounded-lg shadow-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white flex items-center justify-between col-span-1 md:col-span-2 lg:col-span-1">
            <div>
                <p className="text-base font-semibold">Available Balance</p>
                <h3 className="text-3xl font-extrabold mt-1">
                    ₹{value.toFixed(2)}
                </h3>
            </div>
            <Pocket size={32} className="opacity-80" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 px-4 md:px-8 pt-30 pb-20">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Financial Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card
                    title="Total Revenue"
                    value={summary.totalRevenue || 0}
                    icon={BarChart}
                    colorClass="bg-blue-600"
                />
                <Card
                    title="Net Income"
                    value={netIncome}
                    icon={Clock}
                    colorClass="bg-yellow-600"
                />
                <Card
                    title="Total Withdrawn"
                    value={summary.totalWithdrawn || 0}
                    icon={TrendingDown}
                    colorClass="bg-red-600"
                />
                <AvailableBalanceCard value={availableBalance} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white dark:bg-neutral-900 p-6 rounded-lg shadow border border-gray-200 dark:border-neutral-800">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Fee & Sales Breakdown</h2>
                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                        <p className="flex justify-between">
                            <span>Total Items Sold:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{summary.totalProductsSold || 0} units</span>
                        </p>
                        <p className="flex justify-between">
                            <span>Total Platform Fee:</span>
                            <span className="font-semibold text-red-600">- ₹{(summary.totalPlatformFee || 0).toFixed(2)}</span>
                        </p>
                        <p className="flex justify-between">
                            <span>Total Product Tax:</span>
                            <span className="font-semibold text-orange-600">₹{(summary.totalProductTax || 0).toFixed(2)}</span>
                        </p>
                        <p className="flex justify-between border-t pt-3 border-gray-200 dark:border-neutral-800">
                            <span className="font-bold text-lg">Current Net Income:</span>
                            <span className="font-extrabold text-lg text-yellow-700 dark:text-yellow-400">₹{netIncome.toFixed(2)}</span>
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-xl border border-green-400/50 dark:border-green-600/50">
                    <h2 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                        <IndianRupee size={20} /> Request Payout
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        Max available: ₹{availableBalance.toFixed(2)}
                    </p>

                    <form onSubmit={handleWithdrawal} className="space-y-4">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black dark:text-white">₹</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max={availableBalance}
                                placeholder="Enter amount"
                                value={withdrawalAmount}
                                onChange={(e) => setWithdrawalAmount(e.target.value)}
                                disabled={availableBalance <= 0 || isProcessing}
                                className="w-full text-black dark:text-white pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg text-lg font-semibold focus:ring-green-500 focus:border-green-500 transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={availableBalance <= 0 || isProcessing || parseFloat(withdrawalAmount) <= 0}
                            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${availableBalance <= 0 || isProcessing || parseFloat(withdrawalAmount) <= 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 shadow-md'
                                }`}
                        >
                            {isProcessing ? 'Processing...' : 'Withdraw Now'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow border border-gray-200 dark:border-neutral-800">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar size={20} /> Monthly Earning History
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-800">
                        <thead className="bg-gray-50 dark:bg-neutral-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Month</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Net Earning</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orders Count</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
                            {monthlyEarnings.map((item) => (
                                <tr key={item.monthYear}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{`${item.month}/${item.year}`}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-green-700 dark:text-green-400">₹{item.netEarning.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">{item.orders}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="h-10"></div>
        </div>
    );
};

export default Revenue;