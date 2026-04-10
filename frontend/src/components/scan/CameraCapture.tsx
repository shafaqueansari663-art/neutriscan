import { useCallback, useEffect, useRef, useState } from 'react'
import './ScanComponents.css'

type Props = {
  onCapture: (file: File) => void
  disabled?: boolean
}

async function openCameraStream(): Promise<MediaStream> {
  const attempts: MediaStreamConstraints[] = [
    { video: { facingMode: { ideal: 'environment' } }, audio: false },
    { video: { facingMode: 'environment' }, audio: false },
    { video: { facingMode: 'user' }, audio: false },
    { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
    { video: true, audio: false },
  ]
  let lastErr: unknown
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints)
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr
}

export function CameraCapture({ onCapture, disabled }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [active, setActive] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [error, setError] = useState('')

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    const v = videoRef.current
    if (v) {
      v.srcObject = null
      v.onloadedmetadata = null
    }
    setVideoReady(false)
    setActive(false)
  }, [])

  const start = useCallback(async () => {
    setError('')
    setVideoReady(false)
    if (!window.isSecureContext) {
      setError('Camera needs a secure context (HTTPS or localhost). Use upload instead.')
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera is not supported in this browser. Use upload instead.')
      return
    }
    try {
      const stream = await openCameraStream()
      streamRef.current = stream
      // Mount <video> first; useEffect binds srcObject (ref is null before this render).
      setActive(true)
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === 'string'
            ? e
            : 'Camera unavailable. Allow camera access or use upload.'
      setError(msg || 'Camera unavailable. Check permissions or use upload.')
    }
  }, [])

  useEffect(() => {
    if (!active) return
    const v = videoRef.current
    const stream = streamRef.current
    if (!v || !stream) return

    const markReady = () => {
      if (v.videoWidth > 0 && v.videoHeight > 0) setVideoReady(true)
    }

    v.muted = true
    v.defaultMuted = true
    v.playsInline = true
    v.setAttribute('playsinline', 'true')
    v.setAttribute('webkit-playsinline', 'true')
    v.srcObject = stream

    v.addEventListener('loadedmetadata', markReady)
    v.addEventListener('loadeddata', markReady)
    v.addEventListener('canplay', markReady)

    v.play().catch(() => undefined)

    return () => {
      v.removeEventListener('loadedmetadata', markReady)
      v.removeEventListener('loadeddata', markReady)
      v.removeEventListener('canplay', markReady)
    }
  }, [active])

  useEffect(() => () => stop(), [stop])

  const snap = useCallback(() => {
    const v = videoRef.current
    if (!v || v.videoWidth < 2 || v.videoHeight < 2) return
    const canvas = document.createElement('canvas')
    canvas.width = v.videoWidth
    canvas.height = v.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(v, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
        onCapture(file)
        stop()
      },
      'image/jpeg',
      0.92,
    )
  }, [onCapture, stop])

  return (
    <div className="scan-camera">
      {!active ? (
        <button type="button" className="btn btn--secondary" onClick={start} disabled={disabled}>
          Use camera
        </button>
      ) : (
        <div className="scan-camera__live">
          <video
            ref={videoRef}
            className="scan-camera__video"
            playsInline
            muted
            autoPlay
            controls={false}
          />
          {!videoReady ? (
            <p className="scan-camera__warming">Starting camera…</p>
          ) : null}
          <div className="scan-camera__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={snap}
              disabled={disabled || !videoReady}
            >
              Capture photo
            </button>
            <button type="button" className="btn btn--ghost" onClick={stop} disabled={disabled}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {error ? <p className="scan-camera__err">{error}</p> : null}
    </div>
  )
}
