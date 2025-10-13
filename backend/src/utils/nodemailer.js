import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
});

// Add connection verification
transporter.verify(function (error, success) {
    if (error) {
        console.log('SMTP Connection failed:', error);
    } else {
        console.log('SMTP Server is ready');
    }
});

const contactEmail = async (name, email, phone, userType, message) => {
    try {
        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: `${process.env.EMAIL_USER}`,
            subject: `New Contact Query - ${name}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .logo { width: auto; height: 48px; margin-bottom: 15px; }
                        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
                        .content { background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin-top: 20px; }
                        .field { margin-bottom: 15px; }
                        .label { font-weight: bold; color: #555; }
                        .message-box { background: #f8f9fa; padding: 15px 0px; border-radius: 5px; margin-top: 10px; }
                        .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="${process.env.FRONTEND_URL}/logo.png" alt="PlaneVault Logo" class="logo">
                            <h2>New Contact Form Submission</h2>
                            <p>You have received a new query from your website</p>
                        </div>
                        <div class="content">
                            <div class="field">
                                <span class="label">Full Name:</span>
                                <span>${name}</span>
                            </div>
                            <div class="field">
                                <span class="label">Email:</span>
                                <span><a href="mailto:${email}">${email}</a></span>
                            </div>
                            <div class="field">
                                <span class="label">Phone:</span>
                                <span><a href="tel:${phone}">${phone}</a></span>
                            </div>
                            <div class="field">
                                <span class="label">User Type:</span>
                                <span>${userType}</span>
                            </div>
                            <div class="field">
                                <span class="label">Message:</span>
                                <div class="message-box">${message}</div>
                            </div>
                        </div>
                        <div class="footer">
                            <p>This email was sent from your PlaneVault's contact form.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        return !!info;
    } catch (error) {
        throw new Error(error);
    }
}

const contactConfirmationEmail = async (name, email) => {
    try {
        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Thank you for contacting PlaneVault`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .logo { width: auto; height: 48px; margin-bottom: 15px; }
                        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
                        .content { background: #fff; padding: 20px; border-radius: 5px; margin-top: 20px; }
                        .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="${process.env.FRONTEND_URL}/logo.png" alt="PlaneVault Logo" class="logo">
                            <h2>Thank You for Contacting PlaneVault</h2>
                        </div>
                        <div class="content">
                            <p>Dear <strong>${name}</strong>,</p>
                            <p>Thank you for reaching out to us. We have received your message and our team will get back to you within 24-48 hours.</p>
                            <p>If your inquiry is urgent, please feel free to call us directly.</p>
                            <br>
                            <p>Best regards,<br>The PlaneVault Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated response. Please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        return !!info;
    } catch (error) {
        throw new Error(error);
    }
}

const bidConfirmationEmail = async (userEmail, userName, itemName, amount, currentBid, auctionEnd) => {
    try {
        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Bid Confirmation - ${itemName}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .logo { width: auto; height: 48px; margin-bottom: 15px; }
                        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
                        .bid-info { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
                        .amount { font-size: 24px; font-weight: bold; color: #2e7d32; }
                        .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="${process.env.FRONTEND_URL}/logo.png" alt="PlaneVault Logo" class="logo">
                            <h2>Bid Confirmation</h2>
                        </div>
                        <p>Dear <strong>${userName}</strong>,</p>
                        
                        <div class="bid-info">
                            <p>Your bid has been successfully placed!</p>
                            <p class="amount">$${amount.toLocaleString()}</p>
                            <p>on <strong>${itemName}</strong></p>
                        </div>
                        
                        <p><strong>Current Highest Bid:</strong> $${currentBid.toLocaleString()}</p>
                        <p><strong>Auction Ends:</strong> ${new Date(auctionEnd).toLocaleString()}</p>
                        
                        <p>You will be notified if you are outbid or when the auction ends.</p>
                        
                        <div class="footer">
                            <p>Happy Bidding!<br>The PlaneVault Team</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        return !!info;
    } catch (error) {
        throw new Error(`Failed to send bid confirmation: ${error.message}`);
    }
}

const outbidNotificationEmail = async (userEmail, userName, itemName, newBid, auctionUrl) => {
    try {
        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `You've been outbid on ${itemName}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .logo { width: auto; height: 48px; margin-bottom: 15px; }
                        .alert { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
                        .cta-button { background: #000; color: #fff !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
                        .bid-amount { font-size: 20px; font-weight: bold; color: #dc3545; margin: 10px 0; }
                        .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="alert">
                            <img src="${process.env.FRONTEND_URL}/logo.png" alt="PlaneVault Logo" class="logo">
                            <h2>🚨 You've Been Outbid!</h2>
                            <p>Another bidder has placed a higher bid on an item you were bidding on.</p>
                        </div>
                        
                        <p>Dear <strong>${userName}</strong>,</p>
                        
                        <p>You've been outbid on: <strong>${itemName}</strong></p>
                        
                        <div class="bid-amount">New Highest Bid: $${newBid}</div>
                        
                        <p>Don't let this one get away! Place a new bid to regain your position in the auction.</p>
                        
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="${auctionUrl}" class="cta-button">Place New Bid Now</a>
                        </p>
                        
                        <p><em>This auction is getting competitive! Act fast to secure your chance to win.</em></p>
                        
                        <div class="footer">
                            <p>You're receiving this email because you placed a bid on this item.<br>
                            To adjust your notification preferences, visit your account settings.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        return !!info;
    } catch (error) {
        throw new Error(`Failed to send outbid notification: ${error.message}`);
    }
}

// Per-auction debounce configuration
const DEBOUNCE_DELAY = 5000; // 5 seconds
const lastNotificationTimes = new Map(); // Store last notification time per auction

const sendOutbidNotifications = async (auction, previousHighestBidder, previousBidders, currentBidderId, newBidAmount) => {
    try {
        const auctionId = auction._id.toString();

        // Per-auction debounce check
        const now = Date.now();
        const lastTime = lastNotificationTimes.get(auctionId) || 0;

        if (now - lastTime < DEBOUNCE_DELAY) {
            console.log(`Outbid notifications debounced for auction ${auctionId} - too frequent`);
            return;
        }
        lastNotificationTimes.set(auctionId, now);

        // Get all unique bidders who should be notified
        const biddersToNotify = previousBidders.filter(bidderId =>
            bidderId !== currentBidderId.toString()
        );

        if (biddersToNotify.length === 0) {
            console.log('No bidders to notify for outbid');
            return;
        }

        // Get user details for all bidders to notify
        const User = (await import('../models/user.model.js')).default;
        const users = await User.find({
            _id: { $in: biddersToNotify },
            'preferences.outbidNotifications': true
        });

        if (users.length === 0) {
            console.log('No users found with outbid notifications enabled');
            return;
        }

        // Create auction URL
        const auctionUrl = `${process.env.FRONTEND_URL}/auction/${auction._id}`;

        // Send notifications to each outbid user
        const notificationPromises = users.map(async (user) => {
            try {
                await outbidNotificationEmail(
                    user.email,
                    user.username,
                    auction.title,
                    newBidAmount,
                    auctionUrl
                );
            } catch (error) {
                console.error(`❌ Failed to send outbid notification to ${user.email}:`, error.message);
            }
        });

        const results = await Promise.allSettled(notificationPromises);

        // Log summary
        const successful = results.filter(result => result.status === 'fulfilled').length;
        const failed = results.filter(result => result.status === 'rejected').length;

        console.log(`Outbid notifications for auction ${auctionId}: ${successful} successful, ${failed} failed`);

    } catch (error) {
        console.error('Error sending outbid notifications:', error);
    }
}

// Optional: Clean up old entries from the Map to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    for (const [auctionId, lastTime] of lastNotificationTimes.entries()) {
        if (lastTime < oneHourAgo) {
            lastNotificationTimes.delete(auctionId);
        }
    }
}, 30 * 60 * 1000);

const sendAuctionWonEmail = async (auction) => {
    try {
        // Safety check - ensure winner is populated and has email
        if (!auction.winner || typeof auction.winner === 'string' || !auction.winner.email) {
            console.error('Winner not populated or missing email for auction:', auction._id);
            return false;
        }

        // Generate next steps HTML based on auction type and status
        const nextSteps = generateNextSteps(auction);

        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: auction.winner.email,
            subject: `🎉 Congratulations! You won ${auction.title}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .logo { width: auto; height: 48px; margin-bottom: 15px; }
                        .congrats { background: #d4edda; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; border-left: 4px solid #28a745; }
                        .winning-bid { font-size: 28px; font-weight: bold; color: #155724; margin: 10px 0; }
                        .next-steps { background: #e2e3e5; padding: 20px; border-radius: 5px; margin: 20px 0; }
                        .auction-details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
                        .cta-button { background: #000; color: #fff !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
                        .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="congrats">
                            <img src="${process.env.FRONTEND_URL}/logo.png" alt="PlaneVault Logo" class="logo">
                            <h2>🎉 Congratulations! You Won! 🎉</h2>
                            <p>You are the winning bidder for:</p>
                            <h3>${auction.title}</h3>
                            <div class="winning-bid">$${auction.finalPrice.toLocaleString() || auction.currentPrice.toLocaleString()}</div>
                        </div>
                        
                        <p>Dear <strong>${auction.winner.firstName || auction.winner.username}</strong>,</p>
                        
                        <div class="auction-details">
                            <h4>Auction Details:</h4>
                            <p><strong>Item:</strong> ${auction.title}</p>
                            <p><strong>Winning Bid:</strong> $${auction.finalPrice.toLocaleString() || auction.currentPrice.toLocaleString()}</p>
                            <p><strong>Auction Ended:</strong> ${new Date(auction.endDate).toLocaleDateString()}</p>
                            ${auction.location ? `<p><strong>Location:</strong> ${auction.location}</p>` : ''}
                        </div>

                        ${auction.status === 'sold' ? `
                            <p>Congratulations on being the highest bidder and winning this auction! Now, you can reach out to ${auction.seller.firstName || auction.seller.username} on the following details and follow up to arrange payment and transfer details.</p>

                            ${auction.seller ? `<p><strong>Seller:</strong> ${auction.seller.firstName || auction.seller.username}</p>` : ''}

                            ${auction.seller ? `<p><strong>E-mail:</strong> ${auction.seller?.email}</p>` : ''}

                            ${auction.seller ? `<p><strong>Phone:</strong> ${auction.seller?.phone}</p>` : ''}
                        ` : `
                            <p></p>
                        `}
                        
                        <div class="next-steps">
                            <h4>Next Steps:</h4>
                            ${nextSteps}
                        </div>
                        
                        <p style="text-align: center; margin: 25px 0;">
                            <a href="${process.env.FRONTEND_URL}/bidder/auctions/won" class="cta-button">View Your Winnings</a>
                        </p>
                        
                        <p>Thank you for bidding with <strong>PlaneVault</strong>!</p>
                        
                        <div class="footer">
                            <p>If you have any questions, please contact our support team.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });
        return !!info;
    } catch (error) {
        console.error(`❌ Failed to send auction won email for auction ${auction._id}:`, error);
        return false;
    }
};

const sendAuctionEndedSellerEmail = async (auction) => {
    try {
        // Safety check - ensure seller is populated and has email
        if (!auction.seller || typeof auction.seller === 'string' || !auction.seller.email) {
            console.error('Seller not populated or missing email for auction:', auction._id);
            return false;
        }

        const statusMessage = auction.status === 'sold'
            ? `Sold for $${auction.finalPrice.toLocaleString() || auction.currentPrice.toLocaleString()}`
            : 'Auction ended without sale';

        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: auction.seller.email,
            subject: `Auction Ended: ${auction.title}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .logo { width: auto; height: 48px; margin-bottom: 15px; }
                        .header { background: #${auction.status === 'sold' ? 'd4edda' : 'fff3cd'}; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; }
                        .status { font-size: 24px; font-weight: bold; color: #${auction.status === 'sold' ? '155724' : '856404'}; }
                        .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="${process.env.FRONTEND_URL}/logo.png" alt="PlaneVault Logo" class="logo">
                            <h2>Your Auction Has Ended</h2>
                            <div class="status">${statusMessage}</div>
                        </div>
                        
                        <p>Dear <strong>${auction.seller.firstName || auction.seller.username}</strong>,</p>
                        
                        <p>Your auction for <strong>"${auction.title}"</strong> has ended.</p>

                        ${auction.status === 'sold' ? `
                            <p>Congratulations on your successful sale! Now, you can reach out to ${auction.winner.firstName || auction.winner.username} on the following details and follow up to arrange payment and transfer details.</p>

                            ${auction.winner ? `<p><strong>Winner:</strong> ${auction.winner.firstName || auction.winner.username}</p>` : ''}

                            ${auction.winner ? `<p><strong>E-mail:</strong> ${auction.winner?.email}</p>` : ''}

                            ${auction.winner ? `<p><strong>Phone:</strong> ${auction.winner?.phone}</p>` : ''}
                        ` : `
                            <p>Your item did not sell this time. You can relist the item from your dashboard.</p>
                        `}
                        
                        <p><strong>Final Status:</strong> ${auction.status}</p>
                        ${auction.finalPrice ? `<p><strong>Final Price:</strong> $${auction.finalPrice.toLocaleString()}</p>` : ''}
                        ${auction.winner ? `<p><strong>Winner:</strong> ${auction.winner.username}</p>` : ''}
                        <p><strong>Total Bids:</strong> ${auction.bidCount.toLocaleString()}</p>
                        
                        <div class="footer">
                            <p>Thank you for using PlaneVault for your auction needs.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });
        return !!info;
    } catch (error) {
        console.error(`❌ Failed to send auction ended email to seller for auction ${auction._id}:`, error);
        return false;
    }
};

// Helper function to generate next steps based on auction details
const generateNextSteps = (auction) => {
    let steps = '';

    // Payment steps
    steps += `
        <p><strong>1. Contact Seller</strong><br>
        To complete your purchase and arrange delivery, you need to contact ${auction.seller.username} directly through your dashboard. They will coordinate the final details with you.</p>
    `;

    steps += `
        <p><strong>2. Inspection</strong><br>
        Do not forget to do pre-purchase inspection and documentation. Discuss the ownership transfer documentation, delivery timing, and all.</p>
    `;

    steps += `
        <p><strong>3. Payment Processing</strong><br>
        Make the payment of $${auction.finalPrice || auction.currentPrice} for the auction you won and make it yours.</p>
    `;

    // Commission information if applicable
    // if (auction.commissionAmount && auction.commissionAmount > 0) {
    //     steps += `
    //         <p><strong>2. Commission</strong><br>
    //         A commission fee of $${auction.commissionAmount} is included in the final amount.</p>
    //     `;
    // }

    return steps;
};

const auctionListedEmail = async (auction, seller) => {
    try {
        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: seller.email,
            subject: `Your Auction is Live: ${auction.title}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .logo { width: auto; height: 48px; margin-bottom: 15px; }
                        .header { background: #e3f2fd; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; }
                        .auction-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
                        .cta-button { background: #000; color: #fff !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
                        .tips { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="${process.env.FRONTEND_URL}/logo.png" alt="PlaneVault Logo" class="logo">
                            <h2>🎉 Your Auction is Live!</h2>
                            <p>Your item is now available for bidding</p>
                        </div>
                        
                        <p>Dear <strong>${seller.firstName || seller.username}</strong>,</p>
                        
                        <div class="auction-info">
                            <h4>Auction Details:</h4>
                            <p><strong>Item:</strong> ${auction.title}</p>
                            <p><strong>Starting Price:</strong> $${auction.startPrice}</p>
                            <p><strong>Auction Ends:</strong> ${new Date(auction.endDate).toLocaleString()}</p>
                            <p><strong>Auction Type:</strong> ${auction.auctionType}</p>
                            ${auction.reservePrice ? `<p><strong>Reserve Price:</strong> $${auction.reservePrice}</p>` : ''}
                        </div>
                        
                        <div class="tips">
                            <h4>Tips for Success:</h4>
                            <ul>
                                <li>Share your auction link on social media</li>
                                <li>Respond promptly to bidder questions</li>
                                <li>Monitor your auction's progress</li>
                                <li>Be prepared for the auction end</li>
                            </ul>
                        </div>
                        
                        <p style="text-align: center; margin: 25px 0;">
                            <a href="${process.env.FRONTEND_URL}/auction/${auction._id}" class="cta-button">View Your Live Auction</a>
                        </p>
                        
                        <p>We'll notify you when you receive bids and when the auction ends.</p>
                        
                        <p>Good luck with your sale!</p>
                    </div>
                </body>
                </html>
            `,
        });

        console.log(`✅ Auction listed email sent to seller ${seller.email}`);
        return !!info;
    } catch (error) {
        console.error(`❌ Failed to send auction listed email:`, error);
        return false;
    }
};

const auctionEndingSoonEmail = async (userEmail, userName, auction, timeRemaining) => {
    try {
        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `⏰ Ending Soon: ${auction.title}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .logo { width: auto; height: 48px; margin-bottom: 15px; }
                        .alert { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
                        .auction-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
                        .cta-button { background: #dc3545; color: #fff !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
                        .time-remaining { font-size: 20px; font-weight: bold; color: #dc3545; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="alert">
                            <img src="${process.env.FRONTEND_URL}/logo.png" alt="PlaneVault Logo" class="logo">
                            <h2>⏰ Auction Ending Soon!</h2>
                            <p>Don't miss your chance to bid on this item</p>
                        </div>
                        
                        <p>Dear <strong>${userName}</strong>,</p>
                        
                        <div class="time-remaining">${timeRemaining}</div>
                        
                        <div class="auction-info">
                            <h4>Auction Details:</h4>
                            <p><strong>Item:</strong> ${auction.title}</p>
                            <p><strong>Current Price:</strong> $${auction.currentPrice}</p>
                            <p><strong>Bid Count:</strong> ${auction.bidCount}</p>
                        </div>
                        
                        <p>This is your last chance to place a bid and secure this item!</p>
                        
                        <p style="text-align: center; margin: 25px 0;">
                            <a href="${process.env.FRONTEND_URL}/auction/${auction._id}" class="cta-button">Place Your Bid Now</a>
                        </p>
                        
                        <p><em>Act fast - this auction is about to end!</em></p>
                    </div>
                </body>
                </html>
            `,
        });

        return !!info;
    } catch (error) {
        console.error(`❌ Failed to send auction ending soon email:`, error);
        return false;
    }
};

const paymentSuccessEmail = async (user, auction, paymentAmount) => {
    try {
        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Payment Confirmed - ${auction.title}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .logo { width: auto; height: 48px; margin-bottom: 15px; }
                        .confirmation { background: #d4edda; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; }
                        .payment-details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
                        .amount { font-size: 24px; font-weight: bold; color: #155724; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="confirmation">
                            <img src="${process.env.FRONTEND_URL}/logo.png" alt="PlaneVault Logo" class="logo">
                            <h2>✅ Payment Successful</h2>
                            <p>Your payment has been processed successfully</p>
                        </div>
                        
                        <p>Dear <strong>${user.firstName || user.username}</strong>,</p>
                        
                        <div class="payment-details">
                            <h4>Payment Details:</h4>
                            <p><strong>Item:</strong> ${auction.title}</p>
                            <p class="amount">$${auction?.commissionAmount?.toLocaleString()}</p>
                            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                        </div>

                        ${auction.status === 'sold' ? `
                            <p>Congratulations on being the highest bidder and winning this auction! Now, you can reach out to ${auction.seller.firstName || auction.seller.username} on the following details and follow up to arrange payment and transfer details.</p>

                            ${auction.seller ? `<p><strong>Seller:</strong> ${auction.seller.firstName || auction.seller.username}</p>` : ''}

                            ${auction.seller ? `<p><strong>E-mail:</strong> ${auction.seller?.email}</p>` : ''}

                            ${auction.seller ? `<p><strong>Phone:</strong> ${auction.seller?.phone}</p>` : ''}
                        ` : `
                            <p></p>
                        `}
                        
                        <p>The hold we created on your card on the first bid has been successfully released and the commission/fee has been charged. Now, you can proceed to contacat the seller.</p>
                        
                        <p>You can check your order and contact the seller from your dashboard.</p>
                        
                        <p>Thank you for your purchase!</p>
                    </div>
                </body>
                </html>
            `,
        });

        console.log(`✅ Payment success email sent to ${user.email}`);
        return !!info;
    } catch (error) {
        console.error(`❌ Failed to send payment success email:`, error);
        return false;
    }
};

const welcomeEmail = async (user) => {
    try {
        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Welcome to PlaneVault!`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .logo { max-width: 150px; height: auto; margin-bottom: 15px; }
                        .welcome { background: #e3f2fd; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; }
                        .features { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
                        .cta-button { background: #000; color: #fff !important !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="welcome">
                            <img src="${process.env.FRONTEND_URL}/logo.png" alt="PlaneVault Logo" class="logo">
                            <h2>✈️ Welcome to PlaneVault!</h2>
                            <p>Your premier destination for aircraft auctions</p>
                        </div>
                        
                        <p>Dear <strong>${user.firstName || user.username}</strong>,</p>
                        
                        <p>Welcome to PlaneVault! We're excited to have you join our community of aviation enthusiasts and professionals.</p>
                        
                        <div class="features">
                            <h4>Get Started:</h4>
                            <ul>
                                ${user.userType === 'bidder' ? `
                                    <li>🛒 Browse active aircraft auctions</li>
                                    <li>⚡ Place bids on amazing aircraft</li>
                                    <li>🔔 Set up bid alerts</li>
                                    <li>💳 Set up your payment method</li>
                                ` : `
                                    <li>📦 List your aircraft for auction</li>
                                    <li>🎯 Set your reserve price</li>
                                    <li>📸 Add photos and documents</li>
                                    <li>👥 Reach qualified buyers</li>
                                `}
                            </ul>
                        </div>
                        
                        <p style="text-align: center; margin: 25px 0;">
                            <a href="${process.env.FRONTEND_URL}/${user.userType}/dashboard" class="cta-button">Explore Your Dashboard</a>
                        </p>
                        
                        <p>Need help getting started? Check out our FAQ or contact our support team.</p>
                        
                        <p>Happy trading!<br>The PlaneVault Team</p>
                    </div>
                </body>
                </html>
            `,
        });

        console.log(`✅ Welcome email sent to ${user.email}`);
        return !!info;
    } catch (error) {
        console.error(`❌ Failed to send welcome email:`, error);
        return false;
    }
};

// const verificationEmail = async (user, verificationUrl) => {
//     try {
//         const info = await transporter.sendMail({
//             from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
//             to: user.email,
//             subject: `Verify Your PlaneVault Account`,
//             html: `
//                 <!DOCTYPE html>
//                 <html>
//                 <head>
//                     <style>
//                         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//                         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//                         .header { background: #e3f2fd; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; }
//                         .cta-button { background: #000; color: #fff !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
//                         .note { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 15px 0; }
//                     </style>
//                 </head>
//                 <body>
//                     <div class="container">
//                         <div class="header">
//                             <h2>Verify Your Account</h2>
//                             <p>One more step to complete your registration</p>
//                         </div>

//                         <p>Dear <strong>${user.firstName || user.username}</strong>,</p>

//                         <p>Thank you for registering with PlaneVault! To complete your registration and access all features, please verify your email address.</p>

//                         <p style="text-align: center; margin: 25px 0;">
//                             <a href="${verificationUrl}" class="cta-button">Verify Email Address</a>
//                         </p>

//                         <div class="note">
//                             <p><strong>Note:</strong> This verification link will expire in 24 hours.</p>
//                         </div>

//                         <p>If the button doesn't work, copy and paste this link into your browser:</p>
//                         <p><a href="${verificationUrl}">${verificationUrl}</a></p>

//                         <p>If you didn't create an account with PlaneVault, please ignore this email.</p>
//                     </div>
//                 </body>
//                 </html>
//             `,
//         });

//         console.log(`✅ Verification email sent to ${user.email}`);
//         return !!info;
//     } catch (error) {
//         console.error(`❌ Failed to send verification email:`, error);
//         return false;
//     }
// };

const resetPasswordEmail = async (email, url) => {
    try {
        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Reset Your PlaneVault Password`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .logo { width: auto; height: 48px; margin-bottom: 15px; }
                        .header { background: #e3f2fd; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
                        .cta-button { background: #000; color: #fff !important; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px; }
                        .url-box { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; word-break: break-all; font-family: monospace; }
                        .note { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
                        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
                        .security-note { background: #f8d7da; padding: 10px; border-radius: 5px; margin: 15px 0; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="${process.env.FRONTEND_URL}/logo.png" alt="PlaneVault Logo" class="logo">
                            <h2>🔒 Reset Your Password</h2>
                            <p>PlaneVault Account Security</p>
                        </div>
                        
                        <div class="content">
                            <p>We received a request to reset your password for your PlaneVault account.</p>
                            
                            <p style="text-align: center; margin: 30px 0;">
                                <a href="${url}" class="cta-button">Reset Password</a>
                            </p>
                            
                            <p>Or copy and paste this link into your browser:</p>
                            <div class="url-box">${url}</div>
                            
                            <div class="note">
                                <p><strong>Note:</strong> This password reset link will expire in 1 hour for security reasons.</p>
                            </div>
                            
                            <div class="security-note">
                                <p><strong>Security Tip:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.</p>
                            </div>
                            
                            <p>For security reasons, we recommend:</p>
                            <ul>
                                <li>Choose a strong, unique password</li>
                                <li>Don't reuse passwords from other sites</li>
                                <li>Enable two-factor authentication if available</li>
                            </ul>
                            
                            <div class="footer">
                                <p>This is an automated message. Please do not reply to this email.</p>
                                <p>If you need assistance, contact our support team.</p>
                                <p>&copy; ${new Date().getFullYear()} PlaneVault. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send reset password email: ${error.message}`);
    }
}

//For admin
const newUserRegistrationEmail = async (adminEmail, user) => {
    try {
        const info = await transporter.sendMail({
            from: `"PlaneVault System" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `📋 New User Registration - ${user.userType}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .logo { width: auto; height: 48px; margin-bottom: 15px; }
                        .header { background: #e3f2fd; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
                        .user-card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff; }
                        .user-detail { margin: 8px 0; }
                        .label { font-weight: bold; color: #555; display: inline-block; width: 120px; }
                        .user-type-badge { 
                            background: ${user.userType === 'seller' ? '#d4edda' : '#e3f2fd'}; 
                            color: ${user.userType === 'seller' ? '#155724' : '#0c5460'};
                            padding: 4px 12px; 
                            border-radius: 20px; 
                            font-size: 12px; 
                            font-weight: bold; 
                            display: inline-block; 
                            margin-left: 10px;
                        }
                        .stats { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; }
                        .cta-button { background: #000; color: #fff !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
                        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="${process.env.FRONTEND_URL}/logo.png" alt="PlaneVault Logo" class="logo">
                            <h2>👤 New User Registration</h2>
                            <p>A new user has joined PlaneVault</p>
                        </div>
                        
                        <div class="content">
                            <p><strong>Hello Admin,</strong></p>
                            <p>A new user has successfully registered on PlaneVault. Here are the details:</p>
                            
                            <div class="user-card">
                                <h3>User Information</h3>
                                <div class="user-detail">
                                    <span class="label">Name:</span>
                                    ${user.firstName} ${user.lastName}
                                </div>
                                <div class="user-detail">
                                    <span class="label">Username:</span>
                                    ${user.username}
                                </div>
                                <div class="user-detail">
                                    <span class="label">Email:</span>
                                    ${user.email}
                                </div>
                                <div class="user-detail">
                                    <span class="label">User Type:</span>
                                    ${user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                                    <span class="user-type-badge">${user.userType.toUpperCase()}</span>
                                </div>
                                <div class="user-detail">
                                    <span class="label">Country:</span>
                                    ${user.countryName} (${user.countryCode})
                                </div>
                                <div class="user-detail">
                                    <span class="label">Phone:</span>
                                    ${user.phone || 'Not provided'}
                                </div>
                                <div class="user-detail">
                                    <span class="label">Registered:</span>
                                    ${new Date(user.createdAt).toLocaleString()}
                                </div>
                            </div>
                            
                            <p style="text-align: center; margin: 25px 0;">
                                <a href="${process.env.FRONTEND_URL}/admin/users" class="cta-button">View User in Admin Panel</a>
                            </p>
                            
                            <div class="footer">
                                <p>This is an automated notification from PlaneVault System.</p>
                                <p>You're receiving this because you're an administrator.</p>
                                <p>&copy; ${new Date().getFullYear()} PlaneVault. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        console.log(`✅ New user registration email sent to admin for ${user.email}`);
        return !!info;
    } catch (error) {
        console.error(`❌ Failed to send new user registration email:`, error);
        return false;
    }
};

const auctionWonAdminEmail = async (adminEmail, auction, winner) => {
    try {
        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `🏆 Auction Won - ${auction.title}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .logo { width: auto; height: 48px; margin-bottom: 15px; }
                        .header { background: #d4edda; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
                        .auction-card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
                        .winner-card { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff; }
                        .detail { margin: 8px 0; }
                        .label { font-weight: bold; color: #555; display: inline-block; width: 150px; }
                        .amount { font-size: 24px; font-weight: bold; color: #28a745; text-align: center; margin: 15px 0; }
                        .commission { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
                        .cta-button { background: #000; color: #fff !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin: 5px; }
                        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
                        .status-badge { 
                            background: #28a745; 
                            color: white;
                            padding: 4px 12px; 
                            border-radius: 20px; 
                            font-size: 12px; 
                            font-weight: bold; 
                            display: inline-block; 
                            margin-left: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="${process.env.FRONTEND_URL}/logo.png" alt="PlaneVault Logo" class="logo">
                            <h2>🏆 Auction Successfully Completed</h2>
                            <p>An auction has ended with a winning bidder</p>
                        </div>
                        
                        <div class="content">
                            <p><strong>Hello Admin,</strong></p>
                            <p>The following auction has ended successfully with a winning bidder:</p>
                            
                            <div class="auction-card">
                                <h3>Auction Details</h3>
                                <div class="detail">
                                    <span class="label">Auction Title:</span>
                                    ${auction.title}
                                </div>
                                <div class="detail">
                                    <span class="label">Category:</span>
                                    ${auction.category}
                                </div>
                                <div class="detail">
                                    <span class="label">Seller:</span>
                                    ${auction.seller?.username || 'N/A'} (${auction.seller?.email || 'N/A'})
                                </div>
                                <div class="detail">
                                    <span class="label">Auction Type:</span>
                                    ${auction.auctionType}
                                    ${auction.reservePrice ? `- Reserve: $${auction.reservePrice?.toLocaleString()}` : ''}
                                </div>
                                <div class="detail">
                                    <span class="label">Total Bids:</span>
                                    ${auction.bidCount?.toLocaleString()} bids
                                </div>
                                <div class="detail">
                                    <span class="label">Auction Ended:</span>
                                    ${new Date(auction.endDate).toLocaleString()}
                                </div>
                                ${auction.location ? `
                                <div class="detail">
                                    <span class="label">Location:</span>
                                    ${auction.location}
                                </div>
                                ` : ''}
                                
                                <div class="amount">
                                    Winning Bid: $${auction.finalPrice?.toLocaleString() || auction.currentPrice?.toLocaleString()}
                                </div>
                                
                                ${auction.commissionAmount && auction.commissionAmount > 0 ? `
                                <div class="commission">
                                    <strong>Commission:</strong> $${auction.commissionAmount?.toLocaleString()}
                                </div>
                                ` : ''}
                            </div>
                            
                            <div class="winner-card">
                                <h3>Winner Information</h3>
                                <div class="detail">
                                    <span class="label">Winner Name:</span>
                                    ${winner.firstName}
                                </div>
                                <div class="detail">
                                    <span class="label">Username:</span>
                                    ${winner.username}
                                </div>
                                <div class="detail">
                                    <span class="label">Email:</span>
                                    ${winner.email}
                                </div>
                            </div>
                            
                            <div style="text-align: center; margin: 25px 0;">
                                <a href="${process.env.FRONTEND_URL}/admin/auctions/all" class="cta-button">View Auction Details</a>
                            </div>
                            
                            <div class="footer">
                                <p>This is an automated notification from PlaneVault Auctions System.</p>
                                <p>You're receiving this because you're as an administrator.</p>
                                <p>&copy; ${new Date().getFullYear()} PlaneVault. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        console.log(`✅ Auction won admin email sent for auction ${auction._id}`);
        return !!info;
    } catch (error) {
        console.error(`❌ Failed to send auction won admin email:`, error);
        return false;
    }
};

const auctionEndedAdminEmail = async (adminEmail, auction) => {
    try {
        // Determine email content based on auction status
        const getStatusDetails = (status) => {
            const statusConfig = {
                'sold': {
                    subject: '🏆 Auction Sold',
                    headerColor: '#d4edda',
                    headerText: 'Auction Successfully Sold',
                    statusBadge: 'SOLD',
                    badgeColor: '#28a745',
                    summary: 'This auction has ended successfully with a winning bidder.'
                },
                'reserve_not_met': {
                    subject: '⚠️ Reserve Not Met',
                    headerColor: '#fff3cd',
                    headerText: 'Auction Ended - Reserve Not Met',
                    statusBadge: 'RESERVE NOT MET',
                    badgeColor: '#ffc107',
                    summary: 'This auction ended but the reserve price was not met.'
                },
                'ended': {
                    subject: '📊 Auction Ended - No Sale',
                    headerColor: '#e2e3e5',
                    headerText: 'Auction Ended Without Sale',
                    statusBadge: 'ENDED - NO SALE',
                    badgeColor: '#6c757d',
                    summary: 'This auction ended without any winning bids.'
                },
                'cancelled': {
                    subject: '❌ Auction Cancelled',
                    headerColor: '#f8d7da',
                    headerText: 'Auction Cancelled',
                    statusBadge: 'CANCELLED',
                    badgeColor: '#dc3545',
                    summary: 'This auction was cancelled before completion.'
                }
            };
            return statusConfig[status] || statusConfig['ended'];
        };

        const statusDetails = getStatusDetails(auction.status);

        // Populate necessary data
        await auction.populate('seller', 'username email firstName lastName');
        if (auction.winner) {
            await auction.populate('winner', 'username email firstName lastName userType');
        }

        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `${statusDetails.subject} - ${auction.title}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .logo { width: auto; height: 48px; margin-bottom: 15px; }
                        .header { background: ${statusDetails.headerColor}; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
                        .auction-card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusDetails.badgeColor}; }
                        .party-card { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
                        .detail { margin: 8px 0; }
                        .label { font-weight: bold; color: #555; display: inline-block; width: 150px; }
                        .amount { font-size: 20px; font-weight: bold; color: ${statusDetails.badgeColor}; text-align: center; margin: 15px 0; }
                        .commission { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
                        .stats { background: #e9ecef; padding: 15px; border-radius: 8px; margin: 15px 0; }
                        .cta-button { background: #000; color: #fff !important; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin: 5px; font-size: 14px; }
                        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
                        .status-badge { 
                            background: ${statusDetails.badgeColor}; 
                            color: white;
                            padding: 6px 16px; 
                            border-radius: 20px; 
                            font-size: 14px; 
                            font-weight: bold; 
                            display: inline-block; 
                            margin: 10px 0;
                        }
                        .action-alert { background: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #dc3545; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="${process.env.FRONTEND_URL}/logo.png" alt="PlaneVault Logo" class="logo">
                            <h2>${statusDetails.headerText}</h2>
                            <p>${statusDetails.summary}</p>
                            <div class="status-badge">${statusDetails.statusBadge}</div>
                        </div>
                        
                        <div class="content">
                            <p><strong>Hello Admin,</strong></p>
                            
                            <div class="auction-card">
                                <h3>Auction Summary</h3>
                                <div class="detail">
                                    <span class="label">Auction Title:</span>
                                    ${auction.title}
                                </div>
                                <div class="detail">
                                    <span class="label">Auction ID:</span>
                                    ${auction._id}
                                </div>
                                <div class="detail">
                                    <span class="label">Category:</span>
                                    ${auction.category}
                                </div>
                                <div class="detail">
                                    <span class="label">Auction Type:</span>
                                    ${auction.auctionType}
                                    ${auction.reservePrice ? ` (Reserve: $${auction.reservePrice?.toLocaleString()})` : ''}
                                </div>
                                <div class="detail">
                                    <span class="label">Final Status:</span>
                                    <strong>${auction.status.toUpperCase().replace('_', ' ')}</strong>
                                </div>
                                ${auction.finalPrice ? `
                                <div class="amount">
                                    Final Price: $${auction.finalPrice?.toLocaleString()}
                                </div>
                                ` : ''}
                            </div>

                            <div class="stats">
                                <h4>📊 Auction Statistics</h4>
                                <div class="detail">
                                    <span class="label">Total Bids:</span>
                                    ${auction.bidCount?.toLocaleString()} bids
                                </div>
                                <div class="detail">
                                    <span class="label">Starting Price:</span>
                                    $${auction.startPrice?.toLocaleString()}
                                </div>
                                <div class="detail">
                                    <span class="label">Current Price:</span>
                                    $${auction.currentPrice?.toLocaleString()}
                                </div>
                                ${auction.commissionAmount && auction.commissionAmount > 0 ? `
                                <div class="detail">
                                    <span class="label">Commission:</span>
                                    $${auction.commissionAmount?.toLocaleString()}
                                </div>
                                ` : ''}
                                <div class="detail">
                                    <span class="label">Auction Duration:</span>
                                    ${Math.ceil((auction.endDate - auction.startDate) / (1000 * 60 * 60 * 24))} days
                                </div>
                                <div class="detail">
                                    <span class="label">Ended At:</span>
                                    ${new Date(auction.endDate).toLocaleString()}
                                </div>
                            </div>

                            ${auction.seller ? `
                            <div class="party-card">
                                <h4>👤 Seller Information</h4>
                                <div class="detail">
                                    <span class="label">Name:</span>
                                    ${auction.seller.firstName} ${auction.seller.lastName}
                                </div>
                                <div class="detail">
                                    <span class="label">Username:</span>
                                    ${auction.seller.username}
                                </div>
                                <div class="detail">
                                    <span class="label">Email:</span>
                                    ${auction.seller.email}
                                </div>
                            </div>
                            ` : ''}

                            ${auction.winner ? `
                            <div class="party-card">
                                <h4>🏆 Winner Information</h4>
                                <div class="detail">
                                    <span class="label">Name:</span>
                                    ${auction.winner.firstName} ${auction.winner.lastName}
                                </div>
                                <div class="detail">
                                    <span class="label">Username:</span>
                                    ${auction.winner.username}
                                </div>
                                <div class="detail">
                                    <span class="label">Email:</span>
                                    ${auction.winner.email}
                                </div>
                                <div class="detail">
                                    <span class="label">User Type:</span>
                                    ${auction.winner.userType}
                                </div>
                            </div>
                            ` : ''}

                            ${auction.status === 'reserve_not_met' ? `
                            <div class="action-alert">
                                <h4>⚠️ Action Required</h4>
                                <p>This auction ended without meeting the reserve price. The seller may need assistance with relisting or alternative options.</p>
                            </div>
                            ` : ''}

                            ${auction.status === 'cancelled' ? `
                            <div class="action-alert">
                                <h4>❌ Cancellation Notice</h4>
                                <p>This auction was cancelled. Please review the reason for cancellation and follow up with the seller if necessary.</p>
                            </div>
                            ` : ''}

                            <div style="text-align: center; margin: 25px 0;">
                                <a href="${process.env.FRONTEND_URL}/admin/auctions/all" class="cta-button">View Auction Details</a>
                            </div>
                            
                            <div class="footer">
                                <p>This is an automated notification from PlaneVault Auctions System.</p>
                                <p>You're receiving this because you're an administrator.</p>
                                <p>&copy; ${new Date().getFullYear()} PlaneVault. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        console.log(`✅ Auction ended admin email sent for auction ${auction._id} (Status: ${auction.status})`);
        return !!info;
    } catch (error) {
        console.error(`❌ Failed to send auction ended admin email:`, error);
        return false;
    }
};

const flaggedCommentAdminEmail = async (adminEmail, reason, comment, auction, reportedByUser) => {
    try {
        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `🚩 Flagged Comment - ${auction.title}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .logo { width: auto; height: 48px; margin-bottom: 15px; }
                        .header { background: #fff3cd; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; border-left: 4px solid #ffc107; }
                        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
                        .comment-card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #dc3545; }
                        .user-card { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
                        .auction-card { background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 15px 0; }
                        .detail { margin: 8px 0; }
                        .label { font-weight: bold; color: #555; display: inline-block; width: 120px; }
                        .comment-text { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #dc3545; font-style: italic; }
                        .flag-badge { 
                            background: #dc3545; 
                            color: white;
                            padding: 6px 16px; 
                            border-radius: 20px; 
                            font-size: 12px; 
                            font-weight: bold; 
                            display: inline-block; 
                            margin: 5px 0;
                        }
                        .cta-button { background: #000; color: #fff !important; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin: 5px; font-size: 14px; }
                        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
                        .timestamp { color: #6c757d; font-size: 12px; }
                        .action-section { background: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; }
                        .reason-box { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="${process.env.FRONTEND_URL}/logo.png" alt="PlaneVault Logo" class="logo">
                            <h2>🚩 Comment Flagged for Review</h2>
                            <p>A user has reported inappropriate content in an auction comment</p>
                            <div class="flag-badge">FLAGGED CONTENT</div>
                        </div>
                        
                        <div class="content">
                            <p><strong>Hello Admin,</strong></p>
                            <p>A comment has been flagged by a community member and requires your review.</p>

                            <div class="reason-box">
                                <strong>Flag Reason:</strong> ${reason}
                            </div>

                            <div class="auction-card">
                                <h4>📋 Auction Details</h4>
                                <div class="detail">
                                    <span class="label">Auction Title:</span>
                                    ${auction.title}
                                </div>
                                <div class="detail">
                                    <span class="label">Auction ID:</span>
                                    ${auction._id}
                                </div>
                                <div class="detail">
                                    <span class="label">Category:</span>
                                    ${auction.category}
                                </div>
                                <div class="detail">
                                    <span class="label">Current Price:</span>
                                    $${auction.currentPrice?.toLocaleString()}
                                </div>
                                <div class="detail">
                                    <span class="label">Status:</span>
                                    ${auction.status}
                                </div>
                            </div>

                            <div class="comment-card">
                                <h4>💬 Flagged Comment</h4>
                                <div class="comment-text">
                                    "${comment.content}"
                                </div>
                                <div class="timestamp">
                                    Posted: ${new Date(comment.createdAt).toLocaleString()}
                                </div>
                                ${comment.updatedAt && comment.updatedAt !== comment.createdAt ? `
                                <div class="timestamp">
                                    Last Edited: ${new Date(comment.updatedAt).toLocaleString()}
                                </div>
                                ` : ''}
                                <div class="detail">
                                    <span class="label">Likes:</span>
                                    ${comment.likes?.length || 0}
                                </div>
                                <div class="detail">
                                    <span class="label">Flags:</span>
                                    ${comment.flags?.length || 0}
                                </div>
                            </div>

                            <div class="user-card">
                                <h4>👤 Comment Author</h4>
                                <div class="detail">
                                    <span class="label">Name:</span>
                                    ${comment.user?.firstName || comment.userName || 'N/A'} ${comment.user?.lastName || ''}
                                </div>
                                <div class="detail">
                                    <span class="label">Username:</span>
                                    ${comment.user?.username || comment.userName || 'N/A'}
                                </div>
                                <div class="detail">
                                    <span class="label">Email:</span>
                                    ${comment.user?.email || 'N/A'}
                                </div>
                                <div class="detail">
                                    <span class="label">User Type:</span>
                                    ${comment.user?.userType || 'N/A'}
                                </div>
                                <div class="detail">
                                    <span class="label">Member Since:</span>
                                    ${comment.user?.createdAt ? new Date(comment.user.createdAt).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>

                            <div class="user-card">
                                <h4>👤 Reported By</h4>
                                <div class="detail">
                                    <span class="label">Name:</span>
                                    ${reportedByUser.firstName} ${reportedByUser.lastName}
                                </div>
                                <div class="detail">
                                    <span class="label">Username:</span>
                                    ${reportedByUser.username}
                                </div>
                                <div class="detail">
                                    <span class="label">Email:</span>
                                    ${reportedByUser.email}
                                </div>
                                <div class="detail">
                                    <span class="label">User Type:</span>
                                    ${reportedByUser.userType}
                                </div>
                                <div class="timestamp">
                                    Flagged at: ${new Date().toLocaleString()}
                                </div>
                            </div>

                            <div style="text-align: center; margin: 25px 0;">
                                <a href="${process.env.FRONTEND_URL}/admin/comments" class="cta-button">Review Comment</a>
                            </div>
                            
                            <div class="footer">
                                <p>This is an automated notification from PlaneVault Moderation System.</p>
                                <p>You're receiving this because you're as a moderator/administrator.</p>
                                <p>&copy; ${new Date().getFullYear()} PlaneVault. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        console.log(`✅ Flagged comment email sent to admin for comment ${comment._id}`);
        return !!info;
    } catch (error) {
        console.error(`❌ Failed to send flagged comment email:`, error);
        return false;
    }
};

// Comment emails
const newCommentSellerEmail = async (seller, auction, comment, commentAuthor) => {
    try {
        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: seller.email,
            subject: `💬 New Comment on Your Auction: ${auction.title}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .logo { width: auto; height: 48px; margin-bottom: 15px; }
                        .header { background: #e3f2fd; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
                        .auction-card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .comment-card { background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff; }
                        .detail { margin: 8px 0; }
                        .label { font-weight: bold; color: #555; display: inline-block; width: 120px; }
                        .comment-text { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; font-style: italic; border: 1px solid #e0e0e0; }
                        .cta-button { background: #000; color: #fff !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
                        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
                        .timestamp { color: #6c757d; font-size: 12px; }
                        .author-badge { background: #17a2b8; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; margin-left: 10px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="${process.env.FRONTEND_URL}/logo.png" alt="PlaneVault Logo" class="logo">
                            <h2>💬 New Comment on Your Auction</h2>
                            <p>Someone has commented on your auction listing</p>
                        </div>
                        
                        <div class="content">
                            <p>Dear <strong>${seller.firstName || seller.username}</strong>,</p>
                            <p>A new comment has been posted on your auction. Engaging with comments can help build trust and answer potential bidder questions.</p>

                            <div class="auction-card">
                                <h4>📋 Your Auction</h4>
                                <div class="detail">
                                    <span class="label">Title:</span>
                                    ${auction.title}
                                </div>
                                <div class="detail">
                                    <span class="label">Current Price:</span>
                                    $${auction.currentPrice?.toLocaleString()}
                                </div>
                                <div class="detail">
                                    <span class="label">Bid Count:</span>
                                    ${auction.bidCount}
                                </div>
                                <div class="detail">
                                    <span class="label">Time Remaining:</span>
                                    ${auction.timeRemainingFormatted || 'Ending soon'}
                                </div>
                            </div>

                            <div class="comment-card">
                                <h4>👤 New Comment</h4>
                                <div class="detail">
                                    <span class="label">From:</span>
                                    ${commentAuthor.firstName || commentAuthor.username}
                                    <span class="author-badge">${commentAuthor.userType}</span>
                                </div>
                                <div class="comment-text">
                                    "${comment.content}"
                                </div>
                                <div class="timestamp">
                                    Posted: ${new Date(comment.createdAt).toLocaleString()}
                                </div>
                            </div>

                            <p><strong>Why this matters:</strong></p>
                            <ul>
                                <li>Active comment sections increase auction visibility</li>
                                <li>Responding to questions can build bidder confidence</li>
                                <li>Engaged sellers often see higher final prices</li>
                            </ul>

                            <div style="text-align: center; margin: 25px 0;">
                                <a href="${process.env.FRONTEND_URL}/auction/${auction._id}" class="cta-button">View & Respond to Comment</a>
                            </div>

                            <p>Keep the conversation going! Your responses help create a transparent and trustworthy auction environment.</p>
                            
                            <div class="footer">
                                <p>You're receiving this because you're the seller of this auction.</p>
                                <p>To adjust your notification preferences, visit your account settings.</p>
                                <p>&copy; ${new Date().getFullYear()} PlaneVault. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        console.log(`✅ New comment email sent to seller ${seller.email}`);
        return !!info;
    } catch (error) {
        console.error(`❌ Failed to send new comment email to seller:`, error);
        return false;
    }
};

const newCommentBidderEmail = async (bidder, auction, comment, commentAuthor) => {
    try {
        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: bidder.email,
            subject: `💬 New Activity on Auction: ${auction.title}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .logo { width: auto; height: 48px; margin-bottom: 15px; }
                        .header { background: #fff3cd; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
                        .auction-card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .comment-card { background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff; }
                        .detail { margin: 8px 0; }
                        .label { font-weight: bold; color: #555; display: inline-block; width: 120px; }
                        .comment-text { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; font-style: italic; border: 1px solid #e0e0e0; }
                        .cta-button { background: #000; color: #fff !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
                        .bid-button { background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin-left: 10px; }
                        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
                        .timestamp { color: #6c757d; font-size: 12px; }
                        .urgency { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="${process.env.FRONTEND_URL}/logo.png" alt="PlaneVault Logo" class="logo">
                            <h2>💬 New Auction Activity</h2>
                            <p>There's new discussion on an auction you're interested in</p>
                        </div>
                        
                        <div class="content">
                            <p>Dear <strong>${bidder.firstName || bidder.username}</strong>,</p>
                            <p>There's new activity on an auction you've shown interest in. Staying informed can help you make better bidding decisions.</p>

                            <div class="auction-card">
                                <h4>📋 Auction Details</h4>
                                <div class="detail">
                                    <span class="label">Title:</span>
                                    ${auction.title}
                                </div>
                                <div class="detail">
                                    <span class="label">Current Price:</span>
                                    $${auction.currentPrice?.toLocaleString()}
                                </div>
                                <div class="detail">
                                    <span class="label">Your Last Bid:</span>
                                    $[User's last bid amount would go here]
                                </div>
                                <div class="detail">
                                    <span class="label">Time Remaining:</span>
                                    ${auction.timeRemainingFormatted || 'Ending soon'}
                                </div>
                                <div class="detail">
                                    <span class="label">Your Status:</span>
                                    ${auction.currentBidder?.toString() === bidder._id.toString() ? '🏆 Highest Bidder' : '💫 Outbid - Bid again!'}
                                </div>
                            </div>

                            <div class="comment-card">
                                <h4>👤 New Comment</h4>
                                <div class="detail">
                                    <span class="label">From:</span>
                                    ${commentAuthor.firstName || commentAuthor.username}
                                </div>
                                <div class="comment-text">
                                    "${comment.content}"
                                </div>
                                <div class="timestamp">
                                    Posted: ${new Date(comment.createdAt).toLocaleString()}
                                </div>
                            </div>

                            ${auction.timeRemaining < (60 * 60 * 1000) ? `
                            <div class="urgency">
                                <h4>⏰ Auction Ending Soon!</h4>
                                <p>This auction is ending in less than 1 hour. Don't miss your chance!</p>
                            </div>
                            ` : ''}

                            <p><strong>Why check the comments?</strong></p>
                            <ul>
                                <li>Get answers to questions from other bidders</li>
                                <li>Learn more about the item condition</li>
                                <li>Understand shipping and payment details</li>
                                <li>Gauge competition interest level</li>
                            </ul>

                            <div style="text-align: center; margin: 25px 0;">
                                <a href="${process.env.FRONTEND_URL}/auction/${auction._id}" class="cta-button">View Comments & Details</a>
                            </div>

                            <p>Stay engaged with the auction community and make informed bidding decisions!</p>
                            
                            <div class="footer">
                                <p>You're receiving this because you've bid on or shown interest in this auction.</p>
                                <p>To adjust your notification preferences, visit your account settings.</p>
                                <p>&copy; ${new Date().getFullYear()} PlaneVault. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        console.log(`✅ New comment email sent to bidder ${bidder.email}`);
        return !!info;
    } catch (error) {
        console.error(`❌ Failed to send new comment email to bidder:`, error);
        return false;
    }
};

const auctionSubmittedForApprovalEmail = async (adminEmail, auction, seller) => {
    try {
        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `📝 New Auction Submitted for Approval - ${auction.title}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .logo { width: auto; height: 48px; margin-bottom: 15px; }
                        .header { background: #fff3cd; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; border-left: 4px solid #ffc107; }
                        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
                        .auction-card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8; }
                        .seller-card { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
                        .action-card { background: #d4edda; padding: 15px; border-radius: 8px; margin: 15px 0; }
                        .detail { margin: 8px 0; }
                        .label { font-weight: bold; color: #555; display: inline-block; width: 150px; }
                        .status-badge { 
                            background: #ffc107; 
                            color: #212529;
                            padding: 6px 16px; 
                            border-radius: 20px; 
                            font-size: 14px; 
                            font-weight: bold; 
                            display: inline-block; 
                            margin: 10px 0;
                        }
                        .cta-button { 
                            background: #000; 
                            color: #fff !important; 
                            padding: 12px 24px; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            display: inline-block; 
                            font-weight: bold; 
                            margin: 5px;
                        }
                        .approve-btn { 
                            background: #28a745; 
                            color: #fff !important; 
                            padding: 12px 24px; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            display: inline-block; 
                            font-weight: bold; 
                            margin: 5px;
                        }
                        .reject-btn { 
                            background: #dc3545; 
                            color: #fff !important; 
                            padding: 12px 24px; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            display: inline-block; 
                            font-weight: bold; 
                            margin: 5px;
                        }
                        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
                        .priority { background: #f8d7da; padding: 10px; border-radius: 5px; margin: 10px 0; }
                        .images-info { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="${process.env.FRONTEND_URL}/logo.png" alt="PlaneVault Logo" class="logo">
                            <h2>📝 New Auction Awaiting Approval</h2>
                            <p>A seller has submitted a new auction for review</p>
                            <div class="status-badge">AWAITING APPROVAL</div>
                        </div>
                        
                        <div class="content">
                            <p><strong>Hello Admin,</strong></p>
                            <p>A new auction listing has been submitted and requires your approval before it can go live.</p>

                            <div class="auction-card">
                                <h3>🛩️ Auction Details</h3>
                                <div class="detail">
                                    <span class="label">Title:</span>
                                    ${auction.title}
                                </div>
                                <div class="detail">
                                    <span class="label">Auction ID:</span>
                                    ${auction._id}
                                </div>
                                <div class="detail">
                                    <span class="label">Category:</span>
                                    ${auction.category}
                                </div>
                                <div class="detail">
                                    <span class="label">Starting Price:</span>
                                    $${auction.startPrice?.toLocaleString()}
                                </div>
                                ${auction.reservePrice ? `
                                <div class="detail">
                                    <span class="label">Reserve Price:</span>
                                    $${auction.reservePrice?.toLocaleString()}
                                </div>
                                ` : ''}
                                <div class="detail">
                                    <span class="label">Auction Type:</span>
                                    ${auction.auctionType}
                                </div>
                                ${auction.location ? `
                                <div class="detail">
                                    <span class="label">Location:</span>
                                    ${auction.location}
                                </div>
                                ` : ''}
                                ${auction.description ? `
                                <div class="detail">
                                    <span class="label">Description:</span>
                                    <div style="margin-top: 8px; padding: 10px; background: white; border-radius: 5px; border: 1px solid #ddd;">
                                        ${auction.description.substring(0, 200)}${auction.description.length > 200 ? '...' : ''}
                                    </div>
                                </div>
                                ` : ''}
                                <div class="detail">
                                    <span class="label">Submitted:</span>
                                    ${new Date(auction.createdAt).toLocaleString()}
                                </div>
                            </div>

                            <div class="seller-card">
                                <h3>👤 Seller Information</h3>
                                <div class="detail">
                                    <span class="label">Name:</span>
                                    ${seller.firstName} ${seller.lastName}
                                </div>
                                <div class="detail">
                                    <span class="label">Username:</span>
                                    ${seller.username}
                                </div>
                            </div>

                            ${auction.requiresImmediateAttention ? `
                            <div class="priority">
                                <h4>🚨 Priority Review Required</h4>
                                <p>This auction has been flagged for immediate attention due to:</p>
                                <ul>
                                    ${auction.requiresImmediateAttention.reason ? `<li>${auction.requiresImmediateAttention.reason}</li>` : ''}
                                    ${auction.highValueItem ? `<li>High-value item ($${auction.startPrice?.toLocaleString()}+)</li>` : ''}
                                    ${auction.specialCategory ? `<li>Special category item</li>` : ''}
                                </ul>
                            </div>
                            ` : ''}

                            <div class="action-card">
                                <h4>✅ Approval Checklist</h4>
                                <ul>
                                    <li>✓ Verify item description accuracy</li>
                                    <li>✓ Check image quality and relevance</li>
                                    <li>✓ Review pricing appropriateness</li>
                                    <li>✓ Ensure category classification is correct</li>
                                    <li>✓ Confirm seller compliance with terms</li>
                                </ul>
                            </div>

                            <div style="text-align: center; margin: 25px 0;">
                                <a href="${process.env.FRONTEND_URL}/admin/auctions/all" class="cta-button">Review Full Auction Details</a>
                            </div>

                            <p><strong>Action Required:</strong> Please review this auction within 24 hours to ensure timely listing.</p>
                            
                            <div class="footer">
                                <p>This is an automated notification from PlaneVault Auction Approval System.</p>
                                <p>You're receiving this because you're an administrator.</p>
                                <p>&copy; ${new Date().getFullYear()} PlaneVault. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        console.log(`✅ Auction submission email sent to admin for auction ${auction._id}`);
        return !!info;
    } catch (error) {
        console.error(`❌ Failed to send auction submission email:`, error);
        return false;
    }
};

const auctionApprovedEmail = async (seller, auction) => {
    try {
        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: seller.email,
            subject: `✅ Your Auction is Approved: ${auction.title}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .logo { width: auto; height: 48px; margin-bottom: 15px; }
                        .header { background: #d4edda; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
                        .auction-card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .cta-button { background: #000; color: #fff !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
                        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="${process.env.FRONTEND_URL}/logo.png" alt="PlaneVault Logo" class="logo">
                            <h2>✅ Auction Approved!</h2>
                            <p>Your auction is now live and accepting bids</p>
                        </div>
                        
                        <div class="content">
                            <p>Dear <strong>${seller.firstName || seller.username}</strong>,</p>
                            
                            <p>Great news! Your auction listing has been approved and is now live on PlaneVault.</p>

                            <div class="auction-card">
                                <h4>🛩️ Your Live Auction</h4>
                                <p><strong>Title:</strong> ${auction.title}</p>
                                <p><strong>Starting Price:</strong> $${auction.startPrice?.toLocaleString()}</p>
                                <p><strong>Auction Ends:</strong> ${new Date(auction.endDate).toLocaleString()}</p>
                                <p><strong>Auction URL:</strong> <a href="${process.env.FRONTEND_URL}/auction/${auction._id}">View Your Live Auction</a></p>
                            </div>

                            <p><strong>Next Steps:</strong></p>
                            <ul>
                                <li>Share your auction link with potential buyers</li>
                                <li>Monitor bids and respond to questions</li>
                                <li>Be prepared for the auction end date</li>
                            </ul>

                            <div style="text-align: center; margin: 25px 0;">
                                <a href="${process.env.FRONTEND_URL}/auction/${auction._id}" class="cta-button">View Your Live Auction</a>
                            </div>

                            <p>Good luck with your sale! If you have any questions, our support team is here to help.</p>
                            
                            <div class="footer">
                                <p>This is an automated notification from PlaneVault.</p>
                                <p>&copy; ${new Date().getFullYear()} PlaneVault. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        console.log(`✅ Auction approved email sent to seller ${seller.email}`);
        return !!info;
    } catch (error) {
        console.error(`❌ Failed to send auction approved email:`, error);
        return false;
    }
};

const newAuctionNotificationEmail = async (bidder, auction, seller) => {
    try {
        // Determine auction status and appropriate wording
        const isLive = auction.status === 'active' || auction.status === 'live';
        const auctionStatus = isLive ? 'Live Now' : 'Coming Soon';
        const statusColor = isLive ? '#28a745' : '#17a2b8';
        const actionText = isLive ? 'Place Your Bid Now' : 'Add to Watch Later';
        const urgencyText = isLive ? 'Bidding is now open!' : 'Get ready to bid when it goes live!';
        const timeInfo = isLive ?
            `Ends: ${new Date(auction.endDate).toLocaleString()}` :
            `Starts: ${new Date(auction.startDate).toLocaleString()}`;

        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: bidder.email,
            subject: `🛩️ New Auction: ${auction.title}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .logo { width: auto; height: 48px; margin-bottom: 15px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; color: white; }
                        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
                        .auction-card { background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 20px 0; border-left: 5px solid ${statusColor}; }
                        .status-badge { 
                            background: ${statusColor}; 
                            color: white;
                            padding: 8px 20px; 
                            border-radius: 25px; 
                            font-size: 14px; 
                            font-weight: bold; 
                            display: inline-block; 
                            margin: 10px 0;
                        }
                        .detail { margin: 12px 0; display: flex; }
                        .label { font-weight: bold; color: #555; min-width: 140px; }
                        .value { flex: 1; }
                        .cta-button { 
                            background: #000; 
                            color: #fff !important; 
                            padding: 15px 30px; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            margin: 10px 5px;
                            text-align: center;
                        }
                        .live-button { 
                            background: #dc3545; 
                            color: white !important; 
                            padding: 15px 30px; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            display: inline-block; 
                            font-weight: bold; 
                            font-size: 16px;
                            margin: 10px 5px;
                        }
                        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
                        .features { display: flex; justify-content: space-between; flex-wrap: wrap; margin: 25px 0; text-align: center; }
                        .feature { flex: 1; padding: 15px; }
                        .feature-icon { font-size: 24px; margin-bottom: 10px; }
                        .urgency-banner { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 4px solid #ffc107; }
                        .seller-info { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
                        .price-highlight { font-size: 28px; font-weight: bold; color: #2c5530; text-align: center; margin: 15px 0; }
                        .time-remaining { background: #f8f9fa; padding: 10px; border-radius: 5px; text-align: center; margin: 15px 0; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="${process.env.FRONTEND_URL}/logo.png" alt="PlaneVault Logo" class="logo">
                            <h1>✈️ New Auction Available</h1>
                            <p>Something matching your interests has been listed</p>
                            <div class="status-badge">${auctionStatus}</div>
                        </div>
                        
                        <div class="content">
                            <p>Dear <strong>${bidder.firstName || bidder.username}</strong>,</p>
                            
                            <p>We're excited to let you know about a new auction that's just been listed on PlaneVault and matches your bidding preferences!</p>

                            <div class="auction-card">
                                <h2 style="margin-top: 0; color: #2c5530;">${auction.title}</h2>
                                
                                <div class="price-highlight">
                                    $${auction.startPrice?.toLocaleString()}
                                </div>

                                <div class="detail">
                                    <span class="label">Category:</span>
                                    <span class="value">${auction.category}</span>
                                </div>
                                ${auction.make && auction.model ? `
                                <div class="detail">
                                    <span class="label">Make & Model:</span>
                                    <span class="value">${auction.make} ${auction.model}</span>
                                </div>
                                ` : ''}
                                ${auction.year ? `
                                <div class="detail">
                                    <span class="label">Year:</span>
                                    <span class="value">${auction.year}</span>
                                </div>
                                ` : ''}
                                ${auction.location ? `
                                <div class="detail">
                                    <span class="label">Location:</span>
                                    <span class="value">${auction.location}</span>
                                </div>
                                ` : ''}
                                <div class="detail">
                                    <span class="label">Auction Type:</span>
                                    <span class="value">${auction.auctionType}</span>
                                </div>
                                ${auction.reservePrice ? `
                                <div class="detail">
                                    <span class="label">Reserve Price:</span>
                                    <span class="value">$${auction.reservePrice?.toLocaleString()}</span>
                                </div>
                                ` : ''}
                                <div class="detail">
                                    <span class="label">${isLive ? 'Auction Ends' : 'Auction Starts'}:</span>
                                    <span class="value">${new Date(isLive ? auction.endDate : auction.startDate).toLocaleString()}</span>
                                </div>

                                ${auction.description ? `
                                <div class="detail">
                                    <span class="label">Description:</span>
                                    <span class="value" style="margin-top: 8px; display: block;">
                                        ${auction.description.substring(0, 150)}${auction.description.length > 150 ? '...' : ''}
                                    </span>
                                </div>
                                ` : ''}
                            </div>

                            ${isLive ? `
                            <div class="urgency-banner">
                                <h3>⏰ Bidding is Live!</h3>
                                <p>This auction is currently active and accepting bids. Don't miss your chance to place your bid!</p>
                            </div>
                            ` : `
                            <div class="urgency-banner">
                                <h3>📅 Auction Coming Soon</h3>
                                <p>This auction will be starting shortly. Set your reminder and get ready to bid when it goes live!</p>
                            </div>
                            `}

                            <div class="seller-info">
                                <h4>👤 Seller Information</h4>
                                <div class="detail">
                                    <span class="label">Seller:</span>
                                    <span class="value">${seller.username}</span>
                                </div>
                            </div>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL}/auction/${auction._id}" 
                                   class="${isLive ? 'live-button' : 'cta-button'}">
                                   ${isLive ? '🚀 Place Your Bid Now' : '⭐ Save to Watchlist'}
                                </a>
                                <br>
                                <a href="${process.env.FRONTEND_URL}/auction/${auction._id}" class="cta-button">
                                    🔍 View Full Details
                                </a>
                            </div>

                            <p><strong>Happy Bidding!</strong><br>
                            The PlaneVault Team</p>

                            <div class="footer">
                                <p>You're receiving this email because you're a registered bidder on PlaneVault.</p>
                                <p>&copy; ${new Date().getFullYear()} PlaneVault. The premier platform for aircraft auctions.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        console.log(`✅ New auction notification sent to bidder ${bidder.email} for auction ${auction._id}`);
        return !!info;
    } catch (error) {
        console.error(`❌ Failed to send new auction notification:`, error);
        return false;
    }
};

// Bulk notification function for multiple bidders
const sendBulkAuctionNotifications = async (bidders, auction, seller) => {
    try {
        const notificationPromises = bidders.map(async (bidder) => {
            try {
                // Check if bidder has notifications enabled for new auctions
                if (bidder.preferences?.newAuctionNotifications !== false) {
                    await newAuctionNotificationEmail(bidder, auction, seller);
                    return { success: true, email: bidder.email };
                }
                return { success: false, email: bidder.email, reason: 'Notifications disabled' };
            } catch (error) {
                console.error(`❌ Failed to send notification to ${bidder.email}:`, error.message);
                return { success: false, email: bidder.email, error: error.message };
            }
        });

        const results = await Promise.allSettled(notificationPromises);

        // Log summary
        const successful = results.filter(result =>
            result.status === 'fulfilled' && result.value.success
        ).length;
        const failed = results.filter(result =>
            result.status === 'fulfilled' && !result.value.success
        ).length;
        const errors = results.filter(result => result.status === 'rejected').length;

        console.log(`📧 Bulk auction notifications completed: ${successful} successful, ${failed} skipped/failed, ${errors} errors`);

        return {
            total: bidders.length,
            successful,
            failed,
            errors
        };
    } catch (error) {
        console.error('❌ Error in bulk auction notifications:', error);
        throw error;
    }
};

const newBidNotificationEmail = async (seller, auction, bidAmount, bidder) => {
    try {
        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: seller.email,
            subject: `💰 New Bid Received - ${auction.title}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #f8f9fa; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
                        .logo { width: auto; height: 48px; margin-bottom: 15px; }
                        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
                        .bid-card { background: #e8f5e8; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 4px solid #28a745; }
                        .bid-amount { font-size: 32px; font-weight: bold; color: #2e7d32; margin: 10px 0; }
                        .auction-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .detail { margin: 10px 0; display: flex; }
                        .label { font-weight: bold; color: #555; min-width: 120px; }
                        .cta-button { background: #000; color: #fff !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
                        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                        <img src="${process.env.FRONTEND_URL}/logo.png" alt="PlaneVault Logo" class="logo">
                            <h2>🎉 New Bid Received!</h2>
                            <p>Your auction is gaining interest</p>
                        </div>
                        
                        <div class="content">
                            <p>Dear <strong>${seller.firstName || seller.username}</strong>,</p>
                            
                            <p>Great news! Your auction has received a new bid.</p>

                            <div class="bid-card">
                                <h3 style="margin: 0 0 10px 0; color: #2e7d32;">New Bid Amount</h3>
                                <div class="bid-amount">$${bidAmount.toLocaleString()}</div>
                                <p style="margin: 5px 0; color: #555;">on <strong>${auction.title}</strong></p>
                            </div>

                            <div class="auction-info">
                                <h4 style="margin-top: 0;">Auction Details</h4>
                                <div class="detail">
                                    <span class="label">Current Price:</span>
                                    <span>$${auction.currentPrice?.toLocaleString()}</span>
                                </div>
                                <div class="detail">
                                    <span class="label">Total Bids:</span>
                                    <span>${(auction.bidCount || 0).toLocaleString()}</span>
                                </div>
                                <div class="detail">
                                    <span class="label">Time Remaining:</span>
                                    <span>${auction.timeRemainingFormatted || 'Ending soon'}</span>
                                </div>
                                ${bidder ? `
                                <div class="detail">
                                    <span class="label">Bidder:</span>
                                    <span>${bidder.username}</span>
                                </div>
                                ` : ''}
                            </div>

                            <p style="text-align: center; margin: 25px 0;">
                                <a href="${process.env.FRONTEND_URL}/seller/auctions/all" class="cta-button">
                                    View Auction Details
                                </a>
                            </p>

                            <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <h4 style="margin-top: 0; color: #1565c0;">💡 Tips for Success</h4>
                                <ul style="margin: 10px 0; padding-left: 20px;">
                                    <li>Respond promptly to bidder questions</li>
                                    <li>Share your auction on social media</li>
                                    <li>Monitor your auction's progress regularly</li>
                                </ul>
                            </div>

                            <p>Your auction is moving in the right direction! Keep up the momentum.</p>
                            
                            <div class="footer">
                                <p>You're receiving this email because you're the seller of this auction.</p>
                                <p>&copy; ${new Date().getFullYear()} PlaneVault. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        console.log(`✅ New bid notification sent to seller ${seller.email}`);
        return !!info;
    } catch (error) {
        console.error(`❌ Failed to send new bid notification:`, error);
        return false;
    }
};

export {
    contactEmail,
    contactConfirmationEmail,
    resetPasswordEmail,
    bidConfirmationEmail,
    outbidNotificationEmail,
    sendOutbidNotifications,
    sendAuctionWonEmail,
    sendAuctionEndedSellerEmail,
    auctionListedEmail,
    auctionEndingSoonEmail,
    paymentSuccessEmail,
    welcomeEmail,
    // verificationEmail,
    newUserRegistrationEmail,
    auctionWonAdminEmail,
    auctionEndedAdminEmail,
    flaggedCommentAdminEmail,
    newCommentSellerEmail,
    newCommentBidderEmail,
    auctionSubmittedForApprovalEmail,
    auctionApprovedEmail,
    sendBulkAuctionNotifications,
    newBidNotificationEmail,
};