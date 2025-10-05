import { Plus, Edit, BarChart3, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

function QuickActions() {
    const navigate = useNavigate();

    const actions = [
        { label: 'Create Listing', icon: <Plus size={18} />, action: () => navigate('/seller/auctions/create') },
        { label: 'Manage Listings', icon: <Edit size={18} />, action: () => navigate('/seller/auctions/all') },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={action.action}
                        className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                        <div className="p-2 rounded-full bg-gray-100 mb-2">
                            {action.icon}
                        </div>
                        <span className="text-sm font-medium">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default QuickActions;