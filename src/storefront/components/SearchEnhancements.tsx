import { useState, useRef, useCallback } from 'react';
import { Camera, Mic, MicOff, QrCode, X, Loader2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// =====================================
// VOICE SEARCH
// =====================================

export function VoiceSearchButton({ onResult }: { onResult: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');

  const startListening = () => {
    setError('');
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Voice search not supported in this browser');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
      setListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error);
      setError(event.error === 'not-allowed' ? 'Microphone access denied' : 'Voice search failed');
      setListening(false);
      setTimeout(() => setError(''), 3000);
    };

    recognition.onend = () => setListening(false);

    recognition.start();
  };

  return (
    <div className="relative">
      <button
        onClick={startListening}
        disabled={listening}
        className={`p-2 rounded-lg transition-all ${
          listening 
            ? 'bg-red-100 text-red-600 animate-pulse' 
            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
        }`}
        title={listening ? 'Listening...' : 'Voice search'}
      >
        {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>
      {error && (
        <div className="absolute right-0 top-full mt-1 bg-red-50 text-red-600 text-[10px] px-2 py-1 rounded whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
}

// =====================================
// CAMERA / IMAGE SEARCH
// =====================================

export function CameraSearchButton() {
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSearch = () => {
    setSearching(true);
    // In production, this would use Google Vision API or similar
    // For now, navigate to search with a generic query
    setTimeout(() => {
      setSearching(false);
      setShowModal(false);
      setPreview(null);
      navigate('/search?q=fashion');
    }, 1500);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-lg transition-all"
        title="Search by image"
      >
        <Camera className="w-4 h-4" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold">Search by Image</h3>
              <button onClick={() => { setShowModal(false); setPreview(null); }} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {preview ? (
                <div className="space-y-4">
                  <div className="aspect-square max-h-64 mx-auto rounded-xl overflow-hidden bg-gray-100">
                    <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setPreview(null); fileInputRef.current?.click(); }}
                      className="flex-1 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Retake
                    </button>
                    <button
                      onClick={handleSearch}
                      disabled={searching}
                      className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {searching ? <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</> : <><Search className="w-4 h-4" /> Search</>}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square max-h-64 mx-auto border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors"
                  >
                    <Camera className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-600">Take Photo or Upload Image</p>
                    <p className="text-xs text-gray-400 mt-1">We'll find similar products</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCapture}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// =====================================
// QR CODE / BARCODE SCANNER
// =====================================

export function QRScannerButton() {
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  const startScanner = async () => {
    setShowScanner(true);
    setError('');
    setScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Use BarcodeDetector API if available
      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({
          formats: ['qr_code', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
        });

        const scanFrame = async () => {
          if (!videoRef.current || !scanning) return;
          
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const value = barcodes[0].rawValue;
              stopScanner();
              
              // If URL, navigate to it; otherwise search by code
              if (value.startsWith('http')) {
                window.location.href = value;
              } else {
                navigate(`/search?q=${encodeURIComponent(value)}`);
              }
              return;
            }
          } catch (e) {
            // Continue scanning
          }
          
          if (scanning) {
            requestAnimationFrame(scanFrame);
          }
        };

        requestAnimationFrame(scanFrame);
      } else {
        setError('Barcode scanning is not supported in this browser. Try Chrome on Android.');
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setError(err.name === 'NotAllowedError' ? 'Camera access denied' : 'Camera not available');
      setScanning(false);
    }
  };

  const stopScanner = () => {
    setScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowScanner(false);
  };

  return (
    <>
      <button
        onClick={startScanner}
        className="p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-lg transition-all"
        title="Scan QR code or barcode"
      >
        <QrCode className="w-4 h-4" />
      </button>

      {showScanner && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold">Scan QR Code / Barcode</h3>
              <button onClick={stopScanner} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="relative aspect-square bg-black rounded-xl overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white/70 rounded-2xl relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-500 rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-500 rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-500 rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-500 rounded-br-xl" />
                    {/* Scan line animation */}
                    <div className="absolute left-2 right-2 h-0.5 bg-purple-500 animate-bounce" style={{ top: '50%' }} />
                  </div>
                </div>
              </div>

              {error ? (
                <p className="text-center text-sm text-red-600 mb-3">{error}</p>
              ) : (
                <p className="text-center text-sm text-gray-500 mb-3">
                  Point your camera at a QR code or barcode
                </p>
              )}

              <button
                onClick={stopScanner}
                className="w-full py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
