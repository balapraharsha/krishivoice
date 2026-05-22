import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
  Mic, Square, Upload, Loader, AlertCircle, CheckCircle,
  Globe, Package, Activity, Leaf, Info, TrendingUp, Radio
} from 'lucide-react';

const LANGUAGES = [
  { value: 'hi', label: 'Hindi', native: 'हिंदी' },
  { value: 'te', label: 'Telugu', native: 'తెలుగు' },
  { value: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { value: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { value: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { value: 'mr', label: 'Marathi', native: 'मराठी' },
  { value: 'en', label: 'English', native: 'English' },
];

const severityVariant = (s) => s === 'high' || s === 'critical' ? 'danger' : s === 'medium' ? 'warning' : 'success';

const VoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [language, setLanguage] = useState('te');
  const [error, setError] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      setError(null);
      setAudioBlob(null);
      setTranscription(null);
      setRecordingTime(0);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => setAudioBlob(new Blob(chunks, { type: 'audio/wav' }));
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch {
      setError('Could not access microphone. Please check browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlob) { setError('No audio recorded'); return; }
    setProcessing(true);
    setError(null);
    const formData = new FormData();
    formData.append('audio_file', audioBlob, 'recording.wav');
    formData.append('language', language);
    formData.append('latitude', '17.4');
    formData.append('longitude', '78.5');
    try {
      const res = await axios.post('/api/voice/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTranscription(res.data);
    } catch {
      setError('Transcription failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="voice-page" style={{ animation: 'fadeIn 0.5s ease-out' }}>

      {/* Header */}
      <header className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="header-icon"><Mic size={24} /></div>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-dark)' }}>Voice Recording</h1>
          <p style={{ color: 'var(--text-gray)', marginTop: '4px' }}>Record field observations in your local language</p>
        </div>
      </header>

      {/* Language Selector */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px', animation: 'slideUp 0.4s ease-out 0.1s both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Globe size={16} style={{ color: 'var(--accent-green)' }} />
          <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-dark)' }}>Select Language</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {LANGUAGES.map(({ value, label, native }) => (
            <button
              key={value}
              onClick={() => setLanguage(value)}
              style={{
                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                border: `2px solid ${language === value ? 'var(--accent-green)' : 'var(--border-gray)'}`,
                background: language === value ? 'rgba(82,183,136,0.1)' : 'var(--white)',
                color: language === value ? 'var(--primary-green)' : 'var(--text-gray)',
                fontWeight: language === value ? 700 : 500, fontSize: '13px',
                transition: 'all 0.2s ease'
              }}
            >
              {label}
              <span style={{ opacity: 0.7, marginLeft: '4px' }}>({native})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recording Panel */}
      <div className="card" style={{ padding: '40px', textAlign: 'center', marginBottom: '24px', animation: 'slideUp 0.4s ease-out 0.15s both' }}>

        {/* Animated Mic */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <div style={{ position: 'relative' }}>
            {isRecording && (
              <>
                <div style={{
                  position: 'absolute', inset: '-16px', borderRadius: '50%',
                  background: 'rgba(239,68,68,0.15)',
                  animation: 'ripple 1.2s ease-out infinite'
                }} />
                <div style={{
                  position: 'absolute', inset: '-28px', borderRadius: '50%',
                  background: 'rgba(239,68,68,0.08)',
                  animation: 'ripple 1.2s ease-out 0.4s infinite'
                }} />
              </>
            )}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: isRecording ? '#EF4444' : 'var(--accent-green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', boxShadow: isRecording
                ? '0 0 0 6px rgba(239,68,68,0.2)'
                : '0 4px 14px rgba(82,183,136,0.4)',
              transition: 'all 0.3s ease'
            }}>
              {isRecording ? <Radio size={32} /> : <Mic size={32} />}
            </div>
          </div>
        </div>

        {/* Timer */}
        {isRecording && (
          <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'monospace', color: '#EF4444', marginBottom: '12px', letterSpacing: '2px' }}>
            {formatTime(recordingTime)}
          </div>
        )}

        <p style={{ color: 'var(--text-gray)', fontSize: '14px', marginBottom: '24px' }}>
          {isRecording ? 'Recording in progress — speak clearly into your microphone' :
           audioBlob ? 'Recording complete — review and transcribe below' :
           'Press the button below to start recording your field observation'}
        </p>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {!isRecording ? (
            <button
              onClick={startRecording}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '14px 28px', borderRadius: '50px', border: 'none',
                background: 'var(--accent-green)', color: '#fff',
                fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(82,183,136,0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              <Mic size={20} />
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '14px 28px', borderRadius: '50px', border: 'none',
                background: '#EF4444', color: '#fff',
                fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(239,68,68,0.4)',
                animation: 'pulse 1.5s infinite'
              }}
            >
              <Square size={20} />
              Stop Recording
            </button>
          )}
        </div>

        {/* Playback + Transcribe */}
        {audioBlob && !isRecording && (
          <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-gray)', paddingTop: '24px', animation: 'fadeIn 0.4s ease-out' }}>
            <audio src={URL.createObjectURL(audioBlob)} controls style={{ width: '100%', maxWidth: '440px', marginBottom: '16px' }} />
            <br />
            <button
              onClick={handleTranscribe}
              disabled={processing}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '12px 24px', borderRadius: '8px', border: 'none',
                background: processing ? 'var(--border-gray)' : 'var(--primary-green)',
                color: '#fff', fontSize: '14px', fontWeight: 700,
                cursor: processing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {processing ? <><Loader size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Analyzing...</>
                          : <><Upload size={18} /> Transcribe & Analyze</>}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '16px', padding: '12px 16px', background: 'rgba(239,68,68,0.1)',
            borderRadius: '8px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {transcription && (
        <div style={{ animation: 'slideUp 0.5s ease-out' }}>
          {/* Transcription Card */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <CheckCircle size={20} style={{ color: '#10B981' }} />
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-dark)' }}>Transcription</h3>
              {transcription.confidence && (
                <span className="badge success" style={{ marginLeft: 'auto' }}>
                  {(transcription.confidence * 100).toFixed(0)}% Confidence
                </span>
              )}
            </div>
            <div style={{
              background: 'var(--bg-light)', borderRadius: '8px', padding: '16px',
              fontSize: '15px', lineHeight: 1.7, color: 'var(--text-dark)',
              borderLeft: '4px solid var(--accent-green)'
            }}>
              {transcription.transcription}
            </div>
          </div>

          {/* Entities Grid */}
          {transcription.entities && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              {[
                { label: 'Crop',       value: transcription.entities.crop,         icon: Leaf,     color: 'var(--accent-green)' },
                { label: 'Pest / Disease', value: transcription.entities.pest_disease, icon: Activity, color: '#F97316' },
                { label: 'Severity',   value: transcription.entities.severity,     icon: TrendingUp, color: '#EF4444', isBadge: true },
              ].map(({ label, value, icon: Icon, color, isBadge }) => (
                <div key={label} className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Icon size={14} style={{ color }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-gray)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
                  </div>
                  {isBadge && value
                    ? <span className={`badge ${severityVariant(value)}`}>{value}</span>
                    : <p style={{ fontSize: '17px', fontWeight: 700, color: value ? 'var(--text-dark)' : 'var(--text-gray)' }}>
                        {value || 'Not detected'}
                      </p>
                  }
                </div>
              ))}
            </div>
          )}

          {/* Product Recommendation */}
          {transcription.recommendation?.primary_product && (
            <div className="card" style={{ borderTop: '4px solid var(--accent-green)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Package size={18} style={{ color: 'var(--accent-green)' }} />
                <h4 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-dark)' }}>Product Recommendation</h4>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary-green)', marginBottom: '10px' }}>
                {transcription.recommendation.primary_product}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '6px 24px', fontSize: '14px', color: 'var(--text-dark)' }}>
                {transcription.recommendation.dosage && <>
                  <span style={{ color: 'var(--text-gray)', fontWeight: 500 }}>Dosage:</span>
                  <span style={{ fontWeight: 600 }}>{transcription.recommendation.dosage}</span>
                </>}
                {transcription.recommendation.application && <>
                  <span style={{ color: 'var(--text-gray)', fontWeight: 500 }}>Application:</span>
                  <span style={{ fontWeight: 600 }}>{transcription.recommendation.application}</span>
                </>}
              </div>
              {transcription.recommendation.confidence && (
                <span className="badge success" style={{ marginTop: '12px' }}>
                  {(transcription.recommendation.confidence * 100).toFixed(0)}% Match
                </span>
              )}
            </div>
          )}

          {transcription.needs_escalation && (
            <div style={{
              marginTop: '16px', padding: '12px 16px', background: 'rgba(245,158,11,0.1)',
              borderRadius: '8px', color: '#D97706', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <Info size={18} />
              Low confidence result — supervisor review recommended
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes ripple {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default VoiceRecording;