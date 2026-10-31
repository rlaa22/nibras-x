
'use client';

import { useEffect, useRef, useState } from 'react';
import {
  campusMap,
  findCampusRoute,
  DESTINATION
} from '../data/campusRoutes';

export default function NavigationAR() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [position, setPosition] = useState(null);
  const [locationError, setLocationError] = useState('');

  // حساب المسار من أقرب نقطة لها إحداثيات معروفة
  function getNearestNode(userPosition) {
    if (!userPosition) return null;

    const validNodes = campusMap.nodes.filter(
      node =>
        node.lat !== null &&
        node.lng !== null &&
        Number.isFinite(node.lat) &&
        Number.isFinite(node.lng)
    );

    if (validNodes.length === 0) return null;

    const toRadians = value => value * Math.PI / 180;

    function distance(a, b) {
      const earthRadius = 6371000;

      const dLat = toRadians(b.lat - a.lat);
      const dLng = toRadians(b.lng - a.lng);

      const value =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(a.lat)) *
        Math.cos(toRadians(b.lat)) *
        Math.sin(dLng / 2) ** 2;

      return 2 * earthRadius *
        Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
    }

    return validNodes.reduce((nearest, node) => {
      const currentDistance = distance(userPosition, node);

      if (!nearest || currentDistance < nearest.distance) {
        return {
          id: node.id,
          name: node.name,
          distance: currentDistance
        };
      }

      return nearest;
    }, null);
  }

  const nearestNode = getNearestNode(position);

  const route = nearestNode
    ? findCampusRoute(nearestNode.id, DESTINATION)
    : [];

  // ربط بث الكاميرا بالفيديو
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
        setLocationError(
          'تعذر تحديد الموقع. تحققي من صلاحيات GPS.'
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 15000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
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
        <p style={{ color: '#ff9caa' }}>
          {locationError}
        </p>
      )}

      <div style={{
        padding: '12px',
        margin: '15px 0',
        borderRadius: '12px',
        background: 'rgba(101,234,255,0.08)'
      }}>
        {!position ? (
          <p>بانتظار تحديد موقعك...</p>
        ) : !nearestNode ? (
          <p>تم تحديد موقعك، ونحتاج معايرة نقاط مسارات الجامعة.</p>
        ) : route.length === 0 ? (
          <p>لا يوجد مسار متصل من موقعك إلى مبنى 12 حاليًا.</p>
        ) : (
          <>
            <p>أقرب نقطة معروفة: {nearestNode.name}</p>
            <p>المسار التجريبي: {route.join(' ← ')}</p>
          </>
        )}
      </div>

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

            <strong>
              {route.length > 0
                ? 'تم حساب مسار تجريبي'
                : 'المسار قيد المعايرة'}
            </strong>

            <p style={{ fontSize: '12px', marginTop: '7px' }}>
              {route.length > 0
                ? 'المسار غير معتمد للملاحة الفعلية حتى التحقق من الممرات.'
                : 'سيتم تفعيل التوجيه بعد إضافة إحداثيات ومسارات الجامعة الفعلية.'}
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
