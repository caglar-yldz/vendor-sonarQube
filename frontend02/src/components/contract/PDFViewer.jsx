import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import React from "react";

import { useTranslation } from "react-i18next";

function PDFViewer({ pdfURL }) {
  const { t } = useTranslation();

  const renderError = (error) => {
    let message = "";
    switch (error.name) {
      case "InvalidPDFException":
        message = t("pdfViewer.invalidDocument");
        break;
      case "MissingPDFException":
        message = t("pdfViewer.missingDocument");
        break;
      case "UnexpectedResponseException":
        message = t("pdfViewer.unexpectedResponse");
        break;
      default:
        message = t("pdfViewer.uploadErrorDocument");
        break;
    }

    return (
      <div
        style={{
          alignItems: "center",
          display: "flex",
          height: "100%",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "#e53e3e",
            borderRadius: "0.25rem",
            color: "#fff",
            padding: "0.5rem",
          }}
        >
          {message}
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: "100%" }}>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer fileUrl={pdfURL} renderError={renderError} />
      </Worker>
    </div>
  );
}

export default PDFViewer;
