import React from "react";
import "./primaryButton.scss";
import "../../styles/Global.scss"
import { Loading3QuartersOutlined } from "@ant-design/icons";

export default function PrimaryButton({ children, disabled, loading, onClick, style }) {
  return (
    <button
      className="primary"
      disabled={disabled}
      onClick={onClick}
      style={{
        backgroundColor: disabled ? "#0000000A" : "",
        borderColor: disabled ? "#00000026" : "",
        cursor: disabled ? "not-allowed" : "pointer",
        color: disabled ? "#00000040" : "",
        ...style,
      }}
    >
      {loading ? (
        <div className="rotate-container">
          <Loading3QuartersOutlined className="rotate" />
        </div>
      ) : (
        children
      )}
    </button>
  );
}
