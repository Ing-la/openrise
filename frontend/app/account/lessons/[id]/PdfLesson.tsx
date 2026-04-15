"use client";

import { Viewer, Worker, type LoadError, SpecialZoomLevel } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

export default function PdfLesson({ pdfUrl }: { pdfUrl: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <Worker workerUrl="/js/pdf.worker.min.js">
        <div className="pdf-viewer-container min-h-[600px] w-full bg-slate-50">
          <Viewer
            fileUrl={pdfUrl}
            defaultScale={SpecialZoomLevel.PageWidth}
            theme="light"
            renderError={(error: LoadError) => (
              <div className="p-8 text-center text-slate-600">
                <p className="mb-2">PDF加载失败</p>
                <p className="text-sm">{error.message}</p>
              </div>
            )}
            renderLoader={() => (
              <div className="p-8 text-center text-slate-600">正在加载PDF...</div>
            )}
          />
        </div>
      </Worker>

      {/* 全局样式覆盖，彻底隐藏所有工具栏和控件 */}
      <style jsx global>{`
        /* 隐藏所有工具栏相关元素 */
        .rpv-core__toolbar,
        .rpv-toolbar,
        .rpv-core__minimal-button,
        .rpv-core__progress-bar,
        .rpv-core__progress-bar-indicator,
        .rpv-core__progress-bar-progress {
          display: none !important;
        }

        /* PDF查看器容器样式 */
        .pdf-viewer-container .rpv-core__viewer {
          min-height: 600px;
          height: auto !important;
          width: 100% !important;
          background-color: rgb(248 250 252) !important; /* slate-50 */
        }

        /* 页面容器 - 实现垂直滚动 */
        .rpv-core__inner-page {
          background-color: rgb(248 250 252) !important;
          box-shadow: none !important;
          border: none !important;
          margin: 0 auto 16px !important;
        }

        /* 移除所有边框和阴影 */
        .rpv-core__page-layer {
          border: none !important;
          box-shadow: none !important;
        }

        /* 文本选择层 */
        .rpv-core__text-layer {
          background: transparent !important;
        }

        /* 确保滚动自然 */
        .rpv-core__viewer-scroll {
          overflow-y: auto !important;
          scroll-behavior: smooth;
        }

        /* 隐藏页码指示器 */
        .rpv-core__page-navigation {
          display: none !important;
        }
      `}</style>

      <p className="p-4 text-sm text-slate-500 border-t border-slate-100">
        如果PDF无法显示，请<a href={pdfUrl} download className="text-primary underline">下载文件</a>
      </p>
    </div>
  );
}