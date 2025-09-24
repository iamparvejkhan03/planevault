import { Bell, Gavel, MessageSquare, Award, Clock } from "lucide-react";

function RecentActivity() {
    const activities = [
        { type: 'bid', item: 'Vintage Rolex Watch', value: '$1,250', time: '5 min ago', icon: <Gavel size={16} /> },
        { type: 'sale', item: 'Antique Persian Rug', value: '$3,450', time: '2 hours ago', icon: <Award size={16} /> },
        { type: 'message', item: 'Question about: Art Deco Lamp', value: 'New message', time: '4 hours ago', icon: <MessageSquare size={16} /> },
        { type: 'ending', item: 'Mid-Century Chair', value: 'Ending in 2 hours', time: '5 hours ago', icon: <Clock size={16} /> },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Recent Activity</h3>
                <Bell size={18} className="text-gray-500" />
            </div>
            <div className="space-y-3">
                {activities.map((activity, index) => (
                    <div key={index} className="flex items-start p-3 rounded-lg hover:bg-gray-50">
                        <div className={`p-2 rounded-full mr-3 ${activity.type === 'bid' ? 'bg-blue-100 text-blue-600' :
                                activity.type === 'sale' ? 'bg-green-100 text-green-600' :
                                    activity.type === 'message' ? 'bg-purple-100 text-purple-600' :
                                        'bg-amber-100 text-amber-600'
                            }`}>
                            {activity.icon}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-gray-800">{activity.item}</p>
                            <p className="text-sm text-gray-600">{activity.value}</p>
                        </div>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RecentActivity;