import React, { useState } from 'react';
import axios from 'axios';
import { Mic, Square, Upload, Loader, AlertCircle, CheckCircle } from 'lucide-react';

const VoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [language, setLanguage] = useState('hi');
  const [error, setError] = useState(null);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlob) {
      setError('No audio to transcribe');
      return;
    }

    setProcessing(true);
    setError(null);
    const formData = new FormData();
    formData.append('audio_file', audioBlob, 'recording.wav');
    formData.append('language', language);
    formData.append('latitude', '17.4');
    formData.append('longitude', '78.5');

    try {
      const response = await axios.post('/api/voice/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setTranscription(response.data);
    } catch (error) {
      console.error('Error transcribing:', error);
      setError('Transcription failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="voice-page">
      <header className="page-header">
        <div className="header-icon">
          <Mic size={24} />
        </div>
        <div>
          <h1>Voice Recording</h1>
          <p>Record field observations in your local language</p>
        </div>
      </header>

      {/* Language Selector */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <label style={{ fontWeight: 600, marginRight: '12px' }}>Select Language:</label>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          style={{ 
            padding: '10px 16px', 
            borderRadius: '8px', 
            border: '1px solid var(--border-gray)',
            fontSize: '14px',
            minWidth: '200px'
          }}
        >
          <option value="hi">Hindi (हिंदी)</option>
          <option value="ta">Tamil (தமிழ்)</option>
          <option value="te">Telugu (తెలుగు)</option>
          <option value="kn">Kannada (ಕನ್ನಡ)</option>
          <option value="ml">Malayalam (മലയാളം)</option>
          <option value="mr">Marathi (मराठी)</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Recording Controls */}
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        {!isRecording ? (
          <button 
            className="btn-record" 
            onClick={startRecording}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}
          >
            <Mic size={24} />
            Start Recording
          </button>
        ) : (
          <button 
            className="btn-record" 
            onClick={stopRecording}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '12px',
              background: '#EF4444',
              animation: 'pulse 1.5s infinite'
            }}
          >
            <Square size={24} />
            Stop Recording
          </button>
        )}

        {audioBlob && !isRecording && (
          <div style={{ marginTop: '24px' }}>
            <audio src={URL.createObjectURL(audioBlob)} controls style={{ width: '100%', maxWidth: '400px' }} />
            <div style={{ marginTop: '16px' }}>
              <button 
                className="btn-primary" 
                onClick={handleTranscribe}
                disabled={processing}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                {processing ? (
                  <>
                    <Loader className="spinner" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Transcribe & Analyze
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            background: 'rgba(239, 68, 68, 0.1)', 
            borderRadius: '8px',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center'
          }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}
      </div>

      {/* Transcription Results */}
      {transcription && (
        <div style={{ marginTop: '32px' }}>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <CheckCircle size={20} style={{ color: '#10B981' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Transcription Results</h3>
            </div>
            <p style={{ 
              fontSize: '16px', 
              lineHeight: '1.6', 
              color: 'var(--text-dark)',
              background: 'var(--bg-light)',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '12px'
            }}>
              {transcription.transcription}
            </p>
            <div className="badge info">
              Confidence: {(transcription.confidence * 100).toFixed(1)}%
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="card">
              <h4 style={{ fontSize: '14px', color: 'var(--text-gray)', marginBottom: '8px' }}>Crop</h4>
              <p style={{ fontSize: '18px', fontWeight: 600 }}>{transcription.entities.crop || 'Not detected'}</p>
            </div>
            
            <div className="card">
              <h4 style={{ fontSize: '14px', color: 'var(--text-gray)', marginBottom: '8px' }}>Pest/Disease</h4>
              <p style={{ fontSize: '18px', fontWeight: 600 }}>{transcription.entities.pest_disease || 'Not detected'}</p>
            </div>
            
            <div className="card">
              <h4 style={{ fontSize: '14px', color: 'var(--text-gray)', marginBottom: '8px' }}>Severity</h4>
              <span className={`badge ${transcription.entities.severity === 'high' ? 'danger' : transcription.entities.severity === 'medium' ? 'warning' : 'success'}`}>
                {transcription.entities.severity || 'Unknown'}
              </span>
            </div>
          </div>

          {transcription.recommendation && transcription.recommendation.products && (
            <div className="card">
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Product Recommendation</h4>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary-green)', marginBottom: '8px' }}>
                {transcription.recommendation.primary_product}
              </h3>
              <p><strong>Dosage:</strong> {transcription.recommendation.dosage}</p>
              <p><strong>Application:</strong> {transcription.recommendation.application}</p>
              <div className="badge success" style={{ marginTop: '8px' }}>
                Confidence: {(transcription.recommendation.confidence * 100).toFixed(1)}%
              </div>
            </div>
          )}

          {transcription.needs_escalation && (
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              background: 'rgba(251, 191, 36, 0.1)', 
              borderRadius: '8px',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={20} />
              Low confidence - Review recommended
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceRecording;