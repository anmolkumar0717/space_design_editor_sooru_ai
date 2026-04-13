import { Camera, Hand, Compass } from "lucide-react";
import { useUIStore } from "@/editor/store/uiStore";

export function ViewControls() {
  const { viewMode, setViewMode } = useUIStore();

  return (
    <div className="absolute bottom-7 left-1/2 -translate-x-1/2 -translate-x-24 z-50">
      <div className="inline-flex items-center gap-0.5 bg-white border border-gray-200/80 rounded-2xl px-3 py-1.5 shadow-sm">
        {/* Compass */}
        <button className="flex items-center justify-center w-[38px] h-[38px] rounded-lg text-gray-500 hover:bg-gray-100 transition-colors duration-100">
          <Compass size={18} strokeWidth={1.5} />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 mx-0.5" />

        {/* Camera */}
        <button className="flex items-center justify-center w-[38px] h-[38px] rounded-lg text-gray-500 hover:bg-gray-100 transition-colors duration-100">
          <Camera size={18} strokeWidth={1.5} />
        </button>

        {/* Hand */}
        <button className="flex items-center justify-center w-[38px] h-[38px] rounded-lg text-gray-500 hover:bg-gray-100 transition-colors duration-100">
          <Hand size={18} strokeWidth={1.5} />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 mx-0.5 px-2" />

        {/* 2D / 3D Toggle */}
        <button
          onClick={() => setViewMode(viewMode === "2d" ? "3d" : "2d")}
          className={`flex items-center justify-center h-[38px]  pl-2 rounded-lg text-[13px] font-medium tracking-wide transition-colors duration-100 ${
            viewMode === "3d"
              ? "bg-gray-100 text-gray-900"
              : "text-gray-900 hover:bg-gray-100"
          }`}
        >
          <div className="pl-2">{viewMode.toUpperCase()}</div>
        </button>
      </div>
    </div>
  );
}
