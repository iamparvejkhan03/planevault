import { useEffect, useState } from "react";

const useAuctionCountdown = (auction) => {
  const [countdown, setCountdown] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    status: 'loading'
  });

  useEffect(() => {
    if (!auction) {
      setCountdown({
        days: '00', hours: '00', minutes: '00', seconds: '00',
        status: 'loading'
      });
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date(); // Client time
      const startDate = new Date(auction.startDate); // UTC from server
      const endDate = new Date(auction.endDate); // UTC from server

      // Use dates directly - no timezone conversion needed
      // JavaScript Date comparisons work correctly with UTC

      // Handle all auction statuses
      if (auction.status === 'approved') {
        const timeUntilStart = startDate - now;
        return {
          days: Math.floor(timeUntilStart / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
          hours: Math.floor((timeUntilStart / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
          minutes: Math.floor((timeUntilStart / 1000 / 60) % 60).toString().padStart(2, '0'),
          seconds: Math.floor((timeUntilStart / 1000) % 60).toString().padStart(2, '0'),
          status: 'approved'
        };
      }

      if (auction.status === 'draft' || auction.status === 'approved') {
        return {
          days: '00', hours: '00', minutes: '00', seconds: '00',
          status: 'draft'
        };
      }

      if (auction.status === 'cancelled' || auction.status === 'suspended') {
        return {
          days: '00', hours: '00', minutes: '00', seconds: '00',
          status: auction.status
        };
      }

      // Auction hasn't started yet
      if (now < startDate) {
        const timeUntilStart = startDate - now;
        return {
          days: Math.floor(timeUntilStart / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
          hours: Math.floor((timeUntilStart / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
          minutes: Math.floor((timeUntilStart / 1000 / 60) % 60).toString().padStart(2, '0'),
          seconds: Math.floor((timeUntilStart / 1000) % 60).toString().padStart(2, '0'),
          status: 'approved'
        };
      }

      // Auction has ended (check both time and status)
      if (now >= endDate ||
        auction.status === 'ended' ||
        auction.status === 'reserve_not_met' ||
        auction.status === 'sold') {
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

    setCountdown(calculateTimeLeft());

    const timer = setInterval(() => {
      setCountdown(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [auction]);

  return countdown;
};

export default useAuctionCountdown;