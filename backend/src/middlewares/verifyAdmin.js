import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];

        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
        
        if(verified){
            const { id } = await jwt.decode(token);

            const user = await User.findById(id);
            
            if(user && user.userType === 'admin'){
                req.user = user;
                next();
            }
        }
    } catch (error) {
        return res.status(401).json({success:false, message:'accessToken'});
    }
}

export default verifyAdmin;