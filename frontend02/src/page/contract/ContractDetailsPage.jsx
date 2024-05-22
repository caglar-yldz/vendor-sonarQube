import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ContractDetails } from "../../components";
import Header from "../../Layout/Header";
import "./contract.scss";
import { decryptContractId } from "../../utils/utils.jsx";
import useBackgroundStyle from "../../hooks/useBackgroundStyle";

function ContractDetailsPage({ socket }) {
  useBackgroundStyle();

  const { contractId } = useParams();
  const [decryptedContractId, setDecryptedContractId] = useState("");

  useEffect(() => {
    const decryptedId = decryptContractId(contractId);
    setDecryptedContractId(decryptedId);
  }, [contractId]);

  return (
    <div className="body">
      <Header socket={socket} />
        <ContractDetails contractId={decryptedContractId} />
    </div>
  );
}

export default ContractDetailsPage;
