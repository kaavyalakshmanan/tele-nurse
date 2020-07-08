import React, { useState, useEffect } from 'react';
import ProgressComponent from '@material-ui/core/CircularProgress';


function JitsiMeetComponent() {
    const [loading, setLoading] = useState(true);
    const containerStyle = {
        width: '800px',
        height: '400px',
    };

    const jitsiContainerStyle = {
        display: (loading ? 'none' : 'block'),
        width: '100%',
        height: '100%',
    }

    function startConference() {
        try {
            const domain = 'meet.jit.si';
            const options = {
                roomName: 'AppointmentTime',
                height: 400,
                parentNode: document.getElementById('jitsi-container'),
                interfaceConfigOverwrite: {
                    filmStripOnly: false,
                    SHOW_JITSI_WATERMARK: false,
                },
                configOverwrite: {
                    disableSimulcast: false,
                },
            };

            const api = new window.JitsiMeetExternalAPI(domain, options);
            api.addEventListener('videoConferenceJoined', () => {
                console.log('Local User Joined');
                setLoading(false);
                api.executeCommand('displayName', 'Dr. Shawarma');
            });
        } catch (error) {
            console.error('Failed to load Jitsi API', error);
        }
    }

    useEffect(() => {
        // verify the JitsiMeetExternalAPI constructor is added to the global..
        if (window.JitsiMeetExternalAPI) startConference();
        else alert('Jitsi Meet API script not loaded');
    }, []);

    return (
        <div
            style={containerStyle}
        >
            {loading && <ProgressComponent />}
            <div
                id="jitsi-container"
                style={jitsiContainerStyle}
            />
        </div>
    );
}

export default JitsiMeetComponent;

// https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe
//https://github.com/jitsi/lib-jitsi-meet/blob/master/doc/API.md#installation
//https://gitee.com/huangranrumeng/jitsi-meet/raw/a9bdde193da5d57cbbd4e8c89afebe6de71544a5/doc/api.md
//https://meetrix.io/blog/webrtc/integrate-jitsi-meet-to-react-app.html
//https://jitsi.org/api/
//https://github.com/gatteo/react-jitsi/tree/master/example