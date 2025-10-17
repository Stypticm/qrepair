"use client";

import React, { useState } from "react";

export default function DesktopPreviewPage() {
  const [w, setW] = useState(430);
  const [h, setH] = useState(860);

  return (
    <div className="min-h-screen w-full bg-gray-200 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-5xl mb-4 flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-gray-800">Desktop Preview</h1>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-gray-600">W</label>
          <input
            type="number"
            value={w}
            onChange={(e) => setW(Math.max(320, Number(e.target.value) || 0))}
            className="w-24 px-2 py-1 border rounded-md"
          />
          <label className="text-gray-600">H</label>
          <input
            type="number"
            value={h}
            onChange={(e) => setH(Math.max(640, Number(e.target.value) || 0))}
            className="w-24 px-2 py-1 border rounded-md"
          />
          <button
            onClick={() => { setW(430); setH(860); }}
            className="px-3 py-1 rounded-md bg-white border text-gray-700 hover:bg-gray-50"
          >
            430×860
          </button>
          <button
            onClick={() => { setW(390); setH(844); }}
            className="px-3 py-1 rounded-md bg-white border text-gray-700 hover:bg-gray-50"
          >
            iPhone 14 Pro
          </button>
          <button
            onClick={() => { setW(360); setH(780); }}
            className="px-3 py-1 rounded-md bg-white border text-gray-700 hover:bg-gray-50"
          >
            Pixel 7
          </button>
        </div>
      </div>

      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-300 overflow-hidden"
        style={{ width: w, height: h }}
      >
        <iframe
          src="/"
          title="Preview"
          width={w}
          height={h}
          style={{ border: "0" }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-3">Встроенный предпросмотр mini app во фрейме. Для реального поведения используйте Telegram Desktop / web.telegram.org.</p>
    </div>
  );
}


