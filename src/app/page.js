
'use client';

import { useState, useRef, useEffect } from 'react';

const DESTINATION = {
  lat: 21.431454,
  lng: 40.477317
};

export default function Home() {
  const [started, setStarted] = useState(false);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [locating, setLocating] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = value => value * Math.PI / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function findLocation() {
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('متصفحك لا يدعم تحديد الموقع.');
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      position => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLocating(false);
      },
      error => {
        const messages = {
          1: 'يرجى السماح للموقع بالوصول إلى موقعك.',
          2: 'تعذر تحديد موقعك. حاولي مرة أخرى.',
          3: 'انتهت مهلة تحديد الموقع. أعيدي المحاولة.'
        };

        setLocationError(messages[error.code] || 'حدث خطأ في تحديد الموقع.');
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }

  const distance = location
    ? getDistance(
        location.lat,
        location.lng,
        DESTINATION.lat,
        DESTINATION.lng
      )
    : null;

  const arrived = location && distance <= 50;
  const minutes = distance !== null
    ? Math.max(1, Math.ceil(distance / 80))
    : null;

  const mapsUrl = location
    ? `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${DESTINATION.lat},${DESTINATION.lng}&travelmode=walking`
    : `https://www.google.com/maps/dir/?api=1&destination=${DESTINATION.lat},${DESTINATION.lng}&travelmode=walking`;

  async function startCamera() {
    setCameraError('');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('افتحي الموقع في Safari وتأكدي من استخدام HTTPS.');
      }

      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      setStream(cameraStream);
    } catch (error) {
      setCameraError(
        error.name === 'NotAllowedError'
          ? 'لم يتم السماح باستخدام الكاميرا. تحققي من إعدادات الخصوصية.'
          : error.message || 'تعذر تشغيل الكاميرا.'
      );
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }

  return (
    <main className="page">
      <header className="topbar">
        <a className="logo" href="#home">
          <span className="logo-mark">N<span>X</span></span>
          <span><b>NIBRAS X</b><small>TAIF UNIVERSITY</small></span>
        </a>
        <span className="top-label">A NEW WAY TO DISCOVER</span>
      </header>

      <section className="hero" id="home">
        <div className="copy">
          <div className="eyebrow"><i /> تجربة واقع معزز</div>
          <h1>مرحبًا بكِ في<br/><em>مبنى 12</em></h1>
          <p>
            بوابتك الرقمية لاكتشاف مبنى كلية الحاسبات وتقنية المعلومات
            بجامعة الطائف، بتجربة تفاعلية تجمع الواقع بالتقنية.
          </p>

          <button className="primary" onClick={() => setStarted(true)}>
            {started ? 'التجربة جاهزة' : 'ابدئي التجربة'} <span>↗</span>
          </button>

          <div className="meta">
            <span>⌖</span> كلية الحاسبات وتقنية المعلومات · جامعة الطائف
          </div>
        </div>

        <div className="visual">
          <div className="photo-frame">
            <img src="/building-12.jpeg" alt="واجهة مبنى 12، كلية الحاسبات"/>
            <div className="photo-shade"/>
            <div className="photo-caption">
              <b>12</b><span>COLLEGE OF COMPUTERS</span>
            </div>
            <div className="scan-line"/>
          </div>
          <div className="float-chip chip-a"><i/> BUILDING 12</div>
          <div className="float-chip chip-b">AR READY <span>✦</span></div>
          <div className="ring ring-a"/>
          <div className="ring ring-b"/>
        </div>
      </section>

      {started && (
        <section className="welcome" aria-live="polite">
          <div className="camera-icon">◎</div>
          <div>
            <h2>أهلًا بكِ في NIBRAS X</h2>
            <p>رحلتكِ إلى مبنى 12 تبدأ الآن.</p>
          </div>
          <button className="close" onClick={() => {
            stopCamera();
            setStarted(false);
            setCameraError('');
          }}>
            ×
          </button>
        </section>
      )}

      {started && (
        <section style={{
          maxWidth: '850px',
          margin: '30px auto',
          padding: '22px',
          border: '1px solid #55cce5',
          borderRadius: '20px',
          background: '#101d35',
          color: 'white',
          textAlign: 'center'
        }}>
          <h2>📍 الوصول إلى مبنى 12</h2>

          <p style={{ color: '#b8c9df', margin: '12px 0 20px' }}>
            حددي موقعك لمعرفة المسافة التقريبية إلى مبنى 12.
          </p>

          <button className="primary" onClick={findLocation} disabled={locating}>
            {locating ? 'جاري تحديد موقعك...' : '⌖ حددي موقعي'}
          </button>

          {locationError && (
            <p style={{ color: '#ff9caa', marginTop: '15px' }}>
              {locationError}
            </p>
          )}

          {location && (
            <div style={{
              marginTop: '22px',
              padding: '18px',
              borderRadius: '16px',
              background: '#172b48'
            }}>
              {arrived ? (
                <>
                  <div style={{ fontSize: '42px' }}>🎉</div>
                  <h2 style={{ color: '#65eaff' }}>
                    وصلتي إلى مبنى 12!
                  </h2>
                  <p style={{ marginTop: '10px' }}>
                    أهلًا بكِ في كلية الحاسبات وتقنية المعلومات
                  </p>
                </>
              ) : (
                <>
                  <h3 style={{ color: '#65eaff' }}>المسافة المباشرة التقريبية</h3>
                  <div style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    margin: '12px'
                  }}>
                    {distance >= 1000
                      ? `${(distance / 1000).toFixed(2)} كم`
                      : `${Math.round(distance)} متر`}
                  </div>

                  <p style={{ color: '#b8c9df' }}>
                    وقت مشي تقديري: {minutes} دقيقة تقريبًا
                  </p>
                </>
              )}

              <p style={{
                color: '#8fa8c6',
                fontSize: '12px',
                marginTop: '12px'
              }}>
                دقة تحديد موقعك الحالية: ±{Math.round(location.accuracy)} متر
              </p>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: '18px',
                  padding: '13px 22px',
                  borderRadius: '12px',
                  background: '#55cce5',
                  color: '#08172b',
                  fontWeight: 'bold',
                  textDecoration: 'none'
                }}
              >
                🧭 افتحي الاتجاهات في خرائط Google
              </a>

              <p style={{
                fontSize: '11px',
                color: '#8fa8c6',
                marginTop: '12px'
              }}>
                المسافة المعروضة خط مستقيم وليست مسافة الطريق.
                نقطة الوصول مؤقتة وقد تحتاج إلى التحقق من مدخل المبنى.
              </p>
            </div>
          )}

          <div style={{
            borderTop: '1px solid #34445d',
            marginTop: '25px',
            paddingTop: '22px'
          }}>
            <h2>✦ تجربة الواقع المعزز</h2>
            <p style={{ color: '#b8c9df', margin: '12px 0' }}>
              شغّلي الكاميرا لبدء التجربة.
            </p>

            {!stream && (
              <button className="primary" onClick={startCamera}>
                تشغيل الكاميرا
              </button>
            )}

            {cameraError && (
              <p style={{ color: '#ff9caa', marginTop: '12px' }}>
                {cameraError}
              </p>
            )}

            {stream && (
              <div style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '16px',
                marginTop: '15px'
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
                  right: '15px',
                  padding: '10px',
                  border: '1px solid #65eaff',
                  borderRadius: '12px',
                  background: 'rgba(5, 20, 45, 0.8)',
                  color: '#65eaff'
                }}>
                  BUILDING 12 · AR
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '0',
                  right: '0',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>
                  ✦ NIBRAS X
                </div>
              </div>
            )}

            {stream && (
              <button
                className="primary"
                onClick={stopCamera}
                style={{ marginTop: '20px' }}
              >
                إيقاف الكاميرا
              </button>
            )}
          </div>
        </section>
      )}

      <footer>
        <span>NIBRAS X © 2026</span>
        <span>TAIF UNIVERSITY</span>
      </footer>
    </main>
  );
}
