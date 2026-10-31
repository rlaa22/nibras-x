
'use client';

import { useEffect, useRef, useState } from 'react';
import {
  campusMap,
  DESTINATION,
  getDistance,
  getWalkingTime
} from '../data/campusRoutes';

export default function NavigationAR() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [position, setPosition] = useState(null);
  const [locationError, setLocationError] = useState('');

  const destination = campusMap.nodes.find(
    node => node.id === DESTINATION
  );

  const remainingDistance = position && destination
    ? getDistance(
        position.lat,
        position.lng,
        destination.lat,
        destination.lng
      )
    : null;

  const arrived = remainingDistance !== null &&
    remainingDistance <= 15;

  const walkingTime = remainingDistance !== null
    ? getWalkingTime(remainingDistance)
    : null;

  // متابعة الموقع باستمرار
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
        setLocationError(
          'تعذر تحديد موقعك. تحققي من صلاحيات الموقع.'
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 20000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // تشغيل الكاميرا
  async function startCamera() {
    setCameraError('');

    try {
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

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (error) {
      setCameraError(
        error.name === 'NotAllowedError'
          ? 'اسمحي للموقع باستخدام الكاميرا من إعدادات Safari.'
          : 'تعذر تشغيل الكاميرا. حاولي مرة أخرى.'
      );
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
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

      <h2>🧭 الملاحة إلى مبنى 12</h2>

      <p style={{ color: '#b8c9df' }}>
        NIBRAS X · كلية الحاسبات وتقنية المعلومات
      </p>

      {locationError && (
        <p style={{ color: '#ff9caa' }}>
          {locationError}
        </p>
      )}

      {!position && (
        <p style={{ color: '#65eaff' }}>
          جارٍ تحديد موقعك...
        </p>
      )}

      {position && remainingDistance !== null && (
        <div style={{
          background: 'rgba(101,234,255,0.09)',
          border: '1px solid #65eaff',
          borderRadius: '16px',
          padding: '20px',
          margin: '18px 0'
        }}>

          {arrived ? (
            <>
              <div style={{ fontSize: '42px' }}>🎉</div>
              <h2 style={{ color: '#65eaff' }}>
                وصلتِ إلى مبنى 12 بنجاح!
              </h2>
              <p>أنتِ الآن بالقرب من مدخل الوجهة.</p>
            </>
          ) : (
            <>
              <h3 style={{ color: '#65eaff' }}>
                المسافة المتبقية
              </h3>

              <div style={{
                fontSize: '42px',
                fontWeight: 'bold',
                margin: '10px'
              }}>
                {Math.round(remainingDistance)} متر
              </div>

              <p>
                الوقت التقريبي: {walkingTime} دقيقة
              </p>

              <p style={{ fontSize: '13px', color: '#b8c9df' }}>
                دقة GPS الحالية: ±{Math.round(position.accuracy)} متر
              </p>

              {remainingDistance <= 50 && (
                <h3 style={{ color: '#65eaff' }}>
                  اقتربتِ من الوجهة!
                </h3>
              )}
            </>
          )}
        </div>
      )}

      <button className="primary" onClick={
        cameraOn ? stopCamera : startCamera
      }>
        {cameraOn ? 'إيقاف الكاميرا' : 'تشغيل كاميرا الملاحة'}
      </button>

      {cameraError && (
        <p style={{ color: '#ff9caa' }}>{cameraError}</p>
      )}

      {cameraOn && (
        <div style={{
          position: 'relative',
          marginTop: '18px',
          overflow: 'hidden',
          borderRadius: '16px',
          background: '#050d1c'
        }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: '100%',
              height: '450px',
              objectFit: 'cover',
              display: 'block'
            }}
          />

          <div style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            right: '15px',
            padding: '18px',
            borderRadius: '14px',
            background: 'rgba(5,20,45,0.85)',
            border: '1px solid #65eaff'
          }}>
            {arrived ? (
              <>
                <div style={{ fontSize: '38px' }}>🎉</div>
                <strong>وصلتِ إلى مبنى 12!</strong>
              </>
            ) : remainingDistance !== null ? (
              <>
                <div style={{
                  fontSize: '38px',
                  color: '#65eaff'
                }}>
                  ↑
                </div>

                <strong>اتجهي نحو مدخل مبنى 12</strong>

                <p style={{ marginTop: '8px' }}>
                  متبقي {Math.round(remainingDistance)} متر
                </p>

                <p>
                  الوقت التقريبي {walkingTime} دقيقة
                </p>
              </>
            ) : (
              <strong>بانتظار تحديد موقعك...</strong>
            )}
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

      <p style={{
        color: '#b8c9df',
        fontSize: '12px',
        marginTop: '16px'
      }}>
        المسافة والوقت تقدير مباشر من GPS، وقد يتأثران بدقة الموقع
        ومسار المشاة الفعلي.
      </p>

    </section>
  );
}
