
'use client';

import { useEffect, useRef, useState } from 'react';

export default function NavigationAR() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [position, setPosition] = useState(null);
  const [locationError, setLocationError] = useState('');

  // ربط بث الكاميرا بالفيديو بعد ظهوره
  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;

      videoRef.current.play().catch(() => {
        setCameraError('اضغطي تشغيل الكاميرا مرة أخرى.');
      });
    }
  }, [cameraOn]);

  // متابعة GPS
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
      () => {
        setLocationError('تعذر تحديد الموقع. تحققي من صلاحيات GPS.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 15000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  async function startCamera() {
    setCameraError('');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('افتحي الموقع من Safari باستخدام HTTPS.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      setCameraOn(true);

    } catch (error) {
      setCameraError(
        error.name === 'NotAllowedError'
          ? 'اسمحي للموقع باستخدام الكاميرا من إعدادات Safari.'
          : error.message || 'تعذر تشغيل الكاميرا.'
      );
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
  }

  useEffect(() => {
    return () => {
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
          borderRadius: '16px',
          background: '#050d1c',
          minHeight: '350px'
        }}>

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            webkit-playsinline="true"
            style={{
              width: '100%',
              height: '450px',
              display: 'block',
              objectFit: 'cover'
            }}
          />

          <div style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            right: '15px',
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(5, 20, 45, 0.82)',
            border: '1px solid #65eaff'
          }}>
            <div style={{
              fontSize: '38px',
              color: '#65eaff'
            }}>
              ↑
            </div>

            <strong>المسار قيد التجهيز</strong>

            <p style={{ fontSize: '12px', marginTop: '7px' }}>
              سيتم تفعيل تعليمات المنعطفات بعد معايرة طرق الجامعة.
            </p>
          </div>

          <div style={{
            position: 'absolute',
            bottom: '18px',
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
