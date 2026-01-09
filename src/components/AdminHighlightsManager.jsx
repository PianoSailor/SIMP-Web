import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Highlights image workflow (no backend):
 * - Drag & drop images onto the dropzone
 * - Optional (Chrome/Edge): pick a folder and save images directly into it using File System Access API
 * - Map images to highlight slots and persist mapping in localStorage
 *
 * Usage:
 * - Add ?admin=1 to the URL, or press Ctrl+Shift+A to toggle admin mode.
 */

const LS_KEY = 'simp_highlight_images_v1'

function canUseDirPicker() {
  return typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function'
}

function loadMapping() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function saveMapping(map) {
  localStorage.setItem(LS_KEY, JSON.stringify(map))
}

function safeName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
}

export default function AdminHighlightsManager({ highlights, onMappingChange }) {
  const [mapping, setMapping] = useState(() => loadMapping()) // key -> url path
  const [folderHandle, setFolderHandle] = useState(null)
  const [status, setStatus] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    saveMapping(mapping)
    onMappingChange?.(mapping)
  }, [mapping, onMappingChange])

  const slots = useMemo(() => highlights.map((h) => ({ key: h.key, title: h.title })), [highlights])

  async function pickFolder() {
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' })
      setFolderHandle(handle)
      setStatus('Folder selected. Now drop images to save into that folder.')
    } catch {
      setStatus('Folder selection cancelled.')
    }
  }

  async function writeFileToFolder(file) {
    if (!folderHandle) return null
    const fileName = safeName(file.name)
    try {
      const fileHandle = await folderHandle.getFileHandle(fileName, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write(file)
      await writable.close()
      return fileName
    } catch (e) {
      console.error(e)
      return null
    }
  }

  function assignToNextFree(urlPath) {
    const next = slots.find((s) => !mapping[s.key])
    if (!next) return
    setMapping((prev) => ({ ...prev, [next.key]: urlPath }))
  }

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'))
    if (files.length === 0) {
      setStatus('No images detected. Please drop .png/.jpg/.webp etc.')
      return
    }

    if (folderHandle) {
      setStatus(`Saving ${files.length} image(s) into the selected folder...`)
      let count = 0
      for (const f of files) {
        const name = await writeFileToFolder(f)
        if (name) {
          const urlPath = `/images/highlights/${name}`
          assignToNextFree(urlPath)
          count += 1
        }
      }
      setStatus(count ? `Saved ${count} image(s). Mapped to highlight slots.` : 'Could not save images.')
    } else {
      setStatus(`Loaded ${files.length} image(s) for preview. Tip: Click “Pick highlights folder” for a real workflow.`)
      for (const f of files) {
        const objUrl = URL.createObjectURL(f)
        assignToNextFree(objUrl)
      }
    }
  }

  function onDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    handleFiles(e.dataTransfer.files)
  }

  function onBrowse() {
    inputRef.current?.click()
  }

  function clearMapping() {
    setMapping({})
    setStatus('Cleared highlight image mapping.')
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(mapping, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'highlights.mapping.json'
    a.click()
    URL.revokeObjectURL(url)
    setStatus('Downloaded highlights.mapping.json (for reference/backup).')
  }

  return (
    <div className="adminPanel">
      <div className="adminTop">
        <div>
          <div className="adminTitle">Highlights Image Manager</div>
          <div className="muted adminHint">
            Drag &amp; drop images → map to highlight cards. Best workflow: pick your project folder
            <code className="inlineCode"> public/images/highlights </code> then drop images.
          </div>
        </div>

        <div className="adminActions">
          {canUseDirPicker() ? (
            <button className="btn secondary small" onClick={pickFolder}>
              Pick highlights folder
            </button>
          ) : (
            <span className="muted">Folder save requires Chrome/Edge.</span>
          )}
          <button className="btn secondary small" onClick={onBrowse}>Browse…</button>
          <button className="btn secondary small" onClick={downloadJson}>Export mapping</button>
          <button className="btn secondary small" onClick={clearMapping}>Clear</button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </div>

      <div
        className="dropzone"
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onClick={onBrowse}
      >
        <div className="dropTitle">Drop images here</div>
        <div className="muted">or click to browse. Images map left → right, first free slot.</div>
      </div>

      {status && <div className="adminStatus">{status}</div>}

      <div className="adminGrid">
        {slots.map((s) => (
          <div key={s.key} className="adminSlot">
            <div className="adminSlotHead">
              <div className="adminSlotKey">{s.key}</div>
              <div className="adminSlotTitle">{s.title}</div>
            </div>

            <div className="adminThumb">
              {mapping[s.key] ? (
                <img
                  className="adminThumbImg"
                  src={mapping[s.key]}
                  alt={`${s.title} preview`}
                  loading="lazy"
                />
              ) : (
                <div className="muted">No image</div>
              )}
            </div>

            <div className="adminSlotFoot">
              <input
                className="adminInput"
                value={mapping[s.key] || ''}
                placeholder="e.g. /images/highlights/lantern-rite.jpg"
                onChange={(e) => setMapping((prev) => ({ ...prev, [s.key]: e.target.value }))}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="muted adminNote">
        If you used “Pick highlights folder”, the manager saves files into that folder and sets paths like
        <code className="inlineCode">/images/highlights/filename.jpg</code>.
        For deployment, commit those images under <code className="inlineCode">public/images/highlights</code>.
      </div>
    </div>
  )
}
