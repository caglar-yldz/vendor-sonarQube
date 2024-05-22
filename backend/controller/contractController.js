const asyncHandler = require("express-async-handler");
const Contract = require("../models/contractModel");
const Project = require("../models/projectModel");
const User = require("../models/userModel");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const getContractById = asyncHandler(async (req, res) => {
  const contractId = req.params.id;
  Contract.findById(contractId)
    .then((contract) => {
      res.status(200).json(contract);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

const createContract = asyncHandler(async (req, res) => {
  const contractData = {
    ...req.body,
    projectName: req.body.projectName || null,
    projectId: req.body.projectId || null,
    companyId: req.user.id,
  };
  var paymentDates = [];
  var contractMonth = new Date(contractData.startDate).getMonth() + 1;
  let count = 0;
  for (let i = 0; i < 13; i++) {
    if (i >= contractMonth) {
      const startDate = new Date(contractData.startDate);
      startDate.setMonth(contractMonth + count++ - 1);
      paymentDates.push({
        startDate,
        isPaid: false,
        paymentAmount: 0,
      });
    } else {
      paymentDates.push({});
    }
  }

  const contractDataPdf = {
    vendorId: req.body.vendorId,
    vendorName: req.body.vendorName,
    companyName: req.body.companyName,
    projectName: req.body.projectName,
    job: req.body.job,
    jobTitle: req.body.jobTitle,
    seniorityLevel: req.body.seniorityLevel,
    currency: req.body.currency,
    paymentRate: req.body.paymentRate,
    startDate: req.body.startDate,
    billDate: req.body.billDate,
    contractName: req.body.contractName,
  };

  createContractPDFbackend(contractDataPdf);

  Contract.create({ ...contractData, paymentDates })
    .then((contract) => {
      res.status(201).json(contract);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

const getContract = asyncHandler(async (req, res) => {
  if (req.user.role === "admin") {
    Contract.find({ companyId: req.user.id })
      .then((contract) => {
        res.status(200).json(contract);
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  } else {
    await Contract.find({ vendorId: req.user.id })
      .where({
        isSend: true,
      })
      .then((contract) => {
        res.status(200).json(contract);
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  }
});

const getContractCreatedDate = asyncHandler(async (req, res) => {
  const projectId = req.params.id;

  Contract.findOne()
      .where({ projectId, vendorId: req.user.id, status: 'approved' })
      .select("createdAt")
      .then((contract) => {
        res.status(200).json(contract);
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
});

const sendContractToVendor = asyncHandler(async (req, res) => {
  const contractId = req.params.id;
  Contract.findById(contractId)
    .then((contract) => {
      contract.isSend = true;
      contract.save();
      res.status(200).json(contract);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

const contractConfirmation = asyncHandler(async (req, res) => {
  const contractId = req.params.id;

  Contract.findById(contractId)
    .where({
      vendorId: req.user.id,
    })
    .then((contract) => {
      if (contract.status === "pending") {
        User.findById(req.user.id).then((user) => {
          const isProjectNotAvailable = user.projectIds.some((id) => id.toString() === contract.projectId.toString());

          if (isProjectNotAvailable && req.body.status === "approved")
            return res.status(400).json("Vendor is already in this project");

          contract.status = req.body.status;
          contract.save();

          if (req.body.status === "approved" && contract.projectId) {
            Project.findById(contract.projectId).then((projectAvaible) => {
              if (projectAvaible) {
                Project.findByIdAndUpdate(
                  contract.projectId,
                  {
                    $push: { vendorIds: contract.vendorId },
                  },
                  { new: true }
                ).then();

                User.findByIdAndUpdate(
                  { _id: contract.vendorId },
                  { $push: { projectIds: contract.projectId } }
                ).then();

                res.status(200).json("Vendor confirmed the contact");
              } else {
                res.status(400).json("Project is not exist!");
                return;
              }
            });
          } else res.status(200).json("Vendor rejected the contract");
        });
      } else res.status(400).json("This contract is not confirmable anymore");
    })
    .catch((err) => {
      return res.status(500).json({
        error: err,
      });
    });
});

const createContractPDF = asyncHandler(async (req, res) => {
  // Get data from the client
  const {
    vendorId,
    vendorName,
    companyName,
    projectName,
    jobTitle,
    seniorityLevel,
    currency,
    paymentRate,
    startDate,
    contractName,
  } = req.body;

  const doc = new PDFDocument();

  const fileName = `${contractName}${vendorId}.pdf`;
  const filePath = path.join(__dirname, "..", "feFiles", fileName);
  const fontPath = path.join(
    __dirname,
    "..",
    "fonts",
    "Open_Sans",
    "static",
    "OpenSans_SemiCondensed-Regular.ttf"
  );
  doc.font(fontPath).fontSize(16);
  doc.text("İş sözleşmesi", { align: "center" }).moveDown();
  doc.moveDown();
  doc
    .text(
      `Bu sözleşme ${vendorName} (bundan sonra "Çalışan" olarak anılacaktır) ile ${companyName} (bundan sonra "İşveren" olarak anılacaktır) arasında yapılmıştır.`
    )
    .moveDown();
  doc.moveDown();
  doc
    .text(
      `1. Çalışan, ${startDate} tarihinde İşveren tarafından işe alınacak ve günlük ${paymentRate} ${currency} alacaktır. Maaş her ayın sonunda ödenecek.`
    )
    .moveDown();
  doc.moveDown();
  doc
    .text(
      `2. Çalışan, işbu iş sözleşmesi kapsamında ${jobTitle} pozisyonunda ve ${seniorityLevel} seviyesinde çalışacaktır.`
    )
    .moveDown();
  doc.moveDown();
  if (projectName) {
    doc
      .text(
        `3. Çalışan, İşveren tarafından atanan ${projectName} projesi üzerinde çalışacaktır.`
      )
      .moveDown();
  }

  doc.pipe(fs.createWriteStream(filePath, "utf-16le"));
  doc.end();

  const fileURL = `${fileName}`;

  res.status(201).json({ fileURL });
});

function createContractPDFbackend(contractDataPdf) {
  data = contractDataPdf;

  const doc = new PDFDocument();

  const fileName = `${data.contractName}${data.vendorId}.pdf`;
  const filePath = path.join(__dirname, "..", "files", fileName);
  const fontPath = path.join(
    __dirname,
    "..",
    "fonts",
    "Open_Sans",
    "static",
    "OpenSans_SemiCondensed-Regular.ttf"
  ); // Font dosyasının tam yolu

  doc.font(fontPath).fontSize(16);
  doc.text("İş sözleşmesi", { align: "center" }).moveDown();
  doc.moveDown();
  doc
    .text(
      `Bu sözleşme ${data.vendorName} (bundan sonra "Çalışan" olarak anılacaktır) ile ${data.companyName} (bundan sonra "İşveren" olarak anılacaktır) arasında yapılmıştır.`
    )
    .moveDown();
  doc.moveDown();
  doc
    .text(
      `1. Çalışan, ${data.startDate} tarihinde İşveren tarafından işe alınacak ve günlük ${data.paymentRate} ${data.currency} alacaktır. Maaş her ayın sonunda ödenecek.`
    )
    .moveDown();
  doc.moveDown();
  doc
    .text(
      `2. Çalışan, işbu iş sözleşmesi kapsamında ${data.jobTitle} pozisyonunda ve ${data.seniorityLevel} seviyesinde çalışacaktır.`
    )
    .moveDown();
  doc.moveDown();
  if (data.projectName) {
    doc
      .text(
        `3. Çalışan, İşveren tarafından atanan ${data.projectName} projesi üzerinde çalışacaktır.`
      )
      .moveDown();
  }
  doc.pipe(fs.createWriteStream(filePath, "utf-16le"));
  doc.end();
}

const getPendingContracts = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const currentDate = new Date();

  const tenDaysAgo = new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000);
  if (req.user.role === "user") {
    try {
      const pendingContracts = await Contract.find({
        createdAt: { $gte: tenDaysAgo, $lte: currentDate },
        status: "pending",
        vendorId: userId,
        isSend: true,
      }).select("contractName createdAt companyName");
      res.json(pendingContracts);
    } catch (error) {
      console.error("Error fetching pending contracts:", error);
      res.status(500).json({ message: "Sunucuda bir hata oluştu" });
    }
  } else if (req.user.role === "admin") {
    try {
      const pendingContracts = await Contract.find({
        createdAt: { $gte: tenDaysAgo, $lte: currentDate },
        companyId: userId,
        isSend: true,
      }).select("contractName createdAt vendorName");
      res.json(pendingContracts);
    } catch (error) {
      console.error("Error fetching pending contracts:", error);
      res.status(500).json({ message: "Sunucuda bir hata oluştu" });
    }
  }
});

const getContractCount = asyncHandler(async (req, res) => {
  try {
    let query;
    if (req.user.role === "admin") {
      query = Contract.find({ companyId: req.user.id });
    } else {
      query = Contract.find({ vendorId: req.user.id }).where({
        isSend: true,
      });
    }

    const count = await query.countDocuments();
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const payContract = asyncHandler(async (req, res) => {
  Contract.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        [`paymentDates.${req.body.monthNumber}.isPaid`]: true,
      },
    },
    { new: true }
  )
    .then((updatedContract) => {
      res.json(updatedContract);
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal Server Error" });
    });
});

module.exports = {
  getContract,
  getContractById,
  createContract,
  sendContractToVendor,
  contractConfirmation,
  createContractPDF,
  getPendingContracts,
  getContractCount,
  payContract,
  getContractCreatedDate,
};
