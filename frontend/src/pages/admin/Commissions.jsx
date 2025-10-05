import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { Crown, Save, DollarSign } from 'lucide-react';
import { AdminContainer, AdminHeader, AdminSidebar } from '../../components';

const Commissions = () => {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const categories = [
        'Aircraft',
        'Engines & Parts',
        'Memorabilia'
    ];

    // Map category names to backend format
    const categoryMap = {
        'Aircraft': 'Aircraft',
        'Engines & Parts': 'Engines & Parts',
        'Memorabilia': 'Memorabilia'
    };

    // Fetch commission rates
    const fetchCommissions = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get('/api/v1/admin/commissions');
            if (data.success) {
                setCommissions(data.data.commissions);
            }
        } catch (err) {
            console.error('Fetch commissions error:', err);
            toast.error(err.response?.data?.message || "Failed to fetch commission rates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, []);

    // Handle commission rate change
    const handleCommissionChange = (category, value) => {
        const backendCategory = categoryMap[category];
        setCommissions(prev => 
            prev.map(commission =>
                commission.category === backendCategory
                    ? { ...commission, commissionAmount: parseFloat(value) || 0 }
                    : commission
            )
        );
    };

    // Get commission rate for display
    const getCommissionAmount = (category) => {
        const backendCategory = categoryMap[category];
        const commission = commissions.find(c => c.category === backendCategory);
        return commission ? commission.commissionAmount : 0;
    };

    // Save commission rates
    const handleSave = async () => {
        try {
            setSaving(true);
            const { data } = await axiosInstance.put('/api/v1/admin/commissions', {
                commissions: commissions
            });

            if (data.success) {
                toast.success('Commission rates updated successfully');
                setCommissions(data.data.commissions);
            }
        } catch (err) {
            console.error('Update commissions error:', err);
            toast.error(err.response?.data?.message || "Failed to update commission rates");
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />

            <div className="w-full relative">
                <AdminHeader />

                <AdminContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex items-center gap-3 mb-2">
                            <DollarSign size={32} className="text-green-600" />
                            <h2 className="text-3xl md:text-4xl font-bold">Commission Settings</h2>
                        </div>
                        <p className="text-gray-600">Manage commission rates for different auction categories</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                        </div>
                    ) : (
                        <>
                            {/* Commission Rates Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {categories.map((category) => {
                                    const commissionAmount = getCommissionAmount(category);
                                    const backendCategory = categoryMap[category];
                                    const commissionData = commissions.find(c => c.category === backendCategory);
                                    
                                    return (
                                        <div key={category} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">{category}</p>
                                                    <h3 className="text-2xl font-bold mt-1">
                                                        $ {commissionAmount}
                                                    </h3>
                                                    <p className="text-xs text-gray-400 mt-1">Current commission rate</p>
                                                </div>
                                                <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                                                    <DollarSign size={20} />
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="50"
                                                    value={commissionAmount}
                                                    onChange={(e) => handleCommissionChange(category, e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-right"
                                                />
                                                <span className="text-gray-500">$</span>
                                            </div>

                                            {commissionData?.updatedAt && (
                                                <p className="text-xs text-gray-500 mt-3">
                                                    Last updated: {new Date(commissionData.updatedAt).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Save Button Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                                <div className="flex justify-between items-center flex-wrap gap-3">
                                    <div className='order-2 sm:order-1'>
                                        <h3 className="text-lg font-semibold">Apply Changes</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Save the updated commission rates to make them effective immediately
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex order-1 sm:order-2 items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-black/90 transition-colors disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                Save Rates
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Information Card */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <Crown size={24} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-blue-800 mb-2">About Commission Rates</h3>
                                        <div className="space-y-2 text-sm text-blue-700">
                                            <p>• Commission rates are applied as a fixed amount.</p>
                                            <p>• Changes take effect immediately for new auctions</p>
                                            <p>• Existing auctions will use the commission rate that was set when they were created</p>
                                            <p>• Rates should reflect the value and complexity of each category</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </AdminContainer>
            </div>
        </section>
    );
};

export default Commissions;