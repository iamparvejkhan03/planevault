import { TrendingDown, TrendingUp } from "lucide-react";

function StatCard({ title, value, change, icon, trend = "up", currency, suffix }) {
    const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;

    return (
        <div className="bg-gray-100 rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <div className="flex items-end">
                        {currency && <span className="text-lg font-semibold mr-1">{currency}</span>}
                        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                        <h3 className="text-2xl font-bold text-gray-800">{suffix}</h3>
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-gray-200">
                    {icon}
                </div>
            </div>

            {change && (
                <div className={`flex items-center mt-4 text-sm ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {/* <TrendIcon size={16} className="mr-1" /> */}
                    <span>{change}</span>
                </div>
            )}
        </div>
    );
}

export default StatCard;