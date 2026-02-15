import { useState, useRef, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Download, ImagePlus, X } from 'lucide-react'

const SIZE_OPTIONS = [128, 256, 512] as const
const DEFAULT_SIZE = 256
const LOGO_SIZE_RATIO = 0.2 // logo is 20% of QR size

export function QrGenerator() {
  const [value, setValue] = useState('')
  const [size, setSize] = useState(DEFAULT_SIZE)
  const [centerImageUrl, setCenterImageUrl] = useState<string | null>(null)
  const [centerImageFileName, setCenterImageFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const svgRef = useRef<HTMLDivElement>(null)

  // Revoke object URL on unmount or when image changes
  useEffect(() => {
    return () => {
      if (centerImageUrl) URL.revokeObjectURL(centerImageUrl)
    }
  }, [centerImageUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file?.type.startsWith('image/')) return
    if (centerImageUrl) URL.revokeObjectURL(centerImageUrl)
    setCenterImageUrl(URL.createObjectURL(file))
    setCenterImageFileName(file.name)
    e.target.value = ''
  }

  const clearCenterImage = () => {
    if (centerImageUrl) URL.revokeObjectURL(centerImageUrl)
    setCenterImageUrl(null)
    setCenterImageFileName(null)
    fileInputRef.current?.value && (fileInputRef.current.value = '')
  }

  const handleDownloadPng = () => {
    const svg = svgRef.current?.querySelector('svg')
    if (!svg || !value.trim()) return

    // Clone SVG and strip the center <image> so the serialized SVG only has the QR pattern.
    // We'll draw the center image on the canvas ourselves so it appears in the PNG.
    const svgClone = svg.cloneNode(true) as SVGElement
    const imageEl = svgClone.querySelector('image')
    if (imageEl) imageEl.remove()

    const svgString = new XMLSerializer().serializeToString(svgClone)
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const qrImg = new Image()

    const finishPng = (canvas: HTMLCanvasElement) => {
      const pngUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = pngUrl
      a.download = 'qrcode.png'
      a.click()
      URL.revokeObjectURL(url)
    }

    qrImg.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(qrImg, 0, 0, size, size)

      if (centerImageUrl) {
        const logoSize = Math.round(size * LOGO_SIZE_RATIO)
        const logoX = (size - logoSize) / 2
        const logoY = (size - logoSize) / 2
        const centerImg = new Image()
        centerImg.onload = () => {
          ctx.drawImage(centerImg, logoX, logoY, logoSize, logoSize)
          finishPng(canvas)
        }
        centerImg.onerror = () => finishPng(canvas)
        centerImg.src = centerImageUrl
      } else {
        finishPng(canvas)
      }
    }
    qrImg.src = url
  }

  const logoSize = Math.round(size * LOGO_SIZE_RATIO)
  const imageSettings =
    centerImageUrl && value.trim()
      ? {
        src: centerImageUrl,
        height: logoSize,
        width: logoSize,
        excavate: true,
      }
      : undefined

  const hasContent = value.trim().length > 0

  return (
    <div className="w-full max-w-3xl">
      <Card className="overflow-hidden rounded-xl border border-border/80 bg-card/95 shadow-lg backdrop-blur-sm">
        <CardHeader className="space-y-1.5">
          <CardTitle className="text-xl tracking-tight">QR code generator</CardTitle>
          <CardDescription className="text-muted-foreground/90">
            Enter text or a URL, optionally add a center image, then download.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-value" className="text-foreground/90">
                Content
              </Label>
              <Input
                id="qr-value"
                type="text"
                placeholder="https://example.com or any text..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-10 font-mono text-sm placeholder:font-sans"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground/90">Size</Label>
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={size === option ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSize(option)}
                    className="h-9 min-w-18"
                  >
                    {option}px
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground/90">Center image</Label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Upload center image"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 h-9"
                >
                  <ImagePlus className="w-4 h-4" />
                  Upload image
                </Button>
                {centerImageUrl && (
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-muted-foreground text-sm">{centerImageFileName}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearCenterImage}
                      className="gap-1.5 h-9 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                Optional. Shown in the middle of the QR for branding.
              </p>
            </div>
          </div>

          {/* Preview at end of card */}
          <div className="flex flex-col items-start">
            <Label className="mb-2 text-foreground/90">Preview</Label>
            <div
              className={cn(
                'flex items-center justify-center border-2 border-dashed transition-colors',
                hasContent ? 'border-border/50 bg-white' : 'border-muted-foreground/25'
              )}
              style={!hasContent ? { width: size, height: size } : undefined}
            >
              {hasContent ? (
                <div
                  ref={svgRef}
                  className="inline-flex rounded-lg border border-border/50 bg-white shadow-sm"
                  aria-hidden
                >
                  <QRCodeSVG
                    value={value.trim()}
                    size={size}
                    level={centerImageUrl ? 'H' : 'M'}
                    marginSize={0}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    imageSettings={imageSettings}
                    title="QR code"
                  />
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center px-4">
                  No preview
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadPng}
              disabled={!hasContent}
              className="mt-3 gap-2 w-auto"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
