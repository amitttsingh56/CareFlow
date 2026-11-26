import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [liveNotification, setLiveNotification] = useState(null);
  const [updateCounter, setUpdateCounter] = useState(0);

  useEffect(() => {
    // Connect to server (proxied in Vite or direct)
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });

    newSocket.on('connect', () => {
      console.log('Connected to CareFlow real-time broadcast');
    });

    newSocket.on('hospitals:changed', (data) => {
      console.log('Live update received: hospitals changed', data);
      setLiveNotification({
        title: 'Live Capacity Updated',
        message: 'A hospital just published updated capacity and queue metrics.',
        timestamp: new Date().toLocaleTimeString(),
      });
      setUpdateCounter((prev) => prev + 1);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setLiveNotification(null);
      }, 4000);
    });

    newSocket.on('hospital:updated', (data) => {
      console.log('Live update received for single hospital', data);
      setLiveNotification({
        title: 'Status Updated Just Now',
        message: 'Operational metrics updated directly from hospital desk.',
        timestamp: new Date().toLocaleTimeString(),
      });
      setUpdateCounter((prev) => prev + 1);

      setTimeout(() => {
        setLiveNotification(null);
      }, 4000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinHospital = useCallback(
    (hospitalId) => {
      if (socket && hospitalId) {
        socket.emit('join:hospital', hospitalId);
      }
    },
    [socket]
  );

  const leaveHospital = useCallback(
    (hospitalId) => {
      if (socket && hospitalId) {
        socket.emit('leave:hospital', hospitalId);
      }
    },
    [socket]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        liveNotification,
        updateCounter,
        joinHospital,
        leaveHospital,
        clearNotification: () => setLiveNotification(null),
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
