import { useContext, useState, useEffect } from "react";
import { Input, Select, Row, Col, Card, Typography, DatePicker } from "antd";
import GlobalContext from "../../context/GlobalContext";
import "../../page/contract/contract.scss";
import moment from "moment";
import { useTranslation } from "react-i18next";
import {currencyList} from '../../constans/currencyList.js';

const { Option } = Select;

function DefineDates() {
  const { contractDetails, setContractDetails } = useContext(GlobalContext);
  const [currency, setCurrency] = useState(contractDetails.currency || "TRY");
  const [price, setPrice] = useState(contractDetails.price || "");
  const [dayNumber, setDayNumber] = useState(contractDetails.dayNumber || "");
  const [salaryType, setSalaryType] = useState(
    contractDetails.salaryType || "daily"
  );
  const [warningMessage, setWarningMessage] = useState("");
  const [date, setDate] = useState(
    contractDetails.date ? moment(contractDetails.date) : null
  );
  const [selectedCurrencyPrefix, setSelectedCurrencyPrefix] = useState(() => {
    const selectedCurrency = currencyList.find(
      (item) => item.value === contractDetails.currency
    );
    return selectedCurrency ? selectedCurrency.prefix : "₺";
  });
  const [inpPrice, setInpPrice] = useState(contractDetails.price || "");
  const [validThrough, setValidThrough] = useState(
    contractDetails.validThrough ? moment(contractDetails.validThrough) : null
  );
  const [totalDate, settotalDate] = useState(""); 
  const { t } = useTranslation();

  const handleCurrencyChange = (value) => {
    setCurrency(value);
    const selectedCurrency = currencyList.find((item) => item.value === value);
    if (selectedCurrency) {
      setSelectedCurrencyPrefix(selectedCurrency.prefix);
    }
  };
  const handlePriceChange = (value) => {
    let numericValue = value.replace(/[^\d]/g, "");
    const selectedCurrency = currencyList.find(
      (item) => item.value === currency
    );
    if (selectedCurrency) {
      const thousandSeparator = selectedCurrency.thousandSeparator;
      const decimalSeparator = selectedCurrency.decimalSeparator;

      let formattedValue = "";
      const valueLength = numericValue.length;
      for (let i = 0; i < valueLength; i++) {
        formattedValue += numericValue[i];
        if ((valueLength - i - 1) % 3 === 0 && i !== valueLength - 1) {
          formattedValue += thousandSeparator;
        }
      }

      const decimalIndex = value.indexOf(decimalSeparator);
      if (decimalIndex !== -1) {
        formattedValue += decimalSeparator + value.slice(decimalIndex + 1);
      }

      numericValue = formattedValue;
    }

    let numValue = numericValue.replace(/[,\.]/g, "");

    setInpPrice(numericValue);
    setPrice(numValue);
  };

  const disabledDate = (current) => {
    const today = moment().startOf("day");
    return current && current < today;
  };

  const updatetotalDate = (date, dayNumber) => {
    if (!date || !dayNumber || dayNumber === "") {
      settotalDate("");
      return;
    }

    const newDate = addDaysToDate(date.toDate(), parseInt(dayNumber));

    settotalDate(newDate);
  };

  useEffect(() => {
    updatetotalDate(date, dayNumber);
  }, []);

  const addDaysToDate = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days + 1);
    return result.toISOString().slice(0, 10); // YYYY-MM-DD formatında tarih döndürür
  };

  const handleValidThroughChange = (date, dateString) => {
    setValidThrough(date);
  };
  useEffect(() => {
    setContractDetails((prevState) => ({
      ...prevState,
      currency: currency,
      price: price,
      date: date ? date.format("YYYY-MM-DD") : null,
      validThrough: validThrough ? validThrough.format("YYYY-MM-DD") : null,
      totalDate: totalDate,
      dayNumber,
      salaryType: salaryType,
    }));
  }, [currency, price, date, validThrough, totalDate, dayNumber, salaryType]);

  const selectBefore = (
    <Select
      defaultValue={contractDetails.salaryType || "daily"}
      onChange={(value) => {
        setSalaryType(value);
      }}
    >
      <Option value="daily">{t("contract.daily")}</Option>
      <Option value="monthly">{t("contract.monthly")}</Option>
    </Select>
  );

  return (
    <div className="content">
      <Card bordered={false} className="card-container-centered">
        <Typography.Title style={{ marginBottom: "0" }} level={4}>
          <span style={{ color: "#888" }}> {t("contractPages.step3")}</span>{" "}
          <span style={{ marginLeft: "5px" }}>
            {" "}
            {t("contractPages.defineDates")}
          </span>
        </Typography.Title>
      </Card>

      <Card bordered={false} className="card-content">
        <Typography.Text strong>
          {" "}
          {t("contractPages.contractDetails")}
        </Typography.Text>

        <div className="margin-top">
          <label className={`label-above ${currency ? "" : "required"}`}>
            {t("contractPages.currency")}
          </label>{" "}
          <Select
            className="select-input custom-margin"
            placeholder="Currency"
            value={currency}
            onChange={handleCurrencyChange}
          >
            {currencyList.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.ad}
              </Option>
            ))}
          </Select>
        </div>

        <div className="margin-top">
          <label className={`label-above ${inpPrice ? "" : "required"}`}>
            {t("contractPages.salary")}
          </label>
          <Input
            className="custom-margin"
            placeholder={t("contractPages.salaryPlaceHolder")}
            type="text"
            count={{
              show: true,
              max: 10,
            }}
            maxLength={10}
            prefix={selectedCurrencyPrefix}
            value={inpPrice}
            addonBefore={selectBefore}
            onChange={(e) => {
              const value = e.target.value.replace(selectedCurrencyPrefix, "");
              const numericValue = value.replace(/\D/g, "");
              handlePriceChange(numericValue);
              // setSalaryType(selectBefore);
              inpPrice.length >= 0
                ? setWarningMessage(t("contract.salaryTypeWarningMessage"))
                : setWarningMessage("");
            }}
          />
          <label style={{ color: "orange" }}> {warningMessage} </label>
        </div>

        <div className="margin-top">
          <Row gutter={[0, 10]}>
            <Col span={12} md={12} xl={8} xxl={8}>
              <label className={`label-above ${date ? "" : "required"}`}>
                {t("contractPages.billDate")}
              </label>
              <DatePicker
                style={{ width: "80%" }}
                type="mask"
                placeholder={t("contractPages.selectDate")}
                value={date}
                onChange={(value) => {
                  setDate(value);
                  updatetotalDate(value, dayNumber);
                }}
                disabledDate={disabledDate}
                inputReadOnly
              />
            </Col>
            <Col span={12} md={12} xl={8} xxl={8}>
              <label className={`label-above ${dayNumber ? "" : "required"}`}>
                {t("contractPages.expiryDate")}
              </label>
              <Input
                value={dayNumber}
                style={{ width: "80%" }}
                placeholder={t("contractPages.expiryPlaceHolder")}
                type="number"
                max={30}
                min={0}
                onChange={(e) => {
                  setDayNumber(e.target.value);
                  updatetotalDate(date, e.target.value);
                }}
              />
            </Col>
            <Col span={12} md={12} xl={8} xxl={8}>
              <label className={`label-above ${date ? "" : "required"}`}>
                {" "}
                {t("contractPages.paymentDate")}{" "}
              </label>
              <Input
                type="text"
                style={{ width: "80%" }}
                readOnly
                value={totalDate}
              />
            </Col>
          </Row>
        </div>
        <div className="margin-top">
          <label className={`label-above ${validThrough ? "" : "required"}`}>
            {t("contractPages.validThrough")}{" "}
          </label>
          <DatePicker
            type="mask"
            placeholder={t("contractPages.selectDate")}
            className="custom-margin"
            value={validThrough}
            onChange={handleValidThroughChange}
            disabledDate={disabledDate}
            inputReadOnly
          />
        </div>
      </Card>
    </div>
  );
}

export default DefineDates;
