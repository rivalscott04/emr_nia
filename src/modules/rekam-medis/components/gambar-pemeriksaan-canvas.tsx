import { useRef, useEffect, useCallback, useState } from "react"
import { Button } from "../../../components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../../components/ui/dialog"
import { Input } from "../../../components/ui/input"
import { Eraser, Save, Pencil, Circle as CircleIcon, Square, Minus, ZoomIn, ZoomOut, ArrowRight, Type } from "lucide-react"

const CANVAS_WIDTH = 1000
const CANVAS_HEIGHT = 600
const ZOOM_MIN = 0.25
const ZOOM_MAX = 2.5
const ZOOM_STEP = 0.25

type Tool = "freehand" | "circle" | "rect" | "line" | "arrow" | "text"

interface GambarPemeriksaanCanvasProps {
    disabled?: boolean
    initialDataUrl?: string | null
    onExport?: (dataUrl: string) => void
    onReady?: (getDataUrl: () => string | null) => void
}

const COLORS = [
    "#000000",
    "#1e40af",
    "#b91c1c",
    "#15803d",
    "#a16207",
    "#7e22ce",
]

const DEFAULT_TEXT_FONT_SIZE = 18

type ShapeItem =
    | { type: "circle"; x: number; y: number; r: number; color: string; w: number }
    | { type: "rect"; x: number; y: number; w: number; h: number; color: string; strokeW: number }
    | { type: "line"; x1: number; y1: number; x2: number; y2: number; color: string; strokeW: number }
    | { type: "arrow"; x1: number; y1: number; x2: number; y2: number; color: string; strokeW: number }
    | { type: "text"; x: number; y: number; text: string; color: string; fontSize: number }
    | { type: "path"; points: { x: number; y: number }[]; color: string; w: number }

function getPointerPos(e: React.PointerEvent | PointerEvent, canvas: HTMLCanvasElement): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
    }
}

const ARROW_HEAD_LEN = 14

function findTextAtPosition(
    ctx: CanvasRenderingContext2D,
    shapes: ShapeItem[],
    px: number,
    py: number
): number {
    for (let i = shapes.length - 1; i >= 0; i--) {
        const s = shapes[i]
        if (!s) continue
        if (s.type === "text" && s.text) {
            ctx.font = `${s.fontSize}px sans-serif`
            const w = ctx.measureText(s.text).width
            const h = s.fontSize
            if (px >= s.x && px <= s.x + w && py >= s.y && py <= s.y + h) return i
        }
    }
    return -1
}

function drawArrowhead(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string
) {
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const len = ARROW_HEAD_LEN
    const x3 = x2 - len * Math.cos(angle - Math.PI / 6)
    const y3 = y2 - len * Math.sin(angle - Math.PI / 6)
    const x4 = x2 - len * Math.cos(angle + Math.PI / 6)
    const y4 = y2 - len * Math.sin(angle + Math.PI / 6)
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(x2, y2)
    ctx.lineTo(x3, y3)
    ctx.lineTo(x4, y4)
    ctx.closePath()
    ctx.fill()
}

export function GambarPemeriksaanCanvas({
    disabled = false,
    onExport,
    onReady,
}: GambarPemeriksaanCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [tool, setTool] = useState<Tool>("freehand")
    const [strokeColor, setStrokeColor] = useState<string>(() => COLORS[0] ?? "#000000")
    const [strokeWidth, setStrokeWidth] = useState(3)
    const [zoom, setZoom] = useState(1)
    const viewportRef = useRef<HTMLDivElement>(null)
    const [fitScale, setFitScale] = useState(1)
    const isDrawingRef = useRef(false)
    const lastPointRef = useRef<{ x: number; y: number } | null>(null)
    const shapesRef = useRef<ShapeItem[]>([])
    const currentShapeRef = useRef<ShapeItem | null>(null)
    const startPointRef = useRef<{ x: number; y: number } | null>(null)
    const currentPathRef = useRef<{ x: number; y: number }[] | null>(null)
    const draggingTextRef = useRef<{ index: number; offsetX: number; offsetY: number } | null>(null)
    const [textDialogOpen, setTextDialogOpen] = useState(false)
    const [textDialogPosition, setTextDialogPosition] = useState<{ x: number; y: number } | null>(null)
    const [textDialogValue, setTextDialogValue] = useState("")

    const redraw = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.fillStyle = "#fafafa"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        shapesRef.current.forEach((s) => {
            if (s.type === "path") {
                if (s.points.length < 2) return
                const p0 = s.points[0]
                if (!p0) return
                ctx.strokeStyle = s.color
                ctx.lineWidth = s.w
                ctx.lineCap = "round"
                ctx.lineJoin = "round"
                ctx.beginPath()
                ctx.moveTo(p0.x, p0.y)
                for (let i = 1; i < s.points.length; i++) {
                    const p = s.points[i]
                    if (p) ctx.lineTo(p.x, p.y)
                }
                ctx.stroke()
            } else if (s.type === "circle") {
                ctx.strokeStyle = s.color
                ctx.lineWidth = s.w
                ctx.beginPath()
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
                ctx.stroke()
            } else if (s.type === "rect") {
                ctx.strokeStyle = s.color
                ctx.lineWidth = s.strokeW
                ctx.strokeRect(s.x, s.y, s.w, s.h)
            } else if (s.type === "line") {
                ctx.strokeStyle = s.color
                ctx.lineWidth = s.strokeW
                ctx.beginPath()
                ctx.moveTo(s.x1, s.y1)
                ctx.lineTo(s.x2, s.y2)
                ctx.stroke()
            } else if (s.type === "arrow") {
                ctx.strokeStyle = s.color
                ctx.lineWidth = s.strokeW
                ctx.beginPath()
                ctx.moveTo(s.x1, s.y1)
                ctx.lineTo(s.x2, s.y2)
                ctx.stroke()
                drawArrowhead(ctx, s.x1, s.y1, s.x2, s.y2, s.color)
            } else if (s.type === "text" && s.text) {
                ctx.font = `${s.fontSize}px sans-serif`
                ctx.fillStyle = s.color
                ctx.textBaseline = "top"
                ctx.fillText(s.text, s.x, s.y)
            }
        })
        const cur = currentShapeRef.current
        if (cur) {
            if (cur.type === "circle") {
                ctx.strokeStyle = cur.color
                ctx.lineWidth = cur.w
                ctx.beginPath()
                ctx.arc(cur.x, cur.y, cur.r, 0, Math.PI * 2)
                ctx.stroke()
            } else if (cur.type === "rect") {
                ctx.strokeStyle = cur.color
                ctx.lineWidth = cur.strokeW
                ctx.strokeRect(cur.x, cur.y, cur.w, cur.h)
            } else if (cur.type === "line") {
                ctx.strokeStyle = cur.color
                ctx.lineWidth = cur.strokeW
                ctx.beginPath()
                ctx.moveTo(cur.x1, cur.y1)
                ctx.lineTo(cur.x2, cur.y2)
                ctx.stroke()
            } else if (cur.type === "arrow") {
                ctx.strokeStyle = cur.color
                ctx.lineWidth = cur.strokeW
                ctx.beginPath()
                ctx.moveTo(cur.x1, cur.y1)
                ctx.lineTo(cur.x2, cur.y2)
                ctx.stroke()
                drawArrowhead(ctx, cur.x1, cur.y1, cur.x2, cur.y2, cur.color)
            } else if (cur.type === "text" && cur.text) {
                ctx.font = `${cur.fontSize}px sans-serif`
                ctx.fillStyle = cur.color
                ctx.textBaseline = "top"
                ctx.fillText(cur.text, cur.x, cur.y)
            }
        }
    }, [])

    const getDataUrl = useCallback((): string | null => {
        const canvas = canvasRef.current
        if (!canvas) return null
        try {
            return canvas.toDataURL("image/png")
        } catch {
            return null
        }
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (canvas) {
            const ctx = canvas.getContext("2d")
            if (ctx) {
                ctx.fillStyle = "#fafafa"
                ctx.fillRect(0, 0, canvas.width, canvas.height)
            }
        }
        redraw()
    }, [redraw])

    useEffect(() => {
        if (onReady) onReady(getDataUrl)
    }, [onReady, getDataUrl])

    useEffect(() => {
        const el = viewportRef.current
        if (!el) return
        const ro = new ResizeObserver(() => {
            const w = el.clientWidth
            const h = el.clientHeight
            if (w > 0 && h > 0) {
                const scale = Math.min(w / CANVAS_WIDTH, h / CANVAS_HEIGHT)
                setFitScale(scale)
            }
        })
        ro.observe(el)
        const w = el.clientWidth
        const h = el.clientHeight
        if (w > 0 && h > 0) setFitScale(Math.min(w / CANVAS_WIDTH, h / CANVAS_HEIGHT))
        return () => ro.disconnect()
    }, [])

    const handlePointerDown = useCallback(
        (e: React.PointerEvent<HTMLCanvasElement>) => {
            if (disabled) return
            const canvas = canvasRef.current
            if (!canvas) return
            e.preventDefault()
            const pos = getPointerPos(e, canvas)

            if (tool === "text") {
                const ctx = canvas.getContext("2d")
                if (!ctx) return
                const idx = findTextAtPosition(ctx, shapesRef.current, pos.x, pos.y)
                if (idx >= 0) {
                    const s = shapesRef.current[idx]
                    if (s && s.type === "text") {
                        draggingTextRef.current = {
                            index: idx,
                            offsetX: pos.x - s.x,
                            offsetY: pos.y - s.y,
                        }
                        isDrawingRef.current = true
                        ;(e.target as HTMLCanvasElement).setPointerCapture(e.pointerId)
                    }
                } else {
                    setTextDialogPosition({ x: pos.x, y: pos.y })
                    setTextDialogValue("")
                    setTextDialogOpen(true)
                }
                return
            }

            ;(e.target as HTMLCanvasElement).setPointerCapture(e.pointerId)
            isDrawingRef.current = true
            lastPointRef.current = pos
            startPointRef.current = pos

            if (tool === "freehand") {
                currentPathRef.current = [{ x: pos.x, y: pos.y }]
                const ctx = canvas.getContext("2d")
                if (!ctx) return
                ctx.strokeStyle = strokeColor
                ctx.lineWidth = strokeWidth
                ctx.lineCap = "round"
                ctx.lineJoin = "round"
                ctx.beginPath()
                ctx.moveTo(pos.x, pos.y)
                ctx.lineTo(pos.x, pos.y)
                ctx.stroke()
            } else if (tool === "circle") {
                currentShapeRef.current = { type: "circle", x: pos.x, y: pos.y, r: 1, color: strokeColor, w: strokeWidth }
            } else if (tool === "rect") {
                currentShapeRef.current = {
                    type: "rect",
                    x: pos.x,
                    y: pos.y,
                    w: 1,
                    h: 1,
                    color: strokeColor,
                    strokeW: strokeWidth,
                }
            } else if (tool === "line") {
                currentShapeRef.current = {
                    type: "line",
                    x1: pos.x,
                    y1: pos.y,
                    x2: pos.x,
                    y2: pos.y,
                    color: strokeColor,
                    strokeW: strokeWidth,
                }
            } else if (tool === "arrow") {
                currentShapeRef.current = {
                    type: "arrow",
                    x1: pos.x,
                    y1: pos.y,
                    x2: pos.x,
                    y2: pos.y,
                    color: strokeColor,
                    strokeW: strokeWidth,
                }
            }
            redraw()
        },
        [disabled, tool, strokeColor, strokeWidth, redraw]
    )

    const handlePointerMove = useCallback(
        (e: React.PointerEvent<HTMLCanvasElement>) => {
            const canvas = canvasRef.current
            if (!canvas) return
            const pos = getPointerPos(e, canvas)

            const dragging = draggingTextRef.current
            if (dragging != null) {
                e.preventDefault()
                const shape = shapesRef.current[dragging.index]
                if (shape?.type === "text") {
                    shape.x = pos.x - dragging.offsetX
                    shape.y = pos.y - dragging.offsetY
                    redraw()
                }
                return
            }

            if (!isDrawingRef.current) return
            e.preventDefault()
            const last = lastPointRef.current
            const start = startPointRef.current

            if (tool === "freehand" && last) {
                const path = currentPathRef.current
                if (path) path.push(pos)
                const ctx = canvas.getContext("2d")
                if (!ctx) return
                ctx.strokeStyle = strokeColor
                ctx.lineWidth = strokeWidth
                ctx.lineCap = "round"
                ctx.lineJoin = "round"
                ctx.beginPath()
                ctx.moveTo(last.x, last.y)
                ctx.lineTo(pos.x, pos.y)
                ctx.stroke()
                lastPointRef.current = pos
            } else if (tool === "circle" && start) {
                const r = Math.sqrt((pos.x - start.x) ** 2 + (pos.y - start.y) ** 2)
                currentShapeRef.current = {
                    type: "circle",
                    x: start.x,
                    y: start.y,
                    r: Math.max(1, r),
                    color: strokeColor,
                    w: strokeWidth,
                }
                redraw()
            } else if (tool === "rect" && start) {
                const w = pos.x - start.x
                const h = pos.y - start.y
                currentShapeRef.current = {
                    type: "rect",
                    x: w >= 0 ? start.x : pos.x,
                    y: h >= 0 ? start.y : pos.y,
                    w: Math.abs(w) || 1,
                    h: Math.abs(h) || 1,
                    color: strokeColor,
                    strokeW: strokeWidth,
                }
                redraw()
            } else if (tool === "line" && start) {
                currentShapeRef.current = {
                    type: "line",
                    x1: start.x,
                    y1: start.y,
                    x2: pos.x,
                    y2: pos.y,
                    color: strokeColor,
                    strokeW: strokeWidth,
                }
                redraw()
            } else if (tool === "arrow" && start) {
                currentShapeRef.current = {
                    type: "arrow",
                    x1: start.x,
                    y1: start.y,
                    x2: pos.x,
                    y2: pos.y,
                    color: strokeColor,
                    strokeW: strokeWidth,
                }
                redraw()
            }
        },
        [tool, strokeColor, strokeWidth, redraw]
    )

    const handlePointerUp = useCallback(
        (e: React.PointerEvent<HTMLCanvasElement>) => {
            e.preventDefault()
            try {
                (e.target as HTMLCanvasElement).releasePointerCapture(e.pointerId)
            } catch {
                // ignore
            }
            if (draggingTextRef.current != null) {
                draggingTextRef.current = null
                isDrawingRef.current = false
                return
            }
            if (!isDrawingRef.current) return
            isDrawingRef.current = false
            lastPointRef.current = null
            const path = currentPathRef.current
            if (path && path.length >= 2) {
                shapesRef.current.push({ type: "path", points: [...path], color: strokeColor, w: strokeWidth })
            }
            currentPathRef.current = null
            const cur = currentShapeRef.current
            if (cur) {
                shapesRef.current.push(cur)
                currentShapeRef.current = null
            }
            startPointRef.current = null
            redraw()
        },
        [redraw, strokeColor, strokeWidth]
    )

    const handlePointerLeave = useCallback(
        (e: React.PointerEvent<HTMLCanvasElement>) => {
            if (draggingTextRef.current != null) {
                draggingTextRef.current = null
                isDrawingRef.current = false
                redraw()
                return
            }
            if (isDrawingRef.current) {
                const path = currentPathRef.current
                if (path && path.length >= 2) {
                    shapesRef.current.push({ type: "path", points: [...path], color: strokeColor, w: strokeWidth })
                }
                currentPathRef.current = null
                const cur = currentShapeRef.current
                if (cur) {
                    shapesRef.current.push(cur)
                    currentShapeRef.current = null
                }
            }
            isDrawingRef.current = false
            lastPointRef.current = null
            startPointRef.current = null
            redraw()
        },
        [redraw, strokeColor, strokeWidth]
    )

    const handleClear = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.fillStyle = "#fafafa"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        shapesRef.current = []
        currentShapeRef.current = null
        currentPathRef.current = null
    }

    const handleSave = () => {
        const dataUrl = getDataUrl()
        if (dataUrl) onExport?.(dataUrl)
    }

    const handleTextDialogConfirm = () => {
        const teks = textDialogValue.trim()
        if (textDialogPosition && teks !== "") {
            shapesRef.current.push({
                type: "text",
                x: textDialogPosition.x,
                y: textDialogPosition.y,
                text: teks,
                color: strokeColor,
                fontSize: DEFAULT_TEXT_FONT_SIZE,
            })
            redraw()
        }
        setTextDialogOpen(false)
        setTextDialogPosition(null)
        setTextDialogValue("")
    }

    const handleTextDialogOpenChange = (open: boolean) => {
        if (!open) {
            setTextDialogPosition(null)
            setTextDialogValue("")
        }
        setTextDialogOpen(open)
    }

    return (
        <div className="space-y-3">
            <Dialog open={textDialogOpen} onOpenChange={handleTextDialogOpenChange}>
                <DialogContent className="sm:max-w-md" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Teks untuk blok</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <Input
                            placeholder="Ketik teks lalu klik Tambah"
                            value={textDialogValue}
                            onChange={(e) => setTextDialogValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault()
                                    handleTextDialogConfirm()
                                }
                            }}
                            className="w-full"
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleTextDialogOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="button" onClick={handleTextDialogConfirm} disabled={!textDialogValue.trim()}>
                            Tambah
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <p className="text-sm text-muted-foreground">
                Pilih alat lalu <strong>klik-tahan dan geser</strong> di canvas. Zoom canvas pakai tombol di toolbar atau <strong>Ctrl + scroll</strong> di atas canvas.
            </p>

            <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border bg-muted/50">
                <span className="text-sm font-medium text-muted-foreground">Alat:</span>
                <div className="flex gap-1">
                    <Button
                        type="button"
                        variant={tool === "freehand" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTool("freehand")}
                        disabled={disabled}
                        title="Pensil"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant={tool === "circle" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTool("circle")}
                        disabled={disabled}
                        title="Lingkaran"
                    >
                        <CircleIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant={tool === "rect" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTool("rect")}
                        disabled={disabled}
                        title="Kotak"
                    >
                        <Square className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant={tool === "line" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTool("line")}
                        disabled={disabled}
                        title="Garis"
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant={tool === "arrow" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTool("arrow")}
                        disabled={disabled}
                        title="Panah"
                    >
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant={tool === "text" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTool("text")}
                        disabled={disabled}
                        title="Teks (klik tempatkan, drag untuk pindah)"
                    >
                        <Type className="h-4 w-4" />
                    </Button>
                </div>
                <span className="text-sm font-medium text-muted-foreground">Warna:</span>
                <div className="flex gap-1">
                    {COLORS.map((c) => (
                        <button
                            key={c}
                            type="button"
                            className="w-7 h-7 rounded-full border-2 border-slate-300 hover:border-slate-600"
                            style={{
                                backgroundColor: c,
                                borderColor: strokeColor === c ? "#0f172a" : undefined,
                            }}
                            onClick={() => setStrokeColor(c)}
                            disabled={disabled}
                        />
                    ))}
                </div>
                <span className="text-sm font-medium text-muted-foreground">Ukuran:</span>
                <input
                    type="range"
                    min={1}
                    max={12}
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    disabled={disabled}
                    className="w-24"
                />
                <span className="text-xs text-muted-foreground">{strokeWidth}px</span>
                <span className="text-sm font-medium text-muted-foreground">Zoom:</span>
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
                        disabled={disabled}
                        title="Zoom out"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-xs tabular-nums min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
                        disabled={disabled}
                        title="Zoom in"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setZoom(1)}
                        disabled={disabled}
                        title="Reset 100%"
                    >
                        100%
                    </Button>
                </div>
            </div>

            <div
                ref={viewportRef}
                className="border rounded-lg overflow-auto bg-slate-100 w-full max-w-full select-none"
                style={{
                    touchAction: "none",
                    cursor: "crosshair",
                    aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
                    minHeight: 200,
                }}
                onWheel={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault()
                        setZoom((z) => {
                            const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
                            return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z + delta))
                        })
                    }
                }}
            >
                <div
                    style={{
                        width: CANVAS_WIDTH,
                        height: CANVAS_HEIGHT,
                        transform: `scale(${fitScale * zoom})`,
                        transformOrigin: "0 0",
                    }}
                >
                    <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="block cursor-crosshair"
                    style={{ display: "block", touchAction: "none", cursor: "crosshair" }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerLeave}
                    onPointerCancel={handlePointerUp}
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleClear} disabled={disabled}>
                    <Eraser className="mr-2 h-4 w-4" />
                    Hapus canvas
                </Button>
                <Button type="button" variant="default" size="sm" onClick={handleSave} disabled={disabled}>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan sebagai lampiran
                </Button>
            </div>
        </div>
    )
}
