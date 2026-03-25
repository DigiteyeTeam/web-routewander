"use client";

/** สร้างแถบบาร์โค้ดจำลองจากข้อความ (แต่ละตัวอักษรแปลงเป็นความกว้างแถบ) */
export default function MockBarcode({ code, className }: { code?: string; className?: string }) {
  if (!code) {
    return null;
  }
  const barWidth = 2;
  const gap = 1;
  const height = 48;
  const chars = code.split("");
  const widths: number[] = [];
  for (const c of chars) {
    const n = c.charCodeAt(0);
    widths.push((n % 3) + 1);
    widths.push((n % 2) + 1);
  }
  let x = 0;
  const totalWidth = widths.reduce((sum, w) => sum + w * barWidth + gap, 0) + gap;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${totalWidth} ${height + 14}`}
      width="100%"
      height={height + 14}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {widths.map((w, i) => {
        const barW = w * barWidth;
        const rect = (
          <rect
            key={i}
            x={x}
            y={0}
            width={barW}
            height={height}
            fill="currentColor"
            className="text-slate-800"
          />
        );
        x += barW + gap;
        return rect;
      })}
      <text
        x={totalWidth / 2}
        y={height + 12}
        textAnchor="middle"
        className="fill-slate-600 text-[10px] font-mono"
      >
        {code}
      </text>
    </svg>
  );
}
