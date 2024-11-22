import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const HubSpotTracker = () => {
    const location = useLocation();

    useEffect(() => {
        const hubspotId = process.env.REACT_APP_HUBSPOT_ID;
        console.log({hubspotId});
        

        if (!hubspotId) {
            console.error('HubSpot ID is not defined in the environment variables.');
            return;
        }

        // Load HubSpot script dynamically
        const script = document.createElement('script');
        script.src = `//js.hs-scripts.com/${hubspotId}.js`;
        script.async = true;

        script.onload = () => {
            if (window.hbspt) {
                window.hbspt.analytics.trackPage(location.pathname);
            }
        };

        document.body.appendChild(script);

        // Track page views on location change
        window.hbspt && window.hbspt.analytics.trackPage(location.pathname);

        return () => {
            // Clean up script on unmount
            document.body.removeChild(script);
        };
    }, [location]);

    return null; // This component doesn't render anything
};

export default HubSpotTracker;