import { 
    Plane, 
    Cog, 
    Trophy, 
    Calendar, 
    Gauge, 
    Fuel, 
    Users, 
    Weight, 
    Settings,
    FileText,
    Award,
    Clock,
    MapPin,
    RefreshCw,
    Cpu
} from "lucide-react";

// Icon mapping for specification fields
// const specificationIcons = {
//     // Aircraft fields
//     make: Plane,
//     model: Settings,
//     year: Calendar,
//     registration: FileText,
//     totalHours: Clock,
//     fuelType: Fuel,
//     seatingCapacity: Users,
//     maxTakeoffWeight: Weight,
//     engineType: Cog,
//     engineCount: Settings,
//     aircraftCondition: Award,
    
//     // Engines & Parts fields
//     partType: Cog,
//     partNumber: FileText,
//     manufacturer: Settings,
//     condition: Award,
//     hoursSinceNew: Clock,
//     serialNumber: FileText,
    
//     // Memorabilia fields
//     itemType: Trophy,
//     era: Calendar,
//     authenticity: Award,
//     dimensions: Gauge,
//     material: Settings
// };

// // Field labels mapping
// const fieldLabels = {
//     make: 'Make',
//     model: 'Model', 
//     year: 'Year',
//     registration: 'Registration',
//     totalHours: 'Total Hours',
//     fuelType: 'Fuel Type',
//     seatingCapacity: 'Seating Capacity',
//     maxTakeoffWeight: 'Max Takeoff Weight',
//     engineType: 'Engine Type',
//     engineCount: 'Number of Engines',
//     aircraftCondition: 'Condition',
    
//     partType: 'Part Type',
//     partNumber: 'Part Number',
//     manufacturer: 'Manufacturer',
//     condition: 'Condition',
//     hoursSinceNew: 'Hours Since New',
//     serialNumber: 'Serial Number',
    
//     itemType: 'Item Type',
//     era: 'Historical Era',
//     authenticity: 'Authenticity',
//     dimensions: 'Dimensions',
//     material: 'Material'
// };

// // Category-specific field groupings
// const categoryFieldGroups = {
//     'Aircraft': {
//         'Basic Info': ['make', 'model', 'year', 'registration'],
//         'Technical Specs': ['totalHours', 'fuelType', 'seatingCapacity', 'maxTakeoffWeight', 'engineType', 'engineCount', 'aircraftCondition'],
//     },
//     'Engines & Parts': {
//         'Part Details': ['partType', 'partNumber', 'manufacturer', 'condition'],
//         'Additional Info': ['serialNumber', 'hoursSinceNew']
//     },
//     'Memorabilia': {
//         'Item Details': ['itemType', 'era', 'authenticity', 'year'],
//         'Description': ['dimensions', 'material']
//     }
// };

// Icon mapping for specification fields
const specificationIcons = {
    // Aircraft fields
    make: Plane,
    model: Settings,
    year: Calendar,
    registration: FileText,
    totalTime: Clock,
    engineTimeSMOH: Clock,
    lastAnnualDate: Calendar,
    usefulLoad: Weight,
    fuelType: Fuel,
    seatingCapacity: Users,
    maxTakeoffWeight: Weight,
    engineType: Cog,
    engineCount: Settings,
    aircraftCondition: Award,
    propellerTime: Clock,
    propellerModel: Settings,
    engineTotalCycles: RefreshCw,
    tbo: Clock,
    avionicsDetails: Cpu,
    
    // Engines & Parts fields
    partType: Cog,
    partNumber: FileText,
    manufacturer: Settings,
    condition: Award,
    hoursSinceNew: Clock,
    serialNumber: FileText,
    
    // Memorabilia fields
    itemType: Trophy,
    era: Calendar,
    authenticity: Award,
    dimensions: Gauge,
    material: Settings
};

// Field labels mapping
const fieldLabels = {
    make: 'Make',
    model: 'Model', 
    year: 'Year',
    registration: 'Registration',
    totalTime: 'Total Time',
    engineTimeSMOH: 'Engine Time SMOH',
    lastAnnualDate: 'Last Annual Inspection',
    usefulLoad: 'Useful Load',
    fuelType: 'Fuel Type',
    seatingCapacity: 'Seating Capacity',
    maxTakeoffWeight: 'Max Takeoff Weight',
    engineType: 'Engine Type',
    engineCount: 'Number of Engines',
    aircraftCondition: 'Condition',
    propellerTime: 'Propeller Time',
    propellerModel: 'Propeller Model',
    engineTotalCycles: 'Engine Cycles',
    tbo: 'Time Between Overhaul',
    avionicsDetails: 'Avionics',
    
    partType: 'Part Type',
    partNumber: 'Part Number',
    manufacturer: 'Manufacturer',
    condition: 'Condition',
    hoursSinceNew: 'Hours Since New',
    serialNumber: 'Serial Number',
    
    itemType: 'Item Type',
    era: 'Historical Era',
    authenticity: 'Authenticity',
    dimensions: 'Dimensions',
    material: 'Material'
};

// Category-specific field groupings
const categoryFieldGroups = {
    'Aircraft': {
        'Basic Info': ['make', 'model', 'year', 'registration', 'aircraftCondition'],
        'Time & Inspections': ['totalTime', 'engineTimeSMOH', 'lastAnnualDate'],
        'Weight & Capacity': ['usefulLoad', 'seatingCapacity', 'maxTakeoffWeight'],
        'Engine Details': ['engineType', 'engineCount', 'fuelType'],
        'Propeller Details': ['propellerTime', 'propellerModel'],
        'Jet Engine Details': ['engineTotalCycles'],
        'Turboprop Details': ['tbo'],
        'Avionics': ['avionicsDetails']
    },
    'Engines & Parts': {
        'Part Details': ['partType', 'partNumber', 'manufacturer', 'condition'],
        'Additional Info': ['serialNumber', 'hoursSinceNew']
    },
    'Memorabilia': {
        'Item Details': ['itemType', 'era', 'authenticity', 'year'],
        'Description': ['dimensions', 'material']
    }
};

// Specifications Section Component
const SpecificationsSection = ({ auction }) => {
    if (!auction.specifications || Object.keys(auction.specifications).length === 0) {
        return null;
    }

    const getFieldGroups = () => {
        const groups = categoryFieldGroups[auction.category] || {};
        const validGroups = {};
        
        // Only include groups that have fields with actual data
        Object.entries(groups).forEach(([groupName, fields]) => {
            const validFields = fields.filter(field => 
                auction.specifications[field] !== undefined && 
                auction.specifications[field] !== null && 
                auction.specifications[field] !== ''
            );
            
            if (validFields.length > 0) {
                validGroups[groupName] = validFields;
            }
        });
        
        return validGroups;
    };

    const fieldGroups = getFieldGroups();

    // If no grouped fields, show all specifications in a simple grid
    if (Object.keys(fieldGroups).length === 0) {
        return (
            <div className="mt-8">
                <h3 className="my-5 text-primary text-xl font-semibold flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Specifications
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-x-5">
                    {Object.entries(auction.specifications).map(([key, value]) => {
                        if (!value || value === '') return null;
                        
                        const IconComponent = specificationIcons[key] || FileText;
                        const label = fieldLabels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        
                        return (
                            <div key={key} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <IconComponent className="flex-shrink-0 w-5 h-5 mt-1 text-primary" strokeWidth={1.5} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-secondary text-sm font-medium">{label}</p>
                                    <p className="text-base text-gray-900 break-words">{value}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <h3 className="my-5 text-primary text-xl font-semibold flex items-center gap-2">
                {/* <Settings className="w-5 h-5" /> */}
                {auction.category} Specifications
            </h3>
            
            {Object.entries(fieldGroups).map(([groupName, fields]) => (
                <div key={groupName} className="mb-6">
                    <h4 className="text-base font-medium text-gray-800 mb-4 border-b pb-2">{groupName}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-x-5">
                        {fields.map(field => {
                            const value = auction.specifications[field];
                            if (!value || value === '') return null;
                            
                            const IconComponent = specificationIcons[field] || FileText;
                            const label = fieldLabels[field] || field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            
                            return (
                                <div key={field} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <IconComponent className="flex-shrink-0 w-8 h-8 mt-1 text-primary" strokeWidth={1} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-secondary text-sm font-medium">{label}</p>
                                        <p className="text-base text-gray-900 break-words">{value}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SpecificationsSection;