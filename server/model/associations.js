import Recipient from "./recipientModels.js";
import RecordDocument from "./recordDocumentModels.js";

// Define associations
Recipient.belongsTo(RecordDocument, {
  foreignKey: "document_id",
  as: "document",
});
RecordDocument.hasMany(Recipient, {
  foreignKey: "document_id",
  as: "recipients",
});

export { Recipient, RecordDocument };
