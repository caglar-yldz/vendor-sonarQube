import React, { useState } from "react";
import { Button, Modal } from "antd";
import PrimaryButton from "../buttons/primaryButton";
import { useTranslation } from "react-i18next";

const App = ({
  title,
  description,
  onOkModal,
  isModalOpen,
  setIsModalOpen,
  loading,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Modal
        title={title}
        visible={isModalOpen}
        okText="Evet"
        okType="primary"
        cancelText="Hayır"
        confirmLoading
        onCancel={() => {
          setIsModalOpen(false);
        }}
        closeIcon={false}
        footer={(props) => (
          <div>
            <div>
              <Button
                style={{ height: "32px", marginRight: "5px" }}
                type="primary"
                danger
                onClick={() => setIsModalOpen(false)}
              >
                {t("areUSure.no")}
              </Button>
              <PrimaryButton
                style={{ height: "32px" }}
                onClick={(e) => {
                  onOkModal(e).then(() => {
                    setIsModalOpen(false);
                  });
                }}
                loading={loading}
                disabled={loading}
              >
                {t("areUSure.yes")}
              </PrimaryButton>
            </div>
          </div>
        )}
      >
        <p>{description}</p>
      </Modal>
    </>
  );
};
export default App;
