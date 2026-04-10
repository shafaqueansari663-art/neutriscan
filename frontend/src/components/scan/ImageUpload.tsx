import { useRef } from 'react'
import './ScanComponents.css'

type Props = {
  onFile: (file: File) => void
  disabled?: boolean
}

export function ImageUpload({ onFile, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="scan-upload">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="scan-upload__input"
        disabled={disabled}
        onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (f && f.type.startsWith('image/')) onFile(f)
        }}
      />
      <button
        type="button"
        className="btn btn--secondary"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        Upload image
      </button>
    </div>
  )
}
