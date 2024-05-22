import  { useEffect } from "react";
import { Select } from "antd";
import { useTranslation } from "react-i18next";

const { Option } = Select;

const languages = [
  { code: "tr", lang: "Türkçe" },
  { code: "en", lang: "English" }
];

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.body.dir = i18n.dir();
  }, [i18n, i18n.language]);

  const changeLanguage = lng => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="select-container">
      <Select
        defaultValue={t("profile.language")}
        style={{ width: 120 }}
        onChange={changeLanguage}
      >
        {languages.map(lng => (
          <Option key={lng.code} value={lng.code}>
            {lng.lang}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default LanguageSelector;