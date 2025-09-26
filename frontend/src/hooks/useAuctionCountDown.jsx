import { useState, useEffect } from 'react';

const useAuctionCountdown = (auction) => {
  const [countdown, setCountdown] = useState({
    days: '00',
    hours: '00', 
    minutes: '00',
    seconds: '00',
    status: 'loading'
  });

  useEffect(() => {
    // If no auction data, return early
    if (!auction) {
      setCountdown({
        days: '00', hours: '00', minutes: '00', seconds: '00',
        status: 'loading'
      });
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const startDate = new Date(auction.startDate);
      const endDate = new Date(auction.endDate);

      // Auction hasn't started yet
      if (now < startDate) {
        const timeUntilStart = startDate - now;
        return {
          days: Math.floor(timeUntilStart / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
          hours: Math.floor((timeUntilStart / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
          minutes: Math.floor((timeUntilStart / 1000 / 60) % 60).toString().padStart(2, '0'),
          seconds: Math.floor((timeUntilStart / 1000) % 60).toString().padStart(2, '0'),
          status: 'not-started'
        };
      }

      // Auction has ended
      if (now >= endDate || auction.status === 'ended' || auction.status === 'sold') {
        return {
          days: '00', hours: '00', minutes: '00', seconds: '00',
          status: 'ended'
        };
      }

      // Auction is live - count down to end
      const timeUntilEnd = endDate - now;
      return {
        days: Math.floor(timeUntilEnd / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
        hours: Math.floor((timeUntilEnd / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
        minutes: Math.floor((timeUntilEnd / 1000 / 60) % 60).toString().padStart(2, '0'),
        seconds: Math.floor((timeUntilEnd / 1000) % 60).toString().padStart(2, '0'),
        status: 'counting-down'
      };
    };

    // Update countdown immediately
    setCountdown(calculateTimeLeft());

    // Set up interval - ALWAYS set it up if auction exists
    const timer = setInterval(() => {
      setCountdown(calculateTimeLeft());
    }, 1000);

    // Cleanup function
    return () => clearInterval(timer);
  }, [auction]); // Re-run when auction changes

  return countdown;
};

export default useAuctionCountdown;