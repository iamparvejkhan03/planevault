import Commission from '../models/commission.model.js';

// Get all commission rates
export const getCommissions = async (req, res) => {
    try {
        const commissions = await Commission.find().sort({ category: 1 });
        
        // Ensure all categories exist
        const categories = ['Aircraft', 'Engines & Parts', 'Memorabilia'];
        const existingCategories = commissions.map(c => c.category);
        
        const missingCategories = categories.filter(cat => !existingCategories.includes(cat));
        
        if (missingCategories.length > 0) {
            // Create default commissions for missing categories
            const defaultCommissions = missingCategories.map(category => ({
                category,
                commissionAmount: category === 'Aircraft' ? 5 : 
                               category === 'Engines & Parts' ? 8 : 10,
                updatedBy: req.user._id
            }));
            
            await Commission.insertMany(defaultCommissions);
            
            // Fetch all commissions again
            const updatedCommissions = await Commission.find().sort({ category: 1 });
            return res.status(200).json({
                success: true,
                data: { commissions: updatedCommissions }
            });
        }

        res.status(200).json({
            success: true,
            data: { commissions }
        });

    } catch (error) {
        console.error('Get commissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching commission rates'
        });
    }
};

// Update commission rates
export const updateCommissions = async (req, res) => {
    try {
        const { commissions } = req.body;

        if (!commissions || !Array.isArray(commissions)) {
            return res.status(400).json({
                success: false,
                message: 'Commissions data is required'
            });
        }

        const updatePromises = commissions.map(commission =>
            Commission.findOneAndUpdate(
                { category: commission.category },
                { 
                    commissionAmount: commission.commissionAmount,
                    updatedBy: req.user._id
                },
                { new: true, upsert: true, runValidators: true }
            )
        );

        const updatedCommissions = await Promise.all(updatePromises);

        res.status(200).json({
            success: true,
            message: 'Commission rates updated successfully',
            data: { commissions: updatedCommissions }
        });

    } catch (error) {
        console.error('Update commissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating commission rates'
        });
    }
};