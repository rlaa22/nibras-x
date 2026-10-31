
'use client';

import { useEffect, useRef, useState } from 'react';

export default function NavigationAR() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [position, setPosition] = useState(null);
  const [locationError, setLocationError] = useState('');

  async function startCamera() {
    setCameraError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraOn(true);
    } catch {
      setCameraError('تعذر تشغيل الكاميرا. تحققي من صلاحيات Safari.');
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('جهازك لا يدعم تحديد الموقع.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      result => {
        setPosition({
          lat: result.coords.latitude,
          lng: result.coords.longitude,
          accuracy: result.coords.accuracy
        });
        setLocationError('');
      },
      () => setLocationError('اسمحي للموقع بالوصول إلى GPS.'),
      { enableHighAccuracy: true, maximumAge: 3000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <section style={{
      maxWidth: '850px',
      margin: '30px auto',
      padding: '22px',
      borderRadius: '20px',
      background: '#101d35',
      color: 'white',
      textAlign: 'center'
    }}>
      <h2>🧭 الملاحة الذكية إلى مبنى 12</h2>

      <p style={{ color: '#b8c9df', margin: '12px 0' }}>
        حددي موقعك وشغّلي الكاميرا لبدء تجربة NIBRAS X.
      </p>

      {position && (
        <p style={{ color: '#65eaff', fontSize: '13px' }}>
          GPS متصل · دقة الموقع ±{Math.round(position.accuracy)} متر
        </p>
      )}

      {locationError && (
        <p style={{ color: '#ff9caa' }}>{locationError}</p>
      )}

      {!cameraOn ? (
        <button className="primary" onClick={startCamera}>
          تشغيل كاميرا الملاحة
        </button>
      ) : (
        <button className="primary" onClick={stopCamera}>
          إيقاف الكاميرا
        </button>
      )}

      {cameraError && (
        <p style={{ color: '#ff9caa', marginTop: '12px' }}>
          {cameraError}
        </p>
      )}

      {cameraOn && (
        <div style={{
          position: 'relative',
          marginTop: '18px',
          overflow: 'hidden',
          borderRadius: '16px'
        }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{ width: '100%', display: 'block' }}
          />

          <div style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            right: '15px',
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(5, 20, 45, 0.85)',
            border: '1px solid #65eaff'
          }}>
            <div style={{ fontSize: '30px', color: '#65eaff' }}>
              ↑
            </div>
            <strong>المسار قيد التجهيز</strong>
            <p style={{ fontSize: '12px', marginTop: '7px' }}>
              سيتم تفعيل تعليمات المنعطفات بعد معايرة طرق الجامعة.
            </p>
          </div>

          <div style={{
            position: 'absolute',
            bottom: '15px',
            left: '0',
            right: '0',
            color: '#65eaff',
            fontWeight: 'bold'
          }}>
            NIBRAS X · BUILDING 12
          </div>
        </div>
      )}
    </section>
  );
}
